# Backlog Implementasi GezyApp

Dokumen ini memecah `PRD.md` dan `RENCANA_IMPLEMENTASI.md` menjadi pekerjaan yang dapat dilaksanakan. Checkbox menjadi status lokal dan dapat dipindahkan menjadi GitHub Issues ketika repository dibuat.

## Konvensi

### Status

- `[ ]` belum dikerjakan
- `[x]` selesai dan memenuhi acceptance criteria
- Tambahkan `BLOCKED:` pada judul bila pekerjaan menunggu keputusan atau dependensi eksternal.

### Prioritas

- `P0`: wajib untuk MVP
- `P1`: penting, dapat dikerjakan setelah P0 jika jadwal terbatas
- `P2`: setelah MVP

### Ukuran

- `S`: perubahan kecil dan terlokalisasi
- `M`: beberapa komponen atau satu alur lengkap
- `L`: alur lintas lapisan yang perlu dipecah saat implementasi bila terlalu besar

### Definition of Done

Sebuah issue selesai ketika:

- Acceptance criteria issue terpenuhi.
- Perilaku sesuai PRD dan tidak membuka data draf/arsip ke publik.
- Typecheck dan pengujian yang relevan lulus.
- Antarmuka baru dapat digunakan dengan keyboard dan pada lebar 360 px.
- Tidak ada secret, data produksi, atau artefak runtime yang masuk Git.
- Dokumentasi diperbarui bila perintah, environment, data, atau operasi berubah.

## Milestone 0 — Keputusan produk

### [ ] GZY-001 — Konfirmasi identitas dan konten awal

**Prioritas:** P0  
**Ukuran:** S  
**Dependensi:** tidak ada

Tetapkan konten minimum yang diperlukan agar portal dapat ditinjau dan diluncurkan.

**Checklist:**

- [x] Tentukan nama tampilan final: GezyApp.
- [x] Tetapkan domain produksi: `https://gezytech.web.id`.
- [x] Sediakan ikon GezyApp dan fallback hijau untuk aplikasi tanpa ikon.
- [ ] Verifikasi nama dan fungsi kesembilan aplikasi awal.
- [ ] Bedakan fungsi `games.gezytech.web.id` dan `game.gezytech.web.id`.
- [x] Setujui penggunaan deskripsi sementara serta kategori awal yang dapat diedit admin.
- [ ] Tentukan teks kontak tambahan bila footer memerlukan tautan atau alamat kontak.

**Acceptance criteria:**

- Konten yang belum tersedia diberi fallback eksplisit dan tidak menghambat pengembangan.
- Semua keputusan final dicatat pada PRD atau data seed.

## Milestone 1 — Fondasi aplikasi

### [x] GZY-010 — Inisialisasi proyek Bun dan TypeScript

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** tidak ada

**Cakupan:**

- Buat `package.json`, lockfile, `tsconfig.json`, dan struktur sumber awal.
- Pasang Hono, Zod, HTMX, dan dependensi pendukung yang diperlukan; gunakan `bun:sqlite` untuk database P0.
- Sediakan perintah `dev`, `build`, `start`, `typecheck`, dan `test`.
- Tambahkan `.gitignore` dan README awal.

**Acceptance criteria:**

- `bun install` selesai tanpa error.
- Server pengembangan dapat dijalankan dengan satu perintah.
- `bun run typecheck` dan build kosong lulus.
- Repository tidak melacak `.env`, database, unggahan, atau hasil build.

### [x] GZY-011 — Buat konfigurasi environment bertipe

**Prioritas:** P0  
**Ukuran:** S  
**Dependensi:** GZY-010

**Cakupan:**

- Validasi `NODE_ENV`, `PORT`, `APP_URL`, `DATABASE_URL`, `SESSION_SECRET`, `UPLOAD_DIR`, `MAX_UPLOAD_MB`, dan `TRUST_PROXY` menggunakan Zod.
- Buat `.env.example` dengan nilai development yang aman.
- Hentikan startup dengan pesan jelas ketika konfigurasi wajib tidak valid.

**Acceptance criteria:**

