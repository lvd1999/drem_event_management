import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Plus, Paperclip } from 'lucide-react'
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions'
import { formatRM } from '@/lib/utils'
import EmptyState from '@/components/common/EmptyState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import TransactionForm from './TransactionForm'

function formatTxDate(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

function toDateStr(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toISOString().slice(0, 10)
}

export default function TransactionsTable({ eventId }) {
  const { data: transactions } = useTransactions(eventId)
  const deleteTransaction = useDeleteTransaction(eventId)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const [filterType, setFilterType] = useState('all')
  const [filterVendor, setFilterVendor] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  function openCreate() { setEditItem(null); setFormOpen(true) }
  function openEdit(tx) { setEditItem(tx); setFormOpen(true) }

  const filtered = useMemo(() => {
    if (!transactions) return []
    return transactions.filter(tx => {
      if (filterType !== 'all' && tx.type !== filterType) return false
      if (filterVendor && !(tx.vendorName ?? '').toLowerCase().includes(filterVendor.toLowerCase())) return false
      const dateStr = toDateStr(tx.date)
      if (filterFrom && dateStr < filterFrom) return false
      if (filterTo && dateStr > filterTo) return false
      return true
    })
  }, [transactions, filterType, filterVendor, filterFrom, filterTo])

  const hasFilters = filterType !== 'all' || filterVendor || filterFrom || filterTo

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">All Transactions</p>
        <Button size="sm" onClick={openCreate}><Plus size={14} className="mr-1" /> Add</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Type toggle */}
        <div className="flex rounded-md border overflow-hidden text-xs font-medium">
          {['all', 'in', 'out'].map(t => (
            <button
              key={t}
              type="button"
              className={`px-3 py-1.5 transition-colors ${filterType === t ? (t === 'in' ? 'bg-green-600 text-white' : t === 'out' ? 'bg-red-600 text-white' : 'bg-foreground text-background') : 'bg-background text-muted-foreground hover:bg-muted'}`}
              onClick={() => setFilterType(t)}
            >
              {t === 'all' ? 'All' : t === 'in' ? 'IN' : 'OUT'}
            </button>
          ))}
        </div>

        <Input
          placeholder="Filter vendor…"
          value={filterVendor}
          onChange={e => setFilterVendor(e.target.value)}
          className="h-8 w-36 text-sm"
        />

        <Input
          type="date"
          value={filterFrom}
          onChange={e => setFilterFrom(e.target.value)}
          className="h-8 w-36 text-sm"
          title="From date"
        />
        <span className="text-muted-foreground text-xs">to</span>
        <Input
          type="date"
          value={filterTo}
          onChange={e => setFilterTo(e.target.value)}
          className="h-8 w-36 text-sm"
          title="To date"
        />

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={() => { setFilterType('all'); setFilterVendor(''); setFilterFrom(''); setFilterTo('') }}
          >
            Clear
          </Button>
        )}
      </div>

      {!transactions?.length
        ? <EmptyState title="No transactions yet" description="Record client payments received and vendor payments made." />
        : filtered.length === 0
          ? <p className="text-sm text-muted-foreground py-6 text-center">No transactions match the current filters.</p>
          : (
            <div className="rounded-md border bg-white overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Vendor</TableHead>
                    <TableHead className="hidden md:table-cell">Method</TableHead>
                    <TableHead className="hidden md:table-cell">Reference</TableHead>
                    <TableHead className="hidden lg:table-cell">Attachments</TableHead>
                    <TableHead className="text-right">Amount (RM)</TableHead>
                    <TableHead className="w-20 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(tx => (
                    <TableRow key={tx.id}>
                      <TableCell className="whitespace-nowrap text-sm">{formatTxDate(tx.date)}</TableCell>
                      <TableCell>
                        {tx.type === 'in'
                          ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">IN</span>
                          : <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">OUT</span>
                        }
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{tx.vendorName || '—'}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{tx.method || '—'}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{tx.reference || '—'}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        <AttachmentCell attachments={tx.attachments} />
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${tx.type === 'in' ? 'text-green-700' : 'text-red-700'}`}>
                        {tx.type === 'in' ? '+' : '-'}{formatRM(tx.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(tx)}><Pencil size={13} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setConfirmId(tx.id)}>
                            <Trash2 size={13} className="text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
      }

      <TransactionForm open={formOpen} onOpenChange={setFormOpen} eventId={eventId} transaction={editItem} />

      <ConfirmDialog
        open={Boolean(confirmId)}
        onOpenChange={() => setConfirmId(null)}
        title="Delete transaction?"
        description="This action cannot be undone."
        loading={deleteTransaction.isPending}
        onConfirm={() => deleteTransaction.mutate(confirmId, { onSuccess: () => setConfirmId(null) })}
      />
    </div>
  )
}

function AttachmentCell({ attachments }) {
  if (!attachments?.length) return <span className="text-muted-foreground">—</span>
  const [first, ...rest] = attachments
  return (
    <div className="flex flex-col gap-0.5">
      <a href={first.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline truncate max-w-[140px]">
        <Paperclip size={11} className="shrink-0" />
        <span className="truncate">{first.name}</span>
      </a>
      {rest.length > 0 && (
        <span className="text-xs text-muted-foreground">+{rest.length} more</span>
      )}
    </div>
  )
}
