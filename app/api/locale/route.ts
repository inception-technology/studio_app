import { NextResponse } from "next/server";
import { API_ERROR_CODES } from "@/lib/api-codes";
import { apiError, apiSuccess } from "@/lib/internal-api";

const SUPPORTED_LOCALES = new Set(["en", "fr", "cn"]);

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  const locale = typeof body?.locale === "string" ? body.locale.trim() : "";

  if (!SUPPORTED_LOCALES.has(locale)) {
    return apiError(400, API_ERROR_CODES.INVALID_LOCALE, "Invalid locale");
  }

  const response = apiSuccess({ locale }, { meta: { source: "cookie" } });
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });

  return response;
}
