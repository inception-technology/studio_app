// src/app/api/auth/me/route.ts
import { API_ERROR_CODES } from "@/lib/api-codes";
import { getAuthorizedSession } from "@/lib/authorized-session";
import { ensureSessionFresh } from "@/lib/session-refresh";
import { apiError, apiSuccess } from "@/lib/internal-api";

// Endpoint pour récupérer les infos de l'utilisateur connecté (basé sur la session)
export async function GET() {
  const session = await getAuthorizedSession();
  if (!session) {
    return apiError(401, API_ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }

  if (!(await ensureSessionFresh(session))) {
    return apiError(401, API_ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }

  return apiSuccess(session.data.user);
}
