-- Supabase SQL Schema for CKeyks Pastry Order System
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clear old products before inserting new ones
DELETE FROM products WHERE category IN ('cakes', 'tarts', 'cupcakes', 'specialty-bread', 'moist-cakes', 'icing-cakes', 'fondant-cakes', 'cake-flavors', 'chiffon-cakes', 'cookies', 'custom-cake');

-- Orders table (header-level info only)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT DEFAULT '',
  pickup_date DATE NOT NULL,
  custom_notes TEXT DEFAULT '',
  total_amount NUMERIC(10, 2) DEFAULT 0
);

-- Order items (line items for each product in an order)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_category TEXT NOT NULL,
  size_choice TEXT NOT NULL,
  design_choice TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  line_total NUMERIC(10, 2) NOT NULL
);

-- Products table (use IF NOT EXISTS for initial setup)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  base_price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  sizes JSONB DEFAULT '[]'::jsonb
);

-- Add sizes column if it doesn't exist (for existing tables)
DO $$ BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '[]'::jsonb;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies (drop if exist, then recreate to ensure schema is up to date)
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can view orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can view order items" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can delete order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;

-- Public can create orders and order items (for the order form)
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT WITH CHECK (true);

-- Authenticated users can view all orders and items (for admin dashboard)
CREATE POLICY "Authenticated users can view orders" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update orders" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete orders" ON orders
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view order items" ON order_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete order items" ON order_items
  FOR DELETE USING (auth.role() = 'authenticated');

-- Products: public can view, authenticated can manage
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert new CKeyks products
-- CUSTOM CAKE (with Icing/Fondant options)
INSERT INTO products (name, description, base_price, category, image_url, sizes) VALUES
  ('Custom Cake', 'Customized cake for special occasions', 0, 'custom-cake', '', '[{"id":"quote","label":"Get a Quote","serves":"Custom quote","price_modifier":0}]'::jsonb)
ON CONFLICT DO NOTHING;

-- CHEWY COOKIES
INSERT INTO products (name, description, base_price, category, image_url, sizes) VALUES
  ('Dubai Chewy Cookie', 'Signature Dubai chewy cookie', 110, 'cookies', '', '[{"id":"single","label":"1 pc","serves":"Single","price_modifier":0},{"id":"4-pack","label":"4 pcs","serves":"4-pack","price_modifier":310}]'::jsonb),
  ('Biscoff Chewy Cookie', 'Biscoff chewy cookie', 95, 'cookies', '', '[{"id":"single","label":"1 pc","serves":"Single","price_modifier":0},{"id":"4-pack","label":"4 pcs","serves":"4-pack","price_modifier":265}]'::jsonb),
  ('Mixed Dubai & Biscoff', '2 pistachio + 2 biscoff', 390, 'cookies', '', '[{"id":"4-pack","label":"4 pcs (2 pistachio + 2 biscoff)","serves":"Mixed 4-pack","price_modifier":0}]'::jsonb)
ON CONFLICT DO NOTHING;
