'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Lock, LogIn, Mail, Settings, ShieldCheck, ShoppingBag, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMe } from '@/features/account/usecases/use-get-me';
import { ProfileForm } from '@/features/account/components/profile-form';
import { MyOrders } from '@/features/account/components/my-orders';
import { ChangePasswordForm } from '@/features/account/components/change-password-form';
import { PreferencesForm } from '@/features/account/components/preferences-form';

const TABS = [
  { value: 'profile', icon: User, label: 'Mon profil', short: 'Profil' },
  { value: 'orders', icon: ShoppingBag, label: 'Mes commandes', short: 'Commandes' },
  { value: 'security', icon: Lock, label: 'Sécurité', short: 'Sécurité' },
  { value: 'preferences', icon: Settings, label: 'Préférences', short: 'Préf.' },
] as const;

export default function AccountPage() {
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    setHasToken(Boolean(localStorage.getItem('access_token')));
    const requested = new URLSearchParams(window.location.search).get('tab');
    if (requested && ['profile', 'orders', 'security', 'preferences'].includes(requested)) {
      setTab(requested);
    }
  }, []);

  const { data: profile, isLoading, isError } = useGetMe(hasToken === true);

  const initials = useMemo(() => {
    if (!profile) return '';
    return `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase();
  }, [profile]);

  if (hasToken === null) {
    return null;
  }

  if (!hasToken || isError) {
    return (
      <main className="app-surface min-h-screen bg-muted/40">
        <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Connectez-vous</h1>
          <p className="text-muted-foreground">
            Vous devez être connecté pour accéder à votre espace personnel. Utilisez le bouton
            « Connexion » en haut de la page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-surface min-h-screen bg-muted/40">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 text-white">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 py-12 sm:py-16">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
            <Avatar className="h-20 w-20 border-2 border-white/30 shadow-lg ring-4 ring-white/10">
              <AvatarFallback className="bg-white/15 text-2xl font-semibold text-white backdrop-blur">
                {initials || <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1.5">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/70">
                Mon espace
              </p>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {profile ? `${profile.firstName} ${profile.lastName}` : 'Bienvenue'}
              </h1>
              {profile?.email && (
                <p className="flex items-center justify-center gap-2 text-white/80 sm:justify-start">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-16">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          {/* Tabs floating over the hero edge */}
          <div className="-mt-7 rounded-2xl border bg-card p-1.5 shadow-sm">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-transparent p-0 sm:grid-cols-4">
              {TABS.map(({ value, icon: Icon, label, short }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex-col gap-1.5 rounded-xl py-3 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm sm:flex-row sm:gap-2 sm:py-2.5"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="text-xs sm:hidden">{short}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="profile" className="mt-6 focus-visible:outline-none">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>Mettez à jour vos coordonnées et votre adresse.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading || !profile ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-2/3" />
                  </div>
                ) : (
                  <ProfileForm profile={profile} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6 focus-visible:outline-none">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <MyOrders />
            )}
          </TabsContent>

          <TabsContent value="security" className="mt-6 focus-visible:outline-none">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Changer mon mot de passe</CardTitle>
                  <CardDescription>Choisissez un mot de passe fort et unique.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="mt-6 focus-visible:outline-none">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Préférences</CardTitle>
                  <CardDescription>Gérez vos notifications et options d&apos;affichage.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <PreferencesForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
