// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE } from "@/lib/cookie";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // protéger dashboard
  if (pathname.startsWith("/dashboard")) {
    const sid = req.cookies.get(COOKIE)?.value;

    if (!sid) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};