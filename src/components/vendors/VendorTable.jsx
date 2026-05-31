import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import VendorCategoryBadge from './VendorCategoryBadge'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useDeleteVendor } from '@/hooks/useVendors'
import { useAuth } from '@/context/AuthContext'
import EmptyState from '@/components/common/EmptyState'

export default function VendorTable({ vendors, onEdit }) {
  const { role } = useAuth()
  const navigate = useNavigate()
  const deleteVendor = useDeleteVendor()
  const [confirmId, setConfirmId] = useState(null)

  if (!vendors?.length) return <EmptyState title="No vendors yet" description="Click 'Add Vendor' to get started." />

  return (
    <>
      <div className="rounded-md border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="hidden sm:table-cell">Phone</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Contact Person</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map(v => (
              <TableRow key={v.id} className="cursor-pointer" onClick={() => navigate(`/vendors/${v.id}`)}>
                <TableCell className="font-medium">{v.name}</TableCell>
                <TableCell><VendorCategoryBadge category={v.category} /></TableCell>
                <TableCell className="hidden sm:table-cell">{v.phone || '—'}</TableCell>
                <TableCell className="hidden md:table-cell">{v.email || '—'}</TableCell>
                <TableCell className="hidden md:table-cell">{v.contact || '—'}</TableCell>
                <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(v)}>
                      <Pencil size={15} />
                    </Button>
                    {role === 'admin' && (
                      <Button variant="ghost" size="icon" onClick={() => setConfirmId(v.id)}>
                        <Trash2 size={15} className="text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={Boolean(confirmId)}
        onOpenChange={() => setConfirmId(null)}
        title="Delete vendor?"
        description="This action cannot be undone."
        loading={deleteVendor.isPending}
        onConfirm={() => deleteVendor.mutate(confirmId, { onSuccess: () => setConfirmId(null) })}
      />
    </>
  )
}
