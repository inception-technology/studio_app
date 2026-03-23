"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, HousePlus, Loader2 } from "lucide-react";
import AppHeader from "@/components/shared/AppHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { studioKeys } from "@/lib/query-keys";
import { makeStudioSchema, type StudioFormData } from "@/lib/schemas/studio";
import { ROLES } from "@/lib/rbac";

// ─── Timezones courants ───────────────────────────────────────────────────────
// Liste réduite des fuseaux les plus utilisés.
// À remplacer par /api/references?reference=timezones si l'endpoint existe.
const COMMON_TIMEZONES = [
  "Africa/Abidjan", "Africa/Cairo", "Africa/Johannesburg", "Africa/Lagos",
  "America/Chicago", "America/Los_Angeles", "America/New_York", "America/Sao_Paulo", "America/Toronto",
  "Asia/Dubai", "Asia/Hong_Kong", "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore", "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/Amsterdam", "Europe/Berlin", "Europe/London", "Europe/Madrid", "Europe/Paris",
  "Europe/Rome", "Europe/Zurich",
  "Pacific/Auckland", "Pacific/Honolulu",
  "UTC",
];

// ─── Pays courants ────────────────────────────────────────────────────────────
const COMMON_COUNTRIES: { code: string; name: string }[] = [
  { code: "AU", name: "Australia" },
  { code: "BE", name: "Belgium" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "CH", name: "Switzerland" },
  { code: "CN", name: "China" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" },
  { code: "PT", name: "Portugal" },
  { code: "SG", name: "Singapore" },
  { code: "US", name: "United States" },
  { code: "ZA", name: "South Africa" },
];

// ─── Composant ────────────────────────────────────────────────────────────────

export default function NewStudioPage() {
  const { isLoading: authLoading, isAuthenticated, userCred } = useAuth();
  const router      = useRouter();
  const queryClient = useQueryClient();

  // ── Auth guard + RBAC guard ──────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.replace("/login"); return; }
    // Seuls Owner et Manager peuvent créer un studio
    const id = userCred?.id_profile;
    const canCreateStudio = id != null && ROLES.MANAGER_AND_ABOVE.some((role) => role === id);
    if (!canCreateStudio) {
      router.replace("/studios");
    }
  }, [authLoading, isAuthenticated, userCred, router]);

  // ── Schéma Zod ──────────────────────────────────────────────────────────
  const schema = useMemo(() => makeStudioSchema({
    nameRequired:     "Le nom du studio est obligatoire",
    cityRequired:     "La ville est obligatoire",
    countryRequired:  "Le pays est obligatoire",
    timezoneRequired: "Le fuseau horaire est obligatoire",
  }), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<StudioFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:          "",
      address_line1: "",
      address_line2: "",
      zipcode:       "",
      city:          "",
      code_country:  "",
      code_timezone: "",
    },
  });

  // ── Submit ───────────────────────────────────────────────────────────────
  async function onSubmit(data: StudioFormData) {
    const res = await fetch("/api/studio", {
      method:      "POST",
      headers:     { "Content-Type": "application/json" },
      credentials: "include",
      body:        JSON.stringify(data),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      const msg =
        (typeof payload?.message === "string" && payload.message.trim()) ? payload.message :
        (typeof payload?.details  === "string" && payload.details.trim())  ? payload.details :
        "Une erreur est survenue. Veuillez réessayer.";
      setError("root", { message: msg });
      return;
    }

    // Invalider le cache React Query pour recharger la liste des studios
    await queryClient.invalidateQueries({ queryKey: studioKeys.all });
    router.push("/studios");
  }

  // ── Loading auth ─────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-organization rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full p-6 max-w-2xl">
      <AppHeader title="New Studio" />

      {/* ── Bouton retour ── */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors cursor-pointer w-fit"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Studios
      </button>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

        {/* ── Erreur globale ── */}
        {errors.root && (
          <Alert variant="destructive">
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        )}

        {/* ── Nom du studio ── */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Studio name *</Label>
          <Input
            id="name"
            placeholder="Downtown Academy"
            disabled={isSubmitting}
            className={errors.name ? "border-red-400" : ""}
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* ── Adresse ── */}
        <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-600">Address</legend>

          <div className="space-y-1.5">
            <Label htmlFor="address_line1">Address line 1</Label>
            <Input
              id="address_line1"
              placeholder="123 Main Street"
              disabled={isSubmitting}
              {...register("address_line1")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address_line2">Address line 2</Label>
            <Input
              id="address_line2"
              placeholder="Suite 4B"
              disabled={isSubmitting}
              {...register("address_line2")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="zipcode">Zip / Postal code</Label>
              <Input
                id="zipcode"
                placeholder="75001"
                disabled={isSubmitting}
                {...register("zipcode")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="Paris"
                disabled={isSubmitting}
                className={errors.city ? "border-red-400" : ""}
                {...register("city")}
              />
              {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
            </div>
          </div>

          {/* Pays */}
          <div className="space-y-1.5">
            <Label htmlFor="code_country">Country *</Label>
            <select
              id="code_country"
              disabled={isSubmitting}
              className={`w-full rounded-md border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-organization/50 ${
                errors.code_country ? "border-red-400" : "border-slate-200"
              }`}
              {...register("code_country")}
            >
              <option value="">— Select a country —</option>
              {COMMON_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            {errors.code_country && (
              <p className="text-xs text-red-500">{errors.code_country.message}</p>
            )}
          </div>
        </fieldset>

        {/* ── Fuseau horaire ── */}
        <div className="space-y-1.5">
          <Label htmlFor="code_timezone">Timezone *</Label>
          <select
            id="code_timezone"
            disabled={isSubmitting}
            className={`w-full rounded-md border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-organization/50 ${
              errors.code_timezone ? "border-red-400" : "border-slate-200"
            }`}
            {...register("code_timezone")}
          >
            <option value="">— Select a timezone —</option>
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
          {errors.code_timezone && (
            <p className="text-xs text-red-500">{errors.code_timezone.message}</p>
          )}
        </div>

        {/* ── Bouton submit ── */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-organization hover:bg-organization/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-organization/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : <HousePlus className="w-5 h-5" />
          }
          <span>{isSubmitting ? "Creating studio…" : "Create Studio"}</span>
        </button>

      </form>
    </div>
  );
}
