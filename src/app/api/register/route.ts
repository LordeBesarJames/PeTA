import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, phone } = await req.json();

    // Validasi dasar
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }
    if (!phone.match(/^[0-9]+$/)) {
      return NextResponse.json({ error: 'Nomor telepon harus angka' }, { status: 400 });
    }

    // 1. Cek username terlebih dahulu
    const usernameCheck = await pool.query(
      'SELECT 1 FROM users WHERE nama = $1 LIMIT 1',
      [username]
    );
    if (usernameCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 400 }
      );
    }

    // 2. Jika username tersedia, cek email
    const emailCheck = await pool.query(
      'SELECT 1 FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // 3. Jika email tersedia, cek no_telp
    const phoneCheck = await pool.query(
      'SELECT 1 FROM users WHERE no_telp = $1 LIMIT 1',
      [phone]
    );
    if (phoneCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Nomor telepon sudah terdaftar' },
        { status: 400 }
      );
    }

    // Jika semua valid, simpan ke database
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertResult = await pool.query(
      'INSERT INTO users (id_user, nama, email, password, no_telp) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING id_user',
      [username, email, hashedPassword, phone]
    );

    return NextResponse.json({
      message: 'Registrasi berhasil!',
      userId: insertResult.rows[0].id_user,
    });

  } catch (error: any) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}