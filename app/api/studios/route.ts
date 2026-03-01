import { NextResponse } from "next/server";
import { getCookie, getSession, SessionData } from "@/lib/session";


async function isAuthorized(): Promise<SessionData | null> {
    // check session (user must be authenticated to access this endpoint)
    const sid = await getCookie();
    if (!sid) return null;
    // get session data from store (Redis or in-memory)
    const session = await getSession(sid);
    if (!session || !session.data) return null
    // check that session contains user info (userId, roleId, orgId)
    if (
        !session.data.user || 
        typeof session.data.user.id !== "number" || 
        typeof session.data.user.id_role !== "number" || 
        typeof session.data.user.id_organization !== "number"
    ) {
        return null;
    }
    return session;
}

// Function to fetch dashboard data (example of protected endpoint that requires authentication)
export async function GET(): Promise<NextResponse> {
    // check authorization and get session data
    const session = await isAuthorized();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // API Server URL (FastAPI) - à configurer via env
    const apiBase = process.env.INTERNAL_API_URL;
    if (!apiBase) return NextResponse.json({ message: "Internal error" }, { status: 500 });
    try {
        // 1) BFF -> FastAPI (server-to-server)
        const r = await fetch(`${apiBase}/org/${session.data.user.id_organization}/studios`, {
        method: "GET",
        headers: { 
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Bearer ${session.data.access_token}`
        },
            cache: "no-store",
        });
        // 1b) handle auth errors
        if (!r.status || r.status === 401) {
            const t = await r.text().catch(() => "");
            return NextResponse.json(
                { message: "Error retrieving studios", details: t }, 
                { status: r.status }
            );
        }
        // 1c) read studios info from FastAPI response
        const response = await r.json();
        if (!response || !response.studios || !Array.isArray(response.studios)) {
            return NextResponse.json(
                { message: "Invalid response from API" }, 
                { status: 500 }
            );
        }
        // 2) respond to client
        return NextResponse.json(
            { ...response.studios }, 
            { status: 200 }
        ); 
    } catch (error) {
        return NextResponse.json(
            { 
                message: "Internal Server Error", 
                details: error instanceof Error ? error.message : String(error) 
            },
             { status: 500 }
            );
    }
}