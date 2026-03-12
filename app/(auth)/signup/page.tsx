"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LanguageForm from "./languageForm";
import SignupForm from "./signupForm";
import ProfileForm from "./profileForm";
import Link from "next/link";
import AuthSuspenseFallback from "@/components/shared/AuthSuspenseFallback";
import { useTranslations } from "next-intl";

function normalizeLocaleCode(value: string): "en" | "fr" | "cn" {
  const normalized = value.trim().toLowerCase().replace("_", "-");

  if (normalized === "fr" || normalized.startsWith("fr-") || normalized === "french") {
    return "fr";
  }

  if (
    normalized === "cn" ||
    normalized === "zh" ||
    normalized.startsWith("zh-") ||
    normalized === "chinese"
  ) {
    return "cn";
  }

  return "en";
}

export default function SignUpPage() {
  const t = useTranslations("Signup");
  const router = useRouter();
  const [step, setStep] = useState<"language" | "profile" | "signup">("language");
  const [lang, setLang] = useState<string>(() => {
    if (typeof window === "undefined") return "en";
    try {
      const stored = window.localStorage.getItem("language_code");
      if (stored) return normalizeLocaleCode(stored);

      const browserLang = window.navigator.language.toLowerCase();
      return normalizeLocaleCode(browserLang);
    } catch {
      return "en";
    }
  });
  const [profile, setProfile] = useState<number>(0);
  const loginLink = "/login";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("language_code");
    if (stored) return;

    const syncLocale = async () => {
      try {
        window.localStorage.setItem("language_code", lang);
      } catch {}

      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: lang }),
        cache: "no-store",
        credentials: "include",
      }).catch(() => null);

      router.refresh();
    };

    void syncLocale();
  }, [lang, router]);

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
              setLang(normalizeLocaleCode(selected));
              setStep("profile");
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