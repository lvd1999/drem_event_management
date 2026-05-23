import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useSettings } from '@/hooks/useSettings'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { formatRM, formatDate } from '@/lib/utils'
import { Printer } from 'lucide-react'

function renderNotesLine(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

export default function QuotationPrintPage() {
  const { eventId, quotationId } = useParams()

  const { data: settings } = useSettings()

  const { data, isLoading } = useQuery({
    queryKey: ['print', quotationId],
    queryFn: async () => {
      const [quotSnap, eventSnap, itemsSnap] = await Promise.all([
        getDoc(doc(db, 'quotations', quotationId)),
        getDoc(doc(db, 'events', eventId)),
        getDocs(query(collection(db, 'quotations', quotationId, 'items'), orderBy('sortOrder'))),
      ])
      const quotation = quotSnap.exists() ? { id: quotSnap.id, ...quotSnap.data() } : null
      const event = eventSnap.exists() ? { id: eventSnap.id, ...eventSnap.data() } : null
      const items = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      return { quotation, event, items }
    },
  })

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (!data?.quotation) return <p className="p-8 text-muted-foreground">Quotation not found.</p>

  const { quotation, event, items } = data
  const subtotal = items.reduce((s, i) => s + (i.totalPrice ?? 0), 0)
  const disc = Number(quotation.discountAmount ?? 0)
  const dep = Number(quotation.depositAmount ?? 0)
  const grandTotal = subtotal - disc
  const balanceDue = grandTotal - dep

  return (
    <>
      <style>{`@media print { .no-print { display: none !important; } @page { margin: 20mm; } }`}</style>

      {/* Print button */}
      <div className="no-print fixed top-4 right-4 z-10">
        <Button onClick={() => window.print()}>
          <Printer size={15} className="mr-1.5" /> Print / Save PDF
        </Button>
      </div>

      {/* A4 content */}
      <div className="max-w-3xl mx-auto px-8 py-10 print:px-0 print:py-0 font-sans text-sm text-gray-800">

        {/* Letterhead */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{settings?.companyName}</h1>
            {settings?.tagline && <p className="text-xs text-gray-500 mt-0.5">{settings.tagline}</p>}
            {settings?.email  && <p className="text-xs text-gray-500">{settings.email}</p>}
            {settings?.phone  && <p className="text-xs text-gray-500">{settings.phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">{settings?.documentTitle}</p>
            <p className="text-xs text-gray-500 mt-0.5">{quotation.quotationNo}</p>
            <p className="text-xs text-gray-500">Issued: {formatDate(quotation.issuedDate)}</p>
            {quotation.validUntil && (
              <p className="text-xs text-gray-500">Valid until: {formatDate(quotation.validUntil)}</p>
            )}
          </div>
        </div>

        {/* Client & Event info */}
        <div className="grid grid-cols-2 gap-6 mb-8 bg-gray-50 rounded-md p-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Client</p>
            <p className="font-medium">{event?.clientName || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Event</p>
            <p className="font-medium">{event?.title || '—'}</p>
            <p className="text-xs text-gray-500">{formatDate(event?.eventDate)}{event?.venue ? ` · ${event.venue}` : ''}</p>
          </div>
        </div>

        {/* Line items table */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
              <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide w-14">Qty</th>
              <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Unit Price</th>
              <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                <td className="py-2 pr-4">
                  <span>{item.description}</span>
                  {item.notes && (
                    <div className="mt-1">
                      {item.notes.split('\n').map((line, idx) =>
                        line
                          ? <p key={idx} className="text-xs text-gray-400 leading-snug">{renderNotesLine(line)}</p>
                          : <p key={idx} className="h-2" />
                      )}
                    </div>
                  )}
                </td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatRM(item.unitPrice)}</td>
                <td className="py-2 text-right font-medium">{formatRM(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatRM(subtotal)}</span>
            </div>
            {disc > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount</span>
                <span>– {formatRM(disc)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t border-gray-300 pt-2">
              <span>Grand Total</span>
              <span>{formatRM(grandTotal)}</span>
            </div>
            {dep > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Deposit Paid</span>
                <span>– {formatRM(dep)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t-2 border-gray-800 pt-2">
              <span>Balance Due</span>
              <span>{formatRM(balanceDue)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quotation.notes && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Notes</p>
            <p className="whitespace-pre-wrap text-gray-700">{quotation.notes}</p>
          </div>
        )}

        {/* Terms */}
        {settings?.termsText && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Terms &amp; Conditions</p>
            <ul className="text-xs text-gray-500 space-y-0.5 list-disc list-inside">
              {settings.termsText.split('\n').filter(Boolean).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        {settings?.footerText && (
          <div className="mt-10 text-center text-xs text-gray-400">
            {settings.footerText}
          </div>
        )}
      </div>
    </>
  )
}
