import { routes } from '@/config/routes.config';
import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = [
  routes.private.profile.getHref()
];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  // faire le résultat si la route est protégée (donc se connecter)

  return NextResponse.next();
}