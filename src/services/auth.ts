import { createHash } from "node:crypto";
import { nowIso, sqlite } from "../db/client";
import type { Admin } from "../db/schema";

const SESSION_DAYS = 7;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}

export async function hashPassword(password: string) {
  return Bun.password.hash(password, { algorithm: "argon2id", memoryCost: 19456, timeCost: 2 });
}

export async function verifyPassword(password: string, hash: string) {
  return Bun.password.verify(password, hash);
}

export function findAdminByEmail(email: string) {
  return sqlite.query(`SELECT * FROM admins WHERE email = ? COLLATE NOCASE AND is_active = 1`).get(email.trim().toLowerCase()) as Admin | null;
}

export async function createAdmin(name: string, email: string, password: string) {
  const now = nowIso();
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  sqlite.query(`INSERT INTO admins (id, name, email, password_hash, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)`).run(id, name.trim(), email.trim().toLowerCase(), passwordHash, now, now);
  return id;
}

export async function createSession(adminId: string) {
  const rawToken = randomToken();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 86_400_000).toISOString();
  sqlite.query(`INSERT INTO sessions (id, admin_id, expires_at, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?)`).run(hashToken(rawToken), adminId, expires, now.toISOString(), now.toISOString());
  return { rawToken, expires };
}

export function getAdminForSession(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const result = sqlite.query(`
    SELECT a.* FROM sessions s JOIN admins a ON a.id = s.admin_id
    WHERE s.id = ? AND s.expires_at > ? AND a.is_active = 1
  `).get(tokenHash, nowIso()) as Admin | null;
  if (result) sqlite.query(`UPDATE sessions SET last_seen_at = ? WHERE id = ?`).run(nowIso(), tokenHash);
  return result;
}

export function revokeSession(rawToken: string) {
  sqlite.query(`DELETE FROM sessions WHERE id = ?`).run(hashToken(rawToken));
}

export function cleanExpiredSessions() {
  sqlite.query(`DELETE FROM sessions WHERE expires_at <= ?`).run(nowIso());
}