- Konfigurasi valid tersedia sebagai object bertipe.
- Secret produksi tidak memiliki default yang lemah.
- Tes mencakup konfigurasi valid dan konfigurasi wajib yang hilang.

### [x] GZY-012 — Siapkan aplikasi Hono, logging, dan error handling

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-010, GZY-011

**Cakupan:**

- Buat bootstrap server dan komposisi route.
- Tambahkan request ID, structured logging, halaman 404, dan error handler produksi.
- Pastikan data sensitif tidak dicatat.

**Acceptance criteria:**

- Server merespons halaman dasar dan 404 yang benar.
- Error tak tertangani dicatat dengan request ID.
- Respons produksi tidak menampilkan stack trace.

### [x] GZY-013 — Implementasikan skema database dan migrasi awal

**Prioritas:** P0  
**Ukuran:** L  
**Dependensi:** GZY-010, GZY-011

**Cakupan:**

- Buat tabel `admins`, `sessions`, `categories`, dan `applications`.
- Tambahkan constraint unik, foreign key, indeks pencarian yang dibutuhkan, dan timestamp.
- Tambahkan tabel `audit_logs` bila diputuskan masuk MVP; jika tidak, catat sebagai issue P1.
- Sediakan perintah generate dan migrate.

**Acceptance criteria:**

- Database baru dapat dibentuk hanya dari migrasi.
- Constraint slug/email unik dan relasi bekerja.
- Migrasi pada database kosong lulus dalam pengujian.

### [x] GZY-014 — Buat seed kategori dan sembilan aplikasi awal

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-001, GZY-013

**Cakupan:**

- Seed kategori awal.
- Seed kesembilan URL dari PRD.
- Sediakan deskripsi dan ikon/fallback awal.
- Buat proses seed aman dijalankan ulang tanpa duplikasi.

**Acceptance criteria:**

- Semua sembilan aplikasi tersedia setelah seed.
- Menjalankan seed dua kali tidak menggandakan data.
- `games` dan `game` menjadi entri terpisah.

### [x] GZY-015 — Tambahkan health check

**Prioritas:** P0  
**Ukuran:** S  
**Dependensi:** GZY-012, GZY-013

**Cakupan:**

- Buat `GET /health` untuk memeriksa proses dan akses database.
- Jangan tampilkan path, secret, versi dependency, atau detail error internal.

**Acceptance criteria:**

- Kondisi sehat menghasilkan HTTP 200.
- Kegagalan database menghasilkan status non-200 yang sesuai.
- Respons hanya memuat informasi operasional minimum.

### [x] GZY-016 — Terapkan versioning SemVer dan sumber versi tunggal

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-010

**Cakupan:**

- Tetapkan versi awal `0.1.0` pada file `VERSION`.
- Saat `package.json` dibuat, sinkronkan field `version` dengan `VERSION`.
- Buat helper pembacaan dan validasi SemVer untuk runtime.
- Dokumentasikan aturan MAJOR/MINOR/PATCH, pre-release, build metadata, dan tag `vX.Y.Z`.
- Tambahkan `CHANGELOG.md` dan prosedur rilis.

**Acceptance criteria:**

- `VERSION` berisi tepat satu versi valid SemVer tanpa awalan `v`.
- Aplikasi gagal startup atau build bila sumber versi invalid.
- Runtime tidak menyimpan salinan versi hard-coded yang dapat berbeda.
- Changelog memuat entri `0.1.0` dan perubahan berikutnya memiliki tempat yang jelas.
- Test mencakup versi normal, pre-release, build metadata, dan versi invalid.

## Milestone 2 — Portal publik

### [x] GZY-020 — Bangun design system dan layout publik

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-010

**Cakupan:**

- Terapkan token hijau dari PRD, tipografi, spacing, radius, shadow, dan focus ring.
- Buat layout, header, navigasi, dan footer responsif.
- Siapkan komponen tombol, badge, input, dan notifikasi dasar.
- Hormati `prefers-reduced-motion`.

**Acceptance criteria:**

- Layout bekerja pada lebar 360 px, tablet, dan desktop.
- Seluruh kontrol memiliki fokus keyboard yang terlihat.
- Kontras teks dan tindakan utama memenuhi WCAG AA.

