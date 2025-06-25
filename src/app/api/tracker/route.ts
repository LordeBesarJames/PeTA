import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { anak_id, jam_makan, status_gizi, tanggal, makanan } = body;

  if (
    !anak_id ||
    !jam_makan ||
    !status_gizi ||
    !tanggal ||
    !Array.isArray(makanan)
  ) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Simpan ke tracker (Supabase auto-generate UUID)
    const result = await client.query(
      `INSERT INTO tracker (anak_id, jam_makan, status_gizi, created_at)
       VALUES ($1, $2, $3, $4)
       RETURNING tracker_id`,
      [anak_id, jam_makan, status_gizi, tanggal]
    );
    const tracker_id = result.rows[0].tracker_id;

    // Simpan ke tracker_detail (td_id auto-generated juga)
    for (const item of makanan) {
      await client.query(
        `INSERT INTO tracker_detail (tracker_id, id_makanan, jumlah_porsi)
         VALUES ($1, $2, $3)`,
        [tracker_id, item.id_makanan, item.jumlah_porsi]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ success: true, tracker_id });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("Gagal simpan tracker:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menyimpan tracker" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function GET(request: NextRequest) {
  const anak_id = request.nextUrl.searchParams.get("anak_id");
  const tanggal = request.nextUrl.searchParams.get("tanggal");

  if (!anak_id || !tanggal) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const result = await pool.query(
    `SELECT t.jam_makan, m.id_makanan, m.nama_makanan,
            m.kalori * td.jumlah_porsi AS kalori,
            m.karbo * td.jumlah_porsi AS karbo,
            m.protein * td.jumlah_porsi AS protein,
            m.lemak * td.jumlah_porsi AS lemak
    FROM tracker t
    JOIN tracker_detail td ON t.tracker_id = td.tracker_id
    JOIN makanan m ON td.id_makanan = m.id_makanan
    WHERE t.anak_id = $1 AND DATE(t.created_at) = $2`,
    [anak_id, tanggal]
  );

  const mealsMap: Record<string, any[]> = {};

  for (const row of result.rows) {
    const mealType = row.jam_makan.toLowerCase(); // ← penting!
    if (!mealsMap[mealType]) mealsMap[mealType] = [];

    mealsMap[mealType].push({
      id: row.id_makanan,
      name: row.nama_makanan,
      calories: row.kalori,
      carb: row.karbo,
      protein: row.protein,
      fat: row.lemak,
    });
  }

  const meals = Object.entries(mealsMap).map(([mealType, data]) => ({
    mealType,
    data,
  }));

  return NextResponse.json({ success: true, meals });
}
