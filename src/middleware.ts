import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Pages still call requireUser() themselves — this only saves a round trip to
// the database for requests that were never going to be allowed through.
const PROTECTED = ["/dashboard", "/messages", "/guide", "/admin"];

/**
 * A relative Location, which the browser resolves against the request URL.
 *
 * NextResponse.redirect() needs an absolute URL, and behind a reverse proxy the
 * standalone server builds that from HOSTNAME (127.0.0.1:3000) rather than the
 * public host — sending users to https://localhost:3000/login. Relative is
 * legal per RFC 7231 and correct in every deployment.
 */
function redirectTo(path: string): NextResponse {
  return new NextResponse(null, { status: 307, headers: { Location: path } });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!PROTECTED.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next();
  }

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const next = encodeURIComponent(pathname + request.nextUrl.search);
    return redirectTo(`/login?next=${next}`);
  }

  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return redirectTo("/");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/messages/:path*", "/guide/:path*", "/admin/:path*"],
};
