import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'sonner'

function tasksCol(eventId) {
  return collection(db, 'events', eventId, 'tasks')
}

export function useChecklist(eventId) {
  return useQuery({
    queryKey: ['events', eventId, 'tasks'],
    queryFn: async () => {
      const snap = await getDocs(query(tasksCol(eventId), orderBy('sortOrder')))
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    },
    enabled: Boolean(eventId),
  })
}

export function useCreateTask(eventId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title) =>
      addDoc(tasksCol(eventId), {
        title,
        status: 'pending',
        sortOrder: Date.now(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    onSuccess: () => qc.invalidateQueries(['events', eventId, 'tasks']),
    onError: () => toast.error('Failed to add task.'),
  })
}

export function useUpdateTask(eventId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      updateDoc(doc(db, 'events', eventId, 'tasks', id), { ...data, updatedAt: serverTimestamp() }),
    onSuccess: () => qc.invalidateQueries(['events', eventId, 'tasks']),
    onError: () => toast.error('Failed to update task.'),
  })
}

export function useDeleteTask(eventId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteDoc(doc(db, 'events', eventId, 'tasks', id)),
    onSuccess: () => qc.invalidateQueries(['events', eventId, 'tasks']),
    onError: () => toast.error('Failed to delete task.'),
  })
}
