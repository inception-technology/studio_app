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
import { fetchReferences } from "@/lib/references";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { makeSignupSchema, type SignupData } from "@/lib/schemas/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

type SignupFormProps = {
  language_code: string;
  profile_id:    number;
};

type ApiLanguage = {
  code_language: string;
  label?:        string;
  name_us?:      string;
  native_name?:  string;
};

type ApiProfile = {
  id_profile: number;
  label?:     string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeLocaleCode(value: string): "en" | "fr" | "cn" {
  const n = value.trim().toLowerCase().replace("_", "-");
  if (n === "fr" || n.startsWith("fr-") || n === "french") return "fr";
  if (n === "cn" || n === "zh" || n.startsWith("zh-") || n === "chinese") return "cn";
  return "en";
}

function isApiLanguage(v: unknown): v is ApiLanguage {
  return !!v && typeof v === "object" && typeof (v as ApiLanguage).code_language === "string";
}

function isApiProfile(v: unknown): v is ApiProfile {
  return !!v && typeof v === "object" && typeof (v as ApiProfile).id_profile === "number";
}

function normalizeReferenceItems(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return Object.values(data);
  return [];
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default function SignupForm({ language_code, profile_id }: SignupFormProps) {
  const t          = useTranslations("Signup");
  const router     = useRouter();
  const searchParams = useSearchParams();
  const baseButton =
    "w-full text-white font-bold py-5 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-3 group cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

  const buttonProfile = React.useMemo(() => {
    switch (profile_id) {
      case 1:
        return `${baseButton} bg-organization hover:bg-organization/90 shadow-organization/25`;
      case 2:
        return `${baseButton} bg-staff hover:bg-staff/90 shadow-staff/25`;
      case 3:
        return `${baseButton} bg-member hover:bg-member/90 shadow-member/25`;
      default:
        return baseButton;
    }
  }, [profile_id]);

  // ── Références API (affichage langue / profil) ───────────────────────────
  const [languageReferences, setLanguageReferences] = React.useState<ApiLanguage[]>([]);
  const [profileReferences,  setProfileReferences]  = React.useState<ApiProfile[]>([]);

  React.useEffect(() => {
    const load = async () => {
      const [langRaw, profRaw] = await Promise.all([
        fetchReferences<unknown>("languages", normalizeReferenceItems),
        fetchReferences<unknown>("profiles", normalizeReferenceItems),
      ]);
      setLanguageReferences(langRaw.filter(isApiLanguage));
      setProfileReferences(profRaw.filter(isApiProfile));
    };
    void load();
  }, []);

  const languageDisplay = React.useMemo(() => {
    const code = normalizeLocaleCode(language_code);
    const ref  = languageReferences.find((i) => normalizeLocaleCode(i.code_language) === code);
    const key  = ref?.label?.trim();
    if (key && t.has(`languages.${key}`)) return t(`languages.${key}`);
    if (code === "fr") return t("languages.french");
    if (code === "cn") return t("languages.chinese");
    return t("languages.english");
  }, [language_code, languageReferences, t]);

  const profileDisplay = React.useMemo(() => {
    const ref = profileReferences.find((i) => i.id_profile === profile_id);
    const key = ref?.label?.trim();
    if (key && t.has(`profiles.${key}`)) return t(`profiles.${key}`);
    if (profile_id === 1) return t("profiles.organizationOwner");
    if (profile_id === 2) return t("profiles.studioStaff");
    return t("profiles.memberFamily");
  }, [profile_id, profileReferences, t]);

  // ── Erreur de vérification depuis URL ────────────────────────────────────
  const verificationError =
    searchParams.get("verification") === "error"
      ? searchParams.get("message") || t("verificationFailed")
      : null;

  // ── React Hook Form ──────────────────────────────────────────────────────
  // Le schéma est recréé si profile_id change (validation conditionnelle org)
  const schema = React.useMemo(
    () => makeSignupSchema({
      fillRequired:         t("fillRequired"),
      emailInvalid:         t("emailInvalid"),
      passwordMin:          t("passwordMin"),
      passwordUpper:        t("passwordUpper"),
      passwordLower:        t("passwordLower"),
      passwordDigit:        t("passwordDigit"),
      passwordSpecial:      t("passwordSpecial"),
      consentRequired:      t("consentRequired"),
      organizationRequired: t("organizationRequired"),
    }, profile_id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile_id],           // ne pas inclure t() — next-intl est stable
  );

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstname:         "",
      lastname:          "",
      email:             "",
      password:          "",
      consent:           false,
      organization_name: "",
    },
  });

  // ── Submit ───────────────────────────────────────────────────────────────
  async function onSubmit(data: SignupData) {
    const res = await fetch("/api/auth/signup", {
      method:      "POST",
      headers:     { "Content-Type": "application/json" },
      credentials: "include",
      body:        JSON.stringify({ ...data, language_code, profile_id }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      const msg =
        (typeof payload?.message === "string" && payload.message.trim()) ? payload.message :
        (typeof payload?.details === "string" && payload.details.trim())  ? payload.details :
        t("signupFailedTryAgain");
      setError("root", { message: msg });
      return;
    }

    const query = new URLSearchParams({ verified: "1", message: t("checkEmailToValidate") });
    router.replace(`/login?${query.toString()}`);
  }

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex flex-col relative z-10 mb-5">
        <motion.form
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col h-full"
        >
          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900">{t("title")}</h2>
            <p className="text-gray-600 mt-2">
              {t("languageProfile", { language: languageDisplay, profile: profileDisplay })}
            </p>
            {profile_id === 3 && (
              <p className="text-gray-600 mt-2 font-bold">{t("minorHint")}</p>
            )}
          </motion.div>

          <div className="space-y-4">
            {/* Erreur globale (root) ou erreur de vérification depuis URL */}
            {(errors.root || verificationError) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {errors.root?.message ?? verificationError}
                </AlertDescription>
              </Alert>
            )}

            {/* Organisation (Owner uniquement) */}
            {profile_id === 1 && (
              <div className="space-y-2">
                <Label htmlFor="organization" className="mb-1 block text-sm">
                  {t("organizationName")} *
                </Label>
                <Input
                  id="organization"
                  type="text"
                  autoComplete="organization"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50 ${
                    errors.organization_name ? "border-red-400" : ""
                  }`}
                  {...register("organization_name")}
                />
                {errors.organization_name && (
                  <p className="text-xs text-red-500">{errors.organization_name.message}</p>
                )}
              </div>
            )}

            {/* Prénom / Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="mb-1 block text-sm">{t("firstName")} *</Label>
                <Input
                  id="firstname"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50 ${
                    errors.firstname ? "border-red-400" : ""
                  }`}
                  {...register("firstname")}
                />
                {errors.firstname && (
                  <p className="text-xs text-red-500">{errors.firstname.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastname" className="mb-1 block text-sm">{t("lastName")} *</Label>
                <Input
                  id="lastname"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50 ${
                    errors.lastname ? "border-red-400" : ""
                  }`}
                  {...register("lastname")}
                />
                {errors.lastname && (
                  <p className="text-xs text-red-500">{errors.lastname.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="mb-1 block text-sm">{t("email")} *</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50 ${
                  errors.email ? "border-red-400" : ""
                }`}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password" className="mb-1 block text-sm">{t("password")} *</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50 ${
                  errors.password ? "border-red-400" : ""
                }`}
                {...register("password")}
              />
              <p className="text-xs text-gray-500">{t("passwordHint")}</p>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Consentement */}
            <div className="flex flex-row mt-4 text-sm text-gray-600 space-x-2">
              {/* Checkbox utilise Controller car ce n'est pas un input HTML natif */}
              <Controller
                name="consent"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="consent"
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(Boolean(v))}
                    disabled={isSubmitting}
                  />
                )}
              />
              <Label htmlFor="consent" className="leading-snug inline-block text-xs text-gray-600">
                {t("consentPrefix")}{" "}
                <Link href="/terms-and-privacy" className="underline">{t("termsPrivacy")}</Link>.
              </Label>
            </div>
            {errors.consent && (
              <p className="text-xs text-red-500">{errors.consent.message}</p>
            )}
          </div>

          {/* ── Bouton submit ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="mt-auto pt-8"
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className={buttonProfile}
            >
              <span className="text-lg">{isSubmitting ? t("submitting") : t("submit")}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.form>
      </div>
    </>
  );
}
