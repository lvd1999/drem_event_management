import { EVENT_STATUSES } from '@/lib/constants'
import StatusBadge from '@/components/common/StatusBadge'

export default function EventStatusBadge({ status }) {
  const meta = EVENT_STATUSES.find(s => s.value === status)
  if (!meta) return null
  return <StatusBadge label={meta.label} colorClass={meta.color} />
}
