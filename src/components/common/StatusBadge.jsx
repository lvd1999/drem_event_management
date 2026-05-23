import { cn } from '@/lib/utils'

export default function StatusBadge({ label, colorClass }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', colorClass)}>
      {label}
    </span>
  )
}
