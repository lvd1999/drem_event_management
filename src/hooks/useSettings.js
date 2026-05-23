import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { toast } from 'sonner'

const SETTINGS_REF = doc(db, 'settings', 'quotation')
const LOGO_REF = ref(storage, 'settings/logo')

export const SETTINGS_DEFAULTS = {
  companyName:   'Dokoh Ratna',
  tagline:       'Weddings & Events',
  email:         'patmagictrick@gmail.com',
  phone:         '',
  logoUrl:       '',
  documentTitle: 'QUOTATION',
  termsText:     '50% deposit required to confirm booking.\nBalance to be paid 7 days before the event date.\nThis quotation is valid for 14 days from the issued date.\nAll prices are inclusive of applicable taxes.',
  footerText:    'Thank you for choosing Dokoh Ratna. We look forward to making your event a success.',
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

export function useUploadLogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file) => {
      await uploadBytes(LOGO_REF, file, { contentType: file.type })
      const url = await getDownloadURL(LOGO_REF)
      await setDoc(SETTINGS_REF, { logoUrl: url }, { merge: true })
      return url
    },
    onSuccess: () => { qc.invalidateQueries(['settings']); toast.success('Logo uploaded.') },
    onError: () => toast.error('Failed to upload logo.'),
  })
}

export function useRemoveLogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      try { await deleteObject(LOGO_REF) } catch (_) { /* already deleted */ }
      await setDoc(SETTINGS_REF, { logoUrl: '' }, { merge: true })
    },
    onSuccess: () => { qc.invalidateQueries(['settings']); toast.success('Logo removed.') },
    onError: () => toast.error('Failed to remove logo.'),
  })
}
