'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, KeyRound, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function AdminResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingLink, setCheckingLink] = useState(true)
  const [canUpdatePassword, setCanUpdatePassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const prepareRecoverySession = async () => {
      const code = searchParams.get('code')

      try {
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            setError('This password reset link is invalid or has expired.')
            return
          }

          setCanUpdatePassword(true)
        } else {
          const { data } = await supabase.auth.getSession()

          if (!data.session) {
            setError('Open the reset link from your email to choose a new password.')
            return
          }

          setCanUpdatePassword(true)
        }
      } catch {
        setError('Unable to verify this password reset link.')
      } finally {
        setCheckingLink(false)
      }
    }

    prepareRecoverySession()
  }, [searchParams, supabase])

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/login')
        router.refresh()
      }, 1500)
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-blue-100">
              {success ? (
                <CheckCircle2 className="w-8 h-8 text-blue-600" />
              ) : (
                <KeyRound className="w-8 h-8 text-blue-600" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl">Choose New Password</CardTitle>
          <CardDescription>
            {success
              ? 'Your password has been updated. Redirecting to sign in...'
              : 'Set a new password for your admin account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {checkingLink ? (
            <div className="flex items-center justify-center py-6 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying reset link...
            </div>
          ) : success ? (
            <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">
              Password updated successfully.
            </div>
          ) : !canUpdatePassword ? (
            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                  {error}
                </div>
              )}
              <Button asChild className="w-full">
                <Link href="/admin/forgot-password">Request New Link</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/admin/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  New Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/admin/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminResetPassword() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        </div>
      }
    >
      <AdminResetPasswordForm />
    </Suspense>
  )
}
