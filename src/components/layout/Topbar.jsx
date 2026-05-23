import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function Topbar() {
  const { signOut, profile } = useAuth()

  return (
    <header className="h-14 border-b border-border bg-white flex items-center justify-between px-6 shrink-0">
      <span className="text-sm text-muted-foreground">
        {new Date().toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground hidden sm:block">{profile?.fullName}</span>
        <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5">
          <LogOut size={15} />
          Sign out
        </Button>
      </div>
    </header>
  )
}
