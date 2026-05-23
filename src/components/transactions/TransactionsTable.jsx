import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions'
import { formatRM } from '@/lib/utils'
import EmptyState from '@/components/common/EmptyState'
import TransactionForm from './TransactionForm'

function formatTxDate(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function TransactionsTable({ eventId }) {
  const { data: transactions } = useTransactions(eventId)
  const deleteTransaction = useDeleteTransaction(eventId)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)

  function openCreate() { setEditItem(null); setFormOpen(true) }
  function openEdit(tx) { setEditItem(tx); setFormOpen(true) }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">All Transactions</p>
        <Button size="sm" onClick={openCreate}><Plus size={14} className="mr-1" /> Add</Button>
      </div>

      {!transactions?.length
        ? <EmptyState title="No transactions yet" description="Record client payments received and vendor payments made." />
        : (
          <div className="rounded-md border bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount (RM)</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap text-sm">{formatTxDate(tx.date)}</TableCell>
                    <TableCell>
                      {tx.type === 'in'
                        ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">IN</span>
                        : <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">OUT</span>
                      }
                    </TableCell>
                    <TableCell className="text-sm">{tx.vendorName || '—'}</TableCell>
                    <TableCell className="text-sm">{tx.method || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{tx.reference || '—'}</TableCell>
                    <TableCell className={`text-right font-semibold ${tx.type === 'in' ? 'text-green-700' : 'text-red-700'}`}>
                      {tx.type === 'in' ? '+' : '-'}{formatRM(tx.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(tx)}><Pencil size={13} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteTransaction.mutate(tx.id)}>
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
    </div>
  )
}
