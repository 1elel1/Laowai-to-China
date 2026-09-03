import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Pages still call requireUser() themselves — this only saves a round trip to
// the database for requests that were never going to be allowed through.
const PROTECTED = ["/dashboard", "/messages", "/guide", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!PROTECTED.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next();
  }

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/messages/:path*", "/guide/:path*", "/admin/:path*"],
};
