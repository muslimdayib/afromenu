import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL – add it to .env.local");
}
if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY – add it to .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ------------------------------------------------------------------ */
/*  Type definitions matching the database schema                      */
/* ------------------------------------------------------------------ */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Establishment {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  currency: string;
  currency_symbol: string;
  language: string;
  theme: 'light' | 'dark';
  brand_color: string;
  logo_url: string | null;
  background_url: string | null;
  wifi_password: string | null;
  phone: string | null;
  is_active: boolean;
  paid_until: string;
  created_at: string;
}

export interface Category {
  id: string;
  establishment_id: string;
  name: string;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
}

export interface Item {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
  tags: string[];
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Retro-compatibility types for legacy [restaurant_id] pages        */
/* ------------------------------------------------------------------ */

export interface Restaurant {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  wifi_password: string | null;
  currency: string;
  slug: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  old_price?: number;
  image_url: string | null;
  is_hidden: boolean;
  sort_order: number;
}

