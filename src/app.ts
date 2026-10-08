import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { config } from "./config/env";
import { runMigrations } from "./db/migrate";
import { cleanExpiredSessions } from "./services/auth";
import { registerAuthRoutes } from "./routes/auth";
import { registerAdminRoutes } from "./routes/admin";
import { registerPublicRoutes } from "./routes/public";
import { layout } from "./views/html";

runMigrations();
cleanExpiredSessions();

export const app = new Hono();

app.use("*", async (c, next) => {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("X-Frame-Options", "DENY");
  c.header("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'");
  await next();
});

app.use("/static/*", serveStatic({ root: "./src" }));
app.use("/uploads/*", serveStatic({ root: "./storage" }));

registerPublicRoutes(app);
registerAuthRoutes(app);
registerAdminRoutes(app);

app.notFound((c) => c.html(layout({ title: "Halaman tidak ditemukan", noindex: true, body: `<section class="admin-main"><div class="container"><div class="empty-state"><h1>Halaman tidak ditemukan</h1><p>Alamat yang Anda buka tidak tersedia.</p><a class="button button-primary" href="/">Kembali ke GezyApp</a></div></div></section>` }), 404));
app.onError((error, c) => {
  console.error(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path}`, error);
  return c.html(layout({ title: "Terjadi kesalahan", noindex: true, body: `<section class="admin-main"><div class="container"><div class="empty-state"><h1>Terjadi kesalahan</h1><p>Coba lagi beberapa saat.</p><a class="button button-primary" href="/">Kembali ke GezyApp</a></div></div></section>` }), 500);
});

export { config };
