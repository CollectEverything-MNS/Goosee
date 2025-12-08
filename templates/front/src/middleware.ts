import createIntlMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'
import { routes } from '@/config/routes.config'

const intlMiddleware = createIntlMiddleware(routing)

export default async function middleware(req: NextRequest) {
  const res = intlMiddleware(req)

  if (res instanceof NextResponse && res.redirected) {
    return res
  }

  const { pathname } = req.nextUrl

  const locale = pathname.split('/')[1]

  const protectedRoutes = [
    routes.gooseeAdmin.pages.getHref(locale),
    routes.gooseeAdmin.templates.getHref(locale),
    routes.gooseeAdmin.users.getHref(locale),
    routes.gooseeAdmin.returnClient.getHref(locale),
    routes.gooseeAdmin.dashboard.getHref(locale),
    routes.gooseeAdmin.salesHistory.getHref(locale),
    routes.gooseeAdmin.roles.getHref(locale),
    routes.gooseeAdmin.clients.getHref(locale),
    routes.gooseeAdmin.products.getHref(locale),
    routes.gooseeAdmin.orders.getHref(locale),
    routes.gooseeAdmin.categories.getHref(locale),
  ]

  // const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  // if (isProtected) {
  //   const token = req.cookies.get('token')?.value
  //
  //   if (!token) {
  //     const url = req.nextUrl.clone()
  //     url.pathname = routes.gooseeAdmin.login.getHref(locale)
  //     return NextResponse.redirect(url)
  //   }
  // }

  return res
}

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
}
