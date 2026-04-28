import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read JWT directly — edge-safe, no NextAuth() instantiation needed
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || "any-random-secret-for-now",
  });

  const isLoggedIn = !!token;
  const onboardingCompleted = token?.onboardingCompleted === true;

  // ─── Route categories ──────────────────────────────────────────────────────
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/leads") ||
    pathname.startsWith("/contacts") ||
    pathname.startsWith("/deals") ||
    pathname.startsWith("/tasks") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/follow-ups");

  // ─── Rule 1: Logged-in users on auth pages ─────────────────────────────────
  // Redirect based on whether they finished onboarding
  if (isLoggedIn && isAuthRoute) {
    if (!onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ─── Rule 2: Not logged in + trying to access dashboard ───────────────────
  if (!isLoggedIn && isDashboardRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Rule 3: Logged in but onboarding not done + dashboard ────────────────
  if (isLoggedIn && !onboardingCompleted && isDashboardRoute) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // ─── Rule 4: Logged in + onboarding done + /onboarding ────────────────────
  if (isLoggedIn && onboardingCompleted && isOnboardingRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ─── Rule 5: Not logged in + /onboarding ──────────────────────────────────
  if (!isLoggedIn && isOnboardingRoute) {
    return NextResponse.redirect(new URL("/signup", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};
