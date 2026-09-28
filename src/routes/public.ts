import type { Hono } from "hono";
import { config } from "../config/env";
import { APP_VERSION } from "../config/version";
import { sqlite } from "../db/client";
import { categoriesForPublic, findApplicationBySlug, listPublicApplications } from "../services/applications";
import { applicationGrid, layout, publicCatalog } from "../views/html";

function catalogBody(query: string, category: string) {
  return `<section class="hero"><div class="container hero-grid"><div><p class="eyebrow" style="color:#a3e635">Gerbang ekosistem GezyTech</p><h1>Semua aplikasi.<br><span>Satu tempat.</span></h1><p class="hero-copy">Temukan ruang belajar, alat kerja, platform AI, dan permainan edukasi GezyTech tanpa perlu mengingat banyak alamat.</p><div class="hero-actions"><a class="button button-primary" href="#katalog">Jelajahi aplikasi <span aria-hidden="true">↓</span></a><a class="button button-secondary" href="/tentang">Tentang GezyApp</a></div></div><div class="hero-art"><img src="/static/images/gezyapp-icon-web.png" alt="Ikon GezyApp"></div></div></section>${publicCatalog({ applications: listPublicApplications(query, category), categories: categoriesForPublic(), query, category })}`;
}

export function registerPublicRoutes(app: Hono) {
  app.get("/", (c) => {
    const url = new URL(c.req.url);
    const query = url.searchParams.get("q") ?? "";
    const category = url.searchParams.get("category") ?? "";
    return c.html(layout({ title: "Semua aplikasi", body: catalogBody(query, category), canonicalPath: "/" }));
  });

  app.get("/aplikasi", (c) => {
    const url = new URL(c.req.url);
    const query = url.searchParams.get("q") ?? "";
    const category = url.searchParams.get("category") ?? "";
    return c.html(layout({ title: "Katalog aplikasi", body: publicCatalog({ applications: listPublicApplications(query, category), categories: categoriesForPublic(), query, category }), canonicalPath: "/aplikasi" }));
  });

  app.get("/partials/applications", (c) => {
    const url = new URL(c.req.url);
    return c.html(applicationGrid(listPublicApplications(url.searchParams.get("q") ?? "", url.searchParams.get("category") ?? "")));
  });

  app.get("/aplikasi/:slug", (c) => {
    const application = findApplicationBySlug(c.req.param("slug"));
    if (!application) return c.notFound();
    const body = `<section class="admin-main"><div class="container form-shell"><a class="back-link" href="/">← Kembali ke katalog</a><div class="detail-card"><div class="app-icon detail-icon">${application.icon_path ? `<img src="${application.icon_path}" alt="">` : `<span class="app-icon-fallback">${application.name.slice(0, 1)}</span>`}</div><p class="eyebrow">${application.category_name ?? "GezyTech"}</p><h1>${application.name}</h1><p class="detail-description">${application.description ?? application.short_description}</p><a class="button button-primary" href="${application.url}" target="_blank" rel="noopener noreferrer">Buka aplikasi ↗</a></div></div></section>`;
    return c.html(layout({ title: application.name, body, description: application.short_description, canonicalPath: `/aplikasi/${application.slug}` }));
  });

  app.get("/tentang", (c) => {
    const body = `<section class="admin-main"><div class="container form-shell"><div class="detail-card"><p class="eyebrow">Tentang GezyApp</p><h1>Satu pintu untuk ekosistem GezyTech.</h1><p class="detail-description">GezyApp membantu pengunjung menemukan seluruh aplikasi GezyTech dengan cepat. Katalog ini dikelola oleh admin dan dapat bertambah seiring berkembangnya layanan.</p><div class="about-points"><div><strong>${listPublicApplications().length}</strong><span>aplikasi terbit</span></div><div><strong>${APP_VERSION}</strong><span>versi portal</span></div></div></div></div></section>`;
    return c.html(layout({ title: "Tentang", body, canonicalPath: "/tentang" }));
  });

  app.get("/robots.txt", (c) => {
    c.header("Content-Type", "text/plain; charset=UTF-8");
    return c.body(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /health\nSitemap: ${new URL("/sitemap.xml", config.APP_URL).toString()}\n`);
  });

  app.get("/sitemap.xml", (c) => {
    c.header("Content-Type", "application/xml; charset=UTF-8");
    const urls = ["/", "/aplikasi", "/tentang", ...listPublicApplications().map((application) => `/aplikasi/${application.slug}`)];
    const xml = urls.map((path) => `<url><loc>${escXml(new URL(path, config.APP_URL).toString())}</loc></url>`).join("");
    return c.body(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}</urlset>`);
  });

  app.get("/health", (c) => {
    try {
      sqlite.query("SELECT 1 AS ok").get();
      return c.json({ status: "ok", version: APP_VERSION });
    } catch {
      return c.json({ status: "error" }, 503);
    }
  });
}

function escXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}
