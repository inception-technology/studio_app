"use client";

/**
 * QueryProvider
 *
 * Doit être un Client Component car QueryClient est instancié côté client.
 * On utilise useState pour créer l'instance une seule fois par rendu React,
 * évitant ainsi de recréer un nouveau client à chaque re-render.
 *
 * ReactQueryDevtools est inclus uniquement en développement
 * (tree-shaken automatiquement en production par Next.js).
 */

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { makeQueryClient } from "@/lib/query-client";
import type { QueryClient } from "@tanstack/react-query";

// Singleton en dehors du composant pour éviter la re-création
// lors des Server-Side Renders (Next.js peut appeler le composant plusieurs fois)
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Côté serveur : toujours un nouveau client (pas de state partagé entre requêtes)
    return makeQueryClient();
  }
  // Côté client : réutiliser l'instance existante ou en créer une
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState garantit qu'on ne recrée pas le client à chaque render
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools visible uniquement en dev, dans un panneau flottant en bas à droite */}
      <ReactQueryDevtools
        initialIsOpen={false}
        buttonPosition="bottom-right"
      />
    </QueryClientProvider>
  );
}
