import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Pages still call requireUser() themselves — this only saves a round trip to
// the database for requests that were never going to be allowed through.
const PROTECTED = ["/dashboard", "/messages", "/guide", "/admin"];

/**
 * The origin the browser actually used.
 *
 * `request.nextUrl.origin` is wrong behind a reverse proxy: the standalone
 * server builds it from HOSTNAME/PORT (127.0.0.1:3000), which would redirect
 * users to https://localhost:3000/login. The forwarded headers, or failing
 * that the Host header, carry the real one. A relative Location is not an
 * option — the middleware runtime parses it as an absolute URL and throws.
 */
function publicOrigin(request: NextRequest): string {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? null;
  if (!host) return request.nextUrl.origin;

  const proto =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "") ??
    "http";
  return `${proto}://${host}`;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!PROTECTED.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next();
  }

  const origin = publicOrigin(request);
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    const login = new URL("/login", origin);
    login.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/messages/:path*", "/guide/:path*", "/admin/:path*"],
};
