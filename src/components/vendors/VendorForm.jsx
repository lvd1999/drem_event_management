import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateVendor, useUpdateVendor } from '@/hooks/useVendors'
import { VENDOR_CATEGORIES } from '@/lib/constants'

export default function VendorForm({ open, onOpenChange, vendor }) {
  const isEdit = Boolean(vendor)
  const create = useCreateVendor()
  const update = useUpdateVendor()
  const loading = create.isPending || update.isPending

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm()
  const category = watch('category')

  useEffect(() => {
    reset(vendor ?? { name: '', category: '', contact: '', email: '', phone: '', notes: '' })
  }, [vendor, reset])

  async function onSubmit(data) {
    if (isEdit) await update.mutateAsync({ id: vendor.id, ...data })
    else await create.mutateAsync(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input {...register('name', { required: true })} className={errors.name ? 'border-destructive' : ''} />
            {errors.name && <p className="text-xs text-destructive">Name is required.</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select value={category} onValueChange={v => setValue('category', v)}>
              <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {VENDOR_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <input type="hidden" {...register('category', { required: true })} />
            {errors.category && <p className="text-xs text-destructive">Category is required.</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input {...register('phone')} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Contact Person</Label>
            <Input {...register('contact')} />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={3} {...register('notes')} />
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
