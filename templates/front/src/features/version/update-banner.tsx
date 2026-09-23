'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowUpCircle, Loader2, X } from 'lucide-react';
import { useSiteVersion } from './use-site-version';
import { useUpdateSite } from './use-update-site';

// Bannière affichée en haut du back-office quand une nouvelle version du site est disponible.
// L'admin choisit de l'installer ; l'orchestrateur redéploie alors le site.
export function UpdateBanner() {
  const { data } = useSiteVersion();
  const update = useUpdateSite();
  const [dismissed, setDismissed] = useState(false);

  // Seules les versions mineures/majeures sont proposées au client. Les patches s'appliquent
  // automatiquement (cron quotidien) : inutile de solliciter le client pour un correctif.
  const proposable = data?.updateType === 'minor' || data?.updateType === 'major';
  if (!proposable || dismissed) return null;

  const install = () =>
    update.mutate(undefined, {
      onSuccess: () =>
        toast.success(
          'Mise à jour lancée : le site va redémarrer avec la nouvelle version.',
        ),
      onError: () => toast.error("La mise à jour n'a pas pu être lancée."),
    });

  return (
    <div className="flex items-center gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
      <ArrowUpCircle className="h-4 w-4 shrink-0" />
      <span className="flex-1">
        Une mise à jour est disponible (version {data.latest}). Voulez-vous l&apos;installer&nbsp;?
      </span>
      <button
        type="button"
        onClick={install}
        disabled={update.isPending}
        className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
      >
        {update.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {update.isPending ? 'Installation…' : 'Installer'}
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-amber-700 hover:text-amber-900"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
