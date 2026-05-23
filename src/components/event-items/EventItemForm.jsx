import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useVendors } from '@/hooks/useVendors'
import { useCreateEventItem, useUpdateEventItem } from '@/hooks/useEventItems'

export default function EventItemForm({ open, onOpenChange, eventId, item }) {
  const isEdit = Boolean(item)
  const create = useCreateEventItem(eventId)
  const update = useUpdateEventItem(eventId)
  const loading = create.isPending || update.isPending
  const { data: vendors } = useVendors()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm()
  const vendorId = watch('vendorId')

  useEffect(() => {
    reset(item
      ? { vendorId: item.vendorId ?? '', description: item.description, category: item.category ?? '', quantity: item.quantity, unitPrice: item.unitPrice, notes: item.notes ?? '' }
      : { vendorId: '', description: '', category: '', quantity: 1, unitPrice: 0, notes: '' }
    )
  }, [item, reset])

  function handleVendorChange(id) {
    setValue('vendorId', id)
    const v = vendors?.find(v => v.id === id)
    if (v) {
      setValue('category', v.category)
    }
  }

  async function onSubmit(data) {
    const vendor = vendors?.find(v => v.id === data.vendorId)
    const payload = {
      ...data,
      quantity: Number(data.quantity),
      unitPrice: Number(data.unitPrice),
      vendorName: vendor?.name ?? '',
      category: data.category || vendor?.category || '',
    }
    if (isEdit) await update.mutateAsync({ id: item.id, ...payload })
    else await create.mutateAsync(payload)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Item' : 'Add Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Vendor</Label>
            <Select value={vendorId} onValueChange={handleVendorChange}>
              <SelectTrigger><SelectValue placeholder="Select vendor (optional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">— No vendor —</SelectItem>
                {vendors?.map(v => <SelectItem key={v.id} value={v.id}>{v.name} ({v.category})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Description *</Label>
            <Input {...register('description', { required: true })} className={errors.description ? 'border-destructive' : ''} />
            {errors.description && <p className="text-xs text-destructive">Description is required.</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input type="number" step="0.01" min="0" {...register('quantity')} />
            </div>
            <div className="space-y-1.5">
              <Label>Unit Price (RM)</Label>
              <Input type="number" step="0.01" min="0" {...register('unitPrice')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={2} {...register('notes')} />
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
