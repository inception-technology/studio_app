import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/query-client";
import { sessionKeys } from "@/lib/query-keys";
import { type CalendarSession, type CalendarSessions, MOCK_SESSIONS } from "@/types/calendar";

// ─── Paramètres du hook ───────────────────────────────────────────────────────

export type CalendarSessionsParams = {
  studioId?: number | null;
  start?:    string;          // ISO 8601 — début de la plage visible
  end?:      string;          // ISO 8601 — fin de la plage visible
};

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchCalendarSessions(
  params: CalendarSessionsParams,
): Promise<CalendarSessions> {
  const sp = new URLSearchParams();
  if (params.studioId != null) sp.set("studio_id", String(params.studioId));
  if (params.start)             sp.set("start", params.start);
  if (params.end)               sp.set("end",   params.end);

  const url = `/api/calendar/sessions${sp.toString() ? `?${sp.toString()}` : ""}`;

  try {
    return await apiFetch<CalendarSessions>(url);
  } catch (err) {
    // Fallback mock si l'endpoint n'existe pas encore côté backend (404)
    if (err instanceof ApiError && err.status === 404) {
      console.warn("[useCalendarSessions] API not ready, using mock data");
      return MOCK_SESSIONS;
    }
    throw err;
  }
}

// ─── Hook principal ───────────────────────────────────────────────────────────

/**
 * useCalendarSessions
 *
 * Retourne les séances de la plage de dates visible dans le calendrier.
 *
 * Usage :
 *   const { sessions, events, isFetching, refetch } = useCalendarSessions({
 *     studioId: 1,
 *     start: "2024-01-01T00:00:00Z",
 *     end:   "2024-01-31T23:59:59Z",
 *   });
 *
 * - `sessions`   : données brutes (CalendarSession[])
 * - `events`     : données mappées pour FullCalendar (EventInput[])
 * - `isLoading`  : true pendant le premier chargement (skeleton)
 * - `isFetching` : true à chaque refetch en arrière-plan
 * - `error`      : instance ApiError si la requête a échoué
 * - `refetch`    : relancer manuellement (bouton refresh)
 */
export function useCalendarSessions(params: CalendarSessionsParams = {}) {
  const query = useQuery({
    queryKey:  sessionKeys.byFilter(params.studioId ?? null, params.start, params.end),
    queryFn:   () => fetchCalendarSessions(params),
    staleTime: 60 * 1000, // 1 min — les créneaux changent peu en cours de navigation
    // Pas de refetchOnWindowFocus pour le calendrier : évite les rechargements parasites
    refetchOnWindowFocus: false,
  });

  return {
    // Données
    sessions:   query.data ?? [],
    // États
    isLoading:  query.isLoading,
    isFetching: query.isFetching,
    isError:    query.isError,
    error:      query.error,
    // Contrôle manuel
    refetch:    query.refetch,
  };
}

// ─── Re-export du type pour les consumers ─────────────────────────────────────
export type { CalendarSession };
