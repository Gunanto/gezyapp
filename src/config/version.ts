import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
const versionPath = resolve(import.meta.dir, "../../VERSION");
export const APP_VERSION = readFileSync(versionPath, "utf8").trim();

if (!semverPattern.test(APP_VERSION)) {
  throw new Error(`Invalid Semantic Version in VERSION: ${APP_VERSION}`);
}
