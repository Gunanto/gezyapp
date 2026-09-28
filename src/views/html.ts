import { APP_VERSION } from "../config/version";
import { config } from "../config/env";
import type { Admin, ApplicationWithCategory, Category } from "../db/schema";

export function esc(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const accessLabels = {
  public: "Publik · tanpa akun",
  login_required: "Perlu akun masuk",
} as const;

const pricingLabels = {
  free: "Gratis",
  paid: "Berbayar",
  freemium: "Freemium",
} as const;

export function applicationMeta(application: ApplicationWithCategory) {
  const badges: string[] = [];
  if (application.show_access_info) {
    const label = accessLabels[application.access_type] ?? accessLabels.public;
    badges.push(`<span class="app-badge app-badge-access app-badge-${esc(application.access_type)}"><span aria-hidden="true">${application.access_type === "public" ? "◉" : "◌"}</span>${label}</span>`);
  }
  if (application.show_pricing_info) {
    const label = pricingLabels[application.pricing_type] ?? pricingLabels.free;
    badges.push(`<span class="app-badge app-badge-pricing app-badge-${esc(application.pricing_type)}"><span aria-hidden="true">${application.pricing_type === "paid" ? "◆" : "✓"}</span>${label}</span>`);
  }
  return badges.length ? `<div class="app-card-meta" aria-label="Informasi aplikasi">${badges.join("")}</div>` : "";
}

export function layout(options: { title: string; body: string; admin?: Admin | null; csrf?: string; description?: string; canonicalPath?: string; noindex?: boolean }) {
  const admin = options.admin;
  const privatePage = Boolean(admin) || options.noindex;
  const nav = admin
    ? `<a href="/admin" class="nav-link">Dashboard</a><a href="/admin/applications" class="nav-link">Aplikasi</a><a href="/admin/categories" class="nav-link">Kategori</a>`
    : `<a href="/" class="nav-link">Aplikasi</a><a href="/tentang" class="nav-link">Tentang</a><a href="/admin/login" class="nav-link nav-link-accent">Admin</a>`;
  const logout = admin && options.csrf ? `<form method="post" action="/admin/logout" class="inline-form"><input type="hidden" name="_csrf" value="${esc(options.csrf)}"><button class="nav-link nav-button" type="submit">Keluar</button></form>` : "";
  return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${esc(options.description ?? "GezyApp — semua aplikasi GezyTech dalam satu tempat.")}">
    ${privatePage ? '<meta name="robots" content="noindex,nofollow">' : `<link rel="canonical" href="${esc(`${config.APP_URL}${options.canonicalPath ?? "/"}`)}">`}
    <meta property="og:title" content="${esc(options.title)} · GezyApp">
    <meta property="og:description" content="${esc(options.description ?? "GezyApp — semua aplikasi GezyTech dalam satu tempat.")}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${esc(`${config.APP_URL}${options.canonicalPath ?? "/"}`)}">
    <meta property="og:image" content="${esc(`${config.APP_URL}/static/images/gezyapp-icon-web.png`)}">
    <meta name="theme-color" content="#052e24">
    <title>${esc(options.title)} · GezyApp</title>
    <link rel="icon" type="image/png" href="/static/images/gezyapp-icon-web.png">
    <link rel="stylesheet" href="/static/style.css">
    <script src="/static/htmx.min.js" defer></script>
  </head>
  <body>
    <div class="site-shell">
      <header class="site-header"><div class="container header-inner">
        <a href="${admin ? "/admin" : "/"}" class="brand" aria-label="GezyApp beranda"><img src="/static/images/gezyapp-icon-web.png" alt="" width="42" height="42"><span>Gezy<span class="brand-accent">App</span></span></a>
        <nav class="main-nav" aria-label="Navigasi utama">${nav}${logout}</nav>
      </div></header>
      <main>${options.body}</main>
      <footer class="site-footer"><div class="container footer-inner"><p>© 2026 Gezy App ala PakGun. All rights reserved.</p><span class="version-badge">Versi ${esc(APP_VERSION)}</span></div></footer>
    </div>
  </body>
</html>`;
}

export function flash(message: string, type: "success" | "error" = "success") {
  return `<div class="flash flash-${type}" role="status">${esc(message)}</div>`;
}

export function applicationCard(application: ApplicationWithCategory) {
  const icon = application.icon_path ? `<img src="${esc(application.icon_path)}" alt="" loading="lazy">` : `<span class="app-icon-fallback" aria-hidden="true">${esc(application.name.slice(0, 1))}</span>`;
  return `<article class="app-card ${application.is_featured ? "is-featured" : ""}"><div class="app-card-top"><div class="app-icon">${icon}</div>${application.is_featured ? '<span class="featured-label">Unggulan</span>' : ""}</div>${applicationMeta(application)}<div class="app-card-content"><p class="eyebrow">${esc(application.category_name ?? "GezyTech")}</p><h3>${esc(application.name)}</h3><p>${esc(application.short_description)}</p></div><a class="button button-small button-primary" href="${esc(application.url)}" target="_blank" rel="noopener noreferrer">Buka aplikasi <span aria-hidden="true">↗</span></a></article>`;
}

export function applicationGrid(applications: ApplicationWithCategory[]) {
  if (applications.length === 0) return `<div id="application-grid" class="empty-state"><div class="empty-icon" aria-hidden="true">⌕</div><h3>Aplikasi tidak ditemukan</h3><p>Coba kata kunci atau kategori lain.</p><a class="button button-secondary" href="/">Tampilkan semua aplikasi</a></div>`;
  return `<div id="application-grid" class="app-grid">${applications.map(applicationCard).join("")}</div>`;
}

export function publicCatalog(options: { applications: ApplicationWithCategory[]; categories: Category[]; query: string; category: string }) {
  const categoryOptions = options.categories.map((category) => `<option value="${esc(category.slug)}" ${options.category === category.slug ? "selected" : ""}>${esc(category.name)}</option>`).join("");
  return `<section class="catalog-section container" id="katalog"><div class="section-heading"><div><p class="eyebrow">Katalog aplikasi</p><h2>Temukan ruang kerja yang tepat</h2></div><span class="result-count">${options.applications.length} aplikasi</span></div><form class="catalog-filters" method="get" action="/" hx-get="/partials/applications" hx-target="#application-grid" hx-select="#application-grid" hx-push-url="true" hx-trigger="keyup changed delay:350ms, change"><label class="search-field"><span class="sr-only">Cari aplikasi</span><span class="search-icon" aria-hidden="true">⌕</span><input type="search" name="q" value="${esc(options.query)}" placeholder="Cari aplikasi, fungsi, atau kata kunci..." autocomplete="off"></label><label class="select-field"><span class="sr-only">Pilih kategori</span><select name="category"><option value="">Semua kategori</option>${categoryOptions}</select></label><noscript><button class="button button-primary" type="submit">Cari</button></noscript></form>${applicationGrid(options.applications)}</section>`;
}

export function adminTable(applications: ApplicationWithCategory[], csrf = "") {
  if (!applications.length) return `<div class="empty-state compact"><h3>Belum ada aplikasi</h3><p>Tambahkan aplikasi pertama untuk mengisi katalog.</p><a class="button button-primary" href="/admin/applications/new">Tambah aplikasi</a></div>`;
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Aplikasi</th><th>Kategori</th><th>Status</th><th>Urutan</th><th>Tindakan</th></tr></thead><tbody>${applications.map((app) => `<tr><td><div class="table-app"><div class="mini-icon">${app.icon_path ? `<img src="${esc(app.icon_path)}" alt="">` : esc(app.name.slice(0, 1))}</div><div><strong>${esc(app.name)}</strong><small>${esc(app.url)}</small></div></div></td><td>${esc(app.category_name ?? "—")}</td><td><span class="status status-${esc(app.status)}">${app.status === "published" ? "Terbit" : app.status === "draft" ? "Draf" : "Arsip"}</span></td><td>${esc(app.sort_order)}</td><td><div class="row-actions"><a class="button button-small button-secondary" href="/admin/applications/${esc(app.id)}/edit">Edit</a><form method="post" action="/admin/applications/${esc(app.id)}/archive" class="inline-form"><input type="hidden" name="_csrf" value="${esc(csrf)}"><button class="button button-small button-quiet" type="submit">Arsip</button></form><a class="button button-small button-quiet" href="/admin/applications/${esc(app.id)}/delete">Hapus</a></div></td></tr>`).join("")}</tbody></table></div>`;
}

export function adminPageHeader(eyebrow: string, title: string, description: string, action = "") {
  return `<div class="admin-page-heading"><div><p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1><p>${esc(description)}</p></div>${action}</div>`;
}
