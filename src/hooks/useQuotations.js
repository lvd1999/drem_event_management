import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, serverTimestamp, runTransaction, where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

function quotItemsCol(quotationId) {
  return collection(db, 'quotations', quotationId, 'items')
}

export function useQuotation(eventId) {
  return useQuery({
    queryKey: ['quotations', 'byEvent', eventId],
    queryFn: async () => {
      const snap = await getDocs(query(collection(db, 'quotations'), where('eventId', '==', eventId)))
      if (snap.empty) return null
      const qDoc = snap.docs[0]
      const itemsSnap = await getDocs(query(quotItemsCol(qDoc.id), orderBy('sortOrder')))
      return {
        id: qDoc.id,
        ...qDoc.data(),
        items: itemsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      }
    },
    enabled: Boolean(eventId),
  })
}

export function useGenerateQuotation(eventId) {
  const qc = useQueryClient()
  const { currentUser } = useAuth()
  return useMutation({
    mutationFn: async (eventItems) => {
      const counterRef = doc(db, 'counters', 'quotations')
      const year = new Date().getFullYear()
      let quotationNo

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(counterRef)
        const data = snap.exists() ? snap.data() : { year, seq: 0 }
        const seq = data.year === year ? data.seq + 1 : 1
        quotationNo = `DREM-${year}-${String(seq).padStart(3, '0')}`
        tx.set(counterRef, { year, seq })
      })

      const quotRef = await addDoc(collection(db, 'quotations'), {
        eventId,
        quotationNo,
        status: 'draft',
        issuedDate: serverTimestamp(),
        discountAmount: 0,
        depositAmount: 0,
        notes: '',
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      for (let i = 0; i < eventItems.length; i++) {
        const item = eventItems[i]
        await addDoc(quotItemsCol(quotRef.id), {
          description: item.description,
          quantity: item.quantity ?? 1,
          unitPrice: item.unitPrice ?? 0,
          totalPrice: (item.quantity ?? 1) * (item.unitPrice ?? 0),
          sortOrder: i,
        })
      }
      return quotRef.id
    },
    onSuccess: () => { qc.invalidateQueries(['quotations', 'byEvent', eventId]); toast.success('Quotation generated.') },
    onError: () => toast.error('Failed to generate quotation.'),
  })
}

export function useUpdateQuotation(eventId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      updateDoc(doc(db, 'quotations', id), { ...data, updatedAt: serverTimestamp() }),
    onSuccess: () => qc.invalidateQueries(['quotations', 'byEvent', eventId]),
    onError: () => toast.error('Failed to update quotation.'),
  })
}

export function useCreateQuotationItem(eventId, quotationId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
      addDoc(quotItemsCol(quotationId), {
        ...data,
        totalPrice: (data.quantity ?? 1) * (data.unitPrice ?? 0),
        sortOrder: Date.now(),
      }),
    onSuccess: () => qc.invalidateQueries(['quotations', 'byEvent', eventId]),
    onError: () => toast.error('Failed to add item.'),
  })
}

export function useUpdateQuotationItem(eventId, quotationId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      updateDoc(doc(db, 'quotations', quotationId, 'items', id), {
        ...data,
        totalPrice: (data.quantity ?? 1) * (data.unitPrice ?? 0),
      }),
    onSuccess: () => qc.invalidateQueries(['quotations', 'byEvent', eventId]),
    onError: () => toast.error('Failed to update item.'),
  })
}

export function useDeleteQuotationItem(eventId, quotationId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteDoc(doc(db, 'quotations', quotationId, 'items', id)),
    onSuccess: () => qc.invalidateQueries(['quotations', 'byEvent', eventId]),
    onError: () => toast.error('Failed to delete item.'),
  })
}
