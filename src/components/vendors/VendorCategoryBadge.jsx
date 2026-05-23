import { CATEGORY_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function VendorCategoryBadge({ category }) {
  const color = CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', color)}>
      {category}
    </span>
  )
}
