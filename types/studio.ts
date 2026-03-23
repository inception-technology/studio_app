/**
 * types/studio.ts
 *
 * Types alignés sur le schema réel de l'API FastAPI.
 * GET /organization/studios/list  →  { data: StudioRaw[], meta: {...} }
 *
 * La BFF extrait `data` et l'envoie directement :
 *   BFF apiSuccess(body.data)  →  apiFetch retourne Studio[]
 */

// ─── Shape retournée par FastAPI ──────────────────────────────────────────────

export type Studio = {
  id_studio:      number;
  name:           string;
  address_line1?:  string | null;
  address_line2?: string | null;
  zipcode?:        string | null;
  city:           string;
  code_country:   string;
  code_timezone:  string;
  status:        string;
  img_url?:       string | null;
  // Pas de stats dans l'endpoint list — à ajouter si un endpoint dédié existe
  stats?: {
    member_count:      number;   // membres actifs
    monthly_revenue_k: number;   // CA mensuel en milliers
    pending_joins:     number;   // demandes en attente
  };
};

export type Studios = Studio[];

// ─── Shape attendue par <StudioPreviewCard /> ─────────────────────────────────

export type StudioCardProps = {
  id:       number;
  name:     string;
  location: string;
  status:   string;
  members:  number;
  finance:  number;
  img_url:  string;
};

// ─── Mapper Studio → StudioCardProps ─────────────────────────────────────────

export function studioToCardProps(studio: Studio): StudioCardProps {
  // Compose une adresse lisible depuis les champs normalisés de l'API
  const location = [studio.address_line1, studio.city, studio.code_country.toLocaleUpperCase()]
    .filter(Boolean)
    .join(", ") || "—";

  return {
    id:       studio.id_studio,
    name:     studio.name,
    location,
    status:   studio.status,
    members:  studio.stats?.member_count      ?? 0,
    finance:  studio.stats?.monthly_revenue_k ?? 0,
    img_url:  studio.img_url ?? "/logo_dojang.png",   // pas d'image dans l'endpoint list pour l'instant
  };
}
