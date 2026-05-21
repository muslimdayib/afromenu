-- =============================================================================
-- Afromenu — Database Schema
-- Run this script in the Supabase SQL Editor to create all tables.
-- =============================================================================

-- 1. Restaurants
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  logo_url   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE restaurants IS 'Each row represents a single restaurant on the platform.';

-- 2. Categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  display_order INT  NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE categories IS 'Menu categories belonging to a restaurant, ordered by display_order.';

CREATE INDEX IF NOT EXISTS idx_categories_restaurant_id
  ON categories (restaurant_id);

-- 3. Menu Items
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  BIGINT NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(10, 2) NOT NULL,
  image_url    TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE menu_items IS 'Individual dishes / drinks within a category.';

CREATE INDEX IF NOT EXISTS idx_menu_items_category_id
  ON menu_items (category_id);

-- =============================================================================
-- Row Level Security — Public Read-Only
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items  ENABLE ROW LEVEL SECURITY;

-- Allow anonymous (public) SELECT on every table
CREATE POLICY "Public read access on restaurants"
  ON restaurants FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public read access on categories"
  ON categories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public read access on menu_items"
  ON menu_items FOR SELECT
  TO anon
  USING (true);

-- =============================================================================
-- Optional: Seed data for testing (uncomment to use)
-- =============================================================================

/*
INSERT INTO restaurants (id, name, logo_url) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mama Nkechi''s Kitchen', NULL);

INSERT INTO categories (restaurant_id, name, display_order) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Starters',  1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mains',     2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Drinks',    3);

INSERT INTO menu_items (category_id, name, description, price, image_url, is_available) VALUES
  (1, 'Suya Skewers',       'Spiced beef skewers grilled over open flame.',          8.50,  NULL, true),
  (1, 'Puff Puff',          'Golden fried dough balls dusted with powdered sugar.',  4.00,  NULL, true),
  (2, 'Jollof Rice & Chicken', 'Smoky party jollof with grilled chicken thigh.',    14.99, NULL, true),
  (2, 'Egusi Soup & Pounded Yam', 'Rich melon seed soup with tender beef.',         16.50, NULL, true),
  (2, 'Pepper Soup',        'Catfish pepper soup with aromatic spices.',             12.00, NULL, false),
  (3, 'Chapman',            'Classic Nigerian cocktail with Fanta, Sprite & bitters.', 6.00, NULL, true),
  (3, 'Zobo',               'Chilled hibiscus flower drink with ginger.',            4.50, NULL, true);
*/
