import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { useProfiles } from '@/hooks/useProfiles'
import { useCreateTeamMember, useUpdateMemberRole } from '@/hooks/useTeamManagement'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserPlus } from 'lucide-react'

export default function TeamSettings() {
  const { currentUser } = useAuth()
  const { data: profiles = [], isLoading } = useProfiles()
  const createMember = useCreateTeamMember()
  const updateRole = useUpdateMemberRole()
  const [open, setOpen] = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { fullName: '', email: '', password: '', role: 'executive' },
  })
  const roleValue = watch('role')

  async function onSubmit(data) {
    try {
      await createMember.mutateAsync(data)
      toast.success(`${data.fullName} added to the team.`)
      reset()
      setOpen(false)
    } catch (err) {
      const msg = err?.code === 'auth/email-already-in-use'
        ? 'That email is already registered.'
        : err?.message ?? 'Failed to create member.'
      toast.error(msg)
    }
  }

  async function handleRoleChange(uid, role) {
    try {
      await updateRole.mutateAsync({ uid, role })
      toast.success('Role updated.')
    } catch {
      toast.error('Failed to update role.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Team Members</p>
          <p className="text-xs text-muted-foreground mt-0.5">Manage who can log in and their access level.</p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <UserPlus size={15} /> Add Member
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add Team Member</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  {...register('fullName', { required: true })}
                  placeholder="e.g. Siti Aminah"
                  className={errors.fullName ? 'border-destructive' : ''}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  {...register('email', { required: true })}
                  placeholder="e.g. siti@dokohratna.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Temporary Password</Label>
                <Input
                  type="password"
                  {...register('password', { required: true, minLength: 6 })}
                  placeholder="Min. 6 characters"
                  className={errors.password ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">Share this with the member — they can reset it from the login page.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={roleValue} onValueChange={v => setValue('role', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Admins can manage team members, delete records, and change settings.</p>
              </div>
              <Button type="submit" className="w-full" disabled={createMember.isPending}>
                {createMember.isPending ? 'Creating…' : 'Create Account'}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[140px]">Change Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  {p.fullName}
                  {p.id === currentUser?.uid && (
                    <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{p.email ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={p.role === 'admin' ? 'default' : 'secondary'}>
                    {p.role ?? 'executive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {p.id !== currentUser?.uid && (
                    <Select
                      value={p.role ?? 'executive'}
                      onValueChange={role => handleRoleChange(p.id, role)}
                    >
                      <SelectTrigger className="h-7 text-xs w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
