-- =============================================================================
-- Afromenu — Database Schema for QR Code Digital Menu SaaS (Supabase)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing trigger/function/tables if needed for overwrite
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.establishments CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. Public Users Table (Extends Supabase Auth)
-- -----------------------------------------------------------------------------
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.users IS 'Extends authentication table auth.users for application-specific attributes.';

-- 2. Establishments Table
-- -----------------------------------------------------------------------------
CREATE TABLE public.establishments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  slug            VARCHAR(100) UNIQUE NOT NULL,
  currency        VARCHAR(50) NOT NULL DEFAULT 'USD',
  currency_symbol VARCHAR(10) NOT NULL DEFAULT '$',
  language        VARCHAR(50) NOT NULL DEFAULT 'English',
  theme           VARCHAR(10) NOT NULL DEFAULT 'light',
  brand_color     VARCHAR(7) NOT NULL DEFAULT '#f7906c',
  logo_url        TEXT,
  background_url  TEXT,
  wifi_password   VARCHAR(100),
  phone           VARCHAR(30),
  is_active       BOOLEAN DEFAULT true NOT NULL,
  paid_until      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_establishments_user_id ON public.establishments(user_id);
CREATE INDEX idx_establishments_slug ON public.establishments(slug);

COMMENT ON TABLE public.establishments IS 'Each row represents a single restaurant or cafe owned by a user.';

-- 3. Categories Table
-- -----------------------------------------------------------------------------
CREATE TABLE public.categories (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id  UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  name              VARCHAR(200) NOT NULL,
  image_url         TEXT,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  is_visible        BOOLEAN DEFAULT true NOT NULL,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_categories_establishment_id ON public.categories(establishment_id);

COMMENT ON TABLE public.categories IS 'Menu categories belonging to a specific establishment, sorted by sort_order.';

-- 4. Items Table
-- -----------------------------------------------------------------------------
CREATE TABLE public.items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  price           DECIMAL(10,2) NOT NULL,
  image_url       TEXT,
  is_available    BOOLEAN DEFAULT true NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  tags            VARCHAR[] DEFAULT '{}'::VARCHAR[] NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_items_category_id ON public.items(category_id);

COMMENT ON TABLE public.items IS 'Individual dishes or items under a menu category.';


-- =============================================================================
-- Automation: Auto-populate public.users from auth.users on SignUp
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Owner'),
    new.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- =============================================================================
-- Row Level Security (RLS) Policies
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 1. Users Table Policies
-- Read: Allowed for anyone (e.g. to display owner's name in headers)
CREATE POLICY "Allow public read on users" ON public.users
  FOR SELECT USING (true);

-- Update: Allowed only for the owning user
CREATE POLICY "Allow owner update on user" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 2. Establishments Table Policies
-- Read: Allowed for anyone (so customers can view the digital menu)
CREATE POLICY "Allow public read on establishments" ON public.establishments
  FOR SELECT USING (true);

-- Insert/Update/Delete: Allowed only for the owner
CREATE POLICY "Allow owner insert on establishments" ON public.establishments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow owner update on establishments" ON public.establishments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow owner delete on establishments" ON public.establishments
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Categories Table Policies
-- Read: Allowed for anyone
CREATE POLICY "Allow public read on categories" ON public.categories
  FOR SELECT USING (true);

-- Insert/Update/Delete: Allowed only if the user owns the parent establishment
CREATE POLICY "Allow owner write on categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.establishments e
      WHERE e.id = categories.establishment_id AND e.user_id = auth.uid()
    )
  );

-- 4. Items Table Policies
-- Read: Allowed for anyone
CREATE POLICY "Allow public read on items" ON public.items
  FOR SELECT USING (true);

-- Insert/Update/Delete: Allowed only if the user owns the parent category's establishment
CREATE POLICY "Allow owner write on items" ON public.items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.categories c
      JOIN public.establishments e ON c.establishment_id = e.id
      WHERE c.id = items.category_id AND e.user_id = auth.uid()
    )
  );
