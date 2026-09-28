import { getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";

const COOKIE_NAME = "gezyapp_csrf";

export function csrfToken(c: Context) {
  const existing = getCookie(c, COOKIE_NAME);
  if (existing) return existing;
  const token = crypto.randomUUID();
  setCookie(c, COOKIE_NAME, token, { httpOnly: true, sameSite: "Lax", secure: c.req.url.startsWith("https://"), path: "/", maxAge: 86_400 });
  return token;
}

export function csrfIsValid(c: Context, candidate: unknown) {
  const expected = getCookie(c, COOKIE_NAME);
  return typeof candidate === "string" && Boolean(expected) && candidate === expected;
}
