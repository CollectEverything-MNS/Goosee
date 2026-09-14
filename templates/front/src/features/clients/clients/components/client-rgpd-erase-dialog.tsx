'use client';

import { isAxiosError } from 'axios';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AdminStatusBadge } from '@/components/layout/admin/components/admin-status-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  RgpdBilanEffacement,
  useEraseCustomer,
} from '@/features/clients/usecases/use-rgpd-actions';

import { useClient } from '../context/clients-provider';

type Etape = 'avertissement' | 'confirmation' | 'bilan';

export function ClientRgpdEraseDialog() {
  const t = useTranslations('admin.clients.rgpd');
  const { open, setOpen, currentRow, setCurrentRow } = useClient();
  const eraseMutation = useEraseCustomer();

  const [etape, setEtape] = useState<Etape>('avertissement');
  const [saisie, setSaisie] = useState('');
  const [bilan, setBilan] = useState<RgpdBilanEffacement | null>(null);

  const isOpen = open === 'rgpd-erase' && !!currentRow;
  const email: string = currentRow?.email ?? '';
  const nom = `${currentRow?.firstName ?? ''} ${currentRow?.lastName ?? ''}`.trim() || email;
  const saisieValide = saisie.trim().toLowerCase() === email.trim().toLowerCase() && !!email;

  // Chaque ouverture repart de l'avertissement : on ne garde ni la saisie de
  // confirmation ni le bilan du client precedent.
  useEffect(() => {
    if (isOpen) {
      setEtape('avertissement');
      setSaisie('');
      setBilan(null);
    }
  }, [isOpen, currentRow?.id]);

  const handleClose = () => {
    setCurrentRow(null);
    setOpen(null);
  };

  const handleConfirm = async () => {
    try {
      const resultat = await eraseMutation.mutateAsync(currentRow.id);
      setBilan(resultat);
      setEtape('bilan');
      const enEchec = resultat.resultats.some((r) => r.statut === 'echec');
      if (enEchec) {
        toast.warning(t('erase.partial'));
      } else {
        toast.success(t('erase.success'));
      }
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        const msg = error.response.data.message;
        toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
      } else {
        toast.error(t('erase.error'));
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px]">
        <DialogHeader className="space-y-3 border-b border-border bg-muted/30 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <ShieldAlert className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="space-y-0.5 text-left">
              <DialogTitle className="text-base font-semibold">
                {etape === 'bilan' ? t('erase.reportTitle') : t('erase.title')}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {etape === 'bilan' ? t('erase.reportSubtitle') : t('erase.subtitle')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {etape === 'avertissement' && (
            <p className="text-sm text-muted-foreground">{t('erase.warning', { name: nom })}</p>
          )}

          {etape === 'confirmation' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t('erase.confirmLabel')}</p>
              <div className="space-y-2">
                <Label htmlFor="rgpd-confirmation" className="text-xs font-medium">
                  {email}
                </Label>
                <Input
                  id="rgpd-confirmation"
                  value={saisie}
                  autoComplete="off"
                  placeholder={t('erase.confirmPlaceholder')}
                  onChange={(e) => setSaisie(e.target.value)}
                />
              </div>
              {saisie.length > 0 && !saisieValide && (
                <p className="text-xs text-rose-600">{t('erase.confirmMismatch')}</p>
              )}
            </div>
          )}

          {etape === 'bilan' && (
            <div className="space-y-3">
              <ul className="divide-y divide-border rounded-lg border border-border bg-muted/20">
                {(bilan?.resultats ?? []).map((resultat) => (
                  <li
                    key={resultat.service}
                    className="flex items-start justify-between gap-3 px-4 py-3"
                  >
                    <div className="space-y-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {resultat.service}
                      </span>
                      {resultat.raison && (
                        <p className="text-xs text-muted-foreground">{resultat.raison}</p>
                      )}
                    </div>
                    <AdminStatusBadge
                      tone={resultat.statut === 'echec' ? 'danger' : 'success'}
                      withDot
                    >
                      {resultat.statut}
                    </AdminStatusBadge>
                  </li>
                ))}
              </ul>
              {(bilan?.resultats ?? []).some((r) => r.statut === 'echec') && (
                <p className="text-xs text-muted-foreground">{t('erase.reportHint')}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-6 py-4">
          {etape === 'avertissement' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                {t('erase.cancel')}
              </Button>
              <Button
                onClick={() => setEtape('confirmation')}
                className="bg-rose-600 hover:bg-rose-700 focus:ring-rose-600"
              >
                {t('erase.continue')}
              </Button>
            </>
          )}

          {etape === 'confirmation' && (
            <>
              <Button
                variant="outline"
                onClick={() => setEtape('avertissement')}
                disabled={eraseMutation.isPending}
              >
                {t('erase.back')}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!saisieValide || eraseMutation.isPending}
                className="gap-2 bg-rose-600 hover:bg-rose-700 focus:ring-rose-600"
              >
                {eraseMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t('erase.confirm')}
              </Button>
            </>
          )}

          {etape === 'bilan' && <Button onClick={handleClose}>{t('erase.close')}</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
