import { serve } from "bun";
import { app, config } from "./app";
import { APP_VERSION } from "./config/version";

if (import.meta.main) {
  serve({ fetch: app.fetch, port: config.PORT });
  console.log(`GezyApp ${APP_VERSION} running at ${config.APP_URL}`);
}
