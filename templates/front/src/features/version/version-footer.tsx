'use client';

import { useSiteVersion } from './use-site-version';

// Petit pied de page affichant la version actuelle du site (bas des réglages).
export function VersionFooter() {
  const { data } = useSiteVersion();
  if (!data?.current) return null;

  // Une mineure/majeure est proposée (le client choisit) ; un patch s'installe tout seul.
  const proposable = data.updateType === 'minor' || data.updateType === 'major';

  return (
    <p className="mt-8 text-center text-xs text-gray-400">
      Version {data.current}
      {proposable ? ` · mise à jour ${data.latest} disponible` : ' · à jour'}
    </p>
  );
}
