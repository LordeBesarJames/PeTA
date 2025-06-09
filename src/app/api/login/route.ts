
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Check if user exists
    const { rows } = await pool.query(
      'SELECT id_user, email, password FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Email tidak terdaftar' },
        { status: 401 }
      );
    }

    // 2. Verify password
    const isValid = await bcrypt.compare(password, rows[0].password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Password salah' },
        { status: 401 }
      );
    }

    // 3. Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: rows[0].id_user,
        email: rows[0].email
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}