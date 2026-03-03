import { NextResponse } from "next/server";
 
type SignupRequest = {
    firstname: string;
    lastname: string;
    email: string;
    organization: string;
    password: string;
    consent: boolean;
    language?: string;
    profile?: string;
};

export async function POST(request: Request): Promise<NextResponse> {
        const body: SignupRequest | null = await request.json().catch(() => null);
        const firstname = body?.firstname?.trim();
        const lastname = body?.lastname?.trim();
        const email = body?.email?.trim();
        const organization = body?.organization?.trim();
        const password = body?.password;
        const consent = body?.consent;
        const language = body?.language?.trim();
        const profile = body?.profile?.trim();

        if (!firstname || !lastname || !email || !organization || !password) {
            return NextResponse.json(
                { message: "Missing required signup fields" },
                { status: 400 }
            );
        }

        if (!consent) {
            return NextResponse.json(
                { message: "Consent is required" },
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

        try {
            const backendResponse = await fetch(`${apiBase}/auth/signup`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstname,
                    lastname,
                    email,
                    organization,
                    password,
                    consent,
                    language,
                    profile,
                }),
                cache: "no-store",
            });

            if (!backendResponse.ok) {
                const details = await backendResponse.text().catch(() => "");
                return NextResponse.json(
                    { message: "Signup failed", details },
                    { status: backendResponse.status }
                );
            }

            const payload = await backendResponse.json().catch(() => null);
            return NextResponse.json(payload ?? { ok: true }, { status: 200 });
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