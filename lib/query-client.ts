import { QueryClient } from "@tanstack/react-query";

/**
 * Configuration globale du QueryClient.
 *
 * staleTime    : durée pendant laquelle les données sont considérées fraîches.
 *                Passé ce délai, React Query relance la requête en arrière-plan.
 * gcTime       : durée de rétention en cache après qu'un composant se démonte.
 *                (anciennement "cacheTime" dans v4)
 * retry        : nombre de tentatives automatiques en cas d'erreur réseau.
 *                On exclut les erreurs 401/403 pour ne pas boucler sur l'auth.
 * refetchOnWindowFocus : relance automatique quand l'onglet reprend le focus.
 *                Utile pour les données temps réel (présences, réservations).
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:           30 * 1000,       // 30 secondes
        gcTime:               5 * 60 * 1000,  // 5 minutes
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          // Pas de retry sur les erreurs auth ou métier
          if (error instanceof ApiError && [401, 403, 404, 422].includes(error.status)) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: 0, // Jamais de retry automatique sur les mutations
      },
    },
  });
}

/**
 * Classe d'erreur enrichie pour les appels BFF.
 * Permet de typer les erreurs dans les hooks useQuery / useMutation.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Wrapper fetch standard pour tous les appels BFF depuis les hooks React Query.
 * Retourne la donnée parsée, ou lève une ApiError.
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    ...options,
  });

  if (!res.ok) {
    let code = "UNKNOWN_ERROR";
    let message = res.statusText;
    let details: unknown;

    try {
      const body = await res.json() as { code?: string; message?: string; details?: unknown };
      code    = body.code    ?? code;
      message = body.message ?? message;
      details = body.details;
    } catch {
      // Corps non-JSON, on garde les valeurs par défaut
    }

    throw new ApiError(res.status, code, message, details);
  }

  // 204 No Content → pas de corps
  if (res.status === 204) return undefined as T;

  // Toutes les routes BFF retournent { ok: true, data: T } via apiSuccess().
  // On désemballe automatiquement pour que les hooks reçoivent T directement.
  const body = await res.json() as { ok?: boolean; data?: T } | T;
  if (
    body !== null &&
    typeof body === "object" &&
    "ok" in body &&
    "data" in body
  ) {
    return (body as { ok: boolean; data: T }).data;
  }

  return body as T;
}
