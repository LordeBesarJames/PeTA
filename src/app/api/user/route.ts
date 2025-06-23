// app/api/user/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Tidak ada sesi aktif",
          success: false,
        },
        { status: 401 }
      );
    }

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
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        error: error.message || "Terjadi kesalahan saat mengambil data user",
        success: false,
      },
      { status: 500 }
    );
  }
}
