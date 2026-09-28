import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1).default("./storage/database/gezyapp.sqlite"),
  SESSION_SECRET: z.string().min(16).default("development-only-change-this-secret"),
  UPLOAD_DIR: z.string().min(1).default("./storage/uploads"),
  MAX_UPLOAD_MB: z.coerce.number().int().min(1).max(10).default(2),
  TRUST_PROXY: z.enum(["true", "false"]).default("false"),
});

const raw = envSchema.parse({
  NODE_ENV: Bun.env.NODE_ENV,
  PORT: Bun.env.PORT,
  APP_URL: Bun.env.APP_URL,
  DATABASE_URL: Bun.env.DATABASE_URL,
  SESSION_SECRET: Bun.env.SESSION_SECRET,
  UPLOAD_DIR: Bun.env.UPLOAD_DIR,
  MAX_UPLOAD_MB: Bun.env.MAX_UPLOAD_MB,
  TRUST_PROXY: Bun.env.TRUST_PROXY,
});

if (raw.NODE_ENV === "production" && raw.SESSION_SECRET === "development-only-change-this-secret") {
  throw new Error("SESSION_SECRET wajib diganti pada production.");
}

const projectRoot = resolve(import.meta.dir, "../..");
const resolveProjectPath = (value: string) => (isAbsolute(value) ? value : resolve(projectRoot, value));

export const config = {
  ...raw,
  databasePath: resolveProjectPath(raw.DATABASE_URL),
  uploadDir: resolveProjectPath(raw.UPLOAD_DIR),
  trustProxy: raw.TRUST_PROXY === "true",
};

mkdirSync(dirname(config.databasePath), { recursive: true });
mkdirSync(config.uploadDir, { recursive: true });
