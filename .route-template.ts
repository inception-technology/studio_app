/**
 * .route-template.ts
 *
 * Template à copier pour créer une nouvelle BFF route.
 * Remplacer "/resource" par le chemin FastAPI réel, adapter allowedRoles.
 *
 * Étapes :
 *   1. Copier ce fichier dans app/api/<module>/route.ts
 *   2. Remplacer "/resource" par le chemin de l'endpoint FastAPI
 *   3. Choisir allowedRoles selon le niveau d'accès requis
 *   4. Activer paginatedResponse: true si FastAPI retourne { data: [], meta: {} }
 *   5. Supprimer les handlers HTTP inutiles (ex: garder seulement GET)
 */
import type { NextResponse } from "next/server";
import { API_ERROR_CODES } from "./lib/api-codes";
import { apiError } from "./lib/internal-api";
import { proxyToBackend } from "./lib/bff-proxy";
import { ROLES } from "./lib/rbac";

// ─── Groupes de rôles disponibles ────────────────────────────────────────────
// ROLES.OWNER_ONLY          → [1]            Owner seulement
// ROLES.MANAGER_AND_ABOVE   → [1, 2]         Owner + Manager
// ROLES.STAFF_ADMIN         → [1, 2, 3]      + Asst. Manager
// ROLES.STAFF_WITH_COACHES  → [1, 2, 3, 4]   + Coach
// ROLES.ALL_STAFF           → [1, 2, 3, 4, 5] + Asst. Coach

export async function GET(): Promise<NextResponse> {
  return proxyToBackend({
    method:        "GET",
    path:          "/resource",
    useBearerAuth: true,
    allowedRoles:  ROLES.STAFF_ADMIN,    // ← adapter
    // paginatedResponse: true,          // ← activer si FastAPI renvoie { data: [], meta: {} }
    errorMessage:  "Error retrieving resource",
  });
}

export async function POST(req: Request): Promise<NextResponse> {
  const body = await req.json().catch(() => null);
  if (!body) {
    return apiError(400, API_ERROR_CODES.BAD_REQUEST, "Missing request payload");
  }

  return proxyToBackend({
    method:        "POST",
    path:          "/resource",
    body:          JSON.stringify(body),
    useBearerAuth: true,
    allowedRoles:  ROLES.MANAGER_AND_ABOVE,
    errorMessage:  "Error creating resource",
  });
}

export async function PUT(req: Request): Promise<NextResponse> {
  const body = await req.json().catch(() => null);
  if (!body) {
    return apiError(400, API_ERROR_CODES.BAD_REQUEST, "Missing request payload");
  }

  return proxyToBackend({
    method:        "PUT",
    path:          "/resource",
    body:          JSON.stringify(body),
    useBearerAuth: true,
    allowedRoles:  ROLES.MANAGER_AND_ABOVE,
    errorMessage:  "Error updating resource",
  });
}

export async function DELETE(req: Request): Promise<NextResponse> {
  const body = await req.json().catch(() => null);

  return proxyToBackend({
    method:        "DELETE",
    path:          "/resource",
    body:          body ? JSON.stringify(body) : undefined,
    useBearerAuth: true,
    allowedRoles:  ROLES.OWNER_ONLY,
    errorMessage:  "Error deleting resource",
  });
}

// ─── Exemple avec URL dynamique (chemin dépend de la session) ─────────────────
//
// export async function GET(): Promise<NextResponse> {
//   return proxyToBackend({
//     method:        "GET",
//     path:          (session, apiBase) => {
//       const id = session.data.user.id_organization;
//       if (id == null) return apiError(404, API_ERROR_CODES.NOT_FOUND, "No organization");
//       return `${apiBase}/organization/${id}/resource`;
//     },
//     useBearerAuth: true,
//     allowedRoles:  ROLES.STAFF_ADMIN,
//     errorMessage:  "Error retrieving resource",
//   });
// }
