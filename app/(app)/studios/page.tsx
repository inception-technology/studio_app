// app/studios/page.tsx
"use client";
import AppHeader from "@/components/shared/AppHeader";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StudioPreviewCard from "@/components/shared/StudioPreviewCard";
import { HousePlus } from "lucide-react";
import { useStudios } from "@/hooks/useStudios";
import { ROLES } from "@/lib/rbac";


export default function StudiosPage() {
    const { isLoading, isAuthenticated, userCred } = useAuth();
    const router = useRouter();

    // Seuls Owner et Manager peuvent créer un studio
    const idProfile = userCred?.id_profile;
    const canCreate = idProfile != null && ROLES.MANAGER_AND_ABOVE.some((role) => role === idProfile);
    const { cardProps, isFetching, isError } = useStudios();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/login");
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-screen">
                <div className="w-10 h-10 border-4 border-gray-300 border-t-organization rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="flex flex-col w-full p-6">
            <AppHeader title="studios" />

            {isError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Unable to load studios. Please try again.
                </div>
            )}

            <ul>
                {isFetching && cardProps.length === 0
                    ? Array.from({ length: 2 }).map((_, i) => (
                        <li key={i} className="bg-white p-4 mb-2 rounded-xl border border-slate-100 flex items-center gap-4 animate-pulse">
                            <div className="w-14 h-14 rounded-lg bg-slate-200 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-1/2" />
                                <div className="h-3 bg-slate-100 rounded w-1/3" />
                            </div>
                        </li>
                    ))
                    : cardProps.map((studio) => (
                        <li
                            key={studio.id}
                            className="bg-white dark:bg-slate-900 p-4 mb-2 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 group"
                        >
                            <StudioPreviewCard
                                id={studio.id}
                                name={studio.name}
                                location={studio.location}
                                status={studio.status}
                                members={studio.members}
                                finance={studio.finance}
                                img_url={studio.img_url}
                            />
                        </li>
                    ))
                }
            </ul>

            {canCreate && (
                <Link
                    href="/studios/new"
                    className="w-full mt-10 mb-10 bg-organization hover:bg-organization/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-organization/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                    <HousePlus className="w-5 h-5" />
                    <span>Add New Studio</span>
                </Link>
            )}
        </div>
    );
}