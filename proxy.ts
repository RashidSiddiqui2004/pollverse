import { auth } from "./auth";
import { NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";

const getProtectedRoutes = (req: NextAuthRequest) => {
  const protectedRoutes = ["/profile", "/createPoll"];
  return protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route));
}

export default auth((req) => {
  if (!req.auth && getProtectedRoutes(req)) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  }
});

export const config = {
  matcher: ["/profile/:path*", "/createPoll/:path*"],
};