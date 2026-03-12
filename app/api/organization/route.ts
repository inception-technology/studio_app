import { NextResponse } from "next/server";
import { API_ERROR_CODES } from "@/lib/api-codes";
import { getAuthorizedSession } from "@/lib/authorized-session";
import { ensureSessionFresh, refreshSessionTokens } from "@/lib/session-refresh";
import {
    apiError,
    apiSuccess,
    backendProxyFetch,
    getInternalApiConfigOrError,
    readResponseText,
} from "@/lib/internal-api";

export async function GET(): Promise<NextResponse> {

    // Check session and ensure it's fresh
    const session = await getAuthorizedSession();
    if (!session) {
        return apiError(401, API_ERROR_CODES.UNAUTHORIZED, "Unauthorized");
    }
    if (!(await ensureSessionFresh(session))) {
        return apiError(401, API_ERROR_CODES.UNAUTHORIZED, "Unauthorized");
    }

    // Récupération de l'id de l'organization
    const id = session.data.user.id_organization;
    if (id == null) {
        return apiError(404, API_ERROR_CODES.NOT_FOUND, "Organization not found");
    }

    // Récupération de la configuration de l'API interne
    const configResult = getInternalApiConfigOrError();
    if ("error" in configResult) {
        return configResult.error;
    }
    const { apiBase } = configResult.config;
    const apiEndpoint = new URL(`${apiBase}/organization/${id}`);

    try {
        // 1) BFF -> FastAPI (server-to-server)
        const backendResponse = await backendProxyFetch({
            url: apiEndpoint.toString(),
            method: "GET",
            getHeaders: () => ({
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Bearer ${session.data.access_token}`,
            }),
            retry: {
                statuses: [401],
                shouldRetry: async () => refreshSessionTokens(session),
            },
        });

        // Handle errors from FastAPI
        if (!backendResponse.ok) {
            const details = await readResponseText(backendResponse);
            if (backendResponse.status === 401) {
                return apiError(401, API_ERROR_CODES.UNAUTHORIZED, "Unauthorized", details);
            }
            if (backendResponse.status === 403) {
                return apiError(403, API_ERROR_CODES.FORBIDDEN, "Access denied", details);
            }
            if (backendResponse.status === 404) {
                return apiError(404, API_ERROR_CODES.NOT_FOUND, "Organization not found", details);
            }
            if (backendResponse.status === 422) {
                return apiError(422, API_ERROR_CODES.VALIDATION_FAILED, "Invalid organization request", details);
            }
            return apiError(backendResponse.status, API_ERROR_CODES.ORGANIZATION_FETCH_FAILED, "Error retrieving organization", details);
        }

        const response = await backendResponse.json();
        return apiSuccess(response);
    } catch (error) {
        return apiError(500, API_ERROR_CODES.INTERNAL_ERROR, "Internal Server Error", error);
    }
}