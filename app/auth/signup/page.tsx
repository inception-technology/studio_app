"use client";
import { useState } from "react";
import LanguageForm from "./languageForm";
import SignupForm from "./signupForm";
import ProfileForm from "./profileForm";
import Link from "next/link";

export default function SignUpPage() {
  const [step, setStep] = useState<"language" | "profile" | "signup">("language");
  const [lang, setLang] = useState<string>(() => {
    if (typeof window === "undefined") return "en";
    try {
      return window.localStorage.getItem("lang") || "en";
    } catch {
      return "en";
    }
  });
  const [profile, setProfile] = useState<string>("organization");
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
      <section className="right-container-section">
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
            <SignupForm language={lang} profile={profile} />
          )}
          {step !== "language" && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-gray-500 hover:underline font-bold cursor-pointer"
              >
                Back
              </button>
            </div>
          )}
          <div className="mt-4 py-4 text-center">
            <Link
              href={loginLink}
              className="text-sm text-gray-500 hover:underline font-bold"
            >
              Already have an account? Login
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}