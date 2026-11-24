import { NextResponse, type NextRequest } from "next/server";

// Fast gate: redirects to login when no session cookie exists.
// Full verification (signature, expiry, active user, role) happens in the server layer.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  if (!req.cookies.get("sid")) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
