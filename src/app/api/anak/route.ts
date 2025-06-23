// app/api/anak/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          anak_id as id,
          nama_anak as name,
          berat_anak as weight,
          tinggi_anak as height,
          tanggal_lahir as birth_date,
          jenis_kelamin as gender
        FROM anak 
        WHERE id_user = $1
      `;

      const result = await client.query(query, [user.id_user]);

      return NextResponse.json({
        success: true,
        children: result.rows.map((row) => ({
          id: row.id,
          name: row.name,
          weight: parseFloat(row.weight),
          height: parseInt(row.height),
          birthDate: new Date(row.birth_date),
          gender: row.gender,
        })),
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error fetching children:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch children" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nama_anak, berat_anak, tinggi_anak, tanggal_lahir, jenis_kelamin } =
      body;

    // Validasi input
    if (
      !nama_anak ||
      !berat_anak ||
      !tinggi_anak ||
      !tanggal_lahir ||
      !jenis_kelamin
    ) {
      return NextResponse.json(
        { success: false, error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO anak (nama_anak, berat_anak, tinggi_anak, tanggal_lahir, jenis_kelamin, id_user)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING 
          anak_id as id,
          nama_anak as name,
          berat_anak as weight,
          tinggi_anak as height,
          tanggal_lahir as birth_date,
          jenis_kelamin as gender
      `;

      const values = [
        nama_anak,
        parseFloat(berat_anak),
        parseInt(tinggi_anak),
        tanggal_lahir,
        jenis_kelamin,
        user.id_user,
      ];

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Gagal menambahkan data anak" },
          { status: 500 }
        );
      }

      const newChild = result.rows[0];
      return NextResponse.json({
        success: true,
        child: {
          id: newChild.id,
          name: newChild.name,
          weight: parseFloat(newChild.weight),
          height: parseInt(newChild.height),
          birthDate: new Date(newChild.birth_date),
          gender: newChild.gender,
        },
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error creating child:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menambahkan data anak" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
