import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/"];

// Routes that require authentication (auctioneer/admin only)
const protectedRoutes = ["/dashboard", "/create-auction", "/customers", "/reports", "/billing", "/settings"];

// Allowed roles for this platform (auctioneer and admin only)
const ALLOWED_ROLES = ["auctioneer", "admin", "superadmin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookie
  const token = request.cookies.get("bidooze_auth_token")?.value;

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // If accessing a protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login/register with token, verify role before redirecting
  if ((pathname === "/login" || pathname === "/register") && token) {
    try {
      // Verify user role via API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:8000/api";
      const response = await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user || data;
        const userRole = user.role;

        // Only allow auctioneer/admin to access dashboard
        if (ALLOWED_ROLES.includes(userRole)) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        } else {
          // Buyer role - redirect to login (this platform is for auctioneer/admin only)
          const loginUrl = new URL("/login", request.url);
          loginUrl.searchParams.set("error", "unauthorized_role");
          return NextResponse.redirect(loginUrl);
        }
      }
    } catch (error) {
      // If API call fails, still redirect to login to re-authenticate
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // For protected routes with token, verify role
  if (isProtectedRoute && token) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:8000/api";
      const response = await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user || data;
        const userRole = user.role;

        // Only allow auctioneer/admin roles
        if (!ALLOWED_ROLES.includes(userRole)) {
          // Buyer role trying to access auctioneer/admin routes
          const loginUrl = new URL("/login", request.url);
          loginUrl.searchParams.set("error", "unauthorized_role");
          return NextResponse.redirect(loginUrl);
        }

        // Role is valid, allow request
        return NextResponse.next();
      } else if (response.status === 401) {
        // Token is invalid, redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      // If API call fails, allow request to proceed
      // The API interceptor in the client will handle errors
      return NextResponse.next();
    }
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Default: allow request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

