"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token")?.trim();

    useEffect(() => {
        let cancelled = false;

        async function verifyEmail() {
            if (!token) {
                const query = new URLSearchParams({
                    verification: "error",
                    message: "Invalid or missing verification token.",
                });
                router.replace(`/signup?${query.toString()}`);
                return;
            }

            try {
                const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
                    method: "GET",
                    cache: "no-store",
                });

                if (cancelled) return;

                if (response.ok) {
                    const query = new URLSearchParams({
                        verified: "1",
                        message: "Email verified successfully. You can now log in.",
                    });
                    router.replace(`/login?${query.toString()}`);
                    return;
                }

                const payload = await response.json().catch(() => null);
                const fallback = "Email verification failed. Please sign up again.";
                const message =
                    typeof payload?.message === "string" && payload.message.length > 0
                        ? payload.message
                        : fallback;

                const query = new URLSearchParams({
                    verification: "error",
                    message,
                });
                router.replace(`/signup?${query.toString()}`);
            } catch {
                if (cancelled) return;
                const query = new URLSearchParams({
                    verification: "error",
                    message: "Unable to verify email right now. Please try signing up again.",
                });
                router.replace(`/signup?${query.toString()}`);
            }
        }

        verifyEmail();

        return () => {
            cancelled = true;
        };
    }, [router, token]);

    return (
        <section className="right-container-section">
            <div className="inner-container">
                <p className="text-sm text-gray-600">Verifying your email...</p>
            </div>
        </section>
    );
}
