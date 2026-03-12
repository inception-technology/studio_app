import {
  createSession,
  deleteSession,
  SessionData,
} from "@/lib/session";
import { clearCookie, getCookie, setCookie } from "@/lib/cookie";

export const EXP_SKEW_SECONDS = 60;

type RefreshPayload = {
  access_token: string;
  expires_at: number;
  refresh_token?: string;
};

async function requestTokenRefresh(refreshToken: string): Promise<RefreshPayload | null> {
  const apiBase = process.env.INTERNAL_API_URL;
  if (!apiBase) return null;

  const res = await fetch(`${apiBase}/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return (await res.json()) as RefreshPayload;
}

export async function refreshSessionTokens(session: SessionData): Promise<boolean> {
  const sid = await getCookie();
  if (!sid) {
    await clearCookie();
    return false;
  }

  const refreshed = await requestTokenRefresh(session.data.refresh_token);
  if (!refreshed) {
    await deleteSession(sid);
    await clearCookie();
    return false;
  }

  session.data.access_token = refreshed.access_token;
  session.data.expires_at = refreshed.expires_at;
  if (refreshed.refresh_token) {
    session.data.refresh_token = refreshed.refresh_token;
  }

  await createSession(sid, session);
  await setCookie(sid);
  return true;
}

export async function ensureSessionFresh(session: SessionData, expSkew = EXP_SKEW_SECONDS): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const exp = Math.floor(session.data.expires_at);
  if (exp - now > expSkew) return true;
  return refreshSessionTokens(session);
}
