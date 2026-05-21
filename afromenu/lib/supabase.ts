import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL – add it to .env.local"
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY – add it to .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ------------------------------------------------------------------ */
/*  Type definitions matching the database schema                      */
/* ------------------------------------------------------------------ */

export interface Restaurant {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  restaurant_id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
}
