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
export async function createSession(
  userId: string
): Promise<{ token: string; expiresAt: Date }> {
  try {
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const client = await pool.connect();
    try {
      // Delete any existing sessions for this user first
      await client.query("DELETE FROM sessions WHERE user_id = $1", [userId]);

      // Store new session in database
      await client.query(
        "INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [userId, token, expiresAt]
      );

      return { token, expiresAt };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating session:", error);
    throw new Error("Gagal membuat sesi");
  }
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("session_token")?.value;

    if (!token) {
      console.log("No session token found");
      return null;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const client = await pool.connect();
    try {
      // Check if session exists in database and is not expired
      const sessionResult = await client.query(
        `SELECT s.user_id, u.id_user, u.nama, u.email, u.no_telp 
         FROM sessions s 
         JOIN users u ON s.user_id = u.id_user 
         WHERE s.token = $1 AND s.expires_at > NOW()`,
        [token]
      );

      if (sessionResult.rows.length === 0) {
        console.log("No valid session found");
        return null;
      }

      return sessionResult.rows[0];
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

// Delete session
export async function deleteSession(token: string): Promise<void> {
  try {
    const client = await pool.connect();
    try {
      await client.query("DELETE FROM sessions WHERE token = $1", [token]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("deleteSession error:", error);
    throw new Error("Gagal menghapus sesi");
  }
}

// Validate user credentials
export async function validateUserCredentials(
  email: string,
  password: string
): Promise<User | null> {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT id_user, nama, email, no_telp FROM users WHERE email = $1 AND password = crypt($2, password)",
        [email, password]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("validateUserCredentials error:", error);
    throw new Error("Gagal memvalidasi kredensial");
  }
}
