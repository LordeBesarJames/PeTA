// app/api/profile/password/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import pool from "@/lib/db";
import bcrypt from "bcrypt";

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Tidak ada sesi aktif" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    // Validate input
    if (!currentPassword) {
      return NextResponse.json(
        { error: "Password saat ini harus diisi" },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password baru minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Get current user data with password
    const { rows } = await pool.query(
      "SELECT password FROM users WHERE id_user = $1 LIMIT 1",
      [user.id_user]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const currentUser = rows[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      currentUser.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Password saat ini salah" },
        { status: 401 }
      );
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(
      newPassword,
      currentUser.password
    );

    if (isSamePassword) {
      return NextResponse.json(
        { error: "Password baru harus berbeda dari password saat ini" },
        { status: 400 }
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    const updateResult = await pool.query(
      "UPDATE users SET password = $1 WHERE id_user = $2",
      [hashedNewPassword, user.id_user]
    );

    if (updateResult.rowCount === 0) {
      return NextResponse.json(
        { error: "Gagal mengubah password" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password berhasil diubah",
    });
  } catch (error: any) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat mengubah password" },
      { status: 500 }
    );
  }
}
