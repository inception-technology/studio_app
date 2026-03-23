import type { NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/bff-proxy";

/**
 * GET /api/user/me
 * Retourne le profil complet de l'utilisateur connecté.
 * Accessible à tous les profils authentifiés (pas de restriction RBAC).
 */
export async function GET(): Promise<NextResponse> {
  return proxyToBackend({
    method:         "GET",
    path:           "/user/me",
    useBearerAuth:  true,
    errorMessage:   "Error retrieving user profile",
  });
}
