import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useDeleteClient } from '@/hooks/useClients'
import { useAuth } from '@/context/AuthContext'
import EmptyState from '@/components/common/EmptyState'

export default function ClientTable({ clients, onEdit }) {
  const { role } = useAuth()
  const deleteClient = useDeleteClient()
  const [confirmId, setConfirmId] = useState(null)

  if (!clients?.length) return <EmptyState title="No clients yet" description="Click 'Add Client' to get started." />

  return (
    <>
      <div className="rounded-md border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map(client => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.phone || '—'}</TableCell>
                <TableCell>{client.email || '—'}</TableCell>
                <TableCell className="max-w-xs truncate">{client.address || '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="icon">
                      <Link to={`/clients/${client.id}`}><ExternalLink size={15} /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(client)}>
                      <Pencil size={15} />
                    </Button>
                    {role === 'admin' && (
                      <Button variant="ghost" size="icon" onClick={() => setConfirmId(client.id)}>
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
        title="Delete client?"
        description="This action cannot be undone."
        loading={deleteClient.isPending}
        onConfirm={() => deleteClient.mutate(confirmId, { onSuccess: () => setConfirmId(null) })}
      />
    </>
  )
}
