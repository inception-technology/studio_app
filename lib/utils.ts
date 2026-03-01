// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

// Fonction pour merger les classes CSS de manière conditionnelle
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction utilitaire pour parser les données d'authentification depuis le corps de la requête (JSON ou form-urlencoded)
async function parseRequestBody(req: Request, parameter:string ): Promise<{ value:string } | null> {
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
async function parseRequestParameters(req: Request, parameter:string): Promise<{ value:string } | null> {
    // 1) parse credentials from request parameters
    const url = new URL(req.url);
    const value = url.searchParams.get(parameter);
    if (!value) return null;
    return { value };
  }