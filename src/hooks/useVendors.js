import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

const COL = 'vendors'

async function fetchVendors() {
  const snap = await getDocs(query(collection(db, COL), orderBy('name')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function useVendors() {
  return useQuery({ queryKey: [COL], queryFn: fetchVendors })
}

export function useCreateVendor() {
  const qc = useQueryClient()
  const { currentUser } = useAuth()
  return useMutation({
    mutationFn: (data) =>
      addDoc(collection(db, COL), {
        ...data,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    onSuccess: () => { qc.invalidateQueries([COL]); toast.success('Vendor added.') },
    onError: () => toast.error('Failed to add vendor.'),
  })
}

export function useUpdateVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() }),
    onSuccess: () => { qc.invalidateQueries([COL]); toast.success('Vendor updated.') },
    onError: () => toast.error('Failed to update vendor.'),
  })
}

export function useDeleteVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteDoc(doc(db, COL, id)),
    onSuccess: () => { qc.invalidateQueries([COL]); toast.success('Vendor deleted.') },
    onError: () => toast.error('Failed to delete vendor.'),
  })
}