### [x] GZY-021 — Implementasikan query katalog publik

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-013, GZY-014

**Cakupan:**

- Ambil hanya aplikasi `published`.
- Dukung `q` dan `category` secara bersamaan.
- Cari nama, deskripsi singkat, dan kata kunci.
- Urutkan berdasarkan `sort_order`, lalu nama.
- Kembalikan daftar kategori publik yang relevan.

**Acceptance criteria:**

- Draf dan arsip tidak pernah keluar dari service/query publik.
- Query kosong menampilkan seluruh aplikasi terbit.
- Pencarian case-insensitive dan kombinasi filter diuji.

### [x] GZY-022 — Buat beranda dan kartu aplikasi

**Prioritas:** P0  
**Ukuran:** L  
**Dependensi:** GZY-020, GZY-021

**Cakupan:**

- Buat hero, area unggulan, grid semua aplikasi, kartu, ikon fallback, dan empty state.
- Tampilkan nama, deskripsi singkat, kategori, dan tombol **Buka aplikasi**.
- Buka aplikasi pada tab baru memakai `noopener`/`noreferrer` yang sesuai.

**Acceptance criteria:**

- Kesembilan aplikasi seed terbit dapat tampil.
- Kartu tetap rapi untuk nama/deskripsi pada batas panjang yang diizinkan.
- Tautan menuju URL yang tersimpan dan aman terhadap reverse tabnabbing.

### [x] GZY-023 — Tambahkan pencarian dan filter dinamis

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-021, GZY-022

**Cakupan:**

- Buat form pencarian dan filter kategori.
- Gunakan HTMX untuk memperbarui daftar tanpa reload penuh.
- Pertahankan progressive enhancement melalui form GET.
- Sinkronkan state ke query URL.

**Acceptance criteria:**

- Pencarian/filter bekerja dengan dan tanpa JavaScript.
- URL hasil dapat disalin dan membuka state yang sama.
- Empty state muncul ketika hasil kosong dan menyediakan tindakan reset.

### [x] GZY-024 — Tambahkan metadata, favicon, sitemap, dan robots

**Prioritas:** P0  
**Ukuran:** S  
**Dependensi:** GZY-022, GZY-001

**Cakupan:**

- Title dan meta description.
- Canonical URL, Open Graph, favicon, `robots.txt`, dan `sitemap.xml`.
- Metadata tidak memuat halaman admin.

**Acceptance criteria:**

- Metadata memakai domain/config yang benar.
- Sitemap hanya memuat URL publik.
- Preview tautan memiliki judul, deskripsi, dan gambar/fallback yang layak.

### [x] GZY-026 — Buat footer global dengan copyright dan versi

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-016, GZY-020, GZY-022

**Cakupan:**

- Buat komponen/layout footer bersama untuk halaman publik, login, dan admin.
- Render teks persis `© 2026 GezyTech. Dikembangkan oleh PakGun.`.
- Render versi dari helper sumber versi, dengan format `Versi X.Y.Z`.
- Pastikan footer tetap berada di bawah konten pada layar pendek dan responsif pada ponsel.
- Jangan merender footer di partial HTMX yang hanya mengganti daftar aplikasi.

**Acceptance criteria:**

- Footer muncul satu kali pada beranda, daftar/detail, Tentang, login, dashboard, dan halaman admin.
- Teks hak cipta sama persis, termasuk simbol `©`, tahun, kapitalisasi, dan tanda titik.
- Versi berubah otomatis ketika `VERSION` berubah.
- Tidak ada footer ganda setelah pencarian/filter HTMX.
- Footer lulus pemeriksaan keyboard, kontras, dan lebar 360 px.

### [x] GZY-025 — Buat halaman detail dan Tentang

**Prioritas:** P1  
**Ukuran:** M  
**Dependensi:** GZY-020, GZY-021, keputusan GZY-001

**Cakupan:**

- Buat `/aplikasi/:slug` untuk detail aplikasi terbit.
- Buat `/tentang` dengan konten produk dan kontak.
- Kembalikan 404 untuk slug draf, arsip, atau tidak ditemukan.

**Acceptance criteria:**

