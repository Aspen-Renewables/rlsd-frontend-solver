import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_PASSWORD_HEADER_KEY } from "./constants";

const loginRoute = "/auth/login";
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const password = request.cookies.get(ADMIN_PASSWORD_HEADER_KEY)?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    // redirect to /warning
    if (!isWarningPage(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/warning", request.url));
    }
  }
  const authenticated = password === adminPassword;
  if (isAdminPath(request.nextUrl.pathname)) {  
    if (!authenticated) {
      return NextResponse.redirect(new URL(loginRoute, request.url));
    }
  }

  if (isLoginPath(request.nextUrl.pathname) && authenticated) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
}

const isAdminPath = (path: string) => path.startsWith("/admin");
const isLoginPath = (path: string) => path.startsWith(loginRoute);
const isWarningPage = (path: string) => path.startsWith("/warning");
// See "Matching Paths" below to learn more
