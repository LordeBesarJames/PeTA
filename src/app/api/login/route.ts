import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    // 1. Check if user exists
    const { rows } = await pool.query(
      "SELECT id_user, nama, email, password, no_telp FROM users WHERE email = $1 LIMIT 1",
      [email.toLowerCase().trim()]
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

    // 3. Create new session (createSession sudah menghandle penghapusan session lama)
    const { token, expiresAt } = await createSession(user.id_user);

    // 4. Set cookie - PERBAIKAN DISINI
    const cookieStore = cookies();
    (await cookieStore).set({
      name: "session_token", // Konsisten dengan nama di auth.ts
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt, // Gunakan expiresAt dari createSession
      path: "/",
    });

    // 5. Return success response with user data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id_user,
        nama: user.nama,
        email: user.email,
        no_telp: user.no_telp,
      },
      message: "Login berhasil",
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  }
}
