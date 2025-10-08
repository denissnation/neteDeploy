// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if the path is an admin route
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const accessToken = request.cookies.get("accessToken")?.value;

    if (!accessToken) {
      // Redirect to login if no access token
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      loginUrl.searchParams.set("message", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Specify which paths should trigger the middleware
export const config = {
  matcher: [
    "/admin/:path*", // Protect all admin routes
    // Add other protected paths if needed
  ],
};
