import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE, parseSessionCookie } from "@/lib/auth-session";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/auctioneer/register",
  "/forgot-password",
  "/otp-verification",
  "/admin/login",
  "/auth/mfa",
];

const adminRoutes = [
  "/admin",
];

const approvedOnlyAuctioneerRoutes = [
  "/dashboard",
  "/create-auction",
  "/customers",
  "/reports",
  "/billing",
  "/settings",
  "/miscellaneous",
  "/auctioneer/dashboard",
  "/auctioneer/auctions",
  "/auctioneer/live-console",
  "/auctioneer/settings",
  "/auctioneer/customers",
  "/auctioneer/reports",
  "/auctioneer/billing",
  "/auctioneer/miscellaneous",
];

const auctioneerStatusRoutes = ["/auctioneer/application-status"];

const ALLOWED_ROLES = ["auctioneer", "admin", "superadmin"];
const TOKEN_COOKIE = "bidooze_auth_token";

function clearAuthCookies(response: NextResponse) {
  response.cookies.set(AUTH_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value || null;
  const sessionRaw = request.cookies.get(AUTH_SESSION_COOKIE)?.value || null;
  const session = parseSessionCookie(sessionRaw);
  const userRole = session?.user?.role;
  const accountStatus = session?.user?.account_status;
  const canAccess = !!session?.can_access_auctioneer_features;

  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isApprovedAuctioneerRoute = approvedOnlyAuctioneerRoutes.some((route) => pathname.startsWith(route));
  const isAuctioneerRoute =
    pathname.startsWith("/auctioneer") || isApprovedAuctioneerRoute;

  const isProtectedRoute = isAdminRoute || isAuctioneerRoute;

  if (isProtectedRoute && !token && !isPublicRoute) {
    const loginUrl = new URL(isAdminRoute ? "/admin/login" : "/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && accountStatus && accountStatus !== "active") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("blocked", "1");
    const response = NextResponse.redirect(loginUrl);
    clearAuthCookies(response);
    return response;
  }

  if (token && isPublicRoute) {
    if (userRole === "admin" || userRole === "superadmin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (userRole === "auctioneer") {
      return NextResponse.redirect(
        new URL(canAccess ? "/auctioneer/dashboard" : "/auctioneer/application-status", request.url)
      );
    }
  }

  if (token && isAdminRoute) {
    if (userRole === "auctioneer") {
      return NextResponse.redirect(new URL("/auctioneer/dashboard", request.url));
    }
    if (userRole && !ALLOWED_ROLES.includes(userRole)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized_role");
      return NextResponse.redirect(loginUrl);
    }
  }

  if (token && isAuctioneerRoute) {
    if (userRole === "admin" || userRole === "superadmin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (isApprovedAuctioneerRoute && !canAccess) {
      return NextResponse.redirect(new URL("/auctioneer/application-status", request.url));
    }
    if (auctioneerStatusRoutes.some((route) => pathname.startsWith(route)) && canAccess) {
      return NextResponse.redirect(new URL("/auctioneer/dashboard", request.url));
    }
  }

  if (!token && !isPublicRoute && pathname.startsWith("/auctioneer")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
