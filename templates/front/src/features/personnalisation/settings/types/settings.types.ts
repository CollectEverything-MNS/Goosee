// Coordonnées légales de l'entreprise, affichées sur les factures.
// Stockées dans settings.metadata.company (pas de colonne dédiée → aucune migration).
export interface CompanyInfo {
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  siret?: string;
  vatNumber?: string;
}

export interface SettingsMetadata extends Record<string, unknown> {
  company?: CompanyInfo;
}

export interface SiteSettings {
  id: string;
  title: string;
  description?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  metadata: SettingsMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsDto {
  title?: string;
  description?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  metadata?: Record<string, unknown>;
}
