// app/api/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("session-token")?.value;

    if (token) {
      // Delete session from database
      await deleteSession(token);
    }

    // Clear cookie
    (
      await // Clear cookie
      cookieStore
    ).delete("session-token");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat logout" },
      { status: 500 }
    );
  }
}
