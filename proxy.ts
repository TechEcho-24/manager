import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const onboardingCompleted = Boolean(token?.onboardingCompleted);

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

  // Logged in user visiting login/signup
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(
      new URL(
        onboardingCompleted ? "/dashboard" : "/onboarding",
        req.url
      )
    );
  }

  // Not logged in accessing dashboard
  if (!isLoggedIn && isDashboardRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Logged in but onboarding not done
  if (isLoggedIn && !onboardingCompleted && isDashboardRoute) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // Logged in and onboarding done trying onboarding
  if (isLoggedIn && onboardingCompleted && isOnboardingRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Not logged in accessing onboarding
  if (!isLoggedIn && isOnboardingRoute) {
    return NextResponse.redirect(new URL("/signup", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};