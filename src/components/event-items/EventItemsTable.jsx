import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { useDeleteEventItem } from '@/hooks/useEventItems'
import { formatRM } from '@/lib/utils'
import VendorCategoryBadge from '@/components/vendors/VendorCategoryBadge'
import EventItemForm from './EventItemForm'
import EmptyState from '@/components/common/EmptyState'

export default function EventItemsTable({ eventId, items }) {
  const deleteItem = useDeleteEventItem(eventId)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const subtotal = items?.reduce((sum, i) => sum + (i.totalPrice ?? 0), 0) ?? 0

  function openCreate() { setEditItem(null); setFormOpen(true) }
  function openEdit(item) { setEditItem(item); setFormOpen(true) }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button size="sm" onClick={openCreate}><Plus size={14} className="mr-1" /> Add Item</Button>
      </div>

      {!items?.length
        ? <EmptyState title="No items yet" description="Add services or products for this event." />
        : (
          <div className="rounded-md border bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell>{item.vendorName || '—'}</TableCell>
                    <TableCell>{item.category ? <VendorCategoryBadge category={item.category} /> : '—'}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatRM(item.unitPrice)}</TableCell>
                    <TableCell className="text-right font-medium">{formatRM(item.totalPrice)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil size={13} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteItem.mutate(item.id)}>
                          <Trash2 size={13} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end px-4 py-3 border-t">
              <div className="text-sm font-semibold">Subtotal: {formatRM(subtotal)}</div>
            </div>
          </div>
        )
      }

      <EventItemForm open={formOpen} onOpenChange={setFormOpen} eventId={eventId} item={editItem} />
    </div>
  )
}
