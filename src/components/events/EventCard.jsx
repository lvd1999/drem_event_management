import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import EventStatusBadge from './EventStatusBadge'
import { formatDate } from '@/lib/utils'
import { MapPin } from 'lucide-react'

export default function EventCard({ event }) {
  return (
    <Link to={`/events/${event.id}`} className="block">
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{event.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{event.clientName || '—'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(event.eventDate)}{event.eventTime ? ` · ${event.eventTime}` : ''}</p>
              {event.venue && (
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <MapPin size={11} />{event.venue}
                </p>
              )}
            </div>
            <EventStatusBadge status={event.status} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
