import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Hono } from "hono";
import { config } from "../config/env";
import { archiveApplication, allCategories, applicationInputSchema, applicationStats, createApplication, createCategory, deleteApplication, deleteCategory, findApplication, listAdminApplications, updateApplication, updateCategory } from "../services/applications";
import { currentAdmin, csrfToken } from "./auth";
import { csrfIsValid } from "../services/csrf";
import { esc, flash, adminPageHeader, adminTable, layout } from "../views/html";
import type { ApplicationInput } from "../services/applications";

function value(body: Record<string, unknown>, key: string) {
  const item = body[key];
  return typeof item === "string" ? item : "";
}

function parseApplication(body: Record<string, unknown>): ApplicationInput {
  return applicationInputSchema.parse({
    name: value(body, "name"),
    slug: value(body, "slug"),
    url: value(body, "url"),
    shortDescription: value(body, "shortDescription"),
    description: value(body, "description"),
    categoryId: value(body, "categoryId"),
    keywords: value(body, "keywords"),
    status: value(body, "status") || "draft",
    accessType: value(body, "accessType") || "public",
    pricingType: value(body, "pricingType") || "free",
    showAccessInfo: body.showAccessInfo === "on",
    showPricingInfo: body.showPricingInfo === "on",
    isFeatured: body.isFeatured === "on",
    sortOrder: value(body, "sortOrder") || "0",
  });
}

function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : "Operasi tidak dapat diselesaikan.";
  if (message.includes("UNIQUE constraint failed")) return "Nilai slug atau nama yang Anda masukkan sudah digunakan.";
  return message;
}

async function saveIcon(input: unknown) {
  if (!(input instanceof File) || input.size === 0) return undefined;
  if (input.size > config.MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`Ukuran ikon maksimal ${config.MAX_UPLOAD_MB} MB.`);
  const bytes = new Uint8Array(await input.arrayBuffer());
  const signatures: Array<{ mime: string; extension: string; matches: (data: Uint8Array) => boolean }> = [
    { mime: "image/png", extension: "png", matches: (data) => data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47 },
    { mime: "image/jpeg", extension: "jpg", matches: (data) => data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff },
    { mime: "image/webp", extension: "webp", matches: (data) => String.fromCharCode(...data.slice(0, 4)) === "RIFF" && String.fromCharCode(...data.slice(8, 12)) === "WEBP" },
  ];
  const format = signatures.find((item) => item.mime === input.type && item.matches(bytes));
  if (!format) throw new Error("Ikon harus berupa PNG, JPEG, atau WebP yang valid.");
  const relative = `/uploads/icons/${crypto.randomUUID()}.${format.extension}`;
  const absolute = join(config.uploadDir, "icons", relative.split("/").pop()!);
  await mkdir(join(config.uploadDir, "icons"), { recursive: true });
  await Bun.write(absolute, bytes);
  return relative;
}

function applicationForm(csrf: string, categories: ReturnType<typeof allCategories>, values: Partial<ApplicationInput> & { iconPath?: string | null }, action: string, submitLabel: string, error = "") {
  const categoryOptions = categories.map((category) => `<option value="${esc(category.id)}" ${values.categoryId === category.id ? "selected" : ""}>${esc(category.name)}</option>`).join("");
  return `<section class="admin-main"><div class="container form-shell"><a class="back-link" href="/admin/applications">← Kembali ke aplikasi</a>${error ? flash(error, "error") : ""}<div class="panel"><p class="eyebrow">Katalog aplikasi</p><h1>${esc(submitLabel === "Simpan perubahan" ? "Edit aplikasi" : "Tambah aplikasi")}</h1><form method="post" action="${action}" enctype="multipart/form-data"><input type="hidden" name="_csrf" value="${esc(csrf)}"><div class="form-grid"><div class="form-field"><label for="name">Nama aplikasi</label><input class="form-control" id="name" name="name" value="${esc(values.name)}" required maxlength="120"></div><div class="form-field"><label for="slug">Slug</label><input class="form-control" id="slug" name="slug" value="${esc(values.slug)}" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required><small>Contoh: gezy-teach</small></div><div class="form-field full"><label for="url">URL aplikasi</label><input class="form-control" id="url" name="url" type="url" value="${esc(values.url)}" placeholder="https://" required><small>Gunakan URL HTTPS.</small></div><div class="form-field full"><label for="shortDescription">Deskripsi singkat</label><input class="form-control" id="shortDescription" name="shortDescription" value="${esc(values.shortDescription)}" maxlength="240" required></div><div class="form-field full"><label for="description">Deskripsi lengkap</label><textarea class="form-control" id="description" name="description" rows="5">${esc(values.description)}</textarea></div><div class="form-field"><label for="categoryId">Kategori</label><select class="form-control" id="categoryId" name="categoryId"><option value="">Tanpa kategori</option>${categoryOptions}</select></div><div class="form-field"><label for="status">Status</label><select class="form-control" id="status" name="status"><option value="draft" ${values.status === "draft" ? "selected" : ""}>Draf</option><option value="published" ${values.status === "published" ? "selected" : ""}>Terbit</option><option value="archived" ${values.status === "archived" ? "selected" : ""}>Arsip</option></select></div><div class="form-field"><label for="accessType">Akses pengunjung</label><select class="form-control" id="accessType" name="accessType"><option value="public" ${values.accessType === "public" ? "selected" : ""}>Publik · tanpa akun</option><option value="login_required" ${values.accessType === "login_required" ? "selected" : ""}>Perlu akun masuk</option></select><small>Informasi ini hanya tampil jika diaktifkan di bawah.</small></div><div class="form-field"><label for="pricingType">Harga</label><select class="form-control" id="pricingType" name="pricingType"><option value="free" ${values.pricingType === "free" ? "selected" : ""}>Gratis</option><option value="paid" ${values.pricingType === "paid" ? "selected" : ""}>Berbayar</option><option value="freemium" ${values.pricingType === "freemium" ? "selected" : ""}>Freemium</option></select><small>Pilih status harga yang paling sesuai.</small></div><div class="form-field"><label for="keywords">Kata kunci</label><input class="form-control" id="keywords" name="keywords" value="${esc(values.keywords)}" placeholder="belajar, kelas, sekolah"></div><div class="form-field"><label for="sortOrder">Urutan</label><input class="form-control" id="sortOrder" name="sortOrder" type="number" min="0" max="9999" value="${esc(values.sortOrder ?? 0)}"></div><div class="form-field full"><label for="icon">Ikon aplikasi</label><input class="form-control" id="icon" name="icon" type="file" accept="image/png,image/jpeg,image/webp"><small>PNG, JPEG, atau WebP; maksimal ${config.MAX_UPLOAD_MB} MB.${values.iconPath ? " Ikon saat ini akan dipertahankan jika tidak memilih berkas baru." : ""}</small></div><div class="form-field full"><span class="form-label">Informasi pada card publik</span><label class="form-check"><input type="checkbox" name="showAccessInfo" ${values.showAccessInfo !== false ? "checked" : ""}><span>Tampilkan badge akses (Publik / Perlu akun)</span></label><label class="form-check"><input type="checkbox" name="showPricingInfo" ${values.showPricingInfo !== false ? "checked" : ""}><span>Tampilkan badge harga (Gratis / Berbayar / Freemium)</span></label></div><label class="form-check full"><input type="checkbox" name="isFeatured" ${values.isFeatured ? "checked" : ""}><span>Tandai sebagai aplikasi unggulan</span></label></div><div class="form-actions"><button class="button button-primary" type="submit">${esc(submitLabel)}</button><a class="button button-secondary" href="/admin/applications">Batal</a></div></form></div></div></section>`;
}

