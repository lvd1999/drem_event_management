import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Paperclip, X } from 'lucide-react'
import { useVendors } from '@/hooks/useVendors'
import {
  useAddTransaction, useUpdateTransaction,
  useUploadTransactionFile, useDeleteTransactionFile,
} from '@/hooks/useTransactions'
import { Timestamp } from 'firebase/firestore'

const PAYMENT_METHODS = ['Bank Transfer', 'Cash', 'GrabPay', 'Cheque', 'Other']

function toDateInputValue(ts) {
  if (!ts) return new Date().toISOString().slice(0, 10)
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toISOString().slice(0, 10)
}

export default function TransactionForm({ open, onOpenChange, eventId, transaction }) {
  const isEdit = Boolean(transaction)
  const add = useAddTransaction(eventId)
  const update = useUpdateTransaction(eventId)
  const uploadFile = useUploadTransactionFile(eventId)
  const deleteFile = useDeleteTransactionFile(eventId)
  const loading = add.isPending || update.isPending || uploadFile.isPending || deleteFile.isPending
  const { data: vendors } = useVendors()

  const [pendingFiles, setPendingFiles] = useState([])
  const fileInputRef = useRef(null)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm()
  const type = watch('type', 'in')
  const vendorId = watch('vendorId', '')

  useEffect(() => {
    if (!open) return
    setPendingFiles([])
    reset(transaction
      ? {
          type: transaction.type,
          amount: transaction.amount,
          date: toDateInputValue(transaction.date),
          method: transaction.method ?? '',
          reference: transaction.reference ?? '',
          vendorId: transaction.vendorId ?? '',
        }
      : {
          type: 'in',
          amount: '',
          date: new Date().toISOString().slice(0, 10),
          method: '',
          reference: '',
          vendorId: '',
        }
    )
  }, [open, transaction, reset])

  function handleFileChange(e) {
    const files = Array.from(e.target.files)
    setPendingFiles(prev => [...prev, ...files])
    e.target.value = ''
  }

  function removePending(index) {
    setPendingFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(data) {
    const vendor = vendors?.find(v => v.id === data.vendorId)
    const payload = {
      type: data.type,
      amount: Number(data.amount),
      date: Timestamp.fromDate(new Date(data.date)),
      method: data.method || '',
      reference: data.reference || '',
      vendorId: data.type === 'out' ? (data.vendorId || '') : '',
      vendorName: data.type === 'out' ? (vendor?.name ?? '') : '',
    }

    try {
      let transactionId
      if (isEdit) {
        await update.mutateAsync({ id: transaction.id, ...payload })
        transactionId = transaction.id
      } else {
        const docRef = await add.mutateAsync(payload)
        transactionId = docRef.id
      }

      for (const file of pendingFiles) {
        await uploadFile.mutateAsync({ transactionId, file })
      }

      onOpenChange(false)
    } catch (err) {
      console.error('[TransactionForm submit]', err)
    }
  }

  const existingAttachments = transaction?.attachments ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">

          {/* Type toggle */}
          <div className="space-y-1.5">
            <Label>Type *</Label>
            <div className="flex rounded-md border overflow-hidden">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium transition-colors ${type === 'in' ? 'bg-green-600 text-white' : 'bg-background text-muted-foreground hover:bg-muted'}`}
                onClick={() => setValue('type', 'in')}
              >
                IN — from Client
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium transition-colors ${type === 'out' ? 'bg-red-600 text-white' : 'bg-background text-muted-foreground hover:bg-muted'}`}
                onClick={() => setValue('type', 'out')}
              >
                OUT — to Vendor
              </button>
            </div>
            <input type="hidden" {...register('type')} />
          </div>

          {/* Vendor — only for OUT */}
          {type === 'out' && (
            <div className="space-y-1.5">
              <Label>Vendor</Label>
              <Select value={vendorId || '__none__'} onValueChange={v => setValue('vendorId', v === '__none__' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Select vendor (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— No vendor —</SelectItem>
                  {vendors?.map(v => <SelectItem key={v.id} value={v.id}>{v.name} ({v.category})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Amount (RM) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register('amount', { required: true, min: 0.01 })}
                className={errors.amount ? 'border-destructive' : ''}
              />
              {errors.amount && <p className="text-xs text-destructive">Enter a valid amount.</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" {...register('date', { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <Select value={watch('method') || '__none__'} onValueChange={v => setValue('method', v === '__none__' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None —</SelectItem>
                  {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Reference</Label>
              <Input placeholder="e.g. TT ref, cheque no." {...register('reference')} />
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-1.5">
            <Label>Attachments</Label>

            {/* Existing attachments (edit mode) */}
            {existingAttachments.length > 0 && (
              <ul className="space-y-1 mb-1">
                {existingAttachments.map((att) => (
                  <li key={att.path} className="flex items-center gap-2 text-sm">
                    <Paperclip size={12} className="text-muted-foreground shrink-0" />
                    <a href={att.url} target="_blank" rel="noreferrer" className="truncate text-blue-600 hover:underline flex-1">{att.name}</a>
                    <button
                      type="button"
                      disabled={deleteFile.isPending}
                      onClick={() => deleteFile.mutate({ transactionId: transaction.id, attachment: att })}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Pending files (not yet uploaded) */}
            {pendingFiles.length > 0 && (
              <ul className="space-y-1 mb-1">
                {pendingFiles.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Paperclip size={12} className="shrink-0" />
                    <span className="truncate flex-1">{f.name}</span>
                    <button type="button" onClick={() => removePending(i)} className="hover:text-destructive">
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={13} className="mr-1.5" /> Attach file
            </Button>
            <p className="text-xs text-muted-foreground">PDF or image. Files upload when you save.</p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