- Tidak ada data nonpublik yang bocor melalui halaman detail.
- Halaman memiliki navigasi kembali dan metadata yang benar.

## Milestone 3 — Autentikasi admin

### [x] GZY-030 — Buat CLI admin pertama

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-013

**Cakupan:**

- Buat perintah interaktif atau parameter aman untuk nama/email.
- Baca kata sandi tanpa mencetaknya ke terminal.
- Hash kata sandi dengan algoritma yang disetujui.
- Tolak email ganda dan kata sandi yang tidak memenuhi minimum.

**Acceptance criteria:**

- Admin dapat dibuat tanpa route registrasi publik.
- Kata sandi asli tidak tampil di log, argumen process list, atau database.
- Akun hasil CLI dapat digunakan untuk login.

### [x] GZY-031 — Implementasikan session store dan middleware auth

**Prioritas:** P0  
**Ukuran:** L  
**Dependensi:** GZY-011, GZY-013

**Cakupan:**

- Buat token acak kuat dan simpan hanya hash token.
- Terapkan masa berlaku, pencabutan, dan pembersihan sesi kedaluwarsa.
- Gunakan cookie `HttpOnly`, `SameSite=Lax`, dan `Secure` di produksi.
- Buat middleware perlindungan rute admin.

**Acceptance criteria:**

- Pengguna tanpa sesi diarahkan ke login.
- Sesi kedaluwarsa dan dicabut ditolak.
- Cookie tidak dapat diakses JavaScript browser.
- Tes mencakup sesi valid, kedaluwarsa, dan tidak valid.

### [x] GZY-032 — Bangun login dan logout admin

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-020, GZY-030, GZY-031

**Cakupan:**

- Buat halaman dan handler login.
- Normalisasi email dan gunakan pesan gagal yang umum.
- Rotasi/buat sesi setelah autentikasi berhasil.
- Buat logout POST yang mencabut sesi.

**Acceptance criteria:**

- Login benar menuju dashboard.
- Login salah tidak mengungkap apakah email terdaftar.
- Setelah logout, cookie/sesi lama tidak dapat digunakan.
- Parameter tujuan setelah login hanya menerima path lokal yang aman.

### [x] GZY-033 — Tambahkan CSRF dan rate limit login

**Prioritas:** P0  
**Ukuran:** L  
**Dependensi:** GZY-031, GZY-032

**Cakupan:**

- Lindungi semua form yang mengubah data dengan token CSRF.
- Batasi percobaan login berdasarkan kombinasi alamat dan identitas secara wajar.
- Tangani konfigurasi reverse proxy dengan aman.

**Acceptance criteria:**

- Permintaan perubahan tanpa token valid ditolak.
- Percobaan login berulang menghasilkan HTTP 429 atau penundaan terukur.
- Respons tidak membocorkan akun yang terdaftar.
- Pengujian mencakup token hilang, salah, benar, dan rate limit.

### [x] GZY-034 — Tambahkan security headers

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-012, GZY-023, GZY-032

**Cakupan:**

- Konfigurasi CSP yang kompatibel dengan HTMX dan aset lokal.
- Tambahkan `X-Content-Type-Options`, `Referrer-Policy`, aturan framing, dan header lain yang relevan.
- Hindari inline script/style yang memaksa CSP longgar.

**Acceptance criteria:**

- Halaman publik dan admin tetap berfungsi dengan CSP aktif.
- Aplikasi tidak dapat di-frame oleh origin yang tidak diizinkan.
- Pemeriksaan header produksi lulus.

## Milestone 4 — Panel admin

### [x] GZY-040 — Buat layout admin dan dashboard

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-020, GZY-031, GZY-032

**Cakupan:**

- Buat navigasi admin responsif.
- Tampilkan jumlah aplikasi terbit, draf, arsip, dan kategori.
- Tampilkan pintasan tambah aplikasi serta logout.

**Acceptance criteria:**

- Hanya admin aktif dengan sesi valid yang dapat mengakses dashboard.
- Angka dashboard sama dengan data database.
- Navigasi dapat digunakan pada ponsel dan keyboard.

