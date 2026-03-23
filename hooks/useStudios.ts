import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/query-client";
import { studioKeys } from "@/lib/query-keys";
import { type Studios, type StudioCardProps, studioToCardProps } from "@/types/studio";


// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchStudios(): Promise<Studios> {
  try {
    return await apiFetch<Studios>("/api/studio");
  } catch (err) {
    // Fallback mock si l'endpoint n'existe pas encore côté backend (404)
    if (err instanceof ApiError && err.status === 404) {
      console.warn("[useStudios] API not ready, using mock data");
    }
    throw err;
  }
}

// ─── Hook principal ───────────────────────────────────────────────────────────

/**
 * useStudios
 *
 * Retourne la liste des studios de l'organisation connectée.
 *
 * Usage :
 *   const { studios, cardProps, isLoading, error } = useStudios();
 *
 * - `studios`   : données brutes (type Studio[])
 * - `cardProps` : données mappées pour <StudioPreviewCard /> (type StudioCardProps[])
 * - `isLoading` : true pendant le premier chargement
 * - `isFetching`: true à chaque refetch en arrière-plan
 * - `error`     : instance ApiError si la requête a échoué
 */
export function useStudios() {
  const query = useQuery({
    queryKey: studioKeys.list(),
    queryFn:  fetchStudios,
    staleTime: 60 * 1000, // Les studios changent peu : 1 min de fraîcheur
  });

  const cardProps: StudioCardProps[] = (query.data ?? []).map(studioToCardProps);
 
  // const totalMembers = (query.data ?? []).reduce(
  //   (sum, s) => sum + (s.stats?.member_count ?? 0), 0
  // );

  // const totalPendingJoins = (query.data ?? []).reduce(
  //   (sum, s) => sum + (s.stats?.pending_joins ?? 0), 0
  // );

  const totalMembers = 100;
  const totalPendingJoins = 5;

  return {
    // Données
    studios:           query.data ?? [],
    cardProps,
    totalMembers,
    totalPendingJoins,
    // États
    isLoading:         query.isLoading,
    isFetching:        query.isFetching,
    isError:           query.isError,
    error:             query.error,
  };
}
