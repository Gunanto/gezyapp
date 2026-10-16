import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { APP_VERSION } from "./version";

// Cache-buster berbasis hash isi file: URL berubah otomatis setiap kali
// isi aset berubah, tanpa menunggu nomor versi dinaikkan manual.
// Jatuh kembali ke APP_VERSION bila file tidak terbaca.
function fileHash(relativePath: string): string {
  try {
    const data = readFileSync(resolve(import.meta.dir, "..", relativePath));
    return createHash("sha256").update(data).digest("hex").slice(0, 12);
  } catch {
    return APP_VERSION;
  }
}

export const STYLE_HASH = fileHash("static/style.css");
