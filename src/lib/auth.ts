// lib/auth.ts
import { cookies } from "next/headers";
import pool from "./db";
import crypto from "crypto";

export interface User {
  id_user: string;
  nama: string;
  email: string;
  no_telp: string;
}

export interface Session {
  session_id: string;
  user_id: string;
  token: string;
  expires_at: Date;
}

// Generate secure random token
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Create session in database
export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await pool.query(
    "INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)",
    [userId, token, expiresAt]
  );

  return token;
}

// Get session from token
export async function getSession(
  token: string
): Promise<{ user: User; session: Session } | null> {
  const { rows } = await pool.query(
    `
    SELECT 
      s.session_id, s.user_id, s.token, s.expires_at,
      u.id_user, u.nama, u.email, u.no_telp
    FROM sessions s
    JOIN users u ON s.user_id = u.id_user
    WHERE s.token = $1 AND s.expires_at > now()
  `,
    [token]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return {
    user: {
      id_user: row.id_user,
      nama: row.nama,
      email: row.email,
      no_telp: row.no_telp,
    },
    session: {
      session_id: row.session_id,
      user_id: row.user_id,
      token: row.token,
      expires_at: row.expires_at,
    },
  };
}

// Delete session
export async function deleteSession(token: string): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE token = $1", [token]);
}

// Delete all sessions for a user
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE user_id = $1", [userId]);
}

// Get current user from cookies
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const token = (await cookieStore).get("session-token")?.value;

  if (!token) {
    return null;
  }

  const sessionData = await getSession(token);
  return sessionData?.user || null;
}

// Middleware helper to verify authentication
export async function verifyAuth(): Promise<{
  user: User;
  session: Session;
} | null> {
  const cookieStore = cookies();
  const token = (await cookieStore).get("session-token")?.value;

  if (!token) {
    return null;
  }

  return await getSession(token);
}
