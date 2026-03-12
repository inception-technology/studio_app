// app/studios/page.tsx
"use client";
import AppHeader from "@/components/shared/AppHeader";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { safeApiJson } from "@/lib/utils";
import { useRouter } from "next/navigation";
import StudioPreviewCard from "@/components/shared/StudioPreviewCard";
import { 
    HousePlus,
    UserRound, 
    Banknote,
    Construction,
    ChevronRight
} from "lucide-react";
import { MyStudios } from "@/lib/mock-data";


export default function StudiosPage() {
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

    if (!isAuthenticated) return null;

    return (
        <div className="flex flex-col w-full p-6">
        <AppHeader title="studios"/>
        <ul>
            {MyStudios.map((studio) => (
                <li className="bg-white dark:bg-slate-900 p-4 mb-2 mt-2 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 group"
                key={studio.id}>
                <StudioPreviewCard 
                id={studio.id}
                name={studio.name}
                location={studio.location}
                members={studio.members}
                finance={studio.finance}
                img_url={studio.img_url}
                />
            </li>
            ))}
            <li className="bg-white dark:bg-slate-900 p-4  rounded-xl border border-dashed border-organization/30 flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-lg bg-organization/5 shrink-0 flex items-center justify-center">
              <span className="material-icons text-organization/40"><Construction/></span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="font-bold text-slate-900 dark:text-white">North Branch</h3>
                <span className="text-[9px] font-black uppercase text-organization bg-organization/10 px-1.5 py-0.5 rounded">Setup</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">Legacy Park Area</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <span className="material-icons text-[14px]"><UserRound/></span> 0
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <span className="material-icons text-[14px]"><Banknote/></span> $0.00
                </div>
              </div>
            </div>
            <span className="material-icons text-slate-300 group-active:text-organization"><ChevronRight/></span>
          </li>
        </ul>
        <button className="w-full mt-10 mb-10 bg-organization hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-organization/20 flex items-center justify-center gap-2 mb-8 transition-transform active:scale-95 cursor-pointer">
            <span className="material-icons"><HousePlus/></span>
            <span>Add New Studio</span>
        </button>
        </div>
    );
}