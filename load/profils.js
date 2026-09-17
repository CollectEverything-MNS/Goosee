// Profils de charge partagés par les scripts k6.
// Choix au lancement : -e SCENARIO=poc|smoke|load|rupture|palier (défaut : smoke).
//
//  - poc     : 30 s, 2 VUs maximum, pour une vérification locale économe.
//  - smoke   : ~1 min, charge minime — sert à valider que le script et la cible
//    répondent, pas à mesurer une tenue en charge.
//  - load    : paliers jusqu'à 50 VUs sur ~7 min — comportement sous charge attendue.
//  - rupture : 100 → 250 → 500 → 1000 VUs enchaînés (~6 min 20) — recherche du point
//    de rupture : on lit à quel palier les seuils cassent.
//  - palier  : un seul palier, tenu 45 s (montée 15 s) — mesure isolée d'un niveau de
//    charge ; le nombre de VUs est donné par -e VUS=<n>.
export const profils = {
  // Répétition locale : deux utilisateurs simultanés au maximum.
  poc: [
    { duration: '5s', target: 2 },
    { duration: '20s', target: 2 },
    { duration: '5s', target: 0 },
  ],
  smoke: [
    { duration: '20s', target: 5 },
    { duration: '40s', target: 5 },
    { duration: '10s', target: 0 },
  ],
  load: [
    { duration: '1m', target: 25 },
    { duration: '3m', target: 25 },
    { duration: '1m', target: 50 },
    { duration: '2m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  rupture: [
    { duration: '30s', target: 100 },
    { duration: '60s', target: 100 },
    { duration: '30s', target: 250 },
    { duration: '60s', target: 250 },
    { duration: '30s', target: 500 },
    { duration: '60s', target: 500 },
    { duration: '30s', target: 1000 },
    { duration: '60s', target: 1000 },
    { duration: '20s', target: 0 },
  ],
};

export function stagesPour(scenario, vus) {
  if (scenario === 'palier') {
    const n = Number(vus);
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error(`SCENARIO=palier demande VUS=<entier > 0> (reçu : "${vus}")`);
    }
    return [
      { duration: '15s', target: n },
      { duration: '45s', target: n },
      { duration: '5s', target: 0 },
    ];
  }
  return profils[scenario] || profils.smoke;
}
