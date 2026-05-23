import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>
  if (!currentUser) return <Navigate to="/login" replace />
  return <Outlet />
}
