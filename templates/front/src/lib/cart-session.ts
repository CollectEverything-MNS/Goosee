// Identifiant de panier côté navigateur. Le storefront étant ouvert aux visiteurs non
// connectés, on rattache le panier à une clé de session stable stockée en localStorage
// (le back identifie le panier par ce sessionKey). Régénérée si absente.
const STORAGE_KEY = 'goosee_cart_session';

export function getCartSessionKey(): string {
  if (typeof window === 'undefined') return '';

  let key = window.localStorage.getItem(STORAGE_KEY);
  if (!key) {
    key =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `cart-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(STORAGE_KEY, key);
  }
  return key;
}
