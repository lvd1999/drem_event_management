import { Menu } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function Topbar({ onMenuClick }) {
  const { signOut, profile } = useAuth()

  return (
    <header className="h-14 border-b border-border bg-white flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu size={20} />
        </Button>
        <span className="text-sm text-muted-foreground hidden sm:block">
          {new Date().toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground hidden sm:block">{profile?.fullName}</span>
        <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5">
          <LogOut size={15} />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  )
}
