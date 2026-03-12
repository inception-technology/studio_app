"use client";
import AppHeader from "@/components/shared/AppHeader";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { safeApiJson } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { 
  UsersRound,
  ClipboardPen, 
 } from "lucide-react";


// // Function to fetch dashboard data (e.g., users list)
// async function fetchDashboardData(): Promise<Member[]> {
//   try {
//     const res = await fetch("/api/member/all", {
//       method: "GET",
//       cache: "no-store",
//     });
//     if (!res.ok) return [];
//     const data = await safeApiJson<Member[] | null>(res);
//     console.log("Raw data from /api/member/all:", data); // Debug log the raw data received from the API
//     if (!data) return [];
//     const users: Member[] = Array.isArray(data)
//       ? data
//       : data
//         ? Object.values(data)
//         : [];
//     return users;
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     return [];
//   }
// };

const GlobalPerformance = {
  "revenue":{
    "currency": "$",
    "monthly":45200.00,
    "rate":12.4
  },
  "students":{
    "total":1240,
    "pending_joins": 4
  }
}


const FinancePage = () => {
  
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    let alive = true;
    (async () => {
      //const users = await fetchDashboardData();
      //console.log("Fetched dashboard data:", users); // Debug log for fetched data
      //if (alive) setDashboardData(users);
      if (alive) console.warn("Dashboard data fetching is currently disabled. Please implement fetchDashboardData function to load real data.");
    })();
    return () => {
      alive = false;
    };
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Option: si non auth, tu peux aussi retourner null
  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col w-full p-6">
      <AppHeader title="finance"/>

      <section className="mb-6">

        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 ml-1">Global Performance</h2>
        
        <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-organization/10 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
        <p className="text-slate-500 text-xs font-semibold mb-1">Monthly Global Revenue</p>
        <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">$45,200.00</h3>
        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">+12.4%</span>
        </div>

        <div className="mt-3 flex items-end gap-1 h-8">
        <div className="flex-1 bg-organization/20 rounded-t-sm h-1/2"></div>
        <div className="flex-1 bg-organization/20 rounded-t-sm h-3/4"></div>
        <div className="flex-1 bg-organization/30 rounded-t-sm h-1/3"></div>
        <div className="flex-1 bg-organization/40 rounded-t-sm h-2/3"></div>
        <div className="flex-1 bg-organization/60 rounded-t-sm h-4/5"></div>
        <div className="flex-1 bg-organization rounded-t-sm h-full"></div>
        </div>
        </div>

        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <span className="material-icons text-organization text-xl mb-2"><UsersRound color="red"/></span>
        <p className="text-slate-500 text-[10px] font-bold uppercase">Total Students</p>
        <p className="text-xl font-bold">1,240</p>
        <p className="text-[10px] text-slate-400 mt-1">across all locations</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <span className="material-icons text-organization text-xl mb-2"><ClipboardPen color="red"/></span>
        <p className="text-slate-500 text-[10px] font-bold uppercase">Pending Joins</p>
        <p className="text-xl font-bold">4</p>
        <p className="text-[10px] text-organization font-medium mt-1">Requires action</p>
        </div>
        </div>
      </section>
    </div>
  );
};

export default FinancePage;
