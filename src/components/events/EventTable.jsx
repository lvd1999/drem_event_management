import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import EventStatusBadge from './EventStatusBadge'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useDeleteEvent } from '@/hooks/useEvents'
import { useAuth } from '@/context/AuthContext'
import EmptyState from '@/components/common/EmptyState'
import { formatDate } from '@/lib/utils'

export default function EventTable({ events, onEdit }) {
  const { role } = useAuth()
  const deleteEvent = useDeleteEvent()
  const [confirmId, setConfirmId] = useState(null)

  if (!events?.length) return <EmptyState title="No events found" description="Adjust filters or add a new event." />

  return (
    <>
      <div className="rounded-md border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map(ev => (
              <TableRow key={ev.id}>
                <TableCell className="font-medium">{ev.title}</TableCell>
                <TableCell>{ev.clientName || '—'}</TableCell>
                <TableCell className="whitespace-nowrap">{formatDate(ev.eventDate)}</TableCell>
                <TableCell className="max-w-xs truncate">{ev.venue || '—'}</TableCell>
                <TableCell><EventStatusBadge status={ev.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="icon">
                      <Link to={`/events/${ev.id}`}><ExternalLink size={15} /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(ev)}>
                      <Pencil size={15} />
                    </Button>
                    {role === 'admin' && (
                      <Button variant="ghost" size="icon" onClick={() => setConfirmId(ev.id)}>
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
        title="Delete event?"
        description="All items, tasks, and quotations for this event will also be deleted."
        loading={deleteEvent.isPending}
        onConfirm={() => deleteEvent.mutate(confirmId, { onSuccess: () => setConfirmId(null) })}
      />
    </>
  )
}
