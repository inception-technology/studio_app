import { NextResponse } from "next/server";
 
type SignupRequest = {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    organization_name?: string;
    language_code?: string;
    profile_id?: number;
};

export async function POST(request: Request): Promise<NextResponse> {

    const body: SignupRequest | null = await request.json().catch(() => null);
    const firstname = body?.firstname?.trim();
    const lastname = body?.lastname?.trim();
    const email = body?.email?.trim();
    const organization_name = body?.organization_name?.trim();
    const password = body?.password;
    const language_code = body?.language_code?.trim();
    const profile_id = body?.profile_id;

    if (!firstname || !lastname || !email || !password) {
        return NextResponse.json(
            { message: "Missing required signup fields" },
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
        const backendSignupUrl = `${apiBase}/auth/signup`;
        const backendResponse = await fetch(backendSignupUrl, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "X-Internal-Request": "true",
                "X-Client-ID": oauthClientId,
                "X-Client-Secret": oauthClientSecret,
            },
            body: JSON.stringify({
                firstname,
                lastname,
                email,
                organization_name,
                password,
                language_code,
                profile_id,
            }),
            cache: "no-store",
        });
        if (!backendResponse.ok) {
            const details = await backendResponse.text().catch(() => "");
            console.error("Signup error:", backendResponse.status, typeof(details));
            if (backendResponse.status === 422) {
                return NextResponse.json(
                    { message: "Invalid signup data " },
                    { status: backendResponse.status }
                );
            }
            return NextResponse.json(
                { message: "Signup failed"},
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