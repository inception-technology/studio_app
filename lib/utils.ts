// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export type ApiSuccessEnvelope<T> = {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
};

// Fonction utilitaire pour parser les réponses JSON de manière sécurisée
export async function safeJson<T>(res: Response): Promise<T | null> {
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) return null;
  try {
    const json = await res.clone().json();
    return (json ?? null) as T;
  } catch {
    return null;
  }
}

// Lit une réponse JSON qui peut être soit brute, soit enveloppée dans { ok, data, meta }.
export async function safeApiJson<T>(res: Response): Promise<T | null> {
  const json = await safeJson<unknown>(res);
  if (!json) return null;

  if (
    typeof json === "object" &&
    json !== null &&
    "ok" in json &&
    (json as { ok?: unknown }).ok === true &&
    "data" in json
  ) {
    return (json as ApiSuccessEnvelope<T>).data ?? null;
  }

  return json as T;
}

// Fonction pour merger les classes CSS de manière conditionnelle
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction utilitaire pour parser les données d'authentification depuis le corps de la requête (JSON ou form-urlencoded)
export async function parseRequestBody(req: Request, parameter:string ): Promise<{ value:string } | null> {
    // 1) parse credentials from request body
    if (req.headers.get("Content-Type")?.includes("application/json")) {
        const body = await req.json().catch(() => null);
        if (body && typeof body[parameter] === "string") {
            return { value: body[parameter] };
        }
    } else if (req.headers.get("Content-Type")?.includes("application/x-www-form-urlencoded")) {
        const formData = await req.formData().catch(() => null);
        if (formData) {
            const value = formData.get(parameter);
            if (typeof value === "string") {
                return { value };
            }
        }
    }
    return null;
}

// Fonction utilitaire pour parser les données d'authentification depuis les paramètres de l'URL
export async function parseRequestParameters(req: Request, parameter:string): Promise<{ value:string } | null> {
    // 1) parse credentials from request parameters
    const url = new URL(req.url);
    const value = url.searchParams.get(parameter);
    if (!value) return null;
    return { value };
  }

export function capitalize(word:string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}