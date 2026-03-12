// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { cookieName, COOKIE_TTL } from "@/lib/cookie";
import { createSession, newSessionId, SessionData } from "@/lib/session";
import { API_ERROR_CODES } from "@/lib/api-codes";
import {
    apiError,
    apiSuccess,
    backendProxyFetch,
    getInternalApiConfigOrError,
    getInternalAuthHeaders,
    readResponseText,
} from "@/lib/internal-api";

type LoginRequest = {
    username: string;
    password: string;
};

export async function POST(req: Request): Promise<NextResponse> {
    
    const body: LoginRequest = await req.json().catch(() => null);
    const username = body?.username?.trim();
    const password = body?.password;

    // Vérification basique des champs
    if (!username || !password) {
        return apiError(
            400, 
            API_ERROR_CODES.BAD_REQUEST, 
            "Missing credentials"
        );
    }

    // Récupération de la configuration de l'API interne
    const configResult = getInternalApiConfigOrError();
    if ("error" in configResult) {
        return configResult.error;
    }
    const { apiBase } = configResult.config;
    const loginEndpoint = `${apiBase}/auth/login`;

    try {
        // 1) BFF -> FastAPI (server-to-server)
        const backendResponse = await backendProxyFetch({
            url: loginEndpoint,
            method: "POST",
            getHeaders: () => ({ 
                "Content-Type": "application/x-www-form-urlencoded",
                ...getInternalAuthHeaders(configResult.config),
            }),
            body: new URLSearchParams({
                grant_type: "password",
                username,
                password
            }),
        });
        // 1b) handle auth errors
        if (!backendResponse.ok) {
            const details = await readResponseText(backendResponse);
            console.error(
                "Login error:", 
                backendResponse.status, 
                details
            );
            return apiError(
                backendResponse.status, 
                API_ERROR_CODES.LOGIN_FAILED, 
                "Login failed", 
                details
            );
        }
        // 1c) read response from FastAPI
        const session: SessionData = await backendResponse.json();

        // 2) create server session
        const sid = newSessionId();
        await createSession(
            sid,
            session
        );
        // 3) set cookie and respond to client
        const res = apiSuccess(
            { authenticated: true },
            { status: backendResponse.status }
        );
        res.cookies.set({
            name: cookieName(),
            value: sid,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: COOKIE_TTL,
        });

        return res;
    } catch (error) {
        //TODO Redirect to error page with message instead of just returning text
        console.error("Login error:", error);
        return apiError(
            500, 
            API_ERROR_CODES.INTERNAL_ERROR, 
            "Internal Server Error", 
            error
        );
    }
}
