import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'sonner'

const SETTINGS_REF = doc(db, 'settings', 'quotation')

export const SETTINGS_DEFAULTS = {
  companyName:   'Dokoh Ratna',
  tagline:       'Weddings & Events',
  email:         'patmagictrick@gmail.com',
  phone:         '',
  companyRegNo:  '',
  documentTitle: 'QUOTATION',
  termsText:     '50% deposit required to confirm booking.\nBalance to be paid 7 days before the event date.\nThis quotation is valid for 14 days from the issued date.\nAll prices are inclusive of applicable taxes.',
  footerText:    'Thank you for choosing Dokoh Ratna. We look forward to making your event a success.',
  bankName:      '',
  bankAccount:   '',
  bankHolder:    '',
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const snap = await getDoc(SETTINGS_REF)
      return snap.exists() ? { ...SETTINGS_DEFAULTS, ...snap.data() } : { ...SETTINGS_DEFAULTS }
    },
    staleTime: 5 * 60_000,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => setDoc(SETTINGS_REF, data, { merge: true }),
    onSuccess: () => { qc.invalidateQueries(['settings']); toast.success('Settings saved.') },
    onError: () => toast.error('Failed to save settings.'),
  })
}
