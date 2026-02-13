import crypto from "crypto";
import { redis } from "./redis";
import { cookies } from "next/headers";

const COOKIE = process.env.SESSION_COOKIE_NAME || "session_id";
const TTL = Number(process.env.SESSION_TTL_SECONDS || 60 * 60 * 24 * 7);
const store = new Map<string, SessionData>();


// Session management (in-memory or Redis based on config)

export type SessionData = {
  data : {
    userId: number; 
    orgId: number; 
    roleId: number;
  }
};

export function newSessionId() {
  return crypto.randomUUID();
}

export function sessionKey(sid: string) {
  return `sess:${sid}`;
}

// abstraction pour gérer les sessions (en mémoire ou Redis selon config)
const USE_REDIS = process.env.USE_REDIS_SESSIONS === "true";

export async function createSession(sessionId: string, data: SessionData) {
  // Redis store (for production)
  if (USE_REDIS) {
    await redis.set(sessionKey(sessionId), JSON.stringify(data), { ex: TTL });
  } else {
    // in-memory store (for development/testing)
    store.set(sessionId, data);
  }
}

export async function getSession(sid: string): Promise<SessionData | null> {
  // Redis store (for production)
  if (USE_REDIS) {
    const session_data: string | null = await redis.get(sessionKey(sid));
    return session_data as unknown as SessionData ?? null;
    }
  // in-memory store (for development/testing)
  return store.get(sid) as SessionData ?? null;
}

export async function deleteSession(sid: string) {
  // Redis store (for production)
  if (USE_REDIS) return redis.del(sessionKey(sid));
  // in-memory store (for development/testing)
  store.delete(sid);
}


// Cookie management

export function cookieName() {
  return COOKIE;
}

export async function setCookie(sid: string) {
    const cookieStore = await cookies();
    cookieStore.set({
        name: cookieName(),
        value: sid,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // only send over HTTPS in prod
        sameSite: "lax",
        path: "/",
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