### [x] GZY-041 — Buat daftar dan pencarian aplikasi admin

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-040, GZY-013

**Cakupan:**

- Tampilkan nama, URL/domain, kategori, status, unggulan, urutan, dan waktu perubahan.
- Dukung pencarian dan filter status/kategori.
- Sediakan tindakan edit dan arsip dengan label yang jelas.

**Acceptance criteria:**

- Semua status dapat dilihat admin.
- Daftar tetap dapat digunakan pada layar sempit.
- State kosong dan hasil pencarian kosong ditangani.

### [x] GZY-042 — Implementasikan tambah dan edit aplikasi

**Prioritas:** P0  
**Ukuran:** L  
**Dependensi:** GZY-033, GZY-041

**Cakupan:**

- Buat schema validasi dan service create/update.
- Buat form nama, slug, URL, deskripsi, kategori, kata kunci, status, unggulan, dan urutan.
- Pertahankan nilai input dan tampilkan error per field ketika validasi gagal.
- Tambahkan pratinjau kartu.

**Acceptance criteria:**

- Admin dapat menyimpan draf dan menerbitkan aplikasi.
- Slug ganda, URL tidak aman, dan field wajib yang kosong ditolak.
- Error terkait dengan field dan dapat dibaca screen reader.
- Perubahan terbit terlihat pada katalog publik.

### [x] GZY-043 — Implementasikan arsip dan hapus aplikasi

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-033, GZY-041

**Cakupan:**

- Tambahkan tindakan arsip dan pemulihan dari arsip bila diperlukan.
- Tambahkan penghapusan permanen dengan dialog/halaman konfirmasi.
- Cegah tindakan melalui GET.

**Acceptance criteria:**

- Entri yang diarsipkan segera hilang dari publik.
- Penghapusan tidak dapat terjadi tanpa POST, CSRF valid, dan konfirmasi.
- Penghapusan ikon terkait tidak menyebabkan file milik entri lain hilang.

### [x] GZY-044 — Implementasikan CRUD kategori

**Prioritas:** P0  
**Ukuran:** L  
**Dependensi:** GZY-033, GZY-040

**Cakupan:**

- Buat daftar, tambah, edit, dan pengurutan kategori.
- Validasi nama/slug unik.
- Terapkan aturan ketika kategori masih dipakai aplikasi.

**Acceptance criteria:**

- Kategori dapat dibuat dan digunakan pada form aplikasi.
- Kategori aktif tampil pada filter publik sesuai aturan PRD.
- Penghapusan tidak menghasilkan orphaned reference.

### [x] GZY-045 — Implementasikan unggah ikon aman

**Prioritas:** P0  
**Ukuran:** L  
**Dependensi:** GZY-011, GZY-033, GZY-042

**Cakupan:**

- Terima hanya format gambar yang disetujui.
- Verifikasi MIME dan signature, ukuran, serta dimensi.
- Buat nama acak dan simpan di direktori persisten.
- Optimalkan gambar bila library pemrosesan dipakai.
- Sediakan fallback ketika ikon tidak ada/gagal.

**Acceptance criteria:**

- Berkas non-gambar, oversized, dan format tidak diizinkan ditolak.
- Nama/path dari pengguna tidak dapat menentukan lokasi file.
- Ikon baru muncul pada pratinjau dan katalog setelah disimpan.
- File lama ditangani tanpa menghapus file yang masih direferensikan.

### [x] GZY-046 — Tambahkan metadata akses, harga, dan visibilitas card

**Prioritas:** P0
**Ukuran:** M
**Dependensi:** GZY-022, GZY-042

**Cakupan:**

- Tambahkan pilihan akses `Publik · tanpa akun` atau `Perlu akun masuk`.
- Tambahkan pilihan harga `Gratis`, `Berbayar`, atau `Freemium`.
- Beri admin kontrol terpisah untuk menampilkan badge akses dan badge harga pada card publik.
- Pertahankan data lama melalui migrasi dengan default publik dan gratis.

**Acceptance criteria:**

- Card publik menampilkan badge yang dipilih admin.
- Admin dapat menyembunyikan salah satu atau kedua badge tanpa menghapus nilai metadata.
- Form tambah dan edit menyimpan pilihan metadata dengan validasi.
- Migrasi database lama dan pengujian aplikasi lulus.

