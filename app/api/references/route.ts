import type { NextResponse } from "next/server";
import { API_ERROR_CODES } from "@/lib/api-codes";
import { apiError } from "@/lib/internal-api";
import { proxyToBackend } from "@/lib/bff-proxy";

/**
 * GET /api/references?reference=<type>
 * Retourne les données de référence (langues, profils, pays, etc.).
 * Endpoint public côté BFF — signé avec les credentials internes (client_id/secret).
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return apiError(400, API_ERROR_CODES.BAD_REQUEST, "Missing reference parameter");
  }

  return proxyToBackend({
    method:                 "GET",
    path:                   `/references/${reference}`,
    useInternalAuthHeaders: true,
    errorMessage:           "Error retrieving references",
  });
}
