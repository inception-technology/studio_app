import { NextResponse } from "next/server";
import { API_ERROR_CODES, type ApiErrorCode } from "@/lib/api-codes";

export type InternalApiConfig = {
  apiBase: string;
  oauthClientId: string;
  oauthClientSecret: string;
};

type ErrorDetails = string | null;

export type ApiErrorBody = {
  code: string;
  message: string;
  details: ErrorDetails;
};

export type ApiSuccessBody<T> = {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type BackendProxyOptions = {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  getHeaders?: () => HeadersInit;
  body?: BodyInit;
  cache?: RequestCache;
  retry?: {
    statuses: number[];
    shouldRetry: (response: Response) => Promise<boolean>;
  };
};

function toErrorDetails(details?: unknown): ErrorDetails {
  if (typeof details === "string") {
    const trimmed = details.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (details instanceof Error) {
    return details.message;
  }

  if (details === undefined || details === null) {
    return null;
  }

  try {
    return JSON.stringify(details);
  } catch {
    return String(details);
  }
}

export function apiError(status: number, code: ApiErrorCode, message: string, details?: unknown): NextResponse {
  const payload: ApiErrorBody = {
    code,
    message,
    details: toErrorDetails(details),
  };

  return NextResponse.json(payload, { status });
}

export function apiSuccess<T>(data: T, init?: { status?: number; meta?: Record<string, unknown> }): NextResponse {
  const payload: ApiSuccessBody<T> = {
    ok: true,
    data,
    ...(init?.meta ? { meta: init.meta } : {}),
  };

  return NextResponse.json(payload, { status: init?.status ?? 200 });
}

export async function backendProxyFetch(options: BackendProxyOptions): Promise<Response> {
  const execute = () =>
    fetch(options.url, {
      method: options.method,
      headers: options.getHeaders ? options.getHeaders() : undefined,
      body: options.body,
      cache: options.cache ?? "no-store",
    });

  let response = await execute();
  if (!options.retry || response.ok || !options.retry.statuses.includes(response.status)) {
    return response;
  }

  const shouldRetry = await options.retry.shouldRetry(response);
  if (!shouldRetry) {
    return response;
  }

  response = await execute();
  return response;
}

export function getInternalApiBaseOrError(): { apiBase: string } | { error: NextResponse } {
  const apiBase = process.env.INTERNAL_API_URL;
  if (!apiBase) {
    return {
      error: apiError(500, API_ERROR_CODES.MISSING_INTERNAL_API_URL, "Missing INTERNAL_API_URL"),
    };
  }

  return { apiBase };
}

export function getInternalApiConfigOrError(): { config: InternalApiConfig } | { error: NextResponse } {
  const base = getInternalApiBaseOrError();
  if ("error" in base) {
    return base;
  }

  const oauthClientId = process.env.INTERNAL_OAUTH_CLIENT_ID;
  const oauthClientSecret = process.env.INTERNAL_OAUTH_CLIENT_SECRET;
  if (!oauthClientId || !oauthClientSecret) {
    return {
      error: apiError(500, API_ERROR_CODES.MISSING_OAUTH_CLIENT_CONFIG, "Missing OAuth client configuration"),
    };
  }

  return {
    config: {
      apiBase: base.apiBase,
      oauthClientId,
      oauthClientSecret,
    },
  };
}

export function getInternalAuthHeaders(config: InternalApiConfig): HeadersInit {
  return {
    "X-Internal-Request": "true",
    "X-Client-ID": config.oauthClientId,
    "X-Client-Secret": config.oauthClientSecret,
  };
}

export async function readResponseText(response: Response): Promise<string> {
  return response.text().catch(() => "");
}