### [ ] GZY-048 — Tambahkan pengaturan urutan aplikasi

**Prioritas:** P1  
**Ukuran:** M  
**Dependensi:** GZY-041, GZY-042

**Cakupan:**

- Sediakan kontrol urutan yang dapat dipakai keyboard.
- Simpan urutan deterministik dan tangani nilai yang sama.

**Acceptance criteria:**

- Admin dapat mengubah urutan tanpa mengedit setiap record secara manual.
- Urutan publik konsisten setelah refresh.

### [x] GZY-049 — Tambahkan pratinjau screenshot pada aplikasi

**Prioritas:** P1
**Ukuran:** L
**Dependensi:** GZY-025, GZY-042, GZY-045

**Cakupan:**

- Tambahkan tombol **Lihat** pada card publik menuju halaman detail aplikasi.
- Sediakan galeri screenshot pada halaman detail.
- Izinkan admin mengunggah dan menghapus hingga enam screenshot per aplikasi.
- Validasi tipe, signature, dan ukuran screenshot serta simpan di direktori upload persisten.

**Acceptance criteria:**

- Card menampilkan tombol **Lihat** dan **Buka Aplikasi** secara berdampingan.
- Halaman detail tetap informatif ketika belum ada screenshot.
- Screenshot baru muncul setelah disimpan dan dapat dihapus dengan CSRF valid.
- Data screenshot terhapus otomatis saat aplikasi dihapus.

### [ ] GZY-047 — Tambahkan audit log perubahan penting

**Prioritas:** P1  
**Ukuran:** L  
**Dependensi:** GZY-013, GZY-031, GZY-042, GZY-044

**Cakupan:**

- Catat login berhasil, logout, create/update/status/delete aplikasi, dan perubahan kategori.
- Simpan admin, waktu, jenis aksi, entity ID, dan ringkasan aman.
- Jangan simpan kata sandi, token, atau isi sensitif.

**Acceptance criteria:**

- Setiap operasi yang ditentukan menghasilkan satu audit event.
- Audit tidak dapat diakses oleh pengunjung.
- Data sensitif tidak muncul dalam payload audit.

## Milestone 5 — Kualitas dan keamanan

### [ ] GZY-050 — Lengkapi pengujian unit dan integrasi

**Prioritas:** P0  
**Ukuran:** L  
**Dependensi:** GZY-021, GZY-031, GZY-033, GZY-042, GZY-044, GZY-045

**Cakupan:**

- Query publik dan aturan status.
- Validasi aplikasi/kategori/URL/slug.
- Hash/verifikasi kata sandi dan lifecycle sesi.
- CSRF, rate limit, otorisasi admin, dan upload validation.
- Migrasi database kosong.

**Acceptance criteria:**

- Seluruh aturan bisnis P0 memiliki pengujian bermakna.
- Test memakai database/penyimpanan terisolasi.
- Suite dapat dijalankan dengan satu perintah dan lulus konsisten.

### [ ] GZY-051 — Tambahkan pengujian end-to-end alur utama

**Prioritas:** P0  
**Ukuran:** L  
**Dependensi:** GZY-023, GZY-032, GZY-042, GZY-043, GZY-044

**Cakupan:**

- Akses katalog tanpa login.
- Pencarian, filter, reset, dan buka aplikasi.
- Redirect admin tanpa sesi.
- Login gagal/berhasil dan logout.
- Tambah, edit, terbitkan, arsipkan aplikasi.
- Buat/edit kategori.

**Acceptance criteria:**

- Alur E2E berjalan pada environment test yang dapat diulang.
- Test membuktikan draf/arsip tidak terlihat publik.
- Bukti kegagalan berupa trace/screenshot tersedia tanpa melacak artefak besar ke Git.

### [ ] GZY-052 — Audit aksesibilitas dan responsif

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-023, GZY-040, GZY-042, GZY-044

**Cakupan:**

- Uji keyboard penuh, focus order, label, pesan error, heading, landmark, dan kontras.
- Uji 360 px, tablet, laptop, dan layar besar.
- Uji reduced motion.

