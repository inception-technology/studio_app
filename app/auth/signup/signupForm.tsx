"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useTranslations } from "next-intl";

type SignupPayload = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  consent: boolean;
  organization_name?: string;
};

type SignupFormProps = {
  language_code: string;
  profile_id: number;
};

const PROFILE_LABELS: Record<number, string> = {
  1: "organizationOwner",
  2: "studioStaff",
  3: "memberFamily",
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "english",
  fr: "french",
  cn: "chinese",
};

export default function SignupForm({ language_code, profile_id }: SignupFormProps) {
  const t = useTranslations("Signup");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = React.useState<SignupPayload>({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    consent: false,
    organization_name: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const verificationError =
    searchParams.get("verification") === "error"
      ? searchParams.get("message") || t("verificationFailed")
      : null;
  const displayedErrors = errors.length > 0
    ? errors
    : verificationError
      ? [verificationError]
      : [];

  function update<K extends keyof SignupPayload>(key: K, value: SignupPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    const validationErrors: string[] = [];
    const normalizedEmail = form.email.trim();

    // Basic validation
    if (!form.firstname || !form.lastname || !normalizedEmail || !form.password) {
      validationErrors.push(t("fillRequired"));
    }
    // Simple email regex for basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (normalizedEmail && !emailRegex.test(normalizedEmail)) {
      validationErrors.push(t("emailInvalid"));
    }
    // Password strength checks aligned with backend
    if (form.password) {
      if (form.password.length < 10) {
        validationErrors.push(t("passwordMin"));
      }
      if (!/[A-Z]/.test(form.password)) {
        validationErrors.push(t("passwordUpper"));
      }
      if (!/[a-z]/.test(form.password)) {
        validationErrors.push(t("passwordLower"));
      }
      if (!/\d/.test(form.password)) {
        validationErrors.push(t("passwordDigit"));
      }
      if (!/[^A-Za-z0-9]/.test(form.password)) {
        validationErrors.push(t("passwordSpecial"));
      }
    }
    // Consent check
    if (!form.consent) {
      validationErrors.push(t("consentRequired"));
    }
    // If profile is organization, organization_name is required
    if (profile_id === 1 && !form.organization_name) {
      validationErrors.push(t("organizationRequired"));
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          language_code,
          profile_id: profile_id,
        }),
      });
      
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        console.error("Signup error response:", payload);
        const backendErrors: string[] = [];
        if (typeof payload?.message === "string" && payload.message.trim()) {
          backendErrors.push(payload.message);
        }
        if (typeof payload?.details === "string" && payload.details.trim()) {
          backendErrors.push(payload.details);
        }
        setErrors(backendErrors.length > 0 ? backendErrors : [t("signupFailedTryAgain")]);
        return;
      }

      const query = new URLSearchParams({
        verified: "1",
        message: t("checkEmailToValidate"),
      });
      router.replace(`/auth/login?${query.toString()}`);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : t("signupFailed")]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col relative z-10 mb-5">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col h-full"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900">{t("title")}</h2>
            <p className="text-gray-600 mt-2">
              {t("languageProfile", {
                language: t(`languages.${LANGUAGE_LABELS[language_code] ?? language_code}`),
                profile: t(`profiles.${PROFILE_LABELS[profile_id] ?? profile_id}`),
              })}
            </p>
            {profile_id === 3 && (
              <p className="text-gray-600 mt-2 font-bold">{t("minorHint")}</p>
            )}
          </motion.div>

          <div className="space-y-4">
            {displayedErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <ul className="list-disc pl-5 space-y-1">
                    {displayedErrors.map((message, index) => (
                      <li key={`${message}-${index}`}>{message}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            {profile_id === 1 && (
            <div className="space-y-2">
              <Label 
              htmlFor="organization" 
              className="mb-1 block text-sm"
              >{t("organizationName")} *</Label>
              <Input
                id="organization"
                type="text"
                className="w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50"
                autoComplete="organization"
                value={form.organization_name || ""}
                onChange={(e) => update("organization_name", e.target.value)}
                disabled={loading}
              />
            </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label 
                htmlFor="firstname"
                className="mb-1 block text-sm"
                >{t("firstName")} *</Label>
                <Input
                  id="firstname"
                  className="w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50"
                  value={form.firstname}
                  onChange={(e) => update("firstname", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label 
                htmlFor="lastname"
                className="mb-1 block text-sm"
                >{t("lastName")} *</Label>
                <Input
                  id="lastname"
                  className="w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50"
                value={form.lastname}
                  onChange={(e) => update("lastname", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label 
              htmlFor="email"
              className="mb-1 block text-sm"
              >{t("email")} *</Label>
              <Input
                id="email"
                type="email"
                className="w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50"
                autoComplete="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label 
              htmlFor="password"
              className="mb-1 block text-sm"
              >{t("password")} *</Label>
              <Input
                id="password"
                type="password"
                className="w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                {t("passwordHint")}
              </p>
            </div>

            <div className="flex flex-row mt-4 text-sm text-gray-600 space-x-2">
              <Checkbox
                id="consent"
                checked={form.consent}
                onCheckedChange={(v) => update("consent", Boolean(v))}
                disabled={loading}
              />
              <Label htmlFor="consent" className="leading-snug inline-block text-xs text-gray-600">
                {t("consentPrefix")} <Link href="/terms-and-privacy" className="underline">{t("termsPrivacy")}</Link>.
              </Label>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-auto pt-8"
          >
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-organization hover:bg-organization/90 text-white font-bold py-5 rounded-2xl shadow-lg shadow-organization/25 transition-all active:scale-[0.98] flex items-center justify-center space-x-3 group cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-lg">{loading ? t("submitting") : t("submit")}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.form>
      </div>
    </>
  );
}
