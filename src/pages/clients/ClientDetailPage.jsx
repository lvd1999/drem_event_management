import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import PageHeader from '@/components/common/PageHeader'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Pencil, ArrowLeft, CalendarDays } from 'lucide-react'
import ClientForm from '@/components/clients/ClientForm'
import { formatDate } from '@/lib/utils'
import { EVENT_STATUSES } from '@/lib/constants'
import StatusBadge from '@/components/common/StatusBadge'

export default function ClientDetailPage() {
  const { id } = useParams()
  const [editOpen, setEditOpen] = useState(false)

  const { data: client, isLoading: loadingClient } = useQuery({
    queryKey: ['clients', id],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'clients', id))
      return snap.exists() ? { id: snap.id, ...snap.data() } : null
    },
  })

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ['events', 'byClient', id],
    queryFn: async () => {
      const snap = await getDocs(
        query(collection(db, 'events'), where('clientId', '==', id))
      )
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const aMs = a.eventDate?.toMillis?.() ?? new Date(a.eventDate ?? 0).getTime()
          const bMs = b.eventDate?.toMillis?.() ?? new Date(b.eventDate ?? 0).getTime()
          return bMs - aMs
        })
    },
  })

  if (loadingClient) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
  if (!client) return <p className="text-muted-foreground">Client not found.</p>

  const statusMeta = (status) => EVENT_STATUSES.find(s => s.value === status)

  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2">
          <Link to="/clients"><ArrowLeft size={15} /> Back to Clients</Link>
        </Button>
      </div>

      <PageHeader
        title={client.name}
        action={<Button variant="outline" onClick={() => setEditOpen(true)}><Pencil size={14} className="mr-1.5" /> Edit</Button>}
      />

      <Card className="mb-6">
        <CardContent className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><p className="text-muted-foreground text-xs mb-0.5">Phone</p><p>{client.phone || '—'}</p></div>
          <div><p className="text-muted-foreground text-xs mb-0.5">Email</p><p>{client.email || '—'}</p></div>
          <div className="col-span-2"><p className="text-muted-foreground text-xs mb-0.5">Address</p><p>{client.address || '—'}</p></div>
          {client.notes && (
            <div className="col-span-2 md:col-span-4">
              <p className="text-muted-foreground text-xs mb-0.5">Notes</p>
              <p className="whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
        <CalendarDays size={16} /> Events
      </h2>

      {loadingEvents
        ? <LoadingSpinner />
        : !events?.length
          ? <p className="text-sm text-muted-foreground">No events linked to this client.</p>
          : (
            <div className="space-y-2">
              {events.map(ev => {
                const meta = statusMeta(ev.status)
                return (
                  <Link key={ev.id} to={`/events/${ev.id}`} className="block">
                    <Card className="hover:shadow-sm transition-shadow">
                      <CardContent className="pt-3 pb-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{ev.title}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(ev.eventDate)} {ev.venue ? `· ${ev.venue}` : ''}</p>
                        </div>
                        {meta && <StatusBadge label={meta.label} colorClass={meta.color} />}
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )
      }

      <ClientForm open={editOpen} onOpenChange={setEditOpen} client={client} />
    </div>
  )
}
