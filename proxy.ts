import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // IMPORTANT: Whitelist all auth API routes and critical public routes
  const isAuthApi = pathname.startsWith("/api/auth");
  const isChatApi = pathname.startsWith("/api/chat");
  const isLoginPage = pathname === "/login";

  // 1. Allow all Auth API requests (This fixes the JSON response issue)
  if (isAuthApi) return NextResponse.next();

  // 2. If trying to access protected routes without login
  if (!isLoggedIn && !isLoginPage && !isChatApi) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  // 3. If logged in and trying to go to login page
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (handled manually in middleware)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
