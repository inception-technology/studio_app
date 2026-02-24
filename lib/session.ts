// lib/session.ts
import crypto from "crypto";
import { redis } from "./redis";
import { cookies } from "next/headers";

export const COOKIE = process.env.SESSION_COOKIE_NAME || "session_id";
export const TTL = Number(process.env.SESSION_TTL_SECONDS || 60 * 60 * 24 * 7); 
const store = new Map<string, SessionData>();

// Session management (in-memory or Redis based on config)

export type SessionData = {
  data: {
    access_token: string;
    token_type: string;
    expires_at: number;
    refresh_token: string;
    user: {
      id: number; 
      id_role: number; 
      id_organization: number;
    }
  };
};

type RawSession = {
  access_token: string;
  token_type: string;
  expires_at: number;
  refresh_token: string;
  user: { id: number; id_role: number; id_organization: number };
};

function normalizeSession(input: SessionData | RawSession): SessionData {
  return (input as any).data ? (input as SessionData) : { data: input as RawSession };
}

function computeTtlSeconds(expiresAt: number) {
  const now = Math.floor(Date.now() / 1000);
  // expires_at est parfois float -> on floor
  const ttl = Math.floor(expiresAt) - now;
  // évite ttl <= 0 qui fait expirer instantanément / erreur selon client
  return Math.max(30, ttl); // au moins 30s
}

export function newSessionId() {
  return crypto.randomUUID();
}

export function sessionKey(sid: string) {
  return `sess:${sid}`;
}

// abstraction pour gérer les sessions (en mémoire ou Redis selon config)
const USE_REDIS = process.env.USE_REDIS_SESSIONS === "true";

export async function createSession(sessionId: string, input: SessionData | RawSession) {
  const data = normalizeSession(input);
  // Redis store (for production)
  if (USE_REDIS) {
    //const ttl = computeTtlSeconds(data.data.expires_at);
    await redis.set(sessionKey(sessionId), JSON.stringify(data), { ex: TTL });
  } else {
    // in-memory store (for development/testing)
    store.set(sessionId, data);
  }
}

export async function getSession(sessionId: string): Promise<SessionData | null> {
  // Redis store (for production)
  if (USE_REDIS) {
    const v: string | null = await redis.get(sessionKey(sessionId));
    if (!v) {
      return null;
    }
    const parsed =
      typeof v === "string"
        ? (JSON.parse(v) as SessionData | RawSession)
        : (v as SessionData | RawSession);
    return normalizeSession(parsed);
    }
  // in-memory store (for development/testing)
  return store.get(sessionId) as SessionData || null;
}

export async function deleteSession(sessionId: string) {
  // Redis store (for production)
  if (USE_REDIS) return redis.del(sessionKey(sessionId));
  // in-memory store (for development/testing)
  store.delete(sessionId);
}


// Cookie management

export function cookieName() {
  return COOKIE;
}

export async function setCookie(sessionId: string, exp_session: number = TTL) {
    const cookieStore = await cookies();
    cookieStore.set({
        name: cookieName(),
        value: sessionId,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // only send over HTTPS in prod
        sameSite: "lax",
        path: "/",
        maxAge: exp_session,
        expires: new Date(Date.now() + exp_session * 1000),
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
