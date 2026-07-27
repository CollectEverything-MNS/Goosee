import { generateSlug } from './slug.utils';

describe('generateSlug', () => {
  it('laisse un mot simple en minuscule inchangé', () => {
    expect(generateSlug('burger')).toBe('burger');
  });

  it('met en minuscule un mot avec des majuscules', () => {
    expect(generateSlug('Burger')).toBe('burger');
  });

  it('supprime les accents', () => {
    expect(generateSlug('Crème brûlée')).toBe('creme-brulee');
  });

  it('remplace les espaces par des tirets', () => {
    expect(generateSlug('Menu du jour')).toBe('menu-du-jour');
  });

  it('collapse la ponctuation et les espaces consécutifs en un seul tiret', () => {
    expect(generateSlug('Pizza  &  Pâtes!!')).toBe('pizza-pates');
  });

  it('supprime les tirets en début et fin de chaîne', () => {
    expect(generateSlug('  -Special-  ')).toBe('special');
  });

  it('conserve les chiffres', () => {
    expect(generateSlug('Menu 2 for 1')).toBe('menu-2-for-1');
  });

  it('retourne une chaîne vide pour une entrée vide', () => {
    expect(generateSlug('')).toBe('');
  });
});
