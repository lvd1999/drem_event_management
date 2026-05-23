import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2, Check } from 'lucide-react'
import { formatRM } from '@/lib/utils'

export default function QuotationLineItem({ item, onSave, onDelete, isSaving }) {
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: { description: item.description, quantity: item.quantity, unitPrice: item.unitPrice, notes: item.notes ?? '' },
  })

  useEffect(() => {
    reset({ description: item.description, quantity: item.quantity, unitPrice: item.unitPrice, notes: item.notes ?? '' })
  }, [item, reset])

  const qty = Number(watch('quantity') || 0)
  const price = Number(watch('unitPrice') || 0)
  const total = qty * price

  return (
    <tr>
      <td className="px-3 py-2">
        <Input {...register('description')} className="h-8 text-sm" />
        <Input {...register('notes')} className="h-7 text-xs text-muted-foreground mt-1" placeholder="Notes (optional)" />
      </td>
      <td className="px-3 py-2 w-20">
        <Input type="number" step="0.01" min="0" {...register('quantity')} className="h-8 text-sm text-right" />
      </td>
      <td className="px-3 py-2 w-32">
        <Input type="number" step="0.01" min="0" {...register('unitPrice')} className="h-8 text-sm text-right" />
      </td>
      <td className="px-3 py-2 w-32 text-right text-sm font-medium">{formatRM(total)}</td>
      <td className="px-3 py-2 w-20 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isSaving} onClick={handleSubmit(onSave)}>
            <Check size={13} className="text-green-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
            <Trash2 size={13} className="text-destructive" />
          </Button>
        </div>
      </td>
    </tr>
  )
}
