// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { createSession, newSessionId, setCookie, getSession, SessionData, cookieName, TTL } from "@/lib/session";

type LoginRequest = {
    username: string;
    password: string;
};

export async function POST(req: Request): Promise<NextResponse> {
    
    const body: LoginRequest = await req.json().catch(() => null);
    const username = body?.username?.trim();
    const password = body?.password;

    // Vérification basique des champs (peut être améliorée)
    if (!username || !password) {
    return NextResponse.json(
        { message: "Missing credentials" }, 
        { status: 400 }
    );
    }
    // API Server URL (FastAPI) - à configurer via env
    const apiBase = process.env.INTERNAL_API_URL;
    if (!apiBase) return NextResponse.json(
        { message: "Missing INTERNAL_API_URL" }, 
        { status: 500 }
    );
    try {
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
            console.error("Connection error:", t);
            return NextResponse.json(
                { message: "Sorry but something went wrong. Please try again later." }, 
                { status: r.status }
            );
        }
        // 1c) read user info from FastAPI response
        const session: SessionData = await r.json();

        // 2) create server session
        const sid = newSessionId();
        await createSession(
            sid,
            session
        );
        //TODO remove in Production, only for testing
        const stored = await getSession(sid);
        if (!stored) {
            return NextResponse.json(
                { message: "Session not stored (Redis miss)" }, 
                { status: 500 }
            );
        }
        // // 3) set session cookie
        // await setCookie(sid);
        // // 4) respond to client
        // return NextResponse.json({ ok: true }, { status: 200 });
        // ✅ Réponse + cookie sur la réponse
        
        const res = NextResponse.json({ ok: true }, { status: 200 });
        res.cookies.set({
            name: cookieName(),
            value: sid,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: TTL,
        });

        return res;
    } catch (e) {
        //TODO Redirect to error page with message instead of just returning text
        console.error("Login error:", e);
        return NextResponse.json(
            { message: "Sorry but something went wrong. Please try again later." }, 
            { status: 500 }
        );
    }
}
