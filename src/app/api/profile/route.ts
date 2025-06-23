// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import pool from "@/lib/db";

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Tidak ada sesi aktif" },
        { status: 401 }
      );
    }

    const { nama, email, no_telp } = await request.json();

    // Validate input
    if (!nama?.trim()) {
      return NextResponse.json(
        { error: "Nama tidak boleh kosong" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    if (!no_telp?.trim()) {
      return NextResponse.json(
        { error: "Nomor telepon tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const emailCheckResult = await pool.query(
      "SELECT id_user FROM users WHERE email = $1 AND id_user != $2 LIMIT 1",
      [email, user.id_user]
    );

    if (emailCheckResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Email sudah digunakan oleh pengguna lain" },
        { status: 409 }
      );
    }

    // Update user profile
    const { rows } = await pool.query(
      `UPDATE users 
       SET nama = $1, email = $2, no_telp = $3 
       WHERE id_user = $4 
       RETURNING id_user, nama, email, no_telp`,
      [nama.trim(), email.toLowerCase().trim(), no_telp.trim(), user.id_user]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Gagal mengupdate profil" },
        { status: 500 }
      );
    }

    const updatedUser = rows[0];

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id_user,
        nama: updatedUser.nama,
        email: updatedUser.email,
        no_telp: updatedUser.no_telp,
      },
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat mengupdate profil" },
      { status: 500 }
    );
  }
}
