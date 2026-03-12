"use client";
import DashboardHeader from "@/components/shared/DashboardHeader";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { safeApiJson } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { 
  ChartBar, 
  UsersRound,
  UserRound, 
  ClipboardPen, 
  Receipt,
  HousePlus,
  Construction,
  ChevronRight,
  LockKeyhole
 } from "lucide-react";
import Link from 'next/link'
import { Button } from "@base-ui/react";
import { motion } from 'motion/react';
import Image from "next/image";

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


const DashboardPage = () => {
  
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
      <DashboardHeader />
      <h1 className="text-2xl font-bold text-gray-900 w-full border-b border-gray-300 pb-2">
        Dashboard
      </h1>
      <section id="performance">
        <h2 className="uppercase p-2 font-bold text-gray-500">global performance</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <Receipt color="red"/>
              <h2 className="text-sm font-medium text-gray-500">Revenue</h2>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {GlobalPerformance.revenue.currency}{GlobalPerformance.revenue.monthly.toLocaleString()}
            </div>
            <div className={`text-sm ${GlobalPerformance.revenue.rate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {GlobalPerformance.revenue.rate >= 0 ? '+' : ''}{GlobalPerformance.revenue.rate}%
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center mb-2 gap-2">
              <UsersRound color="red"/>
              <h2 className="text-sm font-medium text-gray-500">Students</h2>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {GlobalPerformance.students.total}
            </div>
            <div className={`text-sm ${GlobalPerformance.students.pending_joins > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
              {GlobalPerformance.students.pending_joins > 0 ? `${GlobalPerformance.students.pending_joins} pending joins` : 'No pending joins'}
            </div>
          </div>
          <div className="bg-red-100 rounded-lg shadow p-4 border border-organization span-row-2">
            <div className="flex items-center gap-2 mb-2">
              <ChartBar color="red"/>
              <h2 className="text-sm font-bold text-gray-900 flex gap-2">Monthly Insights</h2>
            </div>
            <p className="text-sm font-medium text-gray-700">
              Global student retention is up 4% this month. Downtown Academy has 12 belt tests scheduled for next week.
            </p>
            <Link href="" className="text-ml text-organization font-bold">Download Full Report</Link>
          </div>
        </div>
      </section>

      <section id="studios" className="mt-6">
        <h2 className="uppercase p-2 font-bold text-gray-500">my studios (3)</h2>

        <motion.button
            type="submit"
            className="
            w-full 
            bg-organization 
            hover:bg-organization/90 
            text-white 
            font-bold 
            py-5 
            rounded-2xl 
            shadow-lg 
            shadow-organization/25 
            transition-all 
            active:scale-[0.98] 
            flex 
            items-center 
            justify-center 
            space-x-3 
            group 
            cursor-pointer
            ">
              <HousePlus/>
            <span className="text-lg">Add New Studio</span>
        </motion.button>
      </section>
      <section id="assistant">
        <div className="flex items-center gap-2 mb-2">
          <ChartBar color="red"/>
          <h2 className="text-sm font-bold text-gray-900 flex gap-2">Monthly Insights</h2>
        </div>
      </section>
      <section className="mb-6">
<h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 ml-1">Global Performance</h2>
<div className="grid grid-cols-2 gap-3">
<div className="col-span-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden">
<div className="relative z-10">
<p className="text-slate-500 text-xs font-semibold mb-1">Monthly Global Revenue</p>
<div className="flex items-baseline gap-2">
<h3 className="text-2xl font-black text-slate-900 dark:text-white">$45,200.00</h3>
<span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">+12.4%</span>
</div>
<div className="mt-3 flex items-end gap-1 h-8">
<div className="flex-1 bg-primary/20 rounded-t-sm h-1/2"></div>
<div className="flex-1 bg-primary/20 rounded-t-sm h-3/4"></div>
<div className="flex-1 bg-primary/30 rounded-t-sm h-1/3"></div>
<div className="flex-1 bg-primary/40 rounded-t-sm h-2/3"></div>
<div className="flex-1 bg-primary/60 rounded-t-sm h-4/5"></div>
<div className="flex-1 bg-primary rounded-t-sm h-full"></div>
</div>
</div>
<div className="absolute -right-4 -bottom-4 opacity-5">
<span className="material-icons text-8xl text-primary">payments</span>
</div>
</div>
<div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
<span className="material-icons text-primary text-xl mb-2"><UsersRound color="red"/></span>
<p className="text-slate-500 text-[10px] font-bold uppercase">Total Students</p>
<p className="text-xl font-bold">1,240</p>
<p className="text-[10px] text-slate-400 mt-1">across all locations</p>
</div>
<div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
<span className="material-icons text-primary text-xl mb-2"><Clip /></span>
<p className="text-slate-500 text-[10px] font-bold uppercase">Pending Joins</p>
<p className="text-xl font-bold">4</p>
<p className="text-[10px] text-primary font-medium mt-1">Requires action</p>
</div>
</div>
</section>
<button className="w-full bg-primary hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mb-8 transition-transform active:scale-95">
<span className="material-icons">add_business</span>
<span>Add New Studio</span>
</button>
<section>
<div className="flex items-center justify-between mb-4 px-1">
<h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">My Studios (3)</h2>
<button className="text-primary text-xs font-bold uppercase">View Map</button>
</div>
<div className="space-y-3">
<div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 group">
<div className="w-14 h-14 rounded-lg bg-slate-50 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700">
<Image width={100} height={100} className="w-full h-full object-cover" data-alt="Martial arts studio interior with mats" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOol0FlZf5_DtLkrNcRcvcU9V60BZZsENHpaWOcZ5M-scQRuBCKicShokFIw4vB0EhOI2ZObwFuMiK2zsuFwYU3UuzIyaQuY3JUjlB4CCuweoQ6Ye5R7E4MonaxtHxobZ0ZdIhxAr_1-dAg09aF6vcNH7pPuqWvg86IUTheMe0PURJIjBBhCQ148eE6VLmrsB2mVGt6B4Lr1IEiscUYGDDDGPABVcsZx5Mo_faI2wF4JabrgjCPR_FIUZdZQ9nxHVTHXktOXpeGjs" alt="Downtown Studio"/>
</div>
<div className="flex-1">
<div className="flex items-center justify-between mb-0.5">
<h3 className="font-bold text-slate-900 dark:text-white">Downtown Academy</h3>
<span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
</div>
<p className="text-xs text-slate-500 mb-2">Central Business District</p>
<div className="flex items-center gap-3">
<div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-400">
<span className="material-icons text-[14px]"><UserRound/></span> 450
                            </div>
<div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
<span className="material-icons text-[14px]">trending_up</span> $18.2k
                            </div>
</div>
</div>
<span className="material-icons text-slate-300 group-active:text-primary"><ChevronRight/></span>
</div>
<div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 group">
<div className="w-14 h-14 rounded-lg bg-slate-50 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700">
<Image width={100} height={100} className="w-full h-full object-cover" data-alt="Empty training hall with training bags" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNHndDWlR3FAy6jzO6WF0rsmzO1uMPQyE4kpeNivDdN3rh4pJkV-c8CgNZdqRKvqw2DfHM_0xoVpxs2_tkugla8yr8mDhNgxLwyL4mETUJAzL8gjF0cppklsmg9cZxZ81v4QgWnUM6-A0zh8q06budZajE7Wd9a3uej8JSbFRixnI252lb733k2vvIRnWuvtxljpCKP7Aoiyl2ZV68dY5D9JtRDa5kqXKDN0KKb22RwdefXFKNFrFsfSfHxLIL63ggRaVokxgI1vE" alt="Empty training hall with training bags"/>
</div>
<div className="flex-1">
<div className="flex items-center justify-between mb-0.5">
<h3 className="font-bold text-slate-900 dark:text-white">East Side TKD</h3>
<span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
</div>
<p className="text-xs text-slate-500 mb-2">East Riverside Heights</p>
<div className="flex items-center gap-3">
<div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-400">
<span className="material-icons text-[14px]"><UserRound/></span> 320
                            </div>
<div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
<span className="material-icons text-[14px]">trending_up</span> $12.5k
                            </div>
</div>
</div>
<span className="material-icons text-slate-300 group-active:text-primary"><ChevronRight/></span>
</div>
<div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-dashed border-primary/30 flex items-center gap-4 group">
<div className="w-14 h-14 rounded-lg bg-primary/5 shrink-0 flex items-center justify-center">
<span className="material-icons text-primary/40"><Construction/></span>
</div>
<div className="flex-1">
<div className="flex items-center justify-between mb-0.5">
<h3 className="font-bold text-slate-900 dark:text-white">North Branch</h3>
<span className="text-[9px] font-black uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded">Setup</span>
</div>
<p className="text-xs text-slate-500 mb-2">Legacy Park Area</p>
<div className="flex items-center gap-3">
<div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
<span className="material-icons text-[14px]"><UserRound/></span> 0
                            </div>
<div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
<span className="material-icons text-[14px]"><Receipt/></span> $0.00
                            </div>
</div>
</div>
<span className="material-icons text-slate-300 group-active:text-primary"><ChevronRight/></span>
</div>
</div>
</section>
<section className="mt-8">
<div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
<div className="flex items-start gap-3">
<span className="material-icons text-primary"><ChartBar/></span>
<div>
<h4 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Insights</h4>
<p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">Global student retention is up 4% this month. Downtown Academy has 12 belt tests scheduled for next week.</p>
<button className="mt-2 text-xs font-bold text-primary underline">Download Full Report</button>
</div>
</div>
</div>
</section>
<section className="mt-4">
<div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl overflow-hidden relative">
<div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
<div className="flex gap-5 relative z-10">
<div className="flex-1">
<div className="flex items-center gap-2 mb-2">
<div className="bg-primary px-2 py-0.5 rounded text-[10px] font-black text-white tracking-widest uppercase">nb8</div>
<h4 className="text-sm font-bold text-white">Assistant</h4>
</div>
<h5 className="text-lg font-bold text-white leading-tight mb-2">Business Health Score</h5>
<p className="text-xs text-slate-400 mb-4 leading-relaxed">Get AI-powered insights on your organization&apos;s sustainability and growth trajectory.</p>
<button className="bg-primary hover:bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all active:scale-95">
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
<p className="text-[9px] text-primary font-bold mt-2 uppercase tracking-tighter">Premium only</p>
</div>
</div>
</div>
</section>
    </div>
  );
};

export default DashboardPage;
