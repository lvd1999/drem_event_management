import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, ShoppingBag, CalendarDays } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients',   label: 'Clients',   icon: Users },
  { to: '/vendors',   label: 'Vendors',   icon: ShoppingBag },
  { to: '/events',    label: 'Events',    icon: CalendarDays },
]

export default function Sidebar() {
  const { profile, role } = useAuth()

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-white border-r border-border shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Dokoh Ratna</p>
        <p className="text-base font-bold text-foreground leading-tight">Event Manager</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-border">
        <p className="text-sm font-medium text-foreground truncate">{profile?.fullName ?? '—'}</p>
        <p className="text-xs text-muted-foreground capitalize">{role}</p>
      </div>
    </aside>
  )
}
