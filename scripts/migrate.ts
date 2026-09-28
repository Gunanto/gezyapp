import "../src/config/env";
import { runMigrations } from "../src/db/migrate";

runMigrations();
console.log("Database migrations applied.");
