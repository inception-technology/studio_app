import { NextResponse } from "next/server";
import { createSession, newSessionId, setCookie, getSession } from "@/lib/session";

export async function POST(req: Request): Promise<NextResponse> {
    
    const body = await req.json().catch(() => null);
    const username = body?.username?.trim();
    const password = body?.password;

    // Vérification basique des champs (peut être améliorée)
    if (!username || !password) {
    return new NextResponse("Missing credentials", { status: 400 });
    }
    // API Server URL (FastAPI) - à configurer via env
    const apiBase = process.env.INTERNAL_API_URL;
    if (!apiBase) return new NextResponse("Missing INTERNAL_API_URL", { status: 500 });

    // 1) BFF -> FastAPI (server-to-server)
    const r = await fetch(`${apiBase}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
        grant_type: "password",
        username,
        password,
        client_id: process.env.INTERNAL_OAUTH_CLIENT_ID ?? "",
        client_secret: process.env.INTERNAL_OAUTH_CLIENT_SECRET ?? "",
    }),
        cache: "no-store",
    });
    // 1b) handle auth errors
    if (!r.ok) {
        const t = await r.text().catch(() => "");
        return new NextResponse(t || "Login failed", { status: r.status });
    }
    // 1c) read user info from FastAPI response
    const { id:userId, id_role:roleId, id_organization:orgId, is_active } = await r.json();
    if (!is_active) {
        return new NextResponse("User is inactive", { status: 403 });
    }
    // 2) create server session
    const sid = newSessionId();

    await createSession(
        sid,
        { data: { userId, roleId, orgId } }
    );
    // 3) sanity check (optional, can be removed in production)
    const stored = await getSession(sid);
    if (!stored) {
        return new NextResponse("Session not stored (Redis miss)", { status: 500 });
    }
        // 4) set session cookie
    await setCookie(sid);

    // 5) respond to client
    return NextResponse.json({ ok: true}); 
}
