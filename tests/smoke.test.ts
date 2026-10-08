import { test, expect, describe } from "bun:test";
import { app } from "../src/app";
import { APP_VERSION } from "../src/config/version";
import { listPublicApplications } from "../src/services/applications";
import { applicationMeta } from "../src/views/html";

describe("GezyApp public shell", () => {
  test("uses a valid initial semantic version", () => {
    expect(APP_VERSION).toBe("0.3.3");
    expect(APP_VERSION).toMatch(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);
  });

  test("renders the global footer and version", async () => {
    const response = await app.request("http://localhost/");
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Security-Policy")).toContain("https://fonts.googleapis.com");
    expect(response.headers.get("Content-Security-Policy")).toContain("https://fonts.gstatic.com");
    expect(html).toContain('<span class="hero-title-line">Semua Aplikasi,</span><span class="hero-title-line">Satu tempat.</span>');
    expect(html).toContain("© 2026 GezyTech. Dikembangkan oleh PakGun.");
    expect(html).toContain("Versi 0.3.3");
  });

  test("health check reports the running version", async () => {
    const response = await app.request("http://localhost/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", version: "0.3.3" });
  });

  test("error pages keep the global footer", async () => {
    const response = await app.request("http://localhost/does-not-exist");
    const html = await response.text();
    expect(response.status).toBe(404);
    expect(html).toContain("© 2026 GezyTech. Dikembangkan oleh PakGun.");
  });

  test("public query never returns non-published applications", () => {
    expect(listPublicApplications().every((application) => application.status === "published")).toBe(true);
  });

  test("application metadata badges respect admin visibility settings", () => {
    const application = listPublicApplications()[0];
    expect(application).toBeDefined();
    const visible = applicationMeta(application);
    expect(visible).toContain("Publik · tanpa akun");
    expect(visible).toContain("Gratis");

    const hidden = applicationMeta({ ...application, show_access_info: 0, show_pricing_info: 0 });
    expect(hidden).toBe("");
  });

  test("public cards offer preview and destination actions", async () => {
    const response = await app.request("http://localhost/");
    const html = await response.text();
    expect(html).toContain('href="/aplikasi/gezyteach"');
    expect(html).toContain("Buka Aplikasi");
  });

  test("application detail page provides a screenshot preview area", async () => {
    const response = await app.request("http://localhost/aplikasi/gezyteach");
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain("Lihat aplikasi");
    expect(html).toContain("Pratinjau layar");
  });
});
