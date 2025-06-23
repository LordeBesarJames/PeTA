// app/api/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Check if user exists
    const { rows } = await pool.query(
      "SELECT id_user, nama, email, password, no_telp FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Email tidak terdaftar" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // 2. Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // 3. Create session
    const token = await createSession(user.id_user);

    // 4. Set cookie
    const cookieStore = cookies();
    (await cookieStore).set("session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // 5. Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: user.id_user,
        nama: user.nama,
        email: user.email,
        no_telp: user.no_telp,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  }
}
