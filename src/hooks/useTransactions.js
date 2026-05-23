import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'sonner'

function txCol(eventId) {
  return collection(db, 'events', eventId, 'transactions')
}

export function useTransactions(eventId) {
  return useQuery({
    queryKey: ['transactions', eventId],
    queryFn: async () => {
      const snap = await getDocs(query(txCol(eventId), orderBy('date', 'desc')))
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    },
    enabled: Boolean(eventId),
  })
}

export function useAddTransaction(eventId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
      addDoc(txCol(eventId), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    onSuccess: () => { qc.invalidateQueries(['transactions', eventId]); toast.success('Transaction recorded.') },
    onError: () => toast.error('Failed to record transaction.'),
  })
}

export function useUpdateTransaction(eventId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      updateDoc(doc(db, 'events', eventId, 'transactions', id), {
        ...data,
        updatedAt: serverTimestamp(),
      }),
    onSuccess: () => qc.invalidateQueries(['transactions', eventId]),
    onError: () => toast.error('Failed to update transaction.'),
  })
}

export function useDeleteTransaction(eventId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteDoc(doc(db, 'events', eventId, 'transactions', id)),
    onSuccess: () => { qc.invalidateQueries(['transactions', eventId]); toast.success('Transaction deleted.') },
    onError: () => toast.error('Failed to delete transaction.'),
  })
}
