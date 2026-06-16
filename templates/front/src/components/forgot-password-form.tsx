'use client';

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { api } from '@/lib/api-client'
import { routes } from '@/config/routes.config'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Step = 'request' | 'confirm'

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()

  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [info, setInfo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const extractError = (err: unknown): string => {
    const e = err as { response?: { data?: { message?: string | string[] } }; message?: string }
    const msg = e?.response?.data?.message
    if (msg) return Array.isArray(msg) ? msg.join(', ') : msg
    return e?.message || t('admin.forgotPassword.genericError')
  }

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      await api.put('/auth/forget-password-request', { email })
      setInfo(t('admin.forgotPassword.successRequest'))
      setStep('confirm')
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    if (newPassword !== confirmPassword) {
      setError(t('admin.forgotPassword.passwordMismatch'))
      return
    }
    setLoading(true)
    try {
      await api.put('/auth/forget-password-confirm', { email, otp, newPassword })
      setInfo(t('admin.forgotPassword.successReset'))
      setTimeout(() => {
        router.push(routes.gooseeAdmin.login.getHref(locale))
      }, 1500)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={step === 'request' ? handleRequest : handleConfirm}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">{t('admin.forgotPassword.title')}</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step === 'request'
                    ? t('admin.forgotPassword.requestSubtitle')
                    : t('admin.forgotPassword.confirmSubtitle')}
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              {info && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                  {info}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">{t('admin.forgotPassword.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || step === 'confirm'}
                />
              </div>

              {step === 'confirm' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="otp">{t('admin.forgotPassword.otp')}</Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">{t('admin.forgotPassword.newPassword')}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">{t('admin.forgotPassword.confirmPassword')}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step === 'request'
                  ? t('admin.forgotPassword.sendCode')
                  : t('admin.forgotPassword.resetButton')}
              </Button>

              <div className="text-center text-sm">
                <Link
                  href={routes.gooseeAdmin.login.getHref(locale)}
                  className="underline-offset-2 hover:underline"
                >
                  {t('admin.forgotPassword.backToLogin')}
                </Link>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/drive.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
