"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Eye, EyeOff, Check, ArrowRight, Globe } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocale, useTranslations } from "next-intl";
import { fetchReferences } from "@/lib/references";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { makeLoginSchema, type LoginData } from "@/lib/schemas/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Language {
  code_language: string;
  name_us:       string;
  native_name:   string;
  flag_url:      string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeLocaleCode(value: string): "en" | "fr" | "cn" {
  const n = value.trim().toLowerCase().replace("_", "-");
  if (n === "fr" || n.startsWith("fr-") || n === "french") return "fr";
  if (n === "cn" || n === "zh" || n.startsWith("zh-") || n === "chinese") return "cn";
  return "en";
}

function isLanguage(value: unknown): value is Language {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<Language>;
  return (
    typeof c.code_language === "string" &&
    typeof c.name_us      === "string" &&
    typeof c.native_name  === "string" &&
    typeof c.flag_url     === "string"
  );
}

function normalizeLanguages(data: unknown): Language[] {
  if (Array.isArray(data)) return data.filter(isLanguage);
  if (isLanguage(data))    return [data];
  if (data && typeof data === "object") return Object.values(data).filter(isLanguage);
  return [];
}

async function fetchLanguages(): Promise<Language[]> {
  return fetchReferences<Language>("languages", normalizeLanguages);
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default function LoginForm() {
  const t      = useTranslations("Login");
  const locale = useLocale();
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Langue ──────────────────────────────────────────────────────────────
  const [selectedLang, setSelectedLang] = useState<string>(normalizeLocaleCode(locale));
  const [openLang, setOpenLang]         = useState(false);
  const [languages, setLanguages]       = useState<Language[]>([]);
  const [loadingLangs, setLoadingLangs] = useState(true);

  useEffect(() => { setSelectedLang(normalizeLocaleCode(locale)); }, [locale]);

  useEffect(() => {
    fetchLanguages().then(setLanguages).finally(() => setLoadingLangs(false));
  }, []);

  const applyLocale = useCallback(async (nextLocale: string) => {
    const safe = normalizeLocaleCode(nextLocale);
    try { window.localStorage.setItem("language_code", safe); } catch { /* no-op */ }
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: safe }),
      cache: "no-store", credentials: "include",
    }).catch(() => null);
    setSelectedLang(safe);
    setOpenLang(false);
    if (safe !== normalizeLocaleCode(locale)) router.refresh();
  }, [locale, router]);

  // ── React Hook Form ──────────────────────────────────────────────────────
  const schema = makeLoginSchema({
    emailRequired:    t("emailRequired"),
    passwordRequired: t("passwordRequired"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginData>({ resolver: zodResolver(schema) });

  // ── Show/hide password ───────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);

  // ── Vérification email après login ──────────────────────────────────────
  const verificationMessage =
    searchParams.get("verified") === "1"
      ? searchParams.get("message") || t("verifiedDefault")
      : null;

  // ── Submit ───────────────────────────────────────────────────────────────
  async function onSubmit(data: LoginData) {
    try {
      const ok = await login(data.username, data.password);
      if (!ok) {
        setError("root", { message: t("invalidCredentials") });
      }
    } catch (error) {
      setError("root", {
        message: error instanceof Error ? error.message : t("loginFailed"),
      });
    }
  }

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex flex-col p-5 relative z-10 mb-5">

        {/* ── Header + sélecteur de langue ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="mb-8 flex items-center justify-between"
        >
          <h2 className="text-3xl font-bold text-gray-900">{t("title")}</h2>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenLang((p) => !p)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <Globe className="w-5 h-5 text-organization" />
            </button>

            {openLang && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg overflow-hidden z-50">
                {loadingLangs ? (
                  <div className="px-3 py-2 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 rounded bg-gray-100 animate-pulse" style={{ width: `${60 + i * 10}%` }} />
                    ))}
                  </div>
                ) : languages.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-gray-400">—</p>
                ) : languages.map((lang) => {
                  const code = normalizeLocaleCode(lang.code_language);
                  return (
                    <button
                      key={lang.code_language}
                      onClick={() => { void applyLocale(code); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 transition ${
                        selectedLang === code ? "bg-gray-50 font-medium" : ""
                      }`}
                    >
                      <Image src={lang.flag_url} alt={lang.name_us} width={20} height={20}
                        className="rounded-full" referrerPolicy="no-referrer" />
                      <span>
                        {t.has(`LanguageForm.languages.${code}.native`)
                          ? t(`LanguageForm.languages.${code}.native`)
                          : lang.native_name}
                      </span>
                      {selectedLang === code && <Check className="w-4 h-4 ml-auto text-organization" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Formulaire ── */}
        <motion.form
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="space-y-4"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {verificationMessage && (
            <p className="mb-4 rounded bg-emerald-100 p-2 text-sm text-emerald-700">{verificationMessage}</p>
          )}

          {/* Erreur globale (mauvais identifiants / erreur réseau) */}
          {errors.root && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="username" className="font-semibold text-gray-700">{t("email")}</label>
            <input
              id="username"
              type="email"
              autoComplete="email"
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50 ${
                errors.username ? "border-red-400" : ""
              }`}
              {...register("username")}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* Mot de passe */}
          <div className="mb-6">
            <label htmlFor="password" className="font-semibold text-gray-700">{t("password")}</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50 ${
                  errors.password ? "border-red-400" : ""
                }`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Bouton submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="mt-auto pt-8"
          >
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-organization hover:bg-organization/90 text-white font-bold py-5 rounded-2xl shadow-lg shadow-organization/25 transition-all active:scale-[0.98] flex items-center justify-center space-x-3 group cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-lg">{isSubmitting ? t("submitting") : t("submit")}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </>
  );
}
