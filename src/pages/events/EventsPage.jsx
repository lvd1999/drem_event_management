import { useState, useMemo } from 'react'
import { useEvents } from '@/hooks/useEvents'
import EventTable from '@/components/events/EventTable'
import EventForm from '@/components/events/EventForm'
import PageHeader from '@/components/common/PageHeader'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EVENT_STATUSES } from '@/lib/constants'

export default function EventsPage() {
  const { data: events, isLoading } = useEvents()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    if (!events) return []
    return statusFilter === 'all' ? events : events.filter(e => e.status === statusFilter)
  }, [events, statusFilter])

  function openCreate() { setSelected(null); setDialogOpen(true) }
  function openEdit(event) { setSelected(event); setDialogOpen(true) }

  return (
    <div>
      <PageHeader
        title="Events"
        description={`${events?.length ?? 0} total`}
        action={<Button onClick={openCreate}>+ Add Event</Button>}
      />

      <div className="mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {EVENT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading
        ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        : <EventTable events={filtered} onEdit={openEdit} />
      }

      <EventForm open={dialogOpen} onOpenChange={setDialogOpen} event={selected} />
    </div>
  )
}
