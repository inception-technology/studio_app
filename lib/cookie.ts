import { cookies } from "next/headers";

export const COOKIE = process.env.SESSION_COOKIE_NAME || "session_id";
export const COOKIE_TTL = Number(process.env.SESSION_TTL_SECONDS || 60 * 60 * 24 * 7);

export function cookieName() {
  return COOKIE;
}

export async function setCookie(sessionId: string, expSession: number = COOKIE_TTL) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: cookieName(),
    value: sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expSession,
    expires: new Date(Date.now() + expSession * 1000),
  });
}

export async function getCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(cookieName())?.value || null;
}

export async function clearCookie() {
  const cookieStore = await cookies();
  cookieStore.set(cookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}
