import { NextResponse } from "next/server";
import { API_ERROR_CODES } from "@/lib/api-codes";
import {
    apiError,
    apiSuccess,
    backendProxyFetch,
    getInternalApiConfigOrError,
    getInternalAuthHeaders,
    readResponseText,
} from "@/lib/internal-api";


// Function to fetch dashboard data (example of protected endpoint that requires authentication)
export async function GET(request: Request): Promise<NextResponse> {
    
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    // Basic validation
    if (!reference) {
        return apiError(
            400, 
            API_ERROR_CODES.BAD_REQUEST, 
            "Missing reference parameter"
        );
    }

    // Récupération de la configuration de l'API interne
    const configResult = getInternalApiConfigOrError();
    if ("error" in configResult) {
        return configResult.error;
    }
    const { apiBase } = configResult.config;
    const apiEndpoint = new URL(`${apiBase}/references/${reference}`);

    try {
        // 1) BFF -> FastAPI (server-to-server)
        const backendResponse = await backendProxyFetch({
            url: apiEndpoint.toString(),
            method: "GET",
            getHeaders: () => ({
                "Content-Type": "application/x-www-form-urlencoded",
                ...getInternalAuthHeaders(configResult.config),
            }),
        });

        if (!backendResponse.ok) {
            const errorText = await readResponseText(backendResponse);
            return apiError(
                backendResponse.status, 
                API_ERROR_CODES.REFERENCES_FETCH_FAILED, 
                "Error retrieving references", 
                errorText
            );
        }
        // 1) read reference info from FastAPI response
        const response = await backendResponse.json();
        if (!response || !Array.isArray(response)) {
            return apiError(
                500, 
                API_ERROR_CODES.INVALID_BACKEND_RESPONSE, 
                "Invalid response from API"
            );
        }

        // 2) respond to client
        return apiSuccess(response);
    } catch (error) {
        return apiError(
            500, 
            API_ERROR_CODES.INTERNAL_ERROR, 
            "Internal Server Error", 
            error
        );
    }
}