# Product Requirements Document — GezyApp

## Informasi dokumen

| Atribut | Nilai |
|---|---|
| Produk | GezyApp |
| Status | Draf untuk implementasi MVP |
| Versi | 1.0 |
| Tanggal | 28 September 2026 |
| Pemilik produk | GezyTech |
| Bahasa awal | Bahasa Indonesia |
| Domain produksi | `https://gezytech.web.id` |
| Dokumen teknis | `RENCANA_IMPLEMENTASI.md` |
| Backlog | `ISSUES.md` |
| Versi awal | `0.1.0` |

## 1. Latar belakang

GezyTech memiliki beberapa aplikasi web dengan alamat dan fungsi berbeda. Pengunjung perlu mengetahui alamat setiap aplikasi atau memperoleh tautannya dari sumber lain. Ketika aplikasi baru ditambahkan atau keterangannya berubah, belum ada satu katalog publik yang menjadi sumber utama.

GezyApp menyatukan aplikasi tersebut dalam sebuah portal yang mudah dipahami. Halaman publik dapat diakses tanpa akun, sedangkan pengelolaan katalog dilakukan oleh admin yang telah login.

## 2. Pernyataan masalah

### Masalah pengunjung

- Sulit mengetahui semua aplikasi GezyTech yang tersedia.
- Nama atau alamat aplikasi tidak selalu menjelaskan kegunaannya.
- Tidak tersedia pencarian dan pengelompokan aplikasi dalam satu tempat.

### Masalah pengelola

- Penambahan dan perubahan informasi aplikasi berpotensi memerlukan perubahan kode.
- Tidak ada alur terpusat untuk menerbitkan, mengurutkan, menonjolkan, atau mengarsipkan aplikasi.
- Informasi yang dilihat pengunjung sulit dijaga agar tetap konsisten.

## 3. Visi produk

GezyApp menjadi beranda ekosistem aplikasi GezyTech: cepat dibuka, mudah dijelajahi, dan mudah dirawat. Seorang pengunjung harus dapat menemukan aplikasi yang relevan dalam waktu singkat, sedangkan admin harus dapat memperbarui katalog tanpa bantuan pengembang.

## 4. Sasaran MVP

1. Menampilkan seluruh aplikasi GezyTech yang telah diterbitkan dalam satu katalog publik.
2. Memungkinkan pengunjung mencari dan menyaring aplikasi tanpa login.
3. Memungkinkan admin menambah dan mengubah aplikasi, deskripsi, kategori, ikon, status, unggulan, dan urutan.
4. Menjaga akses admin dan operasi perubahan data tetap aman.
5. Menyediakan tampilan modern, responsif, dan aksesibel dengan identitas visual hijau GezyTech.

## 5. Bukan sasaran MVP

- Single sign-on ke aplikasi tujuan.
- Pendaftaran atau akun pengunjung.
- Menjalankan aplikasi tujuan di dalam iframe.
- Monitoring uptime real-time.
- Analitik perilaku terperinci.
- Ulasan, komentar, rating, atau favorit.
- Aplikasi Android/iOS native.
- Pembuatan konten menggunakan AI.
- Portal multibahasa.

Implementasi P0 memakai SQLite melalui `bun:sqlite`, service query TypeScript, dan stylesheet CSS terpisah. `drizzle.config.ts` disiapkan sebagai opsi migrasi ORM ketika skema atau kebutuhan query berkembang.

## 5.1 Versi aplikasi dan footer global

GezyApp mengikuti [Semantic Versioning 2.0.0](https://semver.org/) dengan format `MAJOR.MINOR.PATCH`:

- `MAJOR` naik ketika ada perubahan tidak kompatibel pada API atau perilaku publik yang dijanjikan.
- `MINOR` naik ketika ada kemampuan baru yang tetap kompatibel.
- `PATCH` naik ketika ada perbaikan bug yang kompatibel.
- Selama fase pengembangan awal, versi dimulai dari `0.1.0`; versi `0.y.z` belum menjanjikan API stabil.
- Versi pre-release boleh memakai suffix seperti `-alpha.1` atau `-rc.1`.
- Build metadata seperti `+sha.abc123` boleh ditambahkan untuk artefak deployment dan tidak mengubah precedence versi.

File `VERSION` adalah sumber versi aplikasi. Ketika `package.json` tersedia, field `version` harus sama dengan file tersebut. Setiap rilis wajib memiliki entri di `CHANGELOG.md` dan tag Git memakai format `vMAJOR.MINOR.PATCH`.

Semua halaman penuh memakai layout bersama dan footer global berikut:

```text
© 2026 Gezy App ala PakGun. All rights reserved. · Versi 0.1.0
```

Nilai versi pada footer dibaca dinamis dari sumber versi, sehingga perubahan versi tidak memerlukan perubahan teks template secara manual. Footer berlaku untuk halaman beranda, daftar/detail aplikasi, tentang, login, dashboard, dan semua halaman admin. Partial HTMX yang hanya mengganti isi daftar tidak merender footer kedua.

## 6. Pengguna

### Pengunjung

Pengunjung dapat berupa siswa, guru, staf, atau masyarakat umum. Mereka ingin mengetahui aplikasi yang tersedia, memahami kegunaannya, kemudian membuka aplikasi yang tepat. Pengunjung tidak perlu memahami struktur internal GezyTech.

Kebutuhan utama:

- Melihat aplikasi tanpa membuat akun.
- Memahami fungsi aplikasi dari nama, ikon, dan deskripsi singkat.
- Menemukan aplikasi melalui pencarian atau kategori.
- Membuka aplikasi tujuan dengan jelas dan aman.

### Admin

Admin adalah pengelola katalog GezyApp. Pada MVP, semua admin memiliki hak pengelolaan yang sama.

Kebutuhan utama:

- Login dengan aman.
- Melihat kondisi katalog secara ringkas.
- Membuat dan memperbarui entri aplikasi.
- Mengontrol aplikasi yang terlihat oleh publik.
- Menambah kategori dan mengatur urutan tampilan.
- Mengunggah atau mengganti ikon aplikasi.

## 7. Alur utama pengguna

### Menemukan aplikasi

1. Pengunjung membuka beranda GezyApp.
2. Pengunjung melihat aplikasi unggulan dan seluruh katalog.
3. Pengunjung mengetik kata pencarian atau memilih kategori.
4. Daftar diperbarui dan tetap memiliki URL yang dapat dibagikan.
5. Pengunjung memilih **Buka aplikasi**.
6. Aplikasi tujuan terbuka pada tab baru.

### Menambahkan aplikasi

1. Admin membuka halaman login.
2. Admin memasukkan kredensial yang valid.
3. Admin membuka menu **Aplikasi** dan memilih **Tambah aplikasi**.
4. Admin mengisi identitas, URL, deskripsi, kategori, kata kunci, ikon, serta status.
5. Sistem memvalidasi masukan dan menampilkan pratinjau kartu.
6. Admin menyimpan sebagai draf atau menerbitkannya.
7. Aplikasi terbit muncul pada katalog publik.

### Memperbarui atau mengarsipkan aplikasi

1. Admin membuka daftar aplikasi.
2. Admin mencari dan memilih entri.
3. Admin memperbarui data atau mengubah status menjadi arsip.
4. Sistem menyimpan perubahan dan menampilkan notifikasi hasil.
5. Perubahan terbit terlihat pada katalog; entri arsip tidak terlihat oleh publik.

## 8. Persyaratan fungsional

Prioritas menggunakan `P0` untuk kebutuhan wajib peluncuran, `P1` untuk kebutuhan penting yang dapat menyusul bila jadwal mendesak, dan `P2` untuk pengembangan setelah MVP.

### Katalog publik

| ID | Prioritas | Persyaratan |
|---|---|---|
| FR-PUB-01 | P0 | Beranda dapat diakses tanpa autentikasi. |
| FR-PUB-02 | P0 | Sistem menampilkan semua dan hanya aplikasi berstatus `published`. |
| FR-PUB-03 | P0 | Setiap kartu menampilkan ikon/fallback, nama, deskripsi singkat, kategori, metadata akses/harga sesuai pilihan admin, dan tombol pembuka. |
| FR-PUB-04 | P0 | Tombol aplikasi membuka URL tujuan pada tab baru secara aman. |
| FR-PUB-05 | P0 | Pengunjung dapat mencari berdasarkan nama, deskripsi singkat, dan kata kunci. |
| FR-PUB-06 | P0 | Pengunjung dapat menyaring aplikasi berdasarkan kategori. |
| FR-PUB-07 | P0 | Pencarian dan kategori dapat digunakan bersamaan. |
| FR-PUB-08 | P0 | Query pencarian/filter tercermin pada URL dan dapat dibagikan. |
| FR-PUB-09 | P0 | Sistem menampilkan empty state yang jelas ketika tidak ada hasil. |
| FR-PUB-10 | P0 | Aplikasi unggulan ditampilkan lebih menonjol tanpa menyembunyikan daftar lengkap. |
| FR-PUB-11 | P0 | Urutan aplikasi mengikuti `sort_order`, lalu nama sebagai pengurutan stabil. |
| FR-PUB-12 | P1 | Tersedia halaman detail aplikasi berdasarkan slug. |
| FR-PUB-13 | P1 | Tersedia halaman Tentang yang isinya dapat dikonfigurasi. |

### Autentikasi

| ID | Prioritas | Persyaratan |
|---|---|---|
| FR-AUTH-01 | P0 | Tidak ada registrasi admin publik. |
| FR-AUTH-02 | P0 | Admin pertama dapat dibuat melalui perintah CLI. |
| FR-AUTH-03 | P0 | Admin dapat login menggunakan email dan kata sandi. |
| FR-AUTH-04 | P0 | Kredensial tidak valid menghasilkan pesan umum tanpa mengungkap keberadaan email. |
| FR-AUTH-05 | P0 | Login berhasil membuat sesi server-side dan mengarahkan admin ke dashboard. |
| FR-AUTH-06 | P0 | Admin dapat logout dan sesi tersebut langsung tidak berlaku. |
| FR-AUTH-07 | P0 | Semua rute `/admin`, kecuali login, membutuhkan sesi admin aktif. |
| FR-AUTH-08 | P0 | Login dibatasi untuk mengurangi percobaan berulang. |
| FR-AUTH-09 | P1 | Admin dapat melihat waktu login terakhirnya. |

### Pengelolaan aplikasi

| ID | Prioritas | Persyaratan |
|---|---|---|
| FR-APP-01 | P0 | Admin dapat melihat daftar aplikasi dari semua status. |
| FR-APP-02 | P0 | Admin dapat mencari daftar aplikasi berdasarkan nama atau URL. |
| FR-APP-03 | P0 | Admin dapat membuat aplikasi dengan status awal draf atau terbit. |
| FR-APP-04 | P0 | Admin dapat mengubah nama, slug, URL, deskripsi, kategori, kata kunci, ikon, metadata akses/harga, visibilitas metadata, unggulan, status, dan urutan. |
| FR-APP-05 | P0 | Nama, slug, URL, dan deskripsi singkat wajib diisi. |
| FR-APP-06 | P0 | Slug aplikasi harus unik. |
| FR-APP-07 | P0 | URL produksi harus memakai HTTPS dan skema berbahaya harus ditolak. |
| FR-APP-08 | P0 | Status aplikasi terdiri dari `draft`, `published`, dan `archived`. |
| FR-APP-09 | P0 | Admin dapat mengarsipkan aplikasi tanpa menghapus datanya. |
| FR-APP-10 | P0 | Penghapusan permanen memerlukan konfirmasi eksplisit. |
| FR-APP-11 | P0 | Admin dapat melihat pratinjau kartu sebelum menerbitkan perubahan. |
| FR-APP-12 | P0 | Sistem menampilkan pesan sukses atau kesalahan setelah operasi. |
| FR-APP-13 | P1 | Admin dapat mengatur ulang urutan dengan kontrol yang ramah keyboard. |

### Pengelolaan kategori

| ID | Prioritas | Persyaratan |
|---|---|---|
| FR-CAT-01 | P0 | Admin dapat membuat, mengubah, dan mengurutkan kategori. |
| FR-CAT-02 | P0 | Nama dan slug kategori wajib serta unik. |
| FR-CAT-03 | P0 | Sistem mencegah penghapusan kategori yang masih digunakan, atau meminta admin memindahkan aplikasi terlebih dahulu. |
| FR-CAT-04 | P0 | Hanya kategori yang mempunyai aplikasi terbit yang muncul pada filter publik. |

### Ikon dan unggahan

| ID | Prioritas | Persyaratan |
|---|---|---|
| FR-UPL-01 | P0 | Aplikasi tanpa ikon memakai fallback konsisten. |
| FR-UPL-02 | P0 | Admin dapat mengunggah dan mengganti ikon aplikasi. |
| FR-UPL-03 | P0 | Sistem membatasi format, ukuran, dimensi, serta memverifikasi isi berkas. |
| FR-UPL-04 | P0 | Nama berkas penyimpanan dibuat sistem dan tidak memakai nama asli pengguna. |
| FR-UPL-05 | P1 | Ikon dioptimalkan menjadi format dan ukuran yang efisien untuk web. |

### Dashboard dan operasi

| ID | Prioritas | Persyaratan |
|---|---|---|
| FR-OPS-01 | P0 | Dashboard menampilkan jumlah aplikasi terbit, draf, arsip, dan kategori. |
| FR-OPS-02 | P0 | Tersedia endpoint health check untuk proses aplikasi dan database. |
| FR-OPS-03 | P0 | Tersedia perintah migrasi dan seed yang idempoten atau aman dijalankan ulang. |
| FR-OPS-04 | P0 | Tersedia perintah backup dan prosedur pemulihan database serta unggahan. |
| FR-OPS-05 | P1 | Perubahan penting admin dicatat dalam audit log. |

### Versi dan shell aplikasi

| ID | Prioritas | Persyaratan |
|---|---|---|
| FR-SYS-01 | P0 | Aplikasi memiliki satu sumber versi valid SemVer, dimulai dari `0.1.0`. |
| FR-SYS-02 | P0 | Versi yang berjalan dapat dibaca oleh layout, health check, log startup, dan metadata aplikasi. |
| FR-SYS-03 | P0 | Setiap halaman penuh publik, login, dan admin menggunakan layout bersama. |
| FR-SYS-04 | P0 | Footer global menampilkan teks persis `© 2026 Gezy App ala PakGun. All rights reserved.` |
| FR-SYS-05 | P0 | Footer global menampilkan versi dinamis, misalnya `Versi 0.1.0`, di samping teks hak cipta. |
| FR-SYS-06 | P0 | Footer hanya dirender sekali pada halaman penuh dan tidak diduplikasi oleh partial HTMX. |
| FR-SYS-07 | P0 | Proses rilis memperbarui `VERSION`, `package.json` (bila ada), `CHANGELOG.md`, dan tag Git secara konsisten. |

## 9. Aturan bisnis

1. Hanya aplikasi berstatus `published` yang boleh muncul melalui halaman atau partial publik.
2. Satu slug hanya boleh dimiliki satu aplikasi; slug tidak berubah otomatis setelah entri dibuat kecuali admin mengubahnya.
3. Aplikasi `draft` dapat diedit dan dipratinjau admin tetapi tidak terlihat publik.
4. Aplikasi `archived` disimpan untuk riwayat dan tidak terlihat publik.
5. Aplikasi unggulan tetap harus berstatus `published` agar tampil di beranda.
6. Kategori yang tidak mempunyai aplikasi terbit tidak ditampilkan sebagai filter publik.
7. Penghapusan kategori tidak boleh meninggalkan referensi aplikasi yang rusak.
8. Email admin dibandingkan secara case-insensitive.
9. Tidak ada formulir pembuatan admin melalui halaman publik.
10. `games.gezytech.web.id` dan `game.gezytech.web.id` diperlakukan sebagai dua aplikasi terpisah sampai pemilik produk memutuskan lain.

## 10. Data awal

| Nama | URL | Kategori awal |
|---|---|---|
| GezyTeach | https://teach.gezytech.web.id/ | Pendidikan |
| GezyCBT | https://cbt.gezytech.web.id/ | Pendidikan |
| GezyClass | https://class.gezytech.web.id/ | Pendidikan |
| GezyVote | https://vote.gezytech.web.id/ | Produktivitas |
| GezyMath | https://math.gezytech.web.id/ | Pendidikan |
| GezyTech Platform | https://platform.gezytech.web.id/ | Platform |
| Gezy AIOS | https://aios.gezytech.web.id/ | AI dan Platform |
| Gezy Games | https://games.gezytech.web.id/ | Permainan Edukasi |
| GezyGame | https://game.gezytech.web.id/ | Permainan Edukasi |

Nama, kategori, deskripsi, dan ikon merupakan konten yang dapat diperbaiki admin. Kesembilan URL harus tersedia pada seed awal.

## 11. Persyaratan nonfungsional

### Performa

- Halaman publik harus nyaman digunakan pada jaringan seluler menengah.
- Target Lighthouse produksi untuk Performance, Accessibility, Best Practices, dan SEO minimal 90 pada halaman utama, diukur pada konfigurasi yang wajar.
- Aset gambar harus memiliki ukuran eksplisit dan dimuat secara efisien.
- Respons server untuk katalog lokal ditargetkan di bawah 300 ms pada persentil ke-95, di luar waktu jaringan dan cold start.

### Aksesibilitas

- Antarmuka menargetkan WCAG 2.2 level AA untuk alur utama.
- Seluruh fungsi utama dapat digunakan dengan keyboard.
- Fokus terlihat, label form terhubung dengan kontrol, dan kesalahan form dijelaskan dalam teks.
- Kontras warna teks memenuhi standar; warna bukan satu-satunya penanda status.
- Animasi menghormati `prefers-reduced-motion`.

### Responsif dan kompatibilitas

- Antarmuka diuji mulai lebar 360 px hingga desktop besar.
- Mendukung dua versi mayor terbaru Chrome, Edge, Firefox, dan Safari pada saat peluncuran.
- Fungsi dasar katalog tetap tersedia jika HTMX atau JavaScript browser gagal dimuat.

### Keamanan

- Kata sandi disimpan menggunakan Argon2id atau implementasi hashing Bun yang aman.
- Sesi disimpan server-side; cookie menggunakan `HttpOnly`, `Secure` di produksi, dan `SameSite=Lax`.
- Token sesi yang tersimpan di database berbentuk hash.
- Semua perubahan data dilindungi CSRF dan otorisasi admin.
- Login memiliki rate limit.
- Input divalidasi di server dan keluaran HTML di-escape.
- Unggahan diverifikasi berdasarkan isi, ukuran, dan format.
- Header CSP, `X-Content-Type-Options`, `Referrer-Policy`, dan aturan framing dikonfigurasi.
- Secret, cookie, token, dan kata sandi tidak boleh masuk ke log.

### Keandalan dan pemeliharaan

- Migrasi database memiliki urutan dan dapat diterapkan secara konsisten.
- Data persisten berada di luar image aplikasi.
- Backup mencakup database dan unggahan serta memiliki uji pemulihan.
- Error produksi tidak mengungkap stack trace atau struktur database.
- Typecheck, pengujian penting, dan build harus lulus sebelum rilis.

## 12. Pengalaman visual

- Hijau gelap (`#052E24`, `#0B4F3C`) menjadi dasar identitas dan hijau terang (`#059669`, `#A3E635`) menjadi aksen.
- Beranda memakai hero ringkas, pencarian yang mudah ditemukan, filter kategori, area unggulan, dan grid aplikasi.
- Kartu memberikan hierarki yang jelas antara nama, manfaat, kategori, dan tindakan.
- Pada ponsel, grid memakai satu kolom; tablet dua kolom; desktop tiga atau empat kolom sesuai ruang.
- Area admin mengutamakan keterbacaan tabel/form, status yang jelas, dan tindakan yang tidak mudah tertukar.

## 13. Konten dan nada bahasa

- Gunakan Bahasa Indonesia yang ringkas, ramah, dan langsung.
- Hindari jargon teknis pada halaman publik.
- Deskripsi singkat menjawab “aplikasi ini membantu apa?” dalam satu atau dua kalimat.
- Teks tombol memakai kata kerja yang jelas, misalnya **Buka aplikasi**, **Simpan draf**, dan **Terbitkan**.
- Pesan kesalahan menjelaskan cara memperbaiki masukan tanpa membocorkan informasi sensitif.

## 14. Ukuran keberhasilan

Karena MVP belum memerlukan analitik perilaku lengkap, keberhasilan peluncuran dinilai melalui indikator operasional berikut:

| Indikator | Target MVP |
|---|---|
| Kelengkapan katalog | 9 dari 9 aplikasi awal tersedia dan URL benar |
| Akses publik | Katalog dan pencarian dapat dipakai tanpa login |
| Kemandirian admin | Aplikasi baru dapat diterbitkan tanpa perubahan kode |
| Keamanan akses | Seluruh rute admin terlindungi dan logout mencabut sesi |
| Kualitas antarmuka | Alur utama lulus audit aksesibilitas dan responsif |
| Kesiapan operasi | Backup dan pemulihan berhasil diuji |
| Kualitas rilis | Typecheck, test penting, dan build produksi lulus |

Setelah analitik klik sederhana ditambahkan, metrik dapat diperluas dengan jumlah pembukaan aplikasi, pencarian tanpa hasil, dan kategori yang paling sering digunakan.

## 15. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Deskripsi atau kategori awal kurang tepat | Pengunjung salah memahami aplikasi | Simpan sebagai konten editable dan lakukan tinjauan pemilik produk sebelum rilis. |
| Dua domain permainan membingungkan | Duplikasi tampilan | Gunakan nama/deskripsi berbeda; putuskan penggabungan setelah fungsi keduanya dipastikan. |
| Ikon tidak seragam | Katalog terlihat tidak konsisten | Gunakan bingkai ikon baku dan fallback; normalisasi gambar saat unggah. |
| URL aplikasi berubah | Tautan mati | Admin dapat memperbarui URL; monitoring uptime dijadwalkan setelah MVP. |
| Akun admin diserang | Perubahan katalog tanpa izin | Hash kuat, rate limit, sesi aman, CSRF, dan tanpa registrasi publik. |
| SQLite atau unggahan hilang | Kehilangan katalog/aset | Volume persisten, backup terjadwal, dan uji pemulihan. |
| Cakupan melebar sebelum portal selesai | Rilis tertunda | Patuhi kebutuhan P0; P1/P2 dikerjakan setelah MVP dapat digunakan. |

## 16. Kriteria peluncuran MVP

MVP dapat dirilis ketika seluruh kondisi berikut terpenuhi:

- Semua persyaratan P0 telah selesai dan diverifikasi.
- Sembilan aplikasi awal tersedia dengan nama, deskripsi, URL, kategori, serta ikon atau fallback yang layak.
- Pengunjung dapat mencari, menyaring, dan membuka aplikasi pada ponsel serta desktop.
- Admin dapat login, logout, dan menyelesaikan seluruh alur CRUD aplikasi serta kategori.
- Draf dan arsip tidak dapat terlihat melalui rute publik.
- Validasi URL, slug, form, dan unggahan bekerja.
- Pemeriksaan keamanan dasar, aksesibilitas, typecheck, test, dan build lulus.
- Deployment HTTPS, penyimpanan persisten, backup, pemulihan, dan rollback telah didokumentasikan dan diuji.

## 17. Keputusan terbuka

Keputusan berikut diperlukan sebelum peluncuran produksi, tetapi tidak menghalangi pembangunan MVP:

1. Deskripsi final setiap aplikasi; MVP memakai deskripsi sementara yang dapat diedit admin.
2. Identitas/alamat kontak tambahan pada footer, bila diperlukan selain copyright wajib.
3. Pilihan deployment: Docker, systemd, atau platform hosting yang tersedia.
4. Lokasi, jadwal, dan retensi backup produksi.
5. Apakah halaman detail aplikasi (`FR-PUB-12`) disertakan pada rilis pertama.

## 18. Pengendalian perubahan

Perubahan kebutuhan dicatat di PRD ini terlebih dahulu jika memengaruhi perilaku pengguna, aturan bisnis, atau kriteria rilis. Perubahan teknis yang tidak mengubah kebutuhan produk dicatat di `RENCANA_IMPLEMENTASI.md`. Pekerjaan implementasi dipecah dan dilacak melalui `ISSUES.md`.
