import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const protectedRoutes = ["/tambah-anak", "/api/anak"];

  if (protectedRoutes.some((route) => path.startsWith(route))) {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tambah-anak", "/api/anak/:path*"],
};
