import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

const COL = 'events'

async function fetchEvents() {
  const snap = await getDocs(query(collection(db, COL), orderBy('eventDate', 'asc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function useEvents() {
  return useQuery({ queryKey: [COL], queryFn: fetchEvents })
}

function toTimestamp(dateStr) {
  if (!dateStr) return null
  return Timestamp.fromDate(new Date(dateStr))
}

export function useCreateEvent() {
  const qc = useQueryClient()
  const { currentUser } = useAuth()
  return useMutation({
    mutationFn: ({ eventDate, ...rest }) =>
      addDoc(collection(db, COL), {
        ...rest,
        eventDate: toTimestamp(eventDate),
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    onSuccess: () => { qc.invalidateQueries([COL]); toast.success('Event created.') },
    onError: () => toast.error('Failed to create event.'),
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, eventDate, ...rest }) =>
      updateDoc(doc(db, COL, id), {
        ...rest,
        eventDate: toTimestamp(eventDate),
        updatedAt: serverTimestamp(),
      }),
    onSuccess: () => { qc.invalidateQueries([COL]); toast.success('Event updated.') },
    onError: () => toast.error('Failed to update event.'),
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteDoc(doc(db, COL, id)),
    onSuccess: () => { qc.invalidateQueries([COL]); toast.success('Event deleted.') },
    onError: () => toast.error('Failed to delete event.'),
  })
}
