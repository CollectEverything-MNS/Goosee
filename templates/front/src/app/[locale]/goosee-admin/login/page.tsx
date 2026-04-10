'use client';

import { LoginForm } from '@/components/login-form'
import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { routes } from '@/config/routes.config'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function Page() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const locale = useLocale()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(routes.gooseeAdmin.dashboard.getHref(locale))
    }
  }, [isLoading, isAuthenticated, router, locale])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isAuthenticated) return null

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}
