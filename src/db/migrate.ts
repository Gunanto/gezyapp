import { sqlite } from "./client";

function ensureApplicationColumn(name: string, definition: string) {
  const columns = sqlite.query("PRAGMA table_info(applications)").all() as Array<{ name: string }>;
  if (!columns.some((column) => column.name === name)) {
    sqlite.exec(`ALTER TABLE applications ADD COLUMN ${name} ${definition}`);
  }
}

export function runMigrations() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      last_login_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_admin_id_idx ON sessions(admin_id);
    CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
      url TEXT NOT NULL,
      short_description TEXT NOT NULL,
      description TEXT,
      icon_path TEXT,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      keywords TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
      access_type TEXT NOT NULL DEFAULT 'public' CHECK (access_type IN ('public', 'login_required')),
      pricing_type TEXT NOT NULL DEFAULT 'free' CHECK (pricing_type IN ('free', 'paid', 'freemium')),
      show_access_info INTEGER NOT NULL DEFAULT 1,
      show_pricing_info INTEGER NOT NULL DEFAULT 1,
      is_featured INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT
    );
    CREATE INDEX IF NOT EXISTS applications_status_idx ON applications(status);
    CREATE INDEX IF NOT EXISTS applications_category_idx ON applications(category_id);
    CREATE INDEX IF NOT EXISTS applications_sort_idx ON applications(sort_order, name);
  `);

  // Keep existing installations compatible with the metadata introduced after the MVP schema.
  ensureApplicationColumn("access_type", "TEXT NOT NULL DEFAULT 'public' CHECK (access_type IN ('public', 'login_required'))");
  ensureApplicationColumn("pricing_type", "TEXT NOT NULL DEFAULT 'free' CHECK (pricing_type IN ('free', 'paid', 'freemium'))");
  ensureApplicationColumn("show_access_info", "INTEGER NOT NULL DEFAULT 1");
  ensureApplicationColumn("show_pricing_info", "INTEGER NOT NULL DEFAULT 1");
}
