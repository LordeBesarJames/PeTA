// app/api/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("session-token")?.value;

    // Delete session from database if token exists
    if (token) {
      await deleteSession(token);
    }

    // Clear cookie by setting it with past expiration
    (await cookieStore).set("session-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Logout berhasil",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        error: error.message || "Terjadi kesalahan saat logout",
        success: false,
      },
      { status: 500 }
    );
  }
}
