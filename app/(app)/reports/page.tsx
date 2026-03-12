"use client";
import AppHeader from "@/components/shared/AppHeader";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { safeApiJson } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { 
  ChartBar, 
  LockKeyhole,
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


const ReportsPage = () => {
  
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
      <AppHeader title="reports"/>

      <section className="mt-8">
        <div className="bg-organization/5 border border-organization/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="material-icons text-organization"><ChartBar/></span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Insights</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">Global student retention is up 4% this month. Downtown Academy has 12 belt tests scheduled for next week.</p>
              <button className="mt-2 text-xs font-bold text-organization underline">Download Full Report</button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 mb-10">
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl overflow-hidden relative">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-organization/10 blur-3xl rounded-full"></div>
          <div className="flex gap-5 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-organization px-2 py-0.5 rounded text-[10px] font-black text-white tracking-widest uppercase">nb8</div>
                <h4 className="text-sm font-bold text-white">Assistant</h4>
              </div>
              <h5 className="text-lg font-bold text-white leading-tight mb-2">Business Health Score</h5>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">Get AI-powered insights on your organization&apos;s sustainability and growth trajectory.</p>
              <button className="bg-organization hover:bg-organization/50 text-white text-xs font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all active:scale-95">
                <span className="material-symbols-outlined text-[16px]"><LockKeyhole/></span>
                Unlock Premium
              </button>
            </div>
            <div className="w-24 shrink-0 flex flex-col items-center justify-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="health-gauge absolute inset-0 rounded-full opacity-50"></div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-white leading-none">?</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Score</span>
                </div>
              </div>
              <p className="text-[9px] text-organization font-bold mt-2 uppercase tracking-tighter">Premium only</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ReportsPage;
