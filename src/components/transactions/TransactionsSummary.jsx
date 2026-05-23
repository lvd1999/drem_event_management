import { formatRM } from '@/lib/utils'

export default function TransactionsSummary({ transactions, quotation }) {
  const totalIn = transactions?.filter(t => t.type === 'in').reduce((s, t) => s + (t.amount ?? 0), 0) ?? 0
  const totalOut = transactions?.filter(t => t.type === 'out').reduce((s, t) => s + (t.amount ?? 0), 0) ?? 0
  const balance = totalIn - totalOut

  const subtotal = quotation?.items?.reduce((s, i) => s + (i.totalPrice ?? 0), 0) ?? 0
  const grandTotal = quotation ? subtotal - (quotation.discountAmount ?? 0) : null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <SummaryCard
        label="Total Quoted"
        value={grandTotal !== null ? formatRM(grandTotal) : '—'}
        sub={grandTotal !== null ? null : 'No quotation yet'}
        color="default"
      />
      <SummaryCard
        label="Total Received"
        value={formatRM(totalIn)}
        sub="From client"
        color="green"
      />
      <SummaryCard
        label="Total Paid Out"
        value={formatRM(totalOut)}
        sub="To vendors"
        color="red"
      />
      <SummaryCard
        label="Net Balance"
        value={formatRM(balance)}
        sub="Received − Paid out"
        color={balance >= 0 ? 'green' : 'red'}
      />
    </div>
  )
}

function SummaryCard({ label, value, sub, color }) {
  const valueClass =
    color === 'green' ? 'text-green-700' :
    color === 'red' ? 'text-red-700' :
    'text-foreground'

  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-lg font-bold ${valueClass}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}
