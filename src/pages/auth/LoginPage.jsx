import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [loading, setLoading]         = useState(false)
  const [showReset, setShowReset]     = useState(false)
  const [resetEmail, setResetEmail]   = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard')
    } catch {
      toast.error('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e) {
    e.preventDefault()
    if (!resetEmail) return
    setResetLoading(true)
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      toast.success('Password reset email sent. Check your inbox.')
      setShowReset(false)
      setResetEmail('')
    } catch {
      toast.error('Could not send reset email. Check the address and try again.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Dokoh Ratna</p>
          <CardTitle className="text-xl">Event Manager</CardTitle>
        </CardHeader>
        <CardContent>
          {!showReset ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
              <button
                type="button"
                onClick={() => { setShowReset(true); setResetEmail(email) }}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Reset Password</p>
                <p className="text-xs text-muted-foreground">Enter your email and we'll send a reset link.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="resetEmail">Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  autoComplete="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading ? 'Sending…' : 'Send Reset Link'}
              </Button>
              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to sign in
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
