// lib/session.ts
import crypto from "crypto";
import { redis } from "./redis";
export const TTL = Number(process.env.SESSION_TTL_SECONDS || 60 * 60 * 24 * 7); 
const globalStore = global as typeof globalThis & { __sessionStore?: Map<string, SessionData> };
if (!globalStore.__sessionStore) globalStore.__sessionStore = new Map();
const store = globalStore.__sessionStore;

// Session management (in-memory or Redis based on config)
export type UserSessionInfo = {
  id_user: number;
  id_profile: number;
  id_organization: number | null;
  id_studio: number | null;
  code_language: string | "en";
};


export type SessionData = {
  data: {
    access_token: string;
    token_type: string;
    expires_at: number;
    refresh_token: string;
    user: UserSessionInfo;
  };
};

type RawSession = {
  access_token: string;
  token_type: string;
  expires_at: number;
  refresh_token: string;
  user: UserSessionInfo;
};

function normalizeSession(input: SessionData | RawSession): SessionData {
  if ("data" in input) {
    return input;
  }
  return { data: input };
}

export function newSessionId() {
  return crypto.randomUUID();
}

export function sessionKey(sid: string) {
  return `sess:${sid}`;
}

// abstraction pour gérer les sessions (en mémoire ou Redis selon config)
const USE_REDIS = process.env.USE_REDIS_SESSIONS === "true" || !!redis;

export async function createSession(sessionId: string, input: SessionData | RawSession) {
  // Creates a new session with the given ID and data.
  const data = normalizeSession(input);
  // Storing session
  if (USE_REDIS && redis) {
    // Redis store (for production)
    await redis.set(sessionKey(sessionId), JSON.stringify(data), { ex: TTL });
  } else {
    // in-memory store (for development/testing)
    store.set(sessionId, data);
  }
}

export async function getSession(sessionId: string): Promise<SessionData | null> {
  // Retrieves session data by session ID. Returns null if not found or expired.
  if (USE_REDIS && redis) {
    // Redis store (for production)
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
  // Deletes a session by session ID.
  // Redis store (for production)
  if (USE_REDIS && redis) return redis.del(sessionKey(sessionId));
  // in-memory store (for development/testing)
  store.delete(sessionId);
}
