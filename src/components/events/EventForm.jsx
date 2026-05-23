import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateEvent, useUpdateEvent } from '@/hooks/useEvents'
import { useClients } from '@/hooks/useClients'
import { useProfiles } from '@/hooks/useProfiles'
import { useAuth } from '@/context/AuthContext'
import { EVENT_STATUSES } from '@/lib/constants'

function tsToDateStr(ts) {
  if (!ts) return ''
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toISOString().split('T')[0]
}

export default function EventForm({ open, onOpenChange, event }) {
  const isEdit = Boolean(event)
  const create = useCreateEvent()
  const update = useUpdateEvent()
  const loading = create.isPending || update.isPending
  const { data: clients } = useClients()
  const { data: profiles } = useProfiles()
  const { role } = useAuth()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm()
  const clientId = watch('clientId')
  const status = watch('status')
  const assignedTo = watch('assignedTo')

  useEffect(() => {
    if (event) {
      reset({
        title: event.title ?? '',
        eventDate: tsToDateStr(event.eventDate),
        eventTime: event.eventTime ?? '',
        venue: event.venue ?? '',
        clientId: event.clientId ?? '',
        status: event.status ?? 'upcoming',
        assignedTo: event.assignedTo ?? '',
        remarks: event.remarks ?? '',
      })
    } else {
      reset({ title: '', eventDate: '', eventTime: '', venue: '', clientId: '', status: 'upcoming', assignedTo: '', remarks: '' })
    }
  }, [event, reset])

  async function onSubmit(data) {
    const client = clients?.find(c => c.id === data.clientId)
    const payload = { ...data, clientName: client?.name ?? '' }
    if (isEdit) await update.mutateAsync({ id: event.id, ...payload })
    else await create.mutateAsync(payload)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Event' : 'Add Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Event Title *</Label>
            <Input {...register('title', { required: true })} className={errors.title ? 'border-destructive' : ''} />
            {errors.title && <p className="text-xs text-destructive">Title is required.</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" {...register('eventDate', { required: true })} className={errors.eventDate ? 'border-destructive' : ''} />
              {errors.eventDate && <p className="text-xs text-destructive">Date is required.</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input type="time" {...register('eventTime')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Venue</Label>
            <Input {...register('venue')} />
          </div>

          <div className="space-y-1.5">
            <Label>Client *</Label>
            <Select value={clientId} onValueChange={v => setValue('clientId', v)}>
              <SelectTrigger className={errors.clientId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <input type="hidden" {...register('clientId', { required: true })} />
            {errors.clientId && <p className="text-xs text-destructive">Client is required.</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={v => setValue('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {role === 'admin' && (
              <div className="space-y-1.5">
                <Label>Assigned To</Label>
                <Select value={assignedTo} onValueChange={v => setValue('assignedTo', v)}>
                  <SelectTrigger><SelectValue placeholder="Select executive" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— Unassigned —</SelectItem>
                    {profiles?.map(p => <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Remarks</Label>
            <Textarea rows={3} {...register('remarks')} />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
