import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuotation, useGenerateQuotation, useUpdateQuotation, useCreateQuotationItem, useUpdateQuotationItem, useDeleteQuotationItem } from '@/hooks/useQuotations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import QuotationLineItem from './QuotationLineItem'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { formatRM } from '@/lib/utils'
import { Plus, Printer } from 'lucide-react'
import { QUOTATION_STATUSES } from '@/lib/constants'

export default function QuotationForm({ eventId, eventItems }) {
  const { data: quotation, isLoading } = useQuotation(eventId)
  const generate = useGenerateQuotation(eventId)
  const updateQuot = useUpdateQuotation(eventId)
  const createItem = useCreateQuotationItem(eventId, quotation?.id)
  const updateItem = useUpdateQuotationItem(eventId, quotation?.id)
  const deleteItem = useDeleteQuotationItem(eventId, quotation?.id)

  const [discount, setDiscount] = useState('')
  const [deposit, setDeposit] = useState('')

  if (isLoading) return <LoadingSpinner />

  if (!quotation) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-muted-foreground text-sm">No quotation yet for this event.</p>
        <Button onClick={() => generate.mutate(eventItems ?? [])} disabled={generate.isPending}>
          {generate.isPending ? 'Generating…' : 'Generate Quotation'}
        </Button>
      </div>
    )
  }

  const items = quotation.items ?? []
  const subtotal = items.reduce((s, i) => s + (i.totalPrice ?? 0), 0)
  const disc = Number(quotation.discountAmount ?? 0)
  const dep = Number(quotation.depositAmount ?? 0)
  const grandTotal = subtotal - disc
  const balanceDue = grandTotal - dep

  async function saveDiscountDeposit() {
    await updateQuot.mutateAsync({
      id: quotation.id,
      discountAmount: Number(discount || quotation.discountAmount),
      depositAmount: Number(deposit || quotation.depositAmount),
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold">{quotation.quotationNo}</p>
          <div className="flex items-center gap-2 mt-1">
            <Select
              value={quotation.status}
              onValueChange={v => updateQuot.mutate({ id: quotation.id, status: v })}
            >
              <SelectTrigger className="h-7 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUOTATION_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to={`/events/${eventId}/quotation/${quotation.id}/print`} target="_blank">
            <Printer size={14} className="mr-1.5" /> Print / PDF
          </Link>
        </Button>
      </div>

      {/* Line items */}
      <div className="rounded-md border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2 w-20 text-right">Qty</th>
              <th className="px-3 py-2 w-32 text-right">Unit Price</th>
              <th className="px-3 py-2 w-32 text-right">Total</th>
              <th className="px-3 py-2 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map(item => (
              <QuotationLineItem
                key={item.id}
                item={item}
                isSaving={updateItem.isPending}
                onSave={data => updateItem.mutate({ id: item.id, ...data, quantity: Number(data.quantity), unitPrice: Number(data.unitPrice) })}
                onDelete={() => deleteItem.mutate(item.id)}
              />
            ))}
          </tbody>
        </table>
        <div className="px-3 py-2 border-t">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => createItem.mutate({ description: 'New item', quantity: 1, unitPrice: 0 })}
            disabled={createItem.isPending}
          >
            <Plus size={13} className="mr-1" /> Add Row
          </Button>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatRM(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Discount (RM)</span>
            <Input
              type="number" step="0.01" min="0" className="h-7 w-28 text-right text-sm"
              defaultValue={quotation.discountAmount}
              onChange={e => setDiscount(e.target.value)}
              onBlur={saveDiscountDeposit}
            />
          </div>
          <div className="flex justify-between text-sm font-semibold border-t pt-2">
            <span>Grand Total</span>
            <span>{formatRM(grandTotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Deposit Paid (RM)</span>
            <Input
              type="number" step="0.01" min="0" className="h-7 w-28 text-right text-sm"
              defaultValue={quotation.depositAmount}
              onChange={e => setDeposit(e.target.value)}
              onBlur={saveDiscountDeposit}
            />
          </div>
          <div className="flex justify-between text-sm font-semibold text-primary">
            <span>Balance Due</span>
            <span>{formatRM(balanceDue)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Quotation Notes</Label>
        <Textarea
          rows={3}
          defaultValue={quotation.notes}
          onBlur={e => updateQuot.mutate({ id: quotation.id, notes: e.target.value })}
        />
      </div>
    </div>
  )
}
