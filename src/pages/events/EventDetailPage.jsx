import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Pencil } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EventStatusBadge from '@/components/events/EventStatusBadge'
import EventForm from '@/components/events/EventForm'
import EventItemsTable from '@/components/event-items/EventItemsTable'
import ChecklistPanel from '@/components/checklist/ChecklistPanel'
import QuotationForm from '@/components/quotations/QuotationForm'
import TransactionsSummary from '@/components/transactions/TransactionsSummary'
import TransactionsTable from '@/components/transactions/TransactionsTable'
import { useEventItems } from '@/hooks/useEventItems'
import { useTransactions } from '@/hooks/useTransactions'
import { useQuotation } from '@/hooks/useQuotations'
import { formatDate } from '@/lib/utils'

export default function EventDetailPage() {
  const { id } = useParams()
  const [editOpen, setEditOpen] = useState(false)

  const { data: event, isLoading } = useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'events', id))
      return snap.exists() ? { id: snap.id, ...snap.data() } : null
    },
  })

  const { data: eventItems } = useEventItems(id)
  const { data: transactions } = useTransactions(id)
  const { data: quotation } = useQuotation(id)

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
  if (!event) return <p className="text-muted-foreground">Event not found.</p>

  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2">
          <Link to="/events"><ArrowLeft size={15} /> Back to Events</Link>
        </Button>
      </div>

      <PageHeader
        title={event.title}
        action={
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil size={14} className="mr-1.5" /> Edit Event
          </Button>
        }
      />

      <Tabs defaultValue="info" className="mt-2">
        <TabsList className="mb-4">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="quotation">Quotation</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
        </TabsList>

        {/* Tab 1: Event Info */}
        <TabsContent value="info">
          <Card>
            <CardContent className="pt-5 grid grid-cols-2 md:grid-cols-3 gap-5 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Date</p>
                <p className="font-medium">{formatDate(event.eventDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Time</p>
                <p>{event.eventTime || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                <EventStatusBadge status={event.status} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Client</p>
                <p>{event.clientName || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-0.5">Venue</p>
                <p>{event.venue || '—'}</p>
              </div>
              {event.remarks && (
                <div className="col-span-2 md:col-span-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Remarks</p>
                  <p className="whitespace-pre-wrap">{event.remarks}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Items */}
        <TabsContent value="items">
          <EventItemsTable eventId={id} items={eventItems} />
        </TabsContent>

        {/* Tab 3: Checklist */}
        <TabsContent value="checklist">
          <ChecklistPanel eventId={id} />
        </TabsContent>

        {/* Tab 4: Quotation */}
        <TabsContent value="quotation">
          <QuotationForm eventId={id} eventItems={eventItems} />
        </TabsContent>

        {/* Tab 5: Finance */}
        <TabsContent value="finance">
          <TransactionsSummary transactions={transactions} quotation={quotation} />
          <TransactionsTable eventId={id} />
        </TabsContent>
      </Tabs>

      <EventForm open={editOpen} onOpenChange={setEditOpen} event={event} />
    </div>
  )
}
