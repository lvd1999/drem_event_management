import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useVendors } from '@/hooks/useVendors'
import { useAddTransaction, useUpdateTransaction } from '@/hooks/useTransactions'
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
  const loading = add.isPending || update.isPending
  const { data: vendors } = useVendors()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm()
  const type = watch('type', 'in')
  const vendorId = watch('vendorId', '')

  useEffect(() => {
    if (!open) return
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
    if (isEdit) await update.mutateAsync({ id: transaction.id, ...payload })
    else await add.mutateAsync(payload)
    onOpenChange(false)
  }

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

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
