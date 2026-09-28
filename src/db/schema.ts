export type ApplicationStatus = "draft" | "published" | "archived";

export interface Admin {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  is_active: number;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  name: string;
  slug: string;
  url: string;
  short_description: string;
  description: string | null;
  icon_path: string | null;
  category_id: string | null;
  keywords: string;
  status: ApplicationStatus;
  is_featured: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ApplicationWithCategory extends Application {
  category_name: string | null;
}
