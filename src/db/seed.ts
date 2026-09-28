import { runMigrations } from "./migrate";
import { nowIso, sqlite } from "./client";

const categories = [
  ["education", "Pendidikan", "Aplikasi untuk belajar, mengajar, dan evaluasi."],
  ["productivity", "Produktivitas", "Aplikasi untuk kegiatan dan kebutuhan organisasi."],
  ["platform", "Platform", "Layanan inti dan platform GezyTech."],
  ["ai", "AI dan Platform", "Perangkat berbasis AI untuk membantu pekerjaan."],
  ["learning-games", "Permainan Edukasi", "Belajar melalui permainan yang menyenangkan."],
] as const;

const applications = [
  ["gezyteach", "GezyTeach", "https://teach.gezytech.web.id/", "Ruang belajar dan mengajar online untuk komunitas GezyTech.", "education", "kelas, belajar, mengajar", 1],
  ["gezycbt", "GezyCBT", "https://cbt.gezytech.web.id/", "Platform ujian dan evaluasi berbasis komputer.", "education", "ujian, evaluasi, cbt", 2],
  ["gezyclass", "GezyClass", "https://class.gezytech.web.id/", "Tempat mengelola kegiatan kelas dan pembelajaran.", "education", "kelas, sekolah, pembelajaran", 3],
  ["gezyvote", "GezyVote", "https://vote.gezytech.web.id/", "Pemungutan suara digital yang sederhana untuk berbagai kebutuhan.", "productivity", "voting, suara, pemilihan", 4],
  ["gezymath", "GezyMath", "https://math.gezytech.web.id/", "Belajar matematika melalui latihan dan pengalaman interaktif.", "education", "matematika, latihan, belajar", 5],
  ["gezytech-platform", "GezyTech Platform", "https://platform.gezytech.web.id/", "Pintu masuk ke layanan dan platform utama GezyTech.", "platform", "platform, layanan, gezytech", 6],
  ["gezy-aios", "Gezy AIOS", "https://aios.gezytech.web.id/", "Ruang kerja berbasis AI untuk membantu aktivitas digital.", "ai", "ai, asisten, produktivitas", 7],
  ["gezy-games", "Gezy Games", "https://games.gezytech.web.id/", "Kumpulan permainan edukasi yang membuat belajar terasa seperti petualangan.", "learning-games", "game, permainan, edukasi", 8],
  ["gezy-game", "GezyGame", "https://game.gezytech.web.id/", "Portal permainan pilihan untuk belajar dan bersenang-senang.", "learning-games", "game, permainan, belajar", 9],
] as const;

export function seedDatabase() {
  runMigrations();
  const now = nowIso();
  const insertCategory = sqlite.prepare(`INSERT OR IGNORE INTO categories (id, name, slug, description, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const insertApplication = sqlite.prepare(`INSERT OR IGNORE INTO applications (id, name, slug, url, short_description, description, category_id, keywords, status, is_featured, sort_order, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?)`);

  const transaction = sqlite.transaction(() => {
    const categoryIds = new Map<string, string>();
    for (const [slug, name, description] of categories) {
      const id = `category-${slug}`;
      insertCategory.run(id, name, slug, description, categories.findIndex((item) => item[0] === slug), now, now);
      categoryIds.set(slug, id);
    }
    for (const [slug, name, url, shortDescription, categorySlug, keywords, sortOrder] of applications) {
      const id = `application-${slug}`;
      insertApplication.run(...([id, name, slug, url, shortDescription, shortDescription, categoryIds.get(categorySlug) ?? null, keywords, sortOrder === 1 ? 1 : 0, sortOrder, now, now, now] as any));
    }
  });
  transaction();
}

if (import.meta.main) {
  seedDatabase();
  console.log("Seed data inserted.");
}
