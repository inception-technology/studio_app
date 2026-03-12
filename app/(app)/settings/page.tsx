// app/settings/page.tsx
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


export default function SettingsPage() {
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
        <AppHeader title="settings"/>
        </div>
    )
}