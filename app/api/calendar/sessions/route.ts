import { NextRequest, NextResponse } from "next/server";
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
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET(req: NextRequest): Promise<NextResponse> {

    // Vérification session
    const session = await getAuthorizedSession();
    if (!session) {
        return apiError(401, API_ERROR_CODES.UNAUTHORIZED, "Unauthorized");
    }
    if (!(await ensureSessionFresh(session))) {
        return apiError(401, API_ERROR_CODES.UNAUTHORIZED, "Unauthorized");
    }

    // RBAC : tout le staff (Owner → Asst. Coach), Students exclus
    const forbidden = requireRole(session, ROLES.ALL_STAFF);
    if (forbidden) return forbidden;

    // Récupération des query params (studio_id, start, end)
    const { searchParams } = new URL(req.url);
    const studio_id = searchParams.get("studio_id");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    // Récupération de la config API
    const configResult = getInternalApiConfigOrError();
    if ("error" in configResult) {
        return configResult.error;
    }
    const { apiBase } = configResult.config;

    const apiEndpoint = new URL(`${apiBase}/calendar/sessions`);
    if (studio_id) apiEndpoint.searchParams.set("studio_id", studio_id);
    if (start)     apiEndpoint.searchParams.set("start", start);
    if (end)       apiEndpoint.searchParams.set("end", end);

    try {
        const backendResponse = await backendProxyFetch({
            url: apiEndpoint.toString(),
            method: "GET",
            getHeaders: () => ({
                "Authorization": `Bearer ${session.data.access_token}`,
            }),
            retry: {
                statuses: [401],
                shouldRetry: async () => refreshSessionTokens(session),
            },
        });

        if (!backendResponse.ok) {
            const details = await readResponseText(backendResponse);
            if (backendResponse.status === 401) {
                return apiError(401, API_ERROR_CODES.UNAUTHORIZED, "Unauthorized", details);
            }
            if (backendResponse.status === 403) {
                return apiError(403, API_ERROR_CODES.FORBIDDEN, "Access denied", details);
            }
            return apiError(backendResponse.status, API_ERROR_CODES.INTERNAL_ERROR, "Error fetching sessions", details);
        }

        const data = await backendResponse.json();
        return apiSuccess(data);
    } catch (error) {
        return apiError(500, API_ERROR_CODES.INTERNAL_ERROR, "Internal Server Error", error);
    }
}
