// Profils de charge partagés par les scripts k6.
// Choix au lancement : -e SCENARIO=poc|smoke|load (défaut : smoke).
//
//  - poc   : 30 s, 2 VUs maximum, pour une vérification locale économe.
//  - smoke : ~1 min, charge minime — sert à valider que le script et la cible
//    répondent, pas à mesurer une tenue en charge.
//  - load  : paliers jusqu'à 50 VUs sur ~7 min — comportement sous charge attendue.
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
};

export function stagesPour(scenario) {
  return profils[scenario] || profils.smoke;
}
