import { NextResponse } from "next/server";
import { clearCookie } from "@/lib/cookie";
import { getAuthorizedSession } from "@/lib/authorized-session";
import { ensureSessionFresh, refreshSessionTokens } from "@/lib/session-refresh";

const API_BASE = process.env.INTERNAL_API_URL;

function internalErrorResponse() {
  return NextResponse.json({ message: "Internal error" }, { status: 500 });
}

function unauthorizedResponse() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

function serverErrorResponse(error: unknown) {
  return NextResponse.json(
    {
      message: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
    },
    { status: 500 }
  );
}

type ProxyOptions = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  errorMessage: string;
};

async function callInternalApiWithAuthRetry(session: NonNullable<Awaited<ReturnType<typeof getAuthorizedSession>>>, options: ProxyOptions) {
  if (!API_BASE) return internalErrorResponse();

  const doFetch = () =>
    fetch(`${API_BASE}${options.path}`, {
      method: options.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.access_token}`,
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });

  let res = await doFetch();

  if (!res.ok) {
    const refreshed = await refreshSessionTokens(session);
    if (!refreshed) return unauthorizedResponse();
    res = await doFetch();
  }

  if (!res.ok) {
    const details = await res.text().catch(() => "");
    return NextResponse.json(
      { message: options.errorMessage, details },
      { status: res.status }
    );
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text().catch(() => "");
    return NextResponse.json({ ok: true, data: text }, { status: res.status });
  }

  const payload = await res.json();
  return NextResponse.json(payload, { status: res.status });
}

async function getValidSession() {
  const session = await getAuthorizedSession();
  if (!session) {
    await clearCookie();
    return null;
  }

  const fresh = await ensureSessionFresh(session);
  if (!fresh) return null;

  return session;
}

export async function GET(): Promise<NextResponse> {
  const session = await getValidSession();
  if (!session) return unauthorizedResponse();

  try {
    // Example: replace with your target path
    return await callInternalApiWithAuthRetry(session, {
      method: "GET",
      path: "/resource",
      errorMessage: "Error retrieving resource",
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  const session = await getValidSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await req.json().catch(() => null);

    return await callInternalApiWithAuthRetry(session, {
      method: "POST",
      path: "/resource",
      body,
      errorMessage: "Error creating resource",
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// UPDATE handler: use PUT (or switch to PATCH if your API expects partial updates).
export async function PUT(req: Request): Promise<NextResponse> {
  const session = await getValidSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await req.json().catch(() => null);

    return await callInternalApiWithAuthRetry(session, {
      method: "PUT",
      path: "/resource",
      body,
      errorMessage: "Error updating resource",
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// DEL handler: implemented as HTTP DELETE.
export async function DELETE(req: Request): Promise<NextResponse> {
  const session = await getValidSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await req.json().catch(() => undefined);

    return await callInternalApiWithAuthRetry(session, {
      method: "DELETE",
      path: "/resource",
      body,
      errorMessage: "Error deleting resource",
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
