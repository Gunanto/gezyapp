# GezyApp

Portal publik untuk membuka seluruh aplikasi GezyTech. Pengunjung dapat mencari aplikasi tanpa login; admin dapat mengelola katalog melalui panel terlindungi.

## Menjalankan lokal

```bash
bun install
cp .env.example .env
bun run db:migrate
bun run db:seed
bun run admin:create
bun run dev
```

Buka `http://localhost:3000`. Admin dapat masuk melalui `/admin/login`.

## Perintah

- `bun run dev` — server development dengan hot reload.
- `bun run start` — menjalankan server.
- `bun run typecheck` — pemeriksaan TypeScript.
- `bun run test` — pengujian.
- `bun run db:migrate` — membuat atau memperbarui tabel.
- `bun run db:seed` — memasukkan sembilan aplikasi awal.
- `bun run admin:create` — membuat akun admin pertama.

Versi aplikasi berada di `VERSION` dan mengikuti Semantic Versioning. Footer bersama menampilkan `© 2026 GezyTech. Dikembangkan oleh PakGun.` serta versi yang sedang berjalan.
