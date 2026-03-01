"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { safeJson } from "@/lib/utils";

export type User = {
  id: number; 
  id_role: number; 
  id_organization: number;
};

export type UserProfile = {
  user_id: number;
  firstname: string;
  lastname: string;
  surname: string
  address_line1: string;
  address_line2: string;
  zipcode: string;
  city: string;
  country_code: string;
  email: string;
  phone: string;
  birthdate: string;
  gender: string;
  language_code: string;
  created_at: string;
  updated_at: string;
  role_name: string;
  is_active: boolean;
  last_login_at: string;
};

export type Users = Array<UserProfile>;

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
  refresh: () => Promise<User | null>;
  loadProfile: () => Promise<UserProfile | null>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Fonction pour récupérer les données de l'utilisateur connecté
async function getMe(): Promise<User | null> {
  const res = await fetch("/api/auth/me", { 
    method: "GET", 
    cache: "no-store",
    credentials: "include" 
  });
  if (!res.ok) return null;
  const payload = await safeJson<User>(res);
  return payload ?? null;
}

// Fonction pour connecter l'utilisateur
async function postLogin(username: string, password: string): Promise<boolean> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ username, password }),
    credentials: "include", // Important pour envoyer les cookies de session
  });
  return res.ok;
}

// Fonction pour déconnecter l'utilisateur
async function postLogout(): Promise<void> {
  await fetch("/api/auth/logout", {
     method: "POST", 
     cache: "no-store",
     credentials: "include"
    });
}

// Fonction pour récupérer le profil de l'utilisateur connecté
async function getProfile(): Promise<UserProfile | null> {
  const res = await fetch("/api/user/me", { 
    method: "GET", 
    cache: "no-store",
    credentials: "include"
  });
  if (!res.ok) return null;
  const payload = await safeJson<UserProfile>(res);
  return payload ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user?.id;

  const refresh = useCallback(async () => {
    const me = await getMe();
    setUser(me);
    if (!me) setProfile(null);
    return me;
  }, []);

  const loadProfile = useCallback(async () => {
    const p = await getProfile();
    setProfile(p);
    return p;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const ok = await postLogin(email, password);
        if (!ok) {
          setUser(null);
          setProfile(null);
          return false;
        }
        const me = await refresh();
        if (!me) return false;
        await loadProfile();
        // option: redirection si tu es sur /auth/login
        if (pathname === "/" || pathname?.startsWith("/auth/login")) {
          router.replace("/dashboard");
        }
        return true;
      } finally {
        setIsLoading(false);
      }
    },
    [loadProfile, pathname, refresh, router]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await postLogout();
    } finally {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      router.replace("/");
    }
  }, [router]);

  // Hydratation initiale (au chargement)
  useEffect(() => {
    let alive = true;
    (async () => {
    try {
      // Hydratation initiale : on vérifie si on a déjà une session active
      const me = await getMe();
      if (!alive) return;
      // ✅ stop, ne pas relancer le composant si on est déjà unmounted
      if (!me) {
        setUser(null);
        setIsLoading(false);
        return; 
      }
      // Si on a une session, on charge le profil
      setUser(me);
      if (me) {
        const p = await getProfile();
        if (!alive) return;
        setProfile(p);
      } else {
        setProfile(null);
      }
    } finally {
      if (alive) setIsLoading(false);
    }
    })();
    // Refresh périodique (ex: toutes les 4 minutes)
    const interval = setInterval(() => refresh(), 4 * 60 * 1000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isLoading,
      isAuthenticated,
      refresh,
      loadProfile,
      login,
      logout,
    }),
    [user, profile, isLoading, isAuthenticated, refresh, loadProfile, login, logout]
  );

  return(
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

