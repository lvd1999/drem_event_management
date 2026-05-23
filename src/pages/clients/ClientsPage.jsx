import { useState, useMemo } from 'react'
import { useClients } from '@/hooks/useClients'
import ClientTable from '@/components/clients/ClientTable'
import ClientForm from '@/components/clients/ClientForm'
import PageHeader from '@/components/common/PageHeader'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function ClientsPage() {
  const { data: clients, isLoading } = useClients()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!clients) return []
    const q = search.toLowerCase()
    return clients.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    )
  }, [clients, search])

  function openCreate() { setSelected(null); setDialogOpen(true) }
  function openEdit(client) { setSelected(client); setDialogOpen(true) }

  return (
    <div>
      <PageHeader
        title="Clients"
        description={`${clients?.length ?? 0} total`}
        action={<Button onClick={openCreate}>+ Add Client</Button>}
      />

      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading
        ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        : <ClientTable clients={filtered} onEdit={openEdit} />
      }

      <ClientForm open={dialogOpen} onOpenChange={setDialogOpen} client={selected} />
    </div>
  )
}
