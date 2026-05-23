import { useState, useMemo } from 'react'
import { useVendors } from '@/hooks/useVendors'
import VendorTable from '@/components/vendors/VendorTable'
import VendorForm from '@/components/vendors/VendorForm'
import PageHeader from '@/components/common/PageHeader'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { VENDOR_CATEGORIES } from '@/lib/constants'

export default function VendorsPage() {
  const { data: vendors, isLoading } = useVendors()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filtered = useMemo(() => {
    if (!vendors) return []
    return vendors.filter(v => {
      const matchCat = categoryFilter === 'all' || v.category === categoryFilter
      const q = search.toLowerCase()
      const matchSearch = !q || v.name?.toLowerCase().includes(q) || v.contact?.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [vendors, search, categoryFilter])

  function openCreate() { setSelected(null); setDialogOpen(true) }
  function openEdit(vendor) { setSelected(vendor); setDialogOpen(true) }

  return (
    <div>
      <PageHeader
        title="Vendors"
        description={`${vendors?.length ?? 0} total`}
        action={<Button onClick={openCreate}>+ Add Vendor</Button>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search vendors…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {VENDOR_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading
        ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        : <VendorTable vendors={filtered} onEdit={openEdit} />
      }

      <VendorForm open={dialogOpen} onOpenChange={setDialogOpen} vendor={selected} />
    </div>
  )
}
