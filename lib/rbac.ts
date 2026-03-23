/**
 * lib/rbac.ts
 *
 * Helpers RBAC pour les BFF routes (Couche 3 du contrôle d'accès).
 *
 * Utilisation dans une BFF route :
 *   const session = await getAuthorizedSession();
 *   const forbidden = requireRole(session, ROLES.MANAGER_AND_ABOVE);
 *   if (forbidden) return forbidden;
 */
import { NextResponse } from "next/server";
import { API_ERROR_CODES } from "@/lib/api-codes";
import { apiError } from "@/lib/internal-api";
import type { SessionData } from "@/lib/session";

// ─── Définition des profils ───────────────────────────────────────────────────

export const PROFILE = {
  OWNER:          1,
  MANAGER:        2,
  ASST_MANAGER:   3,
  COACH:          4,
  ASST_COACH:     5,
  STUDENT:        6,
} as const;

export type ProfileId = (typeof PROFILE)[keyof typeof PROFILE];

// ─── Groupes de rôles prédéfinis ─────────────────────────────────────────────

export const ROLES = {
  /** Accès total — Owner uniquement */
  OWNER_ONLY:         [PROFILE.OWNER],

  /** Finance / paramètres avancés — Owner + Manager */
  MANAGER_AND_ABOVE:  [PROFILE.OWNER, PROFILE.MANAGER],

  /** Gestion opérationnelle — Owner, Manager, Asst. Manager */
  STAFF_ADMIN:        [PROFILE.OWNER, PROFILE.MANAGER, PROFILE.ASST_MANAGER],

  /** Studios + Dashboard — Admin + Coaches (lecture) */
  STAFF_WITH_COACHES: [PROFILE.OWNER, PROFILE.MANAGER, PROFILE.ASST_MANAGER, PROFILE.COACH],

  /** Calendrier — tous les profils staff */
  ALL_STAFF:          [PROFILE.OWNER, PROFILE.MANAGER, PROFILE.ASST_MANAGER, PROFILE.COACH, PROFILE.ASST_COACH],
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Vérifie que la session dispose du rôle requis.
 * Retourne une NextResponse 403 si le rôle est insuffisant, null sinon.
 *
 * Usage :
 *   const forbidden = requireRole(session, ROLES.OWNER_ONLY);
 *   if (forbidden) return forbidden;
 */
export function requireRole(
  session: SessionData | null,
  allowedProfiles: readonly number[],
): NextResponse | null {
  if (!session) {
    return apiError(401, API_ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }
  const idProfile = session.data.user.id_profile;
  if (!allowedProfiles.includes(idProfile)) {
    return apiError(
      403,
      API_ERROR_CODES.FORBIDDEN,
      `Insufficient permissions (profile ${idProfile})`,
    );
  }
  return null;
}

/**
 * Vérifie qu'un utilisateur peut accéder à un studio donné.
 * Un Owner/Manager voit tous les studios de son org.
 * Un Coach ne voit que son studio assigné (id_studio).
 */
export function requireStudioAccess(
  session: SessionData | null,
  studioId: number,
): NextResponse | null {
  if (!session) {
    return apiError(401, API_ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }
  const { id_profile, id_studio } = session.data.user;

  // Admins voient tous les studios
  if ([PROFILE.OWNER, PROFILE.MANAGER, PROFILE.ASST_MANAGER].some((role) => role === id_profile)) {
    return null;
  }
  // Coaches/Asst. Coaches : uniquement leur studio assigné
  if ([PROFILE.COACH, PROFILE.ASST_COACH].some((role) => role === id_profile)) {
    if (id_studio !== studioId) {
      return apiError(403, API_ERROR_CODES.FORBIDDEN, "Access restricted to your assigned studio");
    }
    return null;
  }
  // Students et autres : refus
  return apiError(403, API_ERROR_CODES.FORBIDDEN, "Insufficient permissions");
}
