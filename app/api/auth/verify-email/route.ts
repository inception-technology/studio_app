import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token")?.trim();

    if (!token) {
        return NextResponse.json(
            { message: "Missing verification token" },
            { status: 400 }
        );
    }

    const apiBase = process.env.INTERNAL_API_URL;
    if (!apiBase) {
        return NextResponse.json(
            { message: "Missing INTERNAL_API_URL" },
            { status: 500 }
        );
    }

    const oauthClientId = process.env.INTERNAL_OAUTH_CLIENT_ID;
    const oauthClientSecret = process.env.INTERNAL_OAUTH_CLIENT_SECRET;
    if (!oauthClientId || !oauthClientSecret) {
        return NextResponse.json(
            { message: "Missing OAuth client configuration" },
            { status: 500 }
        );
    }

    try {
        const backendResponse = await fetch(
            `${apiBase}/auth/verify-email?token=${encodeURIComponent(token)}`,
            {
                method: "GET",
                headers: {
                    "X-Internal-Request": "true",
                    "X-Client-ID": oauthClientId,
                    "X-Client-Secret": oauthClientSecret,
                },
                cache: "no-store",
            }
        );

        if (!backendResponse.ok) {
            const details = await backendResponse.text().catch(() => "");
            return NextResponse.json(
                { message: "Email verification failed", details },
                { status: backendResponse.status }
            );
        }

        const payload = await backendResponse.json().catch(() => null);
        return NextResponse.json(payload ?? { ok: true }, { status: backendResponse.status });
    } catch (error) {
        return NextResponse.json(
            {
                message: "Internal Server Error",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
