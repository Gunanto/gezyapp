import { test, expect, describe } from "bun:test";
import { app } from "../src/app";
import { APP_VERSION } from "../src/config/version";
import { listPublicApplications } from "../src/services/applications";

describe("GezyApp public shell", () => {
  test("uses a valid initial semantic version", () => {
    expect(APP_VERSION).toBe("0.1.0");
    expect(APP_VERSION).toMatch(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);
  });

  test("renders the global footer and version", async () => {
    const response = await app.request("http://localhost/");
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain("© 2026 Gezy App ala PakGun. All rights reserved.");
    expect(html).toContain("Versi 0.1.0");
  });

  test("health check reports the running version", async () => {
    const response = await app.request("http://localhost/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", version: "0.1.0" });
  });

  test("error pages keep the global footer", async () => {
    const response = await app.request("http://localhost/does-not-exist");
    const html = await response.text();
    expect(response.status).toBe(404);
    expect(html).toContain("© 2026 Gezy App ala PakGun. All rights reserved.");
  });

  test("public query never returns non-published applications", () => {
    expect(listPublicApplications().every((application) => application.status === "published")).toBe(true);
  });
});
