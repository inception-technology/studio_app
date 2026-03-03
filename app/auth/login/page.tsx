// app/auth/login/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "./form";
import AuthSuspenseFallback from "@/components/shared/AuthSuspenseFallback";

export default function LoginPage() {

  const signupLink = "/auth/signup";

  return (
    <>
      <div className="inner-container">
        <Suspense fallback={<AuthSuspenseFallback />}>
          <LoginForm />
        </Suspense>
        <div className="mt-4 py-4 text-center">
          <Link 
            href={signupLink} 
            className="text-sm text-gray-500 hover:underline font-bold"
          >Don&apos;t have an account? Sign Up
          </Link>
        </div>
      </div>
    </>
  );
}
