// app/auth/login/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "./form";
import AuthSuspenseFallback from "@/components/shared/AuthSuspenseFallback";
import { getTranslations } from "next-intl/server";

export default async function LoginPage() {

  const t = await getTranslations("Login");

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
          >{t("dontHaveAccount")}
          </Link>
        </div>
      </div>
    </>
  );
}
