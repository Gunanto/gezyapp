import { z } from "zod";
import type { ApplicationStatus, ApplicationWithCategory, Category } from "../db/schema";
import { nowIso, sqlite } from "../db/client";

export const applicationInputSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(120, "Nama terlalu panjang."),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung."),
  url: z.string().trim().url("URL tidak valid.").refine((value) => new URL(value).protocol === "https:", "URL aplikasi harus menggunakan HTTPS."),
  shortDescription: z.string().trim().min(1, "Deskripsi singkat wajib diisi.").max(240, "Deskripsi singkat terlalu panjang."),
  description: z.string().trim().max(5000, "Deskripsi terlalu panjang.").optional().default(""),
  categoryId: z.string().trim().optional().default(""),
  keywords: z.string().trim().max(500, "Kata kunci terlalu panjang.").optional().default(""),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  accessType: z.enum(["public", "login_required"]).default("public"),
  pricingType: z.enum(["free", "paid", "freemium"]).default("free"),
  showAccessInfo: z.boolean().default(true),
  showPricingInfo: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export type ApplicationInput = z.infer<typeof applicationInputSchema>;

function toApplication(row: Record<string, unknown>): ApplicationWithCategory {
  return row as unknown as ApplicationWithCategory;
}

export function listPublicApplications(query = "", categorySlug = "") {
  const q = query.trim().toLowerCase();
  const search = `%${q}%`;
  return sqlite.query(`
    SELECT a.*, c.name AS category_name
    FROM applications a
    LEFT JOIN categories c ON c.id = a.category_id
    WHERE a.status = 'published'
      AND (? = '' OR lower(a.name) LIKE ? OR lower(a.short_description) LIKE ? OR lower(a.keywords) LIKE ?)
      AND (? = '' OR c.slug = ?)
    ORDER BY a.is_featured DESC, a.sort_order ASC, lower(a.name) ASC
  `).all(q, search, search, search, categorySlug, categorySlug).map((row) => toApplication(row as Record<string, unknown>));
}

export function listAdminApplications(query = "", status = "") {
  const q = query.trim().toLowerCase();
  const search = `%${q}%`;
  return sqlite.query(`
    SELECT a.*, c.name AS category_name
    FROM applications a
    LEFT JOIN categories c ON c.id = a.category_id
    WHERE (? = '' OR lower(a.name) LIKE ? OR lower(a.url) LIKE ?)
      AND (? = '' OR a.status = ?)
    ORDER BY a.sort_order ASC, lower(a.name) ASC
  `).all(q, search, search, status, status).map((row) => toApplication(row as Record<string, unknown>));
}

export function findApplication(id: string) {
  return sqlite.query(`SELECT a.*, c.name AS category_name FROM applications a LEFT JOIN categories c ON c.id = a.category_id WHERE a.id = ?`).get(id) as ApplicationWithCategory | null;
}

export function findApplicationBySlug(slug: string) {
  return sqlite.query(`SELECT a.*, c.name AS category_name FROM applications a LEFT JOIN categories c ON c.id = a.category_id WHERE a.slug = ? AND a.status = 'published'`).get(slug) as ApplicationWithCategory | null;
}

export function categoriesForPublic() {
  return sqlite.query(`
    SELECT c.* FROM categories c
    WHERE EXISTS (SELECT 1 FROM applications a WHERE a.category_id = c.id AND a.status = 'published')
    ORDER BY c.sort_order ASC, lower(c.name) ASC
  `).all() as Category[];
}

export function allCategories() {
  return sqlite.query(`SELECT * FROM categories ORDER BY sort_order ASC, lower(name) ASC`).all() as Category[];
}

export function createApplication(input: ApplicationInput, iconPath: string | null = null) {
  const id = crypto.randomUUID();
  const now = nowIso();
  sqlite.query(`
    INSERT INTO applications (id, name, slug, url, short_description, description, icon_path, category_id, keywords, status, access_type, pricing_type, show_access_info, show_pricing_info, is_featured, sort_order, created_at, updated_at, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, input.name, input.slug, input.url, input.shortDescription, input.description || null, iconPath, input.categoryId || null, input.keywords, input.status, input.accessType, input.pricingType, input.showAccessInfo ? 1 : 0, input.showPricingInfo ? 1 : 0, input.isFeatured ? 1 : 0, input.sortOrder, now, now, input.status === "published" ? now : null);
  return findApplication(id);
}

export function updateApplication(id: string, input: ApplicationInput, iconPath?: string | null) {
  const current = findApplication(id);
  if (!current) return null;
  const now = nowIso();
  const nextIcon = iconPath === undefined ? current.icon_path : iconPath;
  const publishedAt = input.status === "published" ? (current.published_at ?? now) : current.published_at;
  sqlite.query(`
    UPDATE applications SET name = ?, slug = ?, url = ?, short_description = ?, description = ?, icon_path = ?, category_id = ?, keywords = ?, status = ?, access_type = ?, pricing_type = ?, show_access_info = ?, show_pricing_info = ?, is_featured = ?, sort_order = ?, updated_at = ?, published_at = ? WHERE id = ?
  `).run(input.name, input.slug, input.url, input.shortDescription, input.description || null, nextIcon, input.categoryId || null, input.keywords, input.status, input.accessType, input.pricingType, input.showAccessInfo ? 1 : 0, input.showPricingInfo ? 1 : 0, input.isFeatured ? 1 : 0, input.sortOrder, now, publishedAt, id);
  return findApplication(id);
}

export function archiveApplication(id: string) {
  sqlite.query(`UPDATE applications SET status = 'archived', is_featured = 0, updated_at = ? WHERE id = ?`).run(nowIso(), id);
}

export function deleteApplication(id: string) {
  sqlite.query(`DELETE FROM applications WHERE id = ?`).run(id);
}

export function applicationStats() {
  const counts = sqlite.query(`SELECT status, count(*) AS count FROM applications GROUP BY status`).all() as Array<{ status: ApplicationStatus; count: number }>;
  return {
    published: counts.find((item) => item.status === "published")?.count ?? 0,
    draft: counts.find((item) => item.status === "draft")?.count ?? 0,
    archived: counts.find((item) => item.status === "archived")?.count ?? 0,
    categories: (sqlite.query(`SELECT count(*) AS count FROM categories`).get() as { count: number }).count,
  };
}

export function createCategory(name: string, slug: string, description: string) {
  const now = nowIso();
  const id = crypto.randomUUID();
  sqlite.query(`INSERT INTO categories (id, name, slug, description, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(id, name.trim(), slug.trim().toLowerCase(), description.trim() || null, 0, now, now);
}

export function updateCategory(id: string, name: string, slug: string, description: string, sortOrder: number) {
  sqlite.query(`UPDATE categories SET name = ?, slug = ?, description = ?, sort_order = ?, updated_at = ? WHERE id = ?`).run(name.trim(), slug.trim().toLowerCase(), description.trim() || null, sortOrder, nowIso(), id);
}

export function deleteCategory(id: string) {
  const used = (sqlite.query(`SELECT count(*) AS count FROM applications WHERE category_id = ?`).get(id) as { count: number }).count;
  if (used > 0) throw new Error("Kategori masih digunakan oleh aplikasi.");
  sqlite.query(`DELETE FROM categories WHERE id = ?`).run(id);
}
