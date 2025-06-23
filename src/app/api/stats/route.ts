import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Tidak ada sesi aktif" },
        { status: 401 }
      );
    }

    // Get total children
    const childrenResult = await pool.query(
      "SELECT COUNT(*) FROM anak WHERE id_user = $1",
      [user.id_user]
    );
    const totalChildren = parseInt(childrenResult.rows[0].count);

    // Get total recipes
    const recipesResult = await pool.query("SELECT COUNT(*) FROM resep");
    const totalRecipes = parseInt(recipesResult.rows[0].count);

    // Get tracker stats for the last 7 days
    const trackerStatsResult = await pool.query(
      `SELECT 
        COUNT(DISTINCT t.tracker_id) as total_entries,
        COUNT(DISTINCT CASE WHEN t.status_gizi = 'sudah terpenuhi' THEN t.tracker_id END) as fulfilled_entries
       FROM tracker t
       JOIN anak a ON t.anak_id = a.anak_id
       WHERE a.id_user = $1 
       AND t.created_at >= NOW() - INTERVAL '7 days'`,
      [user.id_user]
    );

    const totalEntries = parseInt(trackerStatsResult.rows[0].total_entries);
    const fulfilledEntries = parseInt(
      trackerStatsResult.rows[0].fulfilled_entries
    );

    const avgGrowth =
      totalEntries > 0
        ? Math.round((fulfilledEntries / totalEntries) * 100)
        : 0;
    const weeklyProgress = avgGrowth; // Same calculation for weekly progress

    return NextResponse.json({
      success: true,
      data: {
        totalChildren,
        avgGrowth,
        recipesShared: totalRecipes,
        weeklyProgress,
      },
    });
  } catch (error: any) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil statistik" },
      { status: 500 }
    );
  }
}
