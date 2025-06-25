import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const result = await pool.query(
      `SELECT 
        id_makanan AS id,
        nama_makanan AS name,
        deskripsi_makanan AS description,
        kalori AS calories,
        karbo AS carbs,
        lemak AS fat,
        protein
      FROM makanan`
    );

    return NextResponse.json({
      success: true,
      makanan: result.rows,
    });
  } catch (error: any) {
    console.error("Error fetching makanan:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal mengambil data makanan",
      },
      { status: 500 }
    );
  }
}
