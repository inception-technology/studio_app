import { Suspense } from "react";
import VerifyEmailClient from "./verify-email-client";
import AuthSuspenseFallback from "@/components/shared/AuthSuspenseFallback";

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={<AuthSuspenseFallback fullPage message="Verifying your email..." />}
        >
            <VerifyEmailClient />
        </Suspense>
    );
}
