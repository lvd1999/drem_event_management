import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const snap = await getDocs(query(collection(db, 'profiles'), orderBy('fullName')))
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    },
  })
}
