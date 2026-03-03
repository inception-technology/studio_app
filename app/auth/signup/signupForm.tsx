"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

type SignupPayload = {
  firstname: string;
  lastname: string;
  email: string;
  organization: string;
  password: string;
  consent: boolean;
};

type SignupFormProps = {
  language: string;
  profile?: string;
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  fr: "Français",
  cn: "中文",
};

export default function SignupForm({ language, profile }: SignupFormProps) {
  const router = useRouter();

  const [form, setForm] = React.useState<SignupPayload>({
    firstname: "",
    lastname: "",
    email: "",
    organization: "",
    password: "",
    consent: false,
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function update<K extends keyof SignupPayload>(key: K, value: SignupPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.consent) {
      setError("You must accept data collection to continue.");
      return;
    }

    setLoading(true);
    console.log("Submitting signup form", form);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          language,
          profile: profile ?? "organization",
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Signup failed");
      }

      router.replace("/auth/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex-1 flex flex-col px-8 pt-16 pb-12 relative z-10">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={onSubmit}
          className="flex flex-col h-full"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900">Create an account</h2>
            <p className="text-gray-600 mt-2">
              {`Language: ${LANGUAGE_LABELS[language] ?? language} • Profile: ${profile ?? "organization"}`}
            </p>
            {profile==="member" && (
              <p className="text-gray-600 mt-2 font-bold">Please provide the legal guardian&apos;s information if the member is a minor.</p>
            )}
          </motion.div>

          <div className="space-y-4 flex-1">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {profile === "organization" && (
            <div className="space-y-2">
              <Label 
              htmlFor="organization" 
              className="mb-1 block text-sm"
              >Organization name *</Label>
              <Input
                id="organization"
                type="text"
                className="w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50"
                autoComplete="organization"
                value={form.organization}
                onChange={(e) => update("organization", e.target.value)}
                disabled={loading}
                required
              />
            </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label 
                htmlFor="firstname"
                className="mb-1 block text-sm"
                >First name *</Label>
                <Input
                  id="firstname"
                  className="w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50"
                  value={form.firstname}
                  onChange={(e) => update("firstname", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label 
                htmlFor="lastname"
                className="mb-1 block text-sm"
                >Last name *</Label>
                <Input
                  id="lastname"
                  className="w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50"
                value={form.lastname}
                  onChange={(e) => update("lastname", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label 
              htmlFor="email"
              className="mb-1 block text-sm"
              >Email *</Label>
              <Input
                id="email"
                type="email"
                className="w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50"
                autoComplete="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label 
              htmlFor="password"
              className="mb-1 block text-sm"
              >Password *</Label>
              <Input
                id="password"
                type="password"
                className="w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="flex flex-row mt-4 text-sm text-gray-600 space-x-2">
              <Checkbox
                id="consent"
                checked={form.consent}
                onCheckedChange={(v) => update("consent", Boolean(v))}
                disabled={loading}
              />
              <Label htmlFor="consent" className="leading-snug inline-block text-xs text-gray-600">
                By clicking Sign Up I agree to the <Link href="/terms-and-privacy" className="underline">Terms and Privacy Policy</Link>.
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
              <span className="text-lg">{loading ? "Creating account..." : "Sign Up"}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.form>
      </div>
    </>
  );
}
