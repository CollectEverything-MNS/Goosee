'use client';

import { useEffect, useState } from 'react';
import { Loader2, Lock, LogIn, Settings, ShoppingBag, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMe } from '@/features/account/usecases/use-get-me';
import { ProfileForm } from '@/features/account/components/profile-form';
import { MyOrders } from '@/features/account/components/my-orders';
import { ChangePasswordForm } from '@/features/account/components/change-password-form';
import { PreferencesForm } from '@/features/account/components/preferences-form';

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

  if (hasToken === null) {
    return null;
  }

  if (!hasToken || isError) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <LogIn className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Connectez-vous</h1>
          <p className="text-muted-foreground">
            Vous devez être connecté pour accéder à votre espace personnel. Utilisez le bouton
            « Connexion » en haut de la page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-primary px-4 py-14 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold md:text-4xl">Mon espace</h1>
          <p className="mt-2 text-lg opacity-90">
            {profile
              ? `Bonjour ${profile.firstName} ${profile.lastName}`
              : 'Gérez votre profil et vos commandes'}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Mon profil</span>
              <span className="sm:hidden">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Mes commandes</span>
              <span className="sm:hidden">Commandes</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Sécurité</span>
              <span className="sm:hidden">Sécurité</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Préférences</span>
              <span className="sm:hidden">Préf.</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
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

          <TabsContent value="orders" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <MyOrders />
            )}
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Changer mon mot de passe</CardTitle>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences</CardTitle>
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
