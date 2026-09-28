# Rencana Implementasi GezyApp

## 1. Ringkasan produk

GezyApp adalah portal publik yang menjadi pintu masuk ke seluruh aplikasi web GezyTech. Pengunjung dapat melihat, mencari, menyaring, dan membuka aplikasi tanpa login. Admin masuk ke area khusus untuk mengelola aplikasi, kategori, deskripsi, ikon, urutan tampilan, serta status publikasi.

Nama kerja: **GezyApp**  
Lokasi proyek: `/home/pgun/dev/gezy/gezyapp`  
Bahasa antarmuka awal: Bahasa Indonesia  
Karakter visual: modern, ringan, ramah, dengan hijau gelap dan hijau terang sebagai warna utama.

Versi awal: **0.1.0**. Versi mengikuti [Semantic Versioning 2.0.0](https://semver.org/), disimpan pada file `VERSION`, dan harus disinkronkan dengan `package.json` ketika proyek mulai memiliki manifest. Versi yang sedang berjalan dibaca dari satu sumber ini agar footer, health check, log, dan metadata tidak memiliki nilai yang berbeda.

Footer global pada setiap halaman penuh publik, login, dan admin wajib memuat:

```text
© 2026 Gezy App ala PakGun. All rights reserved. · Versi 0.1.0
```

Bagian `Versi 0.1.0` dibentuk secara dinamis dari sumber versi; teks hak cipta tetap persis seperti di atas. Footer ditempatkan pada layout bersama sehingga halaman baru otomatis menggunakannya.

## 2. Tujuan

1. Menyediakan satu alamat yang mudah diingat untuk menemukan semua aplikasi GezyTech.
2. Membuat daftar aplikasi dapat dikelola tanpa mengubah kode atau melakukan deploy ulang.
3. Memberi pengunjung pengalaman cepat dan jelas di desktop maupun perangkat seluler.
4. Menyediakan fondasi yang mudah dikembangkan ketika jumlah aplikasi bertambah.

## 3. Batas MVP

### Fitur publik

- Beranda dapat diakses tanpa login.
- Hero singkat yang menjelaskan fungsi GezyApp.
- Kartu aplikasi berisi ikon/logo, nama, deskripsi singkat, kategori, dan tombol **Buka aplikasi**.
- Pencarian berdasarkan nama, deskripsi, dan kata kunci.
- Filter berdasarkan kategori.
- Aplikasi unggulan dan urutan aplikasi dapat ditentukan admin.
- Tautan aplikasi dibuka pada tab baru dengan atribut keamanan yang sesuai.
- Empty state ketika pencarian atau filter tidak menemukan aplikasi.
- Tampilan responsif dan aksesibel.
- Halaman informasi singkat, misalnya `/tentang`, dapat diaktifkan bila dibutuhkan.

### Fitur admin

- Login admin dan logout.
- Dashboard ringkas berisi jumlah aplikasi aktif, draf, dan kategori.
- Tambah, lihat, ubah, arsipkan, dan hapus aplikasi.
- Kelola nama, slug, URL, deskripsi singkat, deskripsi lengkap, ikon/logo, kategori, kata kunci, status, label unggulan, serta urutan.
- Kelola kategori.
- Pratinjau kartu sebelum dipublikasikan.
- Validasi URL dan pencegahan slug ganda.
- Pencatatan waktu pembuatan dan perubahan data.

### Di luar MVP

- Akun pengunjung dan single sign-on ke semua aplikasi.
- Pemantauan uptime real-time.
- Analitik kunjungan terperinci.
- Penilaian, komentar, atau favorit pengunjung.
- Aplikasi seluler native.
- Pembuatan deskripsi otomatis dengan AI.

Fitur di luar MVP dapat ditambahkan setelah portal dasar stabil. Struktur data tetap menyediakan ruang untuk penambahan metadata dan integrasi di kemudian hari.

## 4. Data awal aplikasi

Data berikut akan dimasukkan lewat proses seed agar dapat diedit oleh admin setelah instalasi.

| Nama awal | URL | Kategori awal | Status awal |
|---|---|---|---|
| GezyTeach | https://teach.gezytech.web.id/ | Pendidikan | Terbit |
| GezyCBT | https://cbt.gezytech.web.id/ | Pendidikan | Terbit |
| GezyClass | https://class.gezytech.web.id/ | Pendidikan | Terbit |
| GezyVote | https://vote.gezytech.web.id/ | Produktivitas | Terbit |
| GezyMath | https://math.gezytech.web.id/ | Pendidikan | Terbit |
| GezyTech Platform | https://platform.gezytech.web.id/ | Platform | Terbit |
| Gezy AIOS | https://aios.gezytech.web.id/ | AI dan Platform | Terbit |
| Gezy Games | https://games.gezytech.web.id/ | Permainan Edukasi | Terbit |
| GezyGame | https://game.gezytech.web.id/ | Permainan Edukasi | Terbit |

Deskripsi awal dibuat sebagai draf singkat dan diverifikasi admin sebelum peluncuran. `games.gezytech.web.id` dan `game.gezytech.web.id` tetap menjadi entri berbeda sampai fungsi keduanya dipastikan.

## 5. Arsitektur yang disarankan

Portal dibuat sebagai satu aplikasi web server-rendered agar mudah dipasang dan dirawat.

| Bagian | Pilihan | Alasan |
|---|---|---|
| Runtime | Bun | Selaras dengan proyek GezyTech lain dan cepat untuk pengembangan serta deployment. |
| Server | Hono + TypeScript | Ringan, sederhana, dan cocok untuk routing halaman serta API. |
| UI dinamis | Hono JSX + HTMX | Pencarian, filter, formulir, dan dialog dapat dinamis tanpa SPA penuh. |
| Gaya | CSS custom properties + stylesheet terpisah | Menjaga bundle kecil pada portal server-rendered sambil mempertahankan token warna dan responsif. |
| Basis data | SQLite melalui `bun:sqlite` | Cukup untuk portal satu admin atau tim kecil, mudah dicadangkan, dan tidak membutuhkan native dependency tambahan. |
| Query/migrasi | Service query TypeScript + migrasi SQL idempoten | Menjaga P0 tetap ringan; `drizzle.config.ts` disiapkan sebagai jalur migrasi ORM bila kebutuhan query berkembang. |
| Validasi | Zod | Validasi input yang sama pada server dan formulir. |
| Ikon UI | Lucide | Konsisten, ringan, dan mudah diakses. |
| Pengujian | Bun test + Playwright untuk alur utama | Menjaga logika data dan alur admin yang paling penting. |

Semua data penting diproses di server. JavaScript pada browser hanya meningkatkan interaksi; daftar aplikasi dasar tetap dapat digunakan ketika JavaScript gagal dimuat.

## 6. Struktur direktori target

```text
gezyapp/
├── src/
│   ├── index.ts                 # bootstrap server
│   ├── app.ts                   # konfigurasi Hono dan middleware
│   ├── config/                  # pembacaan dan validasi environment
│   ├── db/
│   │   ├── schema.ts
│   │   ├── client.ts
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── csrf.ts
│   │   └── rate-limit.ts
│   ├── routes/
│   │   ├── public.tsx
│   │   ├── auth.tsx
│   │   └── admin/
│   │       ├── dashboard.tsx
│   │       ├── applications.tsx
│   │       ├── categories.tsx
│   │       └── settings.tsx
│   ├── services/
│   │   ├── applications.ts
│   │   ├── categories.ts
│   │   ├── auth.ts
│   │   └── uploads.ts
│   ├── views/
│   │   ├── layouts/
│   │   ├── components/
│   │   ├── public/
│   │   └── admin/
│   └── static/
│       ├── input.css
│       ├── app.ts
│       └── images/
├── tests/
│   ├── unit/
│   └── e2e/
├── scripts/
│   ├── migrate.ts
│   ├── create-admin.ts
│   └── backup.ts
├── storage/
│   ├── database/
│   └── uploads/
├── .env.example
├── .gitignore
├── drizzle.config.ts
├── package.json
├── tsconfig.json
├── Dockerfile
├── README.md
├── VERSION
├── CHANGELOG.md
├── PRD.md
├── ISSUES.md
└── RENCANA_IMPLEMENTASI.md
```

Direktori `storage/` tidak dimasukkan ke Git kecuali file penanda direktori. Logo bawaan dapat diletakkan pada aset statis; unggahan admin disimpan di `storage/uploads/` atau object storage jika kebutuhan berkembang.

## 7. Model data

### `admins`

| Kolom | Tipe | Catatan |
|---|---|---|
| id | text/UUID | Primary key |
| name | text | Nama admin |
| email | text | Unik dan dinormalisasi |
| password_hash | text | Hash kata sandi, tidak pernah menyimpan kata sandi asli |
| is_active | boolean | Menonaktifkan akses tanpa menghapus akun |
| last_login_at | datetime nullable | Audit dasar |
| created_at | datetime | Otomatis |
| updated_at | datetime | Otomatis |

### `sessions`

| Kolom | Tipe | Catatan |
|---|---|---|
| id | text | Token acak yang disimpan sebagai hash |
| admin_id | text | Relasi ke admin |
| expires_at | datetime | Kedaluwarsa sesi |
| created_at | datetime | Otomatis |
| last_seen_at | datetime | Diperbarui berkala |

### `categories`

| Kolom | Tipe | Catatan |
|---|---|---|
| id | text/UUID | Primary key |
| name | text | Nama kategori |
| slug | text | Unik |
| description | text nullable | Keterangan opsional |
| sort_order | integer | Urutan tampilan |
| created_at | datetime | Otomatis |
| updated_at | datetime | Otomatis |

### `applications`

| Kolom | Tipe | Catatan |
|---|---|---|
| id | text/UUID | Primary key |
| name | text | Nama aplikasi |
| slug | text | Unik |
| url | text | Wajib HTTPS untuk data produksi |
| short_description | text | Ringkasan pada kartu |
| description | text nullable | Deskripsi lengkap |
| icon_path | text nullable | Ikon unggahan atau ikon bawaan |
| category_id | text nullable | Relasi kategori |
| keywords | text/JSON | Kata kunci pencarian |
| status | enum | `draft`, `published`, atau `archived` |
| is_featured | boolean | Ditampilkan lebih menonjol |
| sort_order | integer | Urutan manual |
| created_at | datetime | Otomatis |
| updated_at | datetime | Otomatis |
| published_at | datetime nullable | Waktu pertama terbit |

### `audit_logs` (disarankan)

Mencatat admin, aksi, jenis entitas, ID entitas, ringkasan perubahan, alamat IP, dan waktu. Audit log memberi jejak perubahan ketika jumlah admin bertambah.

## 8. Halaman dan rute

### Publik

| Metode | Rute | Fungsi |
|---|---|---|
| GET | `/` | Beranda dan daftar aplikasi terbit |
| GET | `/aplikasi` | Daftar lengkap, pencarian, dan filter |
| GET | `/aplikasi/:slug` | Detail aplikasi; dapat ditunda bila kartu sudah cukup |
| GET | `/tentang` | Informasi GezyApp |
| GET | `/partials/applications` | Hasil daftar untuk pembaruan HTMX |
| GET | `/health` | Pemeriksaan kesehatan deployment |

Parameter daftar: `q`, `category`, dan `page`. Status `draft` atau `archived` tidak pernah dikirim melalui rute publik.

### Autentikasi

| Metode | Rute | Fungsi |
|---|---|---|
| GET | `/admin/login` | Form login |
| POST | `/admin/login` | Memverifikasi kredensial dan membuat sesi |
| POST | `/admin/logout` | Mengakhiri sesi |

### Admin

| Metode | Rute | Fungsi |
|---|---|---|
| GET | `/admin` | Dashboard |
| GET/POST | `/admin/applications` | Daftar dan tambah aplikasi |
| GET/POST | `/admin/applications/:id/edit` | Form dan simpan perubahan |
| POST | `/admin/applications/:id/archive` | Arsipkan aplikasi |
| POST | `/admin/applications/:id/delete` | Hapus setelah konfirmasi |
| GET/POST | `/admin/categories` | Kelola kategori |
| GET/POST | `/admin/settings` | Identitas portal dan pengaturan tampilan |

Semua operasi perubahan memakai `POST` dan token CSRF. Setelah MVP stabil, endpoint data dapat dipisah menjadi `/api/v1` bila ada klien lain yang memerlukannya.

## 9. Arah desain

### Palet awal

| Token | Warna | Penggunaan |
|---|---|---|
| `forest-950` | `#052E24` | Latar hero, footer, dan teks kuat |
| `forest-800` | `#0B4F3C` | Navigasi dan elemen utama |
| `emerald-600` | `#059669` | Tombol utama dan status aktif |
| `lime-400` | `#A3E635` | Aksen kecil dan sorotan |
| `mint-50` | `#ECFDF5` | Latar lembut |
| `paper` | `#F8FAF8` | Latar halaman |
| `slate-700` | `#334155` | Teks isi |

### Prinsip tampilan

- Hero hijau gelap dengan aksen cahaya hijau lembut dan kalimat singkat.
- Kartu memakai permukaan terang, sudut membulat, bayangan halus, serta ikon yang mudah dikenali.
- Animasi pendek hanya untuk hover, fokus, pemuatan, dan perubahan hasil filter.
- Tidak memakai carousel untuk daftar utama agar semua aplikasi mudah ditemukan.
- Grid 1 kolom pada ponsel, 2 kolom pada tablet, dan 3–4 kolom pada desktop.
- Fokus keyboard terlihat jelas, target sentuh minimal 44 px, kontras teks mengikuti WCAG AA.
- Mendukung `prefers-reduced-motion`.

Contoh susunan beranda:

```text
┌─────────────────────────────────────────────────────┐
│ Logo GezyApp            Aplikasi  Tentang  Admin    │
├─────────────────────────────────────────────────────┤
│ Semua aplikasi GezyTech dalam satu tempat           │
│ [ Cari aplikasi...                         ]         │
│ [Semua] [Pendidikan] [AI] [Permainan] [Platform]    │
├─────────────────────────────────────────────────────┤
│ Aplikasi unggulan                                   │
│ [ kartu aplikasi ] [ kartu aplikasi ] [ kartu ]     │
│                                                     │
│ Semua aplikasi                                      │
│ [ kartu ] [ kartu ] [ kartu ] [ kartu ]             │
├─────────────────────────────────────────────────────┤
│ Footer: GezyTech · Tentang · Kontak                 │
└─────────────────────────────────────────────────────┘
```

## 10. Autentikasi dan keamanan

- Admin pertama dibuat lewat perintah CLI, bukan form registrasi publik.
- Kata sandi di-hash dengan Argon2id atau fasilitas password hashing Bun yang setara.
- Cookie sesi memakai `HttpOnly`, `Secure`, dan `SameSite=Lax` di produksi.
- ID sesi disimpan sebagai hash di basis data dan dirotasi setelah login.
- Semua form perubahan dilindungi CSRF.
- Login memiliki rate limit dan penundaan progresif setelah kegagalan berulang.
- Input divalidasi di server; output HTML di-escape secara bawaan.
- Unggahan dibatasi pada tipe gambar yang disetujui, ukuran maksimum, nama acak, dan verifikasi isi file.
- URL aplikasi hanya menerima `https://` di produksi; skema seperti `javascript:` ditolak.
- Header keamanan dasar: CSP, `X-Content-Type-Options`, `Referrer-Policy`, dan pembatasan framing.
- Error produksi tidak menampilkan stack trace atau detail basis data.
- Database dan unggahan dicadangkan berkala; proses pemulihan diuji.

## 11. Variabel environment

```dotenv
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000
DATABASE_URL=./storage/database/gezyapp.sqlite
SESSION_SECRET=ganti-dengan-nilai-acak-yang-panjang
UPLOAD_DIR=./storage/uploads
MAX_UPLOAD_MB=2
TRUST_PROXY=false
```

`.env.example` hanya memuat contoh aman. Secret dan basis data produksi tidak masuk ke Git.

Untuk produksi, gunakan `APP_URL=https://gezytech.web.id`.

## 12. Tahapan implementasi

### Tahap 1 — Fondasi

- Inisialisasi Bun, TypeScript, Hono, HTMX, CSS custom properties, dan struktur direktori.
- Tambahkan konfigurasi environment, logging, error handler, dan health check.
- Buat skema database `bun:sqlite`, migrasi SQL idempoten, seed kategori, dan sembilan aplikasi awal.
- Tambahkan perintah `dev`, `build`, `start`, `typecheck`, `test`, `db:migrate`, `db:seed`, dan `admin:create`.

Hasil: server dapat berjalan, database terbentuk, dan data awal tersedia.

### Tahap 2 — Portal publik

- Buat layout, navigasi, hero, pencarian, filter kategori, kartu, empty state, dan footer.
- Tambahkan pembaruan hasil dengan HTMX dan URL query yang tetap dapat dibagikan.
- Pastikan responsif, navigasi keyboard, metadata SEO, Open Graph, favicon, dan sitemap.

Hasil: pengunjung dapat menemukan dan membuka seluruh aplikasi tanpa login.

### Tahap 3 — Login dan admin

- Buat CLI admin pertama, login, session store, logout, middleware auth, CSRF, dan rate limit.
- Buat dashboard serta CRUD aplikasi dan kategori.
- Tambahkan unggah ikon, pratinjau, status draf/terbit/arsip, unggulan, dan urutan.

Hasil: isi portal dapat dikelola dari browser dengan akses terbatas.

### Tahap 4 — Mutu dan deployment

- Uji unit untuk validasi, autentikasi, query daftar, dan aturan status publikasi.
- Uji end-to-end untuk akses publik, login gagal/berhasil, CRUD, pencarian, filter, dan logout.
- Audit aksesibilitas, keamanan header, ukuran aset, dan performa seluler.
- Siapkan Dockerfile atau service systemd, reverse proxy, HTTPS, backup, dan panduan operasi.

Hasil: aplikasi siap dipasang dan dipelihara.

## 13. Kriteria penerimaan MVP

- Semua sembilan URL awal tampil sebagai aplikasi terbit dan dapat dibuka.
- Pengunjung tidak diminta login untuk melihat atau membuka aplikasi.
- Pencarian dan filter bekerja pada ponsel serta desktop.
- Admin yang belum login selalu dialihkan ke halaman login ketika membuka rute admin.
- Admin dapat menambah aplikasi baru tanpa mengubah kode.
- Admin dapat mengubah deskripsi, URL, ikon, kategori, status, unggulan, dan urutan.
- Entri draf dan arsip tidak muncul di halaman publik.
- URL tidak valid, unggahan terlarang, dan slug ganda ditolak dengan pesan yang jelas.
- Sesi logout tidak dapat dipakai kembali.
- Halaman utama tetap berfungsi secara dasar tanpa JavaScript browser.
- Pemeriksaan tipe, pengujian penting, dan build produksi berhasil.
- Database serta unggahan dapat dicadangkan dan dipulihkan menggunakan prosedur terdokumentasi.

## 14. Rencana pengujian minimum

| Area | Skenario utama |
|---|---|
| Publik | Daftar hanya memuat aplikasi terbit; pencarian dan filter dapat dikombinasikan. |
| Tautan | Tombol menuju URL yang benar dan aman ketika membuka tab baru. |
| Login | Kredensial benar berhasil; kredensial salah ditolak; rate limit berlaku. |
| Otorisasi | Semua rute admin menolak pengguna tanpa sesi valid. |
| CRUD | Tambah, ubah, arsip, terbitkan, urutkan, dan hapus sesuai aturan. |
| Validasi | HTTPS, slug unik, kolom wajib, panjang deskripsi, dan unggahan file. |
| Sesi | Kedaluwarsa, logout, cookie aman, dan token yang dicabut tidak berlaku. |
| Aksesibilitas | Keyboard, fokus, label form, kontras, dan reduced motion. |
| Responsif | Lebar 360 px, tablet, laptop, dan layar besar. |

## 15. Deployment dan operasi

- Target awal: satu instance Bun di belakang Caddy atau Nginx dengan HTTPS.
- Proses aplikasi berjalan sebagai user non-root.
- `storage/database` dan `storage/uploads` dipasang sebagai volume persisten.
- Migrasi dijalankan sebelum versi baru menerima trafik.
- Backup harian menyimpan database dan unggahan ke lokasi terpisah dengan retensi yang ditentukan.
- Health check memeriksa proses dan akses database tanpa membocorkan data sensitif.
- Log menggunakan format terstruktur dan tidak merekam kata sandi, cookie, token, atau isi form sensitif.
- Prosedur rollback mencakup image/aplikasi versi sebelumnya dan backup sebelum migrasi berisiko.

## 16. Pengembangan setelah MVP

Urutan yang disarankan setelah penggunaan nyata memberi data kebutuhan:

1. Pemeriksaan status aplikasi terjadwal dan indikator gangguan.
2. Analitik klik sederhana yang menghormati privasi.
3. Role admin (`owner`, `editor`) dan audit log lengkap.
4. Import/export katalog dalam JSON atau CSV.
5. Object storage untuk ikon dan gambar.
6. API publik terbatas untuk menampilkan katalog di situs GezyTech lain.
7. Tema gelap bila ada kebutuhan pengguna.

## 17. Keputusan sebelum deployment produksi

Hal berikut tidak menghambat implementasi awal, tetapi perlu ditetapkan sebelum peluncuran:

- Deskripsi final setiap aplikasi; MVP memakai deskripsi sementara yang dapat diedit admin.
- Alamat kontak tambahan di footer, bila diperlukan selain copyright wajib.
- Metode deployment yang dipakai: Docker, systemd, atau platform hosting yang sudah tersedia.
- Lokasi serta retensi backup produksi.

## 18. Urutan kerja yang direkomendasikan

Mulai dari Tahap 1 dan Tahap 2 agar bentuk produk publik dapat ditinjau lebih cepat. Setelah tampilan dan struktur katalog disetujui, lanjutkan autentikasi serta CRUD admin. Pendekatan ini menjaga model data tetap menjadi sumber tunggal bagi halaman publik dan panel admin sejak awal.
