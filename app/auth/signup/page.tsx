"use client";
import { Suspense, useState } from "react";
import LanguageForm from "./languageForm";
import SignupForm from "./signupForm";
import ProfileForm from "./profileForm";
import Link from "next/link";
import AuthSuspenseFallback from "@/components/shared/AuthSuspenseFallback";

export default function SignUpPage() {
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
            >Back
            </button>
        )}
          <Link
            href={loginLink}
            className="text-sm text-gray-500 hover:underline text-center p-5"
          >Already have an account? Login
          </Link>
      </div>
    </>
  );
}