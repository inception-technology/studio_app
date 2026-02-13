import { NextResponse } from "next/server";
import { deleteSession, getCookie, clearCookie } from "@/lib/session";

export async function POST() {

    const sid = await getCookie();
    try {
        if (sid) await deleteSession(sid);
    } catch (error) {
        console.error("Failed to delete session:", error);
        return NextResponse.json({ ok: false, error: "Failed to delete session" }, { status: 500 });
    } finally {
        await clearCookie();
    }
    return NextResponse.json({ ok: true });
}
