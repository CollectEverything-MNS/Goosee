'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Profile, UpdateProfileDto } from '../account.types';
import { useUpdateMe } from '../usecases/use-update-me';

interface ProfileFormProps {
  profile: Profile;
}

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postaleCode: string;
  city: string;
  country: string;
};

const toFormState = (p: Profile): FormState => ({
  firstName: p.firstName ?? '',
  lastName: p.lastName ?? '',
  email: p.email ?? '',
  phone: p.phone ?? '',
  address: p.address ?? '',
  postaleCode: p.postaleCode ?? '',
  city: p.city ?? '',
  country: p.country ?? '',
});

export function ProfileForm({ profile }: ProfileFormProps) {
  const [form, setForm] = useState<FormState>(toFormState(profile));
  const { mutateAsync, isPending } = useUpdateMe();

  useEffect(() => {
    setForm(toFormState(profile));
  }, [profile]);

  const setField = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // N'envoyer que les champs renseignes pour respecter les validations backend.
    const payload: UpdateProfileDto = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
    };
    if (form.phone.trim()) payload.phone = form.phone.trim();
    if (form.address.trim()) payload.address = form.address.trim();
    if (form.postaleCode.trim()) payload.postaleCode = form.postaleCode.trim();
    if (form.city.trim()) payload.city = form.city.trim();
    if (form.country.trim()) payload.country = form.country.trim();

    try {
      await mutateAsync(payload);
      toast.success('Profil mis à jour');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Erreur lors de la mise à jour');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom</Label>
          <Input id="firstName" value={form.firstName} onChange={setField('firstName')} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input id="lastName" value={form.lastName} onChange={setField('lastName')} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={form.email} onChange={setField('email')} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input id="phone" value={form.phone} onChange={setField('phone')} placeholder="+33 6 12 34 56 78" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Input id="address" value={form.address} onChange={setField('address')} placeholder="10 rue de la Paix" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="postaleCode">Code postal</Label>
          <Input id="postaleCode" value={form.postaleCode} onChange={setField('postaleCode')} placeholder="57000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input id="city" value={form.city} onChange={setField('city')} placeholder="Metz" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Pays</Label>
          <Input id="country" value={form.country} onChange={setField('country')} placeholder="France" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
