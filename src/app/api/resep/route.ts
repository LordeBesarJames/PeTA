import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get("id");

    // If specific recipe ID is requested, return full recipe details
    if (recipeId) {
      const result = await pool.query(
        "SELECT * FROM resep WHERE resep_id = $1",
        [recipeId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Recipe not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result.rows[0],
      });
    }

    // Otherwise, return list of recipes (existing functionality)
    const result = await pool.query(
      "SELECT resep_id, nama_resep, deskripsi_resep, image_url, protein, lemak, karbohidrat, waktu_masak FROM resep"
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error("Error fetching resep:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