**Acceptance criteria:**

- Tidak ada pelanggaran aksesibilitas kritis/serius pada alur utama.
- Tidak ada overflow horizontal yang menghalangi operasi.
- Semua tindakan publik/admin utama dapat dijalankan dengan keyboard.

### [ ] GZY-053 — Audit performa dan optimasi aset

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-022, GZY-024, GZY-045

**Cakupan:**

- Ukur halaman utama menggunakan build produksi.
- Optimalkan CSS, JS, font, ikon, caching, dan gambar.
- Cegah layout shift pada kartu/ikon.

**Acceptance criteria:**

- Target Lighthouse PRD dicapai atau deviasi disetujui dan didokumentasikan.
- Tidak ada aset yang tidak perlu dan berukuran besar pada muatan awal.
- Gambar memiliki dimensi dan strategi loading yang sesuai.

### [ ] GZY-054 — Lakukan review keamanan pra-rilis

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-033, GZY-034, GZY-042, GZY-045, GZY-050

**Cakupan:**

- Uji akses langsung ke seluruh route admin.
- Tinjau CSRF, cookie, sesi, open redirect, XSS, SQL injection, dan path traversal upload.
- Verifikasi log dan error tidak membocorkan secret.
- Periksa dependency vulnerability yang relevan.

**Acceptance criteria:**

- Tidak ada temuan kritis atau tinggi yang belum diselesaikan.
- Temuan lebih rendah dicatat dengan keputusan mitigasi.
- Checklist keamanan ditautkan pada catatan rilis.

## Milestone 6 — Deployment dan peluncuran

### [ ] GZY-060 — Siapkan artefak deployment produksi

**Prioritas:** P0  
**Ukuran:** L  
**Dependensi:** GZY-001, GZY-010, GZY-016

**Cakupan:**

- Buat Dockerfile multi-stage atau unit systemd sesuai target.
- Jalankan proses sebagai user non-root.
- Pisahkan config/secret dari image.
- Sediakan volume persisten untuk database dan unggahan.
- Tambahkan graceful shutdown.

**Acceptance criteria:**

- Build produksi dapat direproduksi.
- Container/service berjalan sebagai non-root.
- Restart tidak menghilangkan database atau unggahan.
- Health check dapat digunakan orchestrator/reverse proxy.

### [ ] GZY-061 — Konfigurasi reverse proxy dan HTTPS

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-001, GZY-015, GZY-034, GZY-060

**Cakupan:**

- Konfigurasi Caddy/Nginx untuk domain final.
- Aktifkan HTTPS, proxy headers yang benar, batas body upload, dan timeout yang sesuai.
- Set `TRUST_PROXY` hanya untuk lingkungan yang benar.

**Acceptance criteria:**

- HTTP dialihkan ke HTTPS.
- Cookie produksi memiliki atribut Secure.
- IP/protocol aplikasi tidak dapat dipalsukan melalui header klien langsung.
- Upload sesuai batas dan health check dapat diakses sesuai kebijakan.

### [ ] GZY-062 — Implementasikan backup dan uji pemulihan

**Prioritas:** P0  
**Ukuran:** L  
**Dependensi:** GZY-013, GZY-045, GZY-060

**Cakupan:**

- Buat script/prosedur backup konsisten untuk SQLite dan unggahan.
- Simpan backup di lokasi terpisah dengan retensi yang disepakati.
- Dokumentasikan dan jalankan restore drill.

**Acceptance criteria:**

- Backup dapat dibuat tanpa korupsi database.
- Database dan ikon dapat dipulihkan pada instance bersih.
- Hasil restore diverifikasi dengan membuka katalog dan admin.
- Waktu, lokasi, enkripsi, dan retensi backup didokumentasikan.

### [ ] GZY-063 — Susun runbook deployment dan rollback

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** GZY-060, GZY-061, GZY-062

**Cakupan:**

- Dokumentasikan install, environment, migrasi, seed, pembuatan admin, deploy, dan restart.
- Dokumentasikan pemeriksaan pascadeploy dan rollback aplikasi/database.
- Sertakan prosedur rotasi secret serta pemulihan akses admin.

