import type { NextResponse } from "next/server";
import { API_ERROR_CODES } from "@/lib/api-codes";
import { apiError } from "@/lib/internal-api";
import { proxyToBackend } from "@/lib/bff-proxy";
import { ROLES } from "@/lib/rbac";

/**
 * GET /api/organization
 * Retourne les informations de l'organisation courante.
 * Proxifie vers GET /organization/:id côté FastAPI.
 */
export async function GET(): Promise<NextResponse> {
  return proxyToBackend({
    method:        "GET",
    path:          (session, apiBase) => {
      const id = session.data.user.id_organization;
      if (id == null) {
        return apiError(404, API_ERROR_CODES.NOT_FOUND, "No organization linked to this account");
      }
      return `${apiBase}/organization/${id}`;
    },
    useBearerAuth: true,
    allowedRoles:  ROLES.STAFF_ADMIN,
    errorMessage:  "Error retrieving organization",
  });
}
