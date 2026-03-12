import { deleteSession } from "@/lib/session";
import { getCookie, clearCookie } from "@/lib/cookie";
import { API_ERROR_CODES } from "@/lib/api-codes";
import { apiError, apiSuccess } from "@/lib/internal-api";

export async function POST() {

    const sid = await getCookie();
    try {
        if (sid) await deleteSession(sid);
    } catch (error) {
        console.error("Failed to delete session:", error);
        return apiError(500, API_ERROR_CODES.SESSION_DELETE_FAILED, "Failed to delete session", error);
    } finally {
        await clearCookie();
    }
    return apiSuccess({ loggedOut: true });
}
