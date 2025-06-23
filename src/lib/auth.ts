// lib/auth.ts
import { cookies } from "next/headers";
import pool from "./db";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

export interface User {
  id_user: string;
  nama: string;
  email: string;
  no_telp: string;
}

// Create session token
export async function createSession(userId: string): Promise<string> {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Store in database
  await pool.query(
    "INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)",
    [userId, token, expiresAt]
  );

  return token;
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("session-token")?.value;

    if (!token) {
      return null;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Check if session exists in database and is not expired
    const sessionResult = await pool.query(
      "SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()",
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return null;
    }

    // Get user data
    const userResult = await pool.query(
      "SELECT id_user, nama, email, no_telp FROM users WHERE id_user = $1",
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    return userResult.rows[0];
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

// Delete session
export async function deleteSession(token: string): Promise<void> {
  try {
    await pool.query("DELETE FROM sessions WHERE token = $1", [token]);
  } catch (error) {
    console.error("deleteSession error:", error);
  }
}
