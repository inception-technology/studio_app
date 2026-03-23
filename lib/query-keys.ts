/**
 * query-keys.ts
 *
 * Source unique de vérité pour toutes les query keys React Query.
 *
 * Convention :
 *   - Chaque domaine expose un objet *Keys avec des fonctions retournant des tableaux.
 *   - La clé "all" du domaine sert à invalider tout le domaine en une ligne :
 *       queryClient.invalidateQueries({ queryKey: studioKeys.all })
 *   - Les clés plus précises permettent une invalidation chirurgicale :
 *       queryClient.invalidateQueries({ queryKey: studioKeys.detail(id) })
 *
 * Utilisation dans un hook :
 *   const { data } = useQuery({
 *     queryKey: studioKeys.list(),
 *     queryFn:  () => apiFetch("/api/studio"),
 *   });
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authKeys = {
  all:     ["auth"]            as const,
  me:      () => ["auth", "me"]      as const,   // /api/auth/me  (credentials)
  profile: () => ["auth", "profile"] as const,   // /api/user/me  (profil complet)
} as const;

// ─── Organization ─────────────────────────────────────────────────────────────
export const organizationKeys = {
  all:    ["organization"]                          as const,
  detail: () => ["organization", "detail"]          as const,  // /api/organization
} as const;

// ─── Studios ──────────────────────────────────────────────────────────────────
export const studioKeys = {
  all:    ["studios"]                               as const,
  list:   ()         => ["studios", "list"]         as const,  // /api/studio
  detail: (id: number) => ["studios", "detail", id] as const,  // /api/studio/:id
  staff:  (id: number) => ["studios", id, "staff"]  as const,  // /api/studio/:id/staff
} as const;

// ─── Calendar / Sessions ──────────────────────────────────────────────────────
export const sessionKeys = {
  all:       ["sessions"]                                         as const,
  list:      ()                         => ["sessions", "list"]  as const,
  byStudio:  (studioId: number)         => ["sessions", "studio", studioId]          as const,
  byRange:   (start: string, end: string) => ["sessions", "range", start, end]       as const,
  byFilter:  (studioId: number | null, start?: string, end?: string) =>
               ["sessions", "filter", studioId, start, end]                          as const,
  detail:    (id: number)               => ["sessions", "detail", id]                as const,
} as const;

// ─── Réservations ─────────────────────────────────────────────────────────────
export const bookingKeys = {
  all:       ["bookings"]                                          as const,
  list:      ()              => ["bookings", "list"]              as const,
  bySession: (sessionId: number) => ["bookings", "session", sessionId] as const,
  byStudent: (studentId: number) => ["bookings", "student", studentId] as const,
} as const;

// ─── Membres / Students ───────────────────────────────────────────────────────
export const memberKeys = {
  all:       ["members"]                                           as const,
  list:      ()              => ["members", "list"]               as const,
  byStudio:  (studioId: number) => ["members", "studio", studioId] as const,
  detail:    (id: number)    => ["members", "detail", id]         as const,
  pending:   (studioId: number) => ["members", "pending", studioId] as const,
} as const;

// ─── Facturation ──────────────────────────────────────────────────────────────
export const invoiceKeys = {
  all:       ["invoices"]                                          as const,
  list:      ()              => ["invoices", "list"]              as const,
  byStudio:  (studioId: number) => ["invoices", "studio", studioId] as const,
  detail:    (id: number)    => ["invoices", "detail", id]        as const,
} as const;

export const subscriptionKeys = {
  all:       ["subscriptions"]                                      as const,
  list:      ()              => ["subscriptions", "list"]           as const,
  byMember:  (memberId: number) => ["subscriptions", "member", memberId] as const,
} as const;

// ─── Références (listes statiques) ───────────────────────────────────────────
export const referenceKeys = {
  all:      ["references"]                               as const,
  byType:   (type: string) => ["references", type]       as const,  // langues, profils...
} as const;
