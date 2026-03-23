/**
 * middleware.ts
 *
 * Couche 1 du RBAC — vérification de l'AUTHENTIFICATION uniquement.
 *
 * Le middleware s'exécute dans l'Edge Runtime (V8 isolate) :
 * ✅ peut lire les cookies de la requête
 * ❌ ne peut PAS accéder à Redis / à la session complète
 *
 * Il vérifie uniquement que le cookie de session existe.
 * La vérification du RÔLE (id_profile) est faite :
 *   - Couche 2 : layout.tsx  → filtre les items du sidebar (UX)
 *   - Couche 3 : BFF routes  → vérifient session.data.user.id_profile (sécurité réelle)
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE } from "@/lib/cookie";

export function middleware(req: NextRequest) {
  const sid = req.cookies.get(COOKIE)?.value;

  if (!sid) {
    const loginUrl = new URL("/login", req.url);
    // Conserver l'URL de destination pour rediriger après login
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Toutes les routes protégées (hors /api — les BFF routes gèrent elles-mêmes leur auth)
  matcher: [
    "/dashboard/:path*",
    "/studios/:path*",
    "/calendar/:path*",
    "/reports/:path*",
    "/finance/:path*",
    "/settings/:path*",
  ],
};