export function registerAdminRoutes(app: Hono) {
  app.use("/admin/*", async (c, next) => {
    if (c.req.path === "/admin/login") return next();
    if (!currentAdmin(c)) return c.redirect(`/admin/login?next=${encodeURIComponent(c.req.path)}`);
    return next();
  });

  app.get("/admin", (c) => {
    const admin = currentAdmin(c)!;
    const stats = applicationStats();
    const body = `<section class="admin-main"><div class="container">${adminPageHeader("Dashboard", `Selamat datang, ${admin.name}`, "Kelola pintu masuk ke seluruh aplikasi GezyTech.", `<a class="button button-primary" href="/admin/applications/new">+ Tambah aplikasi</a>`)}<div class="stat-grid"><div class="stat-card"><span>Terbit</span><strong>${stats.published}</strong></div><div class="stat-card"><span>Draf</span><strong>${stats.draft}</strong></div><div class="stat-card"><span>Arsip</span><strong>${stats.archived}</strong></div><div class="stat-card"><span>Kategori</span><strong>${stats.categories}</strong></div></div><div class="panel"><p class="eyebrow">Langkah berikutnya</p><h2>Jaga katalog tetap segar</h2><p class="muted">Perbarui deskripsi dan urutan aplikasi agar pengunjung selalu menemukan informasi yang tepat.</p><a class="button button-secondary" href="/admin/applications">Buka daftar aplikasi</a></div></div></section>`;
    return c.html(layout({ title: "Dashboard", body, admin, csrf: csrfToken(c) }));
  });

  app.get("/admin/applications", (c) => {
    const admin = currentAdmin(c)!;
    const url = new URL(c.req.url);
    const applications = listAdminApplications(url.searchParams.get("q") ?? "", url.searchParams.get("status") ?? "");
    const body = `<section class="admin-main"><div class="container">${adminPageHeader("Katalog", "Aplikasi", "Atur aplikasi yang tersedia di portal.", `<a class="button button-primary" href="/admin/applications/new">+ Tambah aplikasi</a>`)}<div class="panel"><form class="admin-filters" method="get"><input name="q" value="${esc(url.searchParams.get("q") ?? "")}" placeholder="Cari nama atau URL"><select name="status"><option value="">Semua status</option><option value="published" ${url.searchParams.get("status") === "published" ? "selected" : ""}>Terbit</option><option value="draft" ${url.searchParams.get("status") === "draft" ? "selected" : ""}>Draf</option><option value="archived" ${url.searchParams.get("status") === "archived" ? "selected" : ""}>Arsip</option></select><button class="button button-secondary" type="submit">Filter</button></form>${adminTable(applications, csrfToken(c))}</div></div></section>`;
    return c.html(layout({ title: "Aplikasi", body, admin, csrf: csrfToken(c) }));
  });

  app.get("/admin/applications/new", (c) => {
    const admin = currentAdmin(c)!;
    return c.html(layout({ title: "Tambah aplikasi", body: applicationForm(csrfToken(c), allCategories(), { status: "draft", accessType: "public", pricingType: "free", showAccessInfo: true, showPricingInfo: true, isFeatured: false, sortOrder: 0 }, "/admin/applications", "Simpan aplikasi"), admin, csrf: csrfToken(c) }));
  });

  app.post("/admin/applications", async (c) => {
    const admin = currentAdmin(c)!;
    const body = await c.req.parseBody();
    if (!csrfIsValid(c, body._csrf)) return c.text("CSRF token tidak valid.", 403);
    try {
      const input = parseApplication(body);
      const iconPath = await saveIcon(body.icon);
      createApplication(input, iconPath ?? null);
      return c.redirect("/admin/applications?created=1");
    } catch (error) {
      const values = { ...Object.fromEntries(Object.entries(body).filter(([, item]) => typeof item === "string")), accessType: value(body, "accessType") || "public", pricingType: value(body, "pricingType") || "free", showAccessInfo: body.showAccessInfo === "on", showPricingInfo: body.showPricingInfo === "on", isFeatured: body.isFeatured === "on" } as Partial<ApplicationInput>;
      return c.html(layout({ title: "Tambah aplikasi", body: applicationForm(csrfToken(c), allCategories(), values, "/admin/applications", "Simpan aplikasi", friendlyError(error)), admin, csrf: csrfToken(c) }), 400);
    }
  });

  app.get("/admin/applications/:id/edit", (c) => {
    const admin = currentAdmin(c)!;
    const application = findApplication(c.req.param("id"));
    if (!application) return c.notFound();
    return c.html(layout({ title: `Edit ${application.name}`, body: applicationForm(csrfToken(c), allCategories(), { name: application.name, slug: application.slug, url: application.url, shortDescription: application.short_description, description: application.description ?? "", categoryId: application.category_id ?? "", keywords: application.keywords, status: application.status, accessType: application.access_type, pricingType: application.pricing_type, showAccessInfo: Boolean(application.show_access_info), showPricingInfo: Boolean(application.show_pricing_info), isFeatured: Boolean(application.is_featured), sortOrder: application.sort_order, iconPath: application.icon_path }, `/admin/applications/${application.id}/edit`, "Simpan perubahan"), admin, csrf: csrfToken(c) }));
  });

  app.post("/admin/applications/:id/edit", async (c) => {
    const admin = currentAdmin(c)!;
    const body = await c.req.parseBody();
    if (!csrfIsValid(c, body._csrf)) return c.text("CSRF token tidak valid.", 403);
    const existing = findApplication(c.req.param("id"));
    if (!existing) return c.notFound();
    try {
      const input = parseApplication(body);
      const iconPath = await saveIcon(body.icon);
      updateApplication(existing.id, input, iconPath);
      return c.redirect("/admin/applications?updated=1");
    } catch (error) {
      const values = { ...Object.fromEntries(Object.entries(body).filter(([, item]) => typeof item === "string")), accessType: value(body, "accessType") || "public", pricingType: value(body, "pricingType") || "free", showAccessInfo: body.showAccessInfo === "on", showPricingInfo: body.showPricingInfo === "on", isFeatured: body.isFeatured === "on", iconPath: existing.icon_path } as Partial<ApplicationInput> & { iconPath?: string | null };
      return c.html(layout({ title: `Edit ${existing.name}`, body: applicationForm(csrfToken(c), allCategories(), values, `/admin/applications/${existing.id}/edit`, "Simpan perubahan", friendlyError(error)), admin, csrf: csrfToken(c) }), 400);
    }
  });

  app.post("/admin/applications/:id/archive", async (c) => {
    const body = await c.req.parseBody();
    if (!csrfIsValid(c, body._csrf)) return c.text("CSRF token tidak valid.", 403);
    archiveApplication(c.req.param("id"));
    return c.redirect("/admin/applications?archived=1");
  });

  app.get("/admin/applications/:id/delete", (c) => {
    const admin = currentAdmin(c)!;
    const application = findApplication(c.req.param("id"));
    if (!application) return c.notFound();
    const body = `<section class="admin-main"><div class="container form-shell"><div class="panel"><p class="eyebrow">Konfirmasi tindakan</p><h1>Hapus ${esc(application.name)}?</h1><p class="muted">Penghapusan permanen tidak dapat dibatalkan. Untuk menyembunyikan aplikasi tanpa menghapus datanya, gunakan arsip.</p><form method="post" action="/admin/applications/${esc(application.id)}/delete" class="form-actions"><input type="hidden" name="_csrf" value="${esc(csrfToken(c))}"><button class="button button-primary" type="submit">Ya, hapus permanen</button><a class="button button-secondary" href="/admin/applications">Batal</a></form></div></div></section>`;
    return c.html(layout({ title: "Konfirmasi penghapusan", body, admin, csrf: csrfToken(c) }));
  });

  app.post("/admin/applications/:id/delete", async (c) => {
    const body = await c.req.parseBody();
    if (!csrfIsValid(c, body._csrf)) return c.text("CSRF token tidak valid.", 403);
    deleteApplication(c.req.param("id"));
    return c.redirect("/admin/applications?deleted=1");
  });

  app.get("/admin/categories", (c) => {
    const admin = currentAdmin(c)!;
    const categories = allCategories();
    const body = `<section class="admin-main"><div class="container">${adminPageHeader("Katalog", "Kategori", "Kelompokkan aplikasi agar mudah ditemukan.")}<div class="panel"><h2>Tambah kategori</h2><form method="post" action="/admin/categories" class="form-grid"><input type="hidden" name="_csrf" value="${esc(csrfToken(c))}"><input type="hidden" name="action" value="create"><div class="form-field"><label for="category-name">Nama</label><input class="form-control" id="category-name" name="name" required></div><div class="form-field"><label for="category-slug">Slug</label><input class="form-control" id="category-slug" name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required></div><div class="form-field full"><label for="category-description">Deskripsi</label><input class="form-control" id="category-description" name="description"></div><div class="form-field full"><button class="button button-primary" type="submit">Tambah kategori</button></div></form></div><div class="panel" style="margin-top:18px"><h2>Kategori aktif</h2><div class="category-list">${categories.map((category) => `<div class="category-row"><form method="post" action="/admin/categories" class="category-edit-form"><input type="hidden" name="_csrf" value="${esc(csrfToken(c))}"><input type="hidden" name="action" value="update"><input type="hidden" name="id" value="${esc(category.id)}"><input class="form-control" aria-label="Nama kategori" name="name" value="${esc(category.name)}" required><input class="form-control" aria-label="Slug kategori" name="slug" value="${esc(category.slug)}" required><input class="form-control" aria-label="Deskripsi kategori" name="description" value="${esc(category.description ?? "")}"><input class="form-control order-input" aria-label="Urutan kategori" name="sortOrder" type="number" min="0" value="${esc(category.sort_order)}"><button class="button button-small button-secondary" type="submit">Simpan</button></form><form method="post" action="/admin/categories" class="inline-form"><input type="hidden" name="_csrf" value="${esc(csrfToken(c))}"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="${esc(category.id)}"><button class="button button-small button-quiet" type="submit">Hapus</button></form></div>`).join("")}</div></div></div></section>`;
    return c.html(layout({ title: "Kategori", body, admin, csrf: csrfToken(c) }));
  });

  app.post("/admin/categories", async (c) => {
    const body = await c.req.parseBody();
    if (!csrfIsValid(c, body._csrf)) return c.text("CSRF token tidak valid.", 403);
    try {
      if (value(body, "action") === "delete") deleteCategory(value(body, "id"));
      else if (value(body, "action") === "update") updateCategory(value(body, "id"), value(body, "name"), value(body, "slug"), value(body, "description"), Number(value(body, "sortOrder") || 0));
      else createCategory(value(body, "name"), value(body, "slug"), value(body, "description"));
      return c.redirect("/admin/categories?updated=1");
    } catch (error) {
      return c.redirect(`/admin/categories?error=${encodeURIComponent(friendlyError(error))}`);
    }
  });
}
