import { Database } from "bun:sqlite";
import { config } from "../config/env";

export const sqlite = new Database(config.databasePath, { create: true });
sqlite.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");

export function nowIso() {
  return new Date().toISOString();
}

export function closeDatabase() {
  sqlite.close();
}
