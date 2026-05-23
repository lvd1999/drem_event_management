import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import EventCard from '@/components/events/EventCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { Users, ShoppingBag, CalendarDays, CalendarCheck } from 'lucide-react'

function startOfDay(d) {
  const t = new Date(d); t.setHours(0,0,0,0); return Timestamp.fromDate(t)
}
function endOfDay(d) {
  const t = new Date(d); t.setHours(23,59,59,999); return Timestamp.fromDate(t)
}

function useStats() {
  const today = new Date()
  const thirtyDaysLater = new Date(today); thirtyDaysLater.setDate(today.getDate() + 30)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [clients, vendors, upcoming, thisMonth] = await Promise.all([
        getDocs(collection(db, 'clients')),
        getDocs(collection(db, 'vendors')),
        getDocs(query(
          collection(db, 'events'),
          where('eventDate', '>=', startOfDay(today)),
          where('eventDate', '<=', endOfDay(thirtyDaysLater)),
          where('status', '==', 'upcoming'),
        )),
        getDocs(query(
          collection(db, 'events'),
          where('eventDate', '>=', startOfDay(monthStart)),
          where('eventDate', '<=', endOfDay(monthEnd)),
        )),
      ])
      return {
        clients: clients.size,
        vendors: vendors.size,
        upcoming: upcoming.size,
        thisMonth: thisMonth.size,
      }
    },
    staleTime: 30_000,
  })
}

function useUpcomingEvents() {
  const today = new Date()
  return useQuery({
    queryKey: ['dashboard-upcoming'],
    queryFn: async () => {
      const snap = await getDocs(query(
        collection(db, 'events'),
        where('eventDate', '>=', startOfDay(today)),
        orderBy('eventDate', 'asc'),
        limit(10),
      ))
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    },
    staleTime: 30_000,
  })
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-md ${color}`}><Icon size={16} className="text-white" /></div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value ?? '—'}</p>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading: loadingStats } = useStats()
  const { data: events, isLoading: loadingEvents } = useUpcomingEvents()
  const today = new Date().toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{today}</p>
      </div>

      {loadingStats
        ? <div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>
        : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Clients"    value={stats?.clients}   icon={Users}         color="bg-blue-500" />
            <StatCard title="Total Vendors"    value={stats?.vendors}   icon={ShoppingBag}   color="bg-purple-500" />
            <StatCard title="Upcoming (30d)"   value={stats?.upcoming}  icon={CalendarDays}  color="bg-orange-500" />
            <StatCard title="Events This Month" value={stats?.thisMonth} icon={CalendarCheck} color="bg-green-500" />
          </div>
        )
      }

      <h2 className="text-base font-semibold mb-3">Upcoming Events</h2>
      {loadingEvents
        ? <LoadingSpinner />
        : !events?.length
          ? <EmptyState title="No upcoming events" description="All caught up!" />
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {events.map(ev => <EventCard key={ev.id} event={ev} />)}
            </div>
          )
      }
    </div>
  )
}
