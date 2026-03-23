import type { NextResponse } from "next/server";
import { API_ERROR_CODES } from "@/lib/api-codes";
import { apiError } from "@/lib/internal-api";
import { proxyToBackend } from "@/lib/bff-proxy";
import { ROLES } from "@/lib/rbac";
import { makeStudioSchema } from "@/lib/schemas/studio";

/**
 * GET /api/studio
 * Retourne la liste des studios de l'organisation courante.
 * Proxifie vers GET /organization/studios/list côté FastAPI.
 * FastAPI renvoie { data: Studio[], meta: {...} } → paginatedResponse: true extrait data.
 */
export async function GET(): Promise<NextResponse> {
  return proxyToBackend({
    method:             "GET",
    path:               (session, apiBase) => {
      if (session.data.user.id_organization == null) {
        return apiError(404, API_ERROR_CODES.NOT_FOUND, "No organization linked to this account");
      }
      return `${apiBase}/organization/studios/list`;
    },
    useBearerAuth:      true,
    allowedRoles:       ROLES.STAFF_WITH_COACHES,
    paginatedResponse:  true,
    errorMessage:       "Error fetching studios",
  });
}

/**
 * POST /api/studio
 * Crée un nouveau studio dans l'organisation courante.
 * Proxifie vers POST /organization/studios côté FastAPI.
 * Réservé aux Owner et Manager (ROLES.MANAGER_AND_ABOVE).
 */
export async function POST(req: Request): Promise<NextResponse> {
  const body = await req.json().catch(() => null);
  if (!body) {
    return apiError(400, API_ERROR_CODES.BAD_REQUEST, "Missing request payload");
  }

  // Validation Zod côté BFF (messages en anglais — déjà validé côté client)
  const schema = makeStudioSchema({
    nameRequired:     "Studio name is required",
    cityRequired:     "City is required",
    countryRequired:  "Country is required",
    timezoneRequired: "Timezone is required",
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError(422, API_ERROR_CODES.VALIDATION_FAILED, "Invalid studio data", parsed.error.flatten());
  }

  return proxyToBackend({
    method:        "POST",
    path:          (session, apiBase) => {
      if (session.data.user.id_organization == null) {
        return apiError(404, API_ERROR_CODES.NOT_FOUND, "No organization linked to this account");
      }
      return `${apiBase}/organization/studios`;
    },
    body:          JSON.stringify(parsed.data),
    useBearerAuth: true,
    allowedRoles:  ROLES.MANAGER_AND_ABOVE,
    errorMessage:  "Error creating studio",
  });
}
