// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { setCookie, getCookie, getSession, createSession, deleteSession } from "@/lib/session";
const EXP_SKEW = 60; // refresh 60s avant expiration

async function refreshAccessToken(refreshToken: string) {
  // API Server URL (FastAPI) - à configurer via env
  const apiBase = process.env.INTERNAL_API_URL;
  if (!apiBase) return new NextResponse("Missing INTERNAL_API_URL", { status: 500 });
  const res = await fetch(`${apiBase}/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  if (!res.ok) return null;
  return await res.json();
}

// Endpoint pour récupérer les infos de l'utilisateur connecté (basé sur la session)
export async function GET(): Promise<NextResponse> {
  // Lecture du cookie de session (sid)
  const sid = await getCookie();
  if (!sid) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // Recupération de la session en base de données à partir du sid
  const session = await getSession(sid);
  // Vérification de l'existence de la session
  if (!session || !session.data?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  // Vérification de l'expiration du token (avec un buffer de EXP_SKEW secondes)
  const now = Math.floor(Date.now() / 1000);
  const exp = Math.floor(session.data.expires_at);
  // si le token expire dans moins de EXP_SKEW secondes, on tente de le rafraîchir
  if (exp - now <= EXP_SKEW) {
    const refreshed = await refreshAccessToken(session.data.refresh_token);
    if (!refreshed) {
      await deleteSession(sid);
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // mise à jour de la session avec les nouveaux tokens et expiration
    session.data.access_token = refreshed.access_token;
    session.data.expires_at = refreshed.expires_at;
    if (refreshed.refresh_token) {
      session.data.refresh_token = refreshed.refresh_token;
    }
    await createSession(sid, session);
    await setCookie(sid); // renouvelle le maxAge du cookie
  }
  // si tout est ok, on retourne les données de session (userId, etc.)
  return NextResponse.json( session.data.user , { status: 200 });
}
