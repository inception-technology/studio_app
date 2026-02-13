"use client";
import DashboardHeader from "@/components/shared/DashboardHeader";
import { useCallback, useState, useEffect } from "react";
import { User } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

async function safeJson<T>(res: Response): Promise<T | null> {
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) return null;
  try {
    const json = await res.clone().json();
    return (json?.data ?? null) as T;
  } catch {
    return null;
  }
}


const Dashboard = () => {
  //const { user } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const date = new Date();
  const router = useRouter();

  const refreshMe = useCallback(async (): Promise<User | null> => {
    const res = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
        credentials: "include"
      });
      if (res.status !== 200) {
        setUser(null);
        return null;
      }
      const data = await safeJson<User>(res);
      if (!data) return null;
      setUser(data);
      return data;
  }, [setUser]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
          const u = await refreshMe();
          if (!u?.userId) router.replace("/");
        } finally {
          if (alive) setIsLoading(false);
        }
    })();
    return () => {
      alive = false;
    };
  }, [refreshMe, router]);

  // TODO : if session is valid, display user info and dashboard content, else display a message or redirect to login page
  const user_data = { username: "Guest" };

  return isLoading ? (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
    </div>
  ) : (
    <div className="flex flex-col w-full p-6">
      <DashboardHeader user_data={user_data} date={date} />
      <h1 className="text-2xl font-bold text-gray-900 w-full border-b border-gray-300 pb-2">
        Dashboard
      </h1>
    </div>
  );
};
export default Dashboard;
