// app/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Page() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
    if (!isLoading && isAuthenticated) {
        router.replace("/dashboard");
    }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || isAuthenticated) return null;

  redirect("/auth/login");
}