import type { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { verifyPassword, createSession, findAdminByEmail, getAdminForSession, revokeSession } from "../services/auth";
import { csrfIsValid, csrfToken } from "../services/csrf";
import { esc, flash, layout } from "../views/html";

const attempts = new Map<string, { count: number; resetAt: number }>();

function clientKey(c: any) {
  return c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

function loginForm(csrf: string, error = "", email = "") {
  return `<main class="auth-main"><section class="auth-card"><p class="eyebrow">Area admin</p><h1>Masuk ke GezyApp</h1><p>Kelola aplikasi dan informasi yang tampil pada katalog publik.</p>${error ? flash(error, "error") : ""}<form method="post" action="/admin/login"><input type="hidden" name="_csrf" value="${esc(csrf)}"><div class="form-field"><label for="email">Email</label><input class="form-control" id="email" name="email" type="email" value="${esc(email)}" autocomplete="username" required></div><div class="form-field"><label for="password">Kata sandi</label><input class="form-control" id="password" name="password" type="password" autocomplete="current-password" required></div><button class="button button-primary" type="submit">Masuk</button></form></section></main>`;
}

export function currentAdmin(c: any) {
  const token = getCookie(c, "gezyapp_session");
  return token ? getAdminForSession(token) : null;
}

export function registerAuthRoutes(app: Hono) {
  app.get("/admin/login", (c) => c.html(layout({ title: "Login admin", body: loginForm(csrfToken(c)), noindex: true })));

  app.post("/admin/login", async (c) => {
    const body = await c.req.parseBody();
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    const key = clientKey(c);
    const state = attempts.get(key);
    if (state && state.resetAt > Date.now() && state.count >= 8) return c.html(layout({ title: "Login admin", body: loginForm(csrfToken(c), "Terlalu banyak percobaan. Coba lagi beberapa saat." ), noindex: true }), 429);
    if (!csrfIsValid(c, body._csrf)) return c.html(layout({ title: "Login admin", body: loginForm(csrfToken(c), "Form kedaluwarsa. Muat ulang halaman dan coba lagi.", email), noindex: true }), 403);
    const admin = findAdminByEmail(email);
    const valid = admin ? await verifyPassword(password, admin.password_hash) : false;
    if (!admin || !valid) {
      const next = state && state.resetAt > Date.now() ? { count: state.count + 1, resetAt: state.resetAt } : { count: 1, resetAt: Date.now() + 10 * 60_000 };
      attempts.set(key, next);
      return c.html(layout({ title: "Login admin", body: loginForm(csrfToken(c), "Email atau kata sandi tidak benar.", email), noindex: true }), 401);
    }
    attempts.delete(key);
    const session = await createSession(admin.id);
    setCookie(c, "gezyapp_session", session.rawToken, { httpOnly: true, sameSite: "Lax", secure: c.req.url.startsWith("https://"), path: "/", expires: new Date(session.expires) });
    const next = new URL(c.req.url).searchParams.get("next");
    return c.redirect(next?.startsWith("/") ? next : "/admin");
  });

  app.post("/admin/logout", async (c) => {
    const body = await c.req.parseBody();
    const token = getCookie(c, "gezyapp_session");
    if (!csrfIsValid(c, body._csrf)) return c.text("CSRF token tidak valid.", 403);
    if (token) revokeSession(token);
    deleteCookie(c, "gezyapp_session", { path: "/" });
    return c.redirect("/admin/login");
  });
}

export { csrfToken };
