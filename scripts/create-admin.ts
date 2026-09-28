import "../src/config/env";
import { runMigrations } from "../src/db/migrate";
import { createAdmin, findAdminByEmail } from "../src/services/auth";

runMigrations();
const name = prompt("Nama admin: ")?.trim() ?? "";
const email = prompt("Email admin: ")?.trim() ?? "";

async function readSecret(label: string) {
  const input = process.stdin;
  process.stdout.write(label);
  if (!input.isTTY) return prompt("") ?? "";
  input.setRawMode(true);
  input.resume();
  return await new Promise<string>((resolve) => {
    let value = "";
    const onData = (chunk: Buffer) => {
      for (const character of chunk.toString()) {
        if (character === "\r" || character === "\n") {
          input.setRawMode(false);
          input.pause();
          input.off("data", onData);
          process.stdout.write("\n");
          resolve(value);
        } else if (character === "\u0003") {
          input.setRawMode(false);
          input.pause();
          input.off("data", onData);
          process.stdout.write("\n");
          resolve("");
        } else if (character === "\u007f") {
          value = value.slice(0, -1);
        } else {
          value += character;
        }
      }
    };
    input.on("data", onData);
  });
}

const password = await readSecret("Kata sandi admin (min. 12 karakter): ");

if (!name || !email || password.length < 12) {
  console.error("Nama, email, dan kata sandi minimal 12 karakter wajib diisi.");
  process.exit(1);
}
if (findAdminByEmail(email)) {
  console.error("Email admin sudah terdaftar.");
  process.exit(1);
}
await createAdmin(name, email, password);
console.log("Admin berhasil dibuat.");
