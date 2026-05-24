import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, serverTimestamp, arrayUnion, arrayRemove,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
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
        attachments: [],
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

export function useUploadTransactionFile(eventId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ transactionId, file }) => {
      const path = `events/${eventId}/transactions/${transactionId}/${file.name}`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await updateDoc(doc(db, 'events', eventId, 'transactions', transactionId), {
        attachments: arrayUnion({ name: file.name, url, path }),
        updatedAt: serverTimestamp(),
      })
    },
    onSuccess: () => qc.invalidateQueries(['transactions', eventId]),
    onError: (err) => { console.error('[upload file]', err); toast.error(`Upload failed: ${err?.message ?? err}`) },
  })
}

export function useDeleteTransactionFile(eventId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ transactionId, attachment }) => {
      await deleteObject(ref(storage, attachment.path))
      await updateDoc(doc(db, 'events', eventId, 'transactions', transactionId), {
        attachments: arrayRemove(attachment),
        updatedAt: serverTimestamp(),
      })
    },
    onSuccess: () => qc.invalidateQueries(['transactions', eventId]),
    onError: (err) => { console.error('[delete file]', err); toast.error(`Delete failed: ${err?.message ?? err}`) },
  })
}
