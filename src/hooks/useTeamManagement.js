import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, secondaryAuth } from '@/lib/firebase'

export function useCreateTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ fullName, email, password, role }) => {
      const { user } = await createUserWithEmailAndPassword(secondaryAuth, email, password)
      await setDoc(doc(db, 'profiles', user.uid), {
        fullName,
        email,
        role,
        createdAt: serverTimestamp(),
      })
      await signOut(secondaryAuth)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profiles'] }),
  })
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uid, role }) => updateDoc(doc(db, 'profiles', uid), { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profiles'] }),
  })
}
