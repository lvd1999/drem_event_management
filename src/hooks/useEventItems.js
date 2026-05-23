import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'sonner'

function itemsCol(eventId) {
  return collection(db, 'events', eventId, 'items')
}

export function useEventItems(eventId) {
  return useQuery({
    queryKey: ['events', eventId, 'items'],
    queryFn: async () => {
      const snap = await getDocs(query(itemsCol(eventId), orderBy('sortOrder')))
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    },
    enabled: Boolean(eventId),
  })
}

export function useCreateEventItem(eventId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
      addDoc(itemsCol(eventId), {
        ...data,
        totalPrice: (data.quantity ?? 1) * (data.unitPrice ?? 0),
        sortOrder: data.sortOrder ?? Date.now(),
        createdAt: serverTimestamp(),
      }),
    onSuccess: () => { qc.invalidateQueries(['events', eventId, 'items']); toast.success('Item added.') },
    onError: () => toast.error('Failed to add item.'),
  })
}

export function useUpdateEventItem(eventId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      updateDoc(doc(db, 'events', eventId, 'items', id), {
        ...data,
        totalPrice: (data.quantity ?? 1) * (data.unitPrice ?? 0),
      }),
    onSuccess: () => qc.invalidateQueries(['events', eventId, 'items']),
    onError: () => toast.error('Failed to update item.'),
  })
}

export function useDeleteEventItem(eventId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteDoc(doc(db, 'events', eventId, 'items', id)),
    onSuccess: () => { qc.invalidateQueries(['events', eventId, 'items']); toast.success('Item removed.') },
    onError: () => toast.error('Failed to remove item.'),
  })
}
