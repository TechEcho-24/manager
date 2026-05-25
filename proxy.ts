import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  const isLoggedIn = !!token;
  const onboardingCompleted = Boolean(token?.onboardingCompleted);
  const paymentCompleted = Boolean(token?.paymentCompleted);
  const orgRole = (token?.orgRole as string) || "owner";
  // Invited users (staff/member) are exempt from payment — their org owner paid
  const isInvitedUser = orgRole !== "owner";

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  const isOnboardingRoute = pathname.startsWith("/onboarding");

  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/leads") ||
    pathname.startsWith("/contacts") ||
    pathname.startsWith("/lead-clients") ||
    pathname.startsWith("/deals") ||
    pathname.startsWith("/tasks") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/follow-ups");

  // Logged in user visiting login/signup
  if (isLoggedIn && isAuthRoute) {
    // If no payment and not an invited user, send to pricing
    if (!paymentCompleted && !isInvitedUser) {
      return NextResponse.redirect(new URL("/#pricing", req.url));
    }
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

  // 🔒 PAYMENT GATE: Block onboarding & dashboard if payment not done (owners only)
  if (isLoggedIn && !paymentCompleted && !isInvitedUser && (isDashboardRoute || isOnboardingRoute)) {
    return NextResponse.redirect(new URL("/#pricing", req.url));
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
