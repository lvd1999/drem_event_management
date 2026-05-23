import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AppShell from '@/components/layout/AppShell'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import ClientsPage from '@/pages/clients/ClientsPage'
import ClientDetailPage from '@/pages/clients/ClientDetailPage'
import VendorsPage from '@/pages/vendors/VendorsPage'
import EventsPage from '@/pages/events/EventsPage'
import EventDetailPage from '@/pages/events/EventDetailPage'
import QuotationPrintPage from '@/pages/quotations/QuotationPrintPage'
import NotFoundPage from '@/pages/NotFoundPage'

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/events/:eventId/quotation/:quotationId/print" element={<QuotationPrintPage />} />
              <Route element={<AppShell />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard"   element={<DashboardPage />} />
                <Route path="/clients"     element={<ClientsPage />} />
                <Route path="/clients/:id" element={<ClientDetailPage />} />
                <Route path="/vendors"     element={<VendorsPage />} />
                <Route path="/events"      element={<EventsPage />} />
                <Route path="/events/:id"  element={<EventDetailPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </AuthProvider>
  )
}
