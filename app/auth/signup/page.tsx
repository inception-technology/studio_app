"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LanguageForm from "./languageForm";
import SignupForm from "./signupForm";
import ProfileForm from "./profileForm";
import Link from "next/link";
import AuthSuspenseFallback from "@/components/shared/AuthSuspenseFallback";
import { useTranslations } from "next-intl";

export default function SignUpPage() {
  const t = useTranslations("Signup");
  const router = useRouter();
  const [step, setStep] = useState<"language" | "profile" | "signup">("language");
  const [lang, setLang] = useState<string>(() => {
    if (typeof window === "undefined") return "en";
    try {
      return window.localStorage.getItem("language_code") || "en";
    } catch {
      return "en";
    }
  });
  const [profile, setProfile] = useState<number>(0);
  const loginLink = "/auth/login";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("language_code");
    if (stored) return;

    const browserLang = window.navigator.language.toLowerCase();
    const detectedLocale = browserLang.startsWith("fr")
      ? "fr"
      : browserLang.startsWith("zh")
        ? "cn"
        : "en";

    setLang(detectedLocale);
    window.localStorage.setItem("language_code", detectedLocale);
    document.cookie = `NEXT_LOCALE=${detectedLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.refresh();
  }, [router]);

  const handleBack = () => {
    if (step === "signup") {
      setStep("profile");
      return;
    }
    if (step === "profile") {
      setStep("language");
    }
  };

  return (
    <>
      <div className="inner-container">
        {step === "language" ? (
          <LanguageForm
            onContinue={(selected) => {
              setLang(selected);
              setStep("profile");
              router.refresh();
            }}
          />
        ) : step === "profile" ? (
          <ProfileForm
            onContinue={(selected) => {
              setProfile(selected);
              setStep("signup");
            }}
          />
        ) : (
          <Suspense fallback={<AuthSuspenseFallback />}>
            <SignupForm 
              language_code={lang} 
              profile_id={profile} 
            />
          </Suspense>
        )}
        {step !== "language" && (
            <button
              type="button"
              onClick={handleBack}
              className="text-sm text-gray-500 hover:underline font-bold cursor-pointer"
            >{t("back")}
            </button>
        )}
          <Link
            href={loginLink}
            className="text-sm text-gray-500 hover:underline text-center p-5"
          >{t("alreadyHaveAccount")}
          </Link>
      </div>
    </>
  );
}