// app/api/anak/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Helper function untuk mendapatkan user dari session
async function getUserFromSession(request: NextRequest) {
  try {
    const token = request.cookies.get("session_token")?.value;
    if (!token) {
      return null;
    }

    const client = await pool.connect();
    try {
      const sessionQuery = `
        SELECT s.user_id, u.id_user, u.nama, u.email, u.no_telp 
        FROM sessions s 
        JOIN users u ON s.user_id = u.id_user 
        WHERE s.token = $1 AND s.expires_at > NOW()
      `;
      const sessionResult = await client.query(sessionQuery, [token]);

      if (sessionResult.rows.length === 0) {
        return null;
      }

      return sessionResult.rows[0];
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error getting user from session:", error);
    return null;
  }
}

// PUT - Update data anak
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("PUT /api/anak/[id] - Starting...");

    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { nama_anak, berat_anak, tinggi_anak, tanggal_lahir, jenis_kelamin } =
      body;

    console.log("Update request for child ID:", id);
    console.log("Update data:", body);

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
      // Cek apakah anak milik user yang sedang login
      const checkQuery = `
        SELECT anak_id FROM anak 
        WHERE anak_id = $1 AND id_user = $2
      `;
      const checkResult = await client.query(checkQuery, [id, user.id_user]);

      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Data anak tidak ditemukan atau tidak memiliki akses",
          },
          { status: 404 }
        );
      }

      // Update data anak
      const updateQuery = `
        UPDATE anak 
        SET 
          nama_anak = $1,
          berat_anak = $2,
          tinggi_anak = $3,
          tanggal_lahir = $4,
          jenis_kelamin = $5
        WHERE anak_id = $6 AND id_user = $7
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
        id,
        user.id_user,
      ];

      const result = await client.query(updateQuery, values);

      if (!result.rows || result.rows.length === 0) {
        console.error("Update query executed but no data returned");
        return NextResponse.json(
          {
            success: false,
            error:
              "Gagal mengupdate data anak - tidak ada data yang dikembalikan",
          },
          { status: 500 }
        );
      }

      const updatedChild = result.rows[0];

      // Transform untuk frontend
      const childData = {
        id: updatedChild.id,
        name: updatedChild.name,
        weight: parseFloat(updatedChild.weight) || 0,
        height: parseInt(updatedChild.height) || 0,
        birthDate: new Date(updatedChild.birth_date),
        gender: updatedChild.gender === "Laki-laki" ? "Male" : "Female",
      };

      console.log("Child updated successfully:", childData);

      return NextResponse.json({
        success: true,
        child: childData,
        message: "Data anak berhasil diupdate",
      });
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    console.error("Error updating child:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { success: false, error: "Gagal mengupdate data anak: " + errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Hapus data anak
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("DELETE /api/anak/[id] - Starting...");

    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    console.log("Delete request for child ID:", id);

    const client = await pool.connect();
    try {
      // Cek apakah anak milik user yang sedang login
      const checkQuery = `
        SELECT nama_anak FROM anak 
        WHERE anak_id = $1 AND id_user = $2
      `;
      const checkResult = await client.query(checkQuery, [id, user.id_user]);

      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Data anak tidak ditemukan atau tidak memiliki akses",
          },
          { status: 404 }
        );
      }

      const childName = checkResult.rows[0].nama_anak;

      // Hapus data anak
      const deleteQuery = `
        DELETE FROM anak 
        WHERE anak_id = $1 AND id_user = $2
      `;

      const result = await client.query(deleteQuery, [id, user.id_user]);

      if (!result.rowCount || result.rowCount === 0) {
        console.error("Delete query executed but no rows affected");
        return NextResponse.json(
          {
            success: false,
            error: "Gagal menghapus data anak - tidak ada data yang terhapus",
          },
          { status: 500 }
        );
      }

      console.log("Child deleted successfully:", childName);

      return NextResponse.json({
        success: true,
        message: `Data anak ${childName} berhasil dihapus`,
      });
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    console.error("Error deleting child:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { success: false, error: "Gagal menghapus data anak: " + errorMessage },
      { status: 500 }
    );
  }
}
