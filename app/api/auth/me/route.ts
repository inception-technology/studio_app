// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getCookie, getSession } from "@/lib/session";

export async function GET(): Promise<NextResponse> {

  const sid = await getCookie();
  if (!sid) return new NextResponse("Unauthorized", { status: 401 });

  const session = await getSession(sid);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  
  return NextResponse.json(session, { status: 200 });
}