**Acceptance criteria:**

- Operator baru dapat mengikuti runbook tanpa informasi lisan tambahan.
- Rollback diuji pada lingkungan nonproduksi.
- Tidak ada nilai secret asli dalam dokumentasi.

### [ ] GZY-064 — Verifikasi dan rilis MVP

**Prioritas:** P0  
**Ukuran:** M  
**Dependensi:** seluruh issue P0 sebelumnya

**Checklist rilis:**

- [ ] Semua persyaratan P0 pada PRD terpenuhi.
- [ ] Kesembilan aplikasi dan kontennya diverifikasi.
- [ ] Typecheck, unit/integration test, E2E, dan build lulus.
- [ ] Audit aksesibilitas, performa, dan keamanan lulus.
- [ ] HTTPS, health check, penyimpanan persisten, backup, restore, dan rollback diverifikasi.
- [ ] Admin produksi dibuat melalui kanal aman.
- [ ] Smoke test publik dan admin selesai setelah deploy.

**Acceptance criteria:**

- Pemilik produk menyetujui katalog dan tampilan produksi.
- Tidak ada defect P0 terbuka.
- Versi rilis dan catatan rilis terdokumentasi.

## Milestone 7 — Setelah MVP

### [ ] GZY-070 — Monitoring status aplikasi tujuan

**Prioritas:** P2  
**Ukuran:** L  
**Dependensi:** GZY-064

Periksa ketersediaan aplikasi secara berkala tanpa memperlambat request publik, simpan riwayat minimum, dan tampilkan status hanya setelah aturan false positive serta timeout ditentukan.

### [ ] GZY-071 — Analitik klik yang menjaga privasi

**Prioritas:** P2  
**Ukuran:** M  
**Dependensi:** GZY-064

Catat agregat pembukaan aplikasi dan pencarian tanpa hasil tanpa membuat profil individu atau menyimpan parameter sensitif.

### [ ] GZY-072 — Role admin owner dan editor

**Prioritas:** P2  
**Ukuran:** L  
**Dependensi:** GZY-047, GZY-064

Tambahkan manajemen admin dan pembatasan tindakan berisiko berdasarkan role setelah kebutuhan multi-admin terbukti.

### [ ] GZY-073 — Import/export katalog

**Prioritas:** P2  
**Ukuran:** M  
**Dependensi:** GZY-064

Tambahkan ekspor dan impor JSON/CSV dengan validasi, pratinjau perubahan, serta perlindungan dari duplikasi.

### [ ] GZY-074 — API katalog publik terbatas

**Prioritas:** P2  
**Ukuran:** M  
**Dependensi:** GZY-064

Sediakan API versioned hanya jika situs lain benar-benar membutuhkannya, dengan rate limit, dokumentasi schema, dan tanpa data admin.

## Urutan eksekusi ringkas

```text
GZY-001
   └── konten final dan keputusan deployment

GZY-010 → GZY-011 → GZY-012
   │         │          └── GZY-015 → GZY-016
   │         └── GZY-013 → GZY-014 → GZY-021
   └── GZY-020 ────────────────────→ GZY-022 → GZY-023 → GZY-024
                                      └── GZY-026

GZY-013 → GZY-030 → GZY-032
   └────→ GZY-031 ──┘ → GZY-033 → GZY-034
                              └──→ GZY-040 → GZY-041 → GZY-042/043/044/045

Fitur selesai → GZY-050/051/052/053/054
             → GZY-060/061/062/063
             → GZY-064
```

## Catatan pemeliharaan backlog

- Jika satu issue berkembang melebihi satu alur yang dapat ditinjau, pecah menjadi sub-issue dan pertahankan ID induknya pada dependensi.
- Jangan memulai issue P2 sebelum P0 selesai, kecuali pekerjaan tersebut menyelesaikan blocker P0.
- Saat keputusan GZY-001 tersedia, perbarui PRD, seed, dan issue terkait dalam perubahan yang sama.
- Setelah issue dipindahkan ke GitHub, simpan ID `GZY-xxx` di judul agar tautan antara PRD, commit, dan release note tetap jelas.
