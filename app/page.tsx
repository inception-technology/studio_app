"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";

export default function Page() {
  
  // TODO: Implement real authentication check (e.g., check cookie/session)
  // Exemple: remplacer par un vrai check (cookie/session)
  // const token = cookies().get("access_token")?.value;
  //const { isAuthenticated, isLoading } = useAuth();

    const isAuthenticated = false;
    const isLoading = false;
    const router = useRouter();

    useEffect(() => {
    if (!isLoading && isAuthenticated) {
        router.replace("/user/dashboard");
    }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || isAuthenticated) return null;

  redirect("/auth/login");
}