/**
 * lib/bff-proxy.ts
 *
 * Helper partagé pour toutes les BFF routes qui proxifient vers FastAPI.
 * Centralise : auth bearer, RBAC, retry 401, réponses paginées, gestion d'erreurs.
 *
 * Usage standard dans une route :
 *   export async function GET(): Promise<NextResponse> {
 *     return proxyToBackend({
 *       method: "GET",
 *       path: "/resource",
 *       useBearerAuth: true,
 *       allowedRoles: ROLES.STAFF_ADMIN,
 *       errorMessage: "Error retrieving resource",
 *     });
 *   }
 *
 * Usage avec URL dynamique (dépend de la session) :
 *   path: (session, apiBase) => {
 *     const id = session.data.user.id_organization;
 *     if (id == null) return apiError(404, API_ERROR_CODES.NOT_FOUND, "No organization");
 *     return `${apiBase}/organization/${id}`;
 *   },
 */
import { NextResponse } from "next/server";
import { API_ERROR_CODES } from "@/lib/api-codes";
import { getAuthorizedSession } from "@/lib/authorized-session";
import { ensureSessionFresh, refreshSessionTokens } from "@/lib/session-refresh";
import {
  apiError,
  apiSuccess,
  backendProxyFetch,
  getInternalApiConfigOrError,
  getInternalAuthHeaders,
  readResponseText,
} from "@/lib/internal-api";
import { requireRole } from "@/lib/rbac";
import type { SessionData } from "@/lib/session";

// ─── Types ────────────────────────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * `path` peut être :
 *   - une string relative à apiBase :  "/resource"
 *   - une fonction qui reçoit (session, apiBase) et retourne :
 *       · une string URL complète
 *       · une NextResponse (pour retourner une erreur avant d'atteindre le backend)
 */
type PathResolver =
  | string
  | ((session: SessionData, apiBase: string) => string | NextResponse);

export type BffProxyOptions = {
  method:                  HttpMethod;
  path:                    PathResolver;
  body?:                   BodyInit;
  /** Requête signée avec le Bearer token de la session utilisateur */
  useBearerAuth?:          boolean;
  /** Requête signée avec les credentials internes BFF (client_id/secret) */
  useInternalAuthHeaders?: boolean;
  /** RBAC : retourne 403 si id_profile n'est pas dans la liste */
  allowedRoles?:           readonly number[];
  /**
   * FastAPI renvoie parfois { data: T[], meta: {...} } (format paginé).
   * true → extrait automatiquement body.data avant d'appeler apiSuccess().
   */
  paginatedResponse?:      boolean;
  successMessage?:         string;
  errorMessage:            string;
};

// ─── Helpers internes ─────────────────────────────────────────────────────────

async function getValidSession(): Promise<SessionData | null> {
  const session = await getAuthorizedSession();
  if (!session) return null;
  if (!(await ensureSessionFresh(session))) return null;
  return session;
}

// ─── Helper principal ─────────────────────────────────────────────────────────

export async function proxyToBackend(options: BffProxyOptions): Promise<NextResponse> {

  // ── Config API interne ────────────────────────────────────────────────────
  const configResult = getInternalApiConfigOrError();
  if ("error" in configResult) return configResult.error;
  const { config } = configResult;

  // ── Session (si bearer auth requise) ─────────────────────────────────────
  const session = options.useBearerAuth ? await getValidSession() : null;
  if (options.useBearerAuth && !session) {
    return apiError(401, API_ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }

  // ── RBAC ──────────────────────────────────────────────────────────────────
  if (options.allowedRoles) {
    const forbidden = requireRole(session, options.allowedRoles);
    if (forbidden) return forbidden;
  }

  // ── Résolution du chemin (string fixe ou fonction dynamique) ──────────────
  let resolvedUrl: string;
  if (typeof options.path === "function") {
    const result = options.path(session!, config.apiBase);
    // La fonction peut retourner une NextResponse pour court-circuiter (ex: 404)
    if (result instanceof NextResponse) return result;
    resolvedUrl = result;
  } else {
    resolvedUrl = `${config.apiBase}${options.path}`;
  }

  // ── Proxy vers FastAPI ────────────────────────────────────────────────────
  try {
    const backendResponse = await backendProxyFetch({
      url: resolvedUrl,
      method: options.method,
      getHeaders: () => ({
        ...(options.body                    ? { "Content-Type": "application/json" } : {}),
        ...(options.useInternalAuthHeaders  ? getInternalAuthHeaders(config)         : {}),
        ...(session                         ? { Authorization: `Bearer ${session.data.access_token}` } : {}),
      }),
      body: options.body,
      ...(session ? {
        retry: {
          statuses: [401],
          shouldRetry: async () => refreshSessionTokens(session),
        },
      } : {}),
    });

    // ── Erreurs backend ─────────────────────────────────────────────────────
    if (!backendResponse.ok) {
      const details = await readResponseText(backendResponse);
      if (backendResponse.status === 401) return apiError(401, API_ERROR_CODES.UNAUTHORIZED,         "Unauthorized",             details);
      if (backendResponse.status === 403) return apiError(403, API_ERROR_CODES.FORBIDDEN,            "Access denied",            details);
      if (backendResponse.status === 404) return apiError(404, API_ERROR_CODES.NOT_FOUND,            "Resource not found",       details);
      if (backendResponse.status === 422) return apiError(422, API_ERROR_CODES.VALIDATION_FAILED,    "Invalid request payload",  details);
      return apiError(backendResponse.status, API_ERROR_CODES.INTERNAL_ERROR, options.errorMessage, details);
    }

    // ── Réponse non-JSON (ex: 204 No Content, texte brut) ───────────────────
    const contentType = backendResponse.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await readResponseText(backendResponse);
      return apiSuccess(text, { status: backendResponse.status });
    }

    const payload = await backendResponse.json().catch(() => null);

    // ── Réponse paginée FastAPI : { data: T[], meta: {...} } ────────────────
    if (
      options.paginatedResponse &&
      payload !== null &&
      typeof payload === "object" &&
      "data" in payload
    ) {
      return apiSuccess((payload as { data: unknown }).data, {
        status: backendResponse.status,
        ...(options.successMessage ? { meta: { message: options.successMessage } } : {}),
      });
    }

    return apiSuccess(payload, {
      status: backendResponse.status,
      ...(options.successMessage ? { meta: { message: options.successMessage } } : {}),
    });

  } catch (error) {
    return apiError(500, API_ERROR_CODES.INTERNAL_ERROR, "Internal Server Error", error);
  }
}
