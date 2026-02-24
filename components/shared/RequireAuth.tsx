"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
    if (!isLoading && !isAuthenticated) {
        router.replace("/auth/login");
    }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || !isAuthenticated) return null;

    return <>{children}</>;
}