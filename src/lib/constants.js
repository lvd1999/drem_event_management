export const VENDOR_CATEGORIES = [
  'Pelamin',
  'Catering',
  'Photography',
  'Videography',
  'Florist',
  'Sound & Lighting',
  'MC',
  'Wardrobe',
  'Makeup',
  'Event Management (in-house)',
  'Others',
]

export const EVENT_STATUSES = [
  { value: 'upcoming',  label: 'Upcoming',  color: 'bg-blue-100 text-blue-800' },
  { value: 'ongoing',   label: 'Ongoing',   color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
]

export const QUOTATION_STATUSES = [
  { value: 'draft',    label: 'Draft',    color: 'bg-gray-100 text-gray-700' },
  { value: 'sent',     label: 'Sent',     color: 'bg-blue-100 text-blue-800' },
  { value: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
]

export const CATEGORY_COLORS = {
  'Pelamin':          'bg-purple-100 text-purple-800',
  'Catering':         'bg-orange-100 text-orange-800',
  'Photography':      'bg-pink-100 text-pink-800',
  'Videography':      'bg-rose-100 text-rose-800',
  'Florist':          'bg-green-100 text-green-800',
  'Sound & Lighting': 'bg-yellow-100 text-yellow-800',
  'MC':               'bg-teal-100 text-teal-800',
  'Wardrobe':         'bg-indigo-100 text-indigo-800',
  'Makeup':                    'bg-fuchsia-100 text-fuchsia-800',
  'Event Management (in-house)': 'bg-cyan-100 text-cyan-800',
  'Others':                    'bg-gray-100 text-gray-700',
}
