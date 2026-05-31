import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, ShoppingBag, CalendarDays, Settings, X } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients',   label: 'Clients',   icon: Users },
  { to: '/vendors',   label: 'Vendors',   icon: ShoppingBag },
  { to: '/events',    label: 'Events',    icon: CalendarDays },
]

export default function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { profile, role } = useAuth()

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile nav drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="p-0 w-60">
          <aside className="flex flex-col h-full bg-white">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Dokoh Ratna</p>
                <p className="text-base font-bold text-foreground leading-tight">Event Manager</p>
              </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileNavOpen(false)}
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
              {role === 'admin' && (
                <NavLink
                  to="/settings"
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <Settings size={16} /> Settings
                </NavLink>
              )}
            </nav>
            <div className="px-4 py-4 border-t border-border">
              <p className="text-sm font-medium text-foreground truncate">{profile?.fullName ?? '—'}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </aside>
        </SheetContent>
      </Sheet>

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
