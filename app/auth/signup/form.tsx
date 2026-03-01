"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

type SignupPayload = {
  firstname: string;
  lastname: string;
  email: string;
  organization: string;
  password: string;
  consent: boolean;
};

export default function SignupForm() {
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
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Signup failed");
      }

      router.replace("/authentication/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="mb-6 text-2xl font-semibold">Sign Up</h1>
          <CardDescription>
            Create an account to manage your Studios.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mb-4">
              <Label 
              htmlFor="organization" 
              className="mb-1 block text-sm"
              >Organization name *</Label>
              <Input
                id="organization"
                type="text"
                className="w-full rounded border px-3 py-2"
                autoComplete="organization"
                value={form.organization}
                onChange={(e) => update("organization", e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <Label 
                htmlFor="firstname"
                className="mb-1 block text-sm"
                >First name *</Label>
                <Input
                  id="firstname"
                  className="w-full rounded border px-3 py-2"
                  value={form.firstname}
                  onChange={(e) => update("firstname", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="mb-4">
                <Label 
                htmlFor="lastname"
                className="mb-1 block text-sm"
                >Last name *</Label>
                <Input
                  id="lastname"
                  className="w-full rounded border px-3 py-2"
                  value={form.lastname}
                  onChange={(e) => update("lastname", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <Label 
              htmlFor="email"
              className="mb-1 block text-sm"
              >Email *</Label>
              <Input
                id="email"
                type="email"
                className="w-full rounded border px-3 py-2"
                autoComplete="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="mb-4">
              <Label 
              htmlFor="password"
              className="mb-1 block text-sm"
              >Password *</Label>
              <Input
                id="password"
                type="password"
                className="w-full rounded border px-3 py-2"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="flex items-start gap-2 mb-4">
              <Checkbox
                id="consent"
                checked={form.consent}
                onCheckedChange={(v) => update("consent", Boolean(v))}
                disabled={loading}
              />
              <Label htmlFor="consent" className="leading-snug">
                By clicking <span className="font-semibold">Sign Up</span> I agree to the Terms and Privacy Policy.
              </Label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-organization px-4 py-2 text-white disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
