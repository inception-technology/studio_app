"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { safeApiJson } from "@/lib/utils";

export type UserCred = {
  id_user: number;
  id_profile: number;
  id_organization: number | null;
  id_studio: number | null;
  code_language: string | null;
};


// User data type returned by /api/auth/me
export type UserProfile = {
  id_user: number;
  firstname: string;
  lastname: string;
  username: string | null;
  address_line1: string | null;
  address_line2: string | null;
  zipcode: string | null;
  city: string | null;
  code_country: string | null;
  phone: string | null;
  birthdate: string | null;
  code_gender: string | null;
  avatar_url: string | null;
};

type AuthState = {
  userCred: UserCred | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
  refresh: () => Promise<UserCred | null>;
  loadProfile: () => Promise<UserProfile | null>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Fonction pour récupérer les données de l'utilisateur connecté
async function getUserCred(): Promise<UserCred | null> {
  const res = await fetch(`/api/auth/me`, { 
    method: "GET", 
    cache: "no-store",
    credentials: "include" 
  });
  if (!res.ok) return null;
  const payload = await safeApiJson<UserCred>(res);
  return payload ?? null;
}

// Fonction pour connecter l'utilisateur
async function postLogin(username: string, password: string): Promise<boolean> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ username, password }),
    credentials: "include",
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
async function getUserProfile(): Promise<UserProfile | null> {
  const res = await fetch("/api/user/me", { 
    method: "GET", 
    cache: "no-store",
    credentials: "include"
  });
  if (!res.ok) return null;
  const payload = await safeApiJson<UserProfile>(res);
  return payload ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [userCred, setUserCred] = useState<UserCred | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!userCred?.id_user;

  const refresh = useCallback(async () => {
    const c = await getUserCred();
    setUserCred(c);
    if (!c) setUserProfile(null);
    return c;
  }, []);

  const loadProfile = useCallback(async () => {
    const p = await getUserProfile();
    setUserProfile(p);
    return p;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const ok = await postLogin(email, password);
        if (!ok) {
          setUserCred(null);
          setUserProfile(null);
          return false;
        }
        const cred = await refresh();
        if (!cred) return false;
        await loadProfile();
        // Always redirect to dashboard after successful login.
        router.replace("/dashboard");
        return true;
      } finally {
        setIsLoading(false);
      }
    },
    [loadProfile, refresh, router]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await postLogout();
    } finally {
      setUserCred(null);
      setUserProfile(null);
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
      const cred = await getUserCred();
      if (!alive) return;
      //ne pas relancer le composant si on est déjà unmounted
      if (!cred) {
        setUserCred(null);
        setIsLoading(false);
        return; 
      }
      // Si on a une session, on charge le profil
      setUserCred(cred);
      if (cred) {
        const p = await getUserProfile();
        if (!alive) return;
        setUserProfile(p);
      } else {
        setUserProfile(null);
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
      userCred,
      userProfile,
      isLoading,
      isAuthenticated,
      refresh,
      loadProfile,
      login,
      logout,
    }),
    [
      userCred, 
      userProfile, 
      isLoading, 
      isAuthenticated, 
      refresh, 
      loadProfile, 
      login, 
      logout
    ]
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

