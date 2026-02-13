"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function RequireAuth({ children }: { children: React.ReactNode }) {
    //const { isAuthenticated, isLoading } = useAuth();
    const isAuthenticated = true; // Mock authentication state for demonstration
    const isLoading = false; // Mock loading state for demonstration
    const router = useRouter();

    useEffect(() => {
    if (!isLoading && !isAuthenticated) {
        router.replace("/");
    }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || !isAuthenticated) return null;

    return <>{children}</>;
}