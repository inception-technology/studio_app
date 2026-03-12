import { NextRequest, NextResponse } from 'next/server';
import { API_ERROR_CODES } from "@/lib/api-codes";
import {
    apiError,
    apiSuccess,
    backendProxyFetch,
    getInternalApiConfigOrError,
    getInternalAuthHeaders,
    readResponseText,
} from "@/lib/internal-api";

type ForgotPasswordRequest = {
    email: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
    const body: ForgotPasswordRequest | null = await request.json().catch(() => null);
    const email = body?.email?.trim();

    // Vérification basique du champ email
    if (!email) {
        return apiError(
            400, 
            API_ERROR_CODES.BAD_REQUEST, 
            "Missing required email field"
        );
    }
    
    // Récupération de la configuration de l'API interne
    const configResult = getInternalApiConfigOrError();
    if ("error" in configResult) {
        return configResult.error;
    }
    const { apiBase } = configResult.config;

    try {
        // 1) BFF -> FastAPI (server-to-server)
        const ForgotPasswordEndpoint = `${apiBase}/auth/forgot-password`;
        const backendResponse = await backendProxyFetch({
            url: ForgotPasswordEndpoint,
            method: "PUT",
            getHeaders: () => ({
                "Content-Type": "application/json",
                ...getInternalAuthHeaders(configResult.config),
            }),
            body: JSON.stringify({"email": email}),
        });

        // 1b) handle auth errors
        if (!backendResponse.ok) {
            const details = await readResponseText(backendResponse);
            console.error(
                "Forgot password error:", 
                backendResponse.status, 
                details
            );
            if (backendResponse.status === 422) {
                return apiError(
                    422, 
                    API_ERROR_CODES.FORGOT_PASSWORD_FAILED, 
                    "Invalid forgot password data", details
                );
            }
            return apiError(
                backendResponse.status, 
                API_ERROR_CODES.FORGOT_PASSWORD_FAILED, 
                "Forgot password failed", 
                details
            );
        }
        // 1c) read response from FastAPI
        const payload = await backendResponse.json().catch(() => null);

        // 2) respond to client
        return apiSuccess(
            payload ?? { created: true }, 
            { status: backendResponse.status }
        );
    } catch (error) {
        console.error("Forgot password error:", error);
        return apiError(
            500, 
            API_ERROR_CODES.INTERNAL_ERROR, 
            "Internal Server Error", 
            error
        );
    }
}