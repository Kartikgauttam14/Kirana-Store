# Supabase Database Setup for KiranaAI

To complete the backend integration, you need to set up the corresponding tables in your Supabase project. 

### Instructions:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Open the **SQL Editor** from the left sidebar.
4. Click **New query**.
5. Copy and paste the entire script below.
6. Click **Run**.

---

### SQL Setup Script

```sql
-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create STORES Table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    gst_number TEXT,
    fssai_number TEXT,
    latitude FLOAT8,
    longitude FLOAT8,
    address TEXT,
    city TEXT,
    pincode TEXT,
    delivery_radius FLOAT8 DEFAULT 3.0,
    min_order_value FLOAT8 DEFAULT 0,
    open_time TEXT,
    close_time TEXT,
    is_open BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create PRODUCTS Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_hindi TEXT,
    category TEXT NOT NULL,
    sku TEXT NOT NULL,
    barcode TEXT,
    unit TEXT NOT NULL,
    cost_price FLOAT8 NOT NULL,
    selling_price FLOAT8 NOT NULL,
    current_stock FLOAT8 NOT NULL DEFAULT 0,
    reorder_level FLOAT8 DEFAULT 10,
    reorder_qty FLOAT8 DEFAULT 20,
    gst_rate FLOAT8 DEFAULT 0,
    supplier_name TEXT,
    supplier_phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create BILLS Table
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    bill_number TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    subtotal FLOAT8 NOT NULL,
    gst_total FLOAT8 NOT NULL,
    discount FLOAT8 DEFAULT 0,
    grand_total FLOAT8 NOT NULL,
    payment_mode TEXT NOT NULL, -- 'CASH' | 'UPI' | 'CARD' | 'CREDIT'
    is_paid BOOLEAN DEFAULT TRUE,
    items JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create ORDERS Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    status TEXT NOT NULL, -- 'PENDING' | 'ACCEPTED' | 'OUTFORDELIVERY' | 'DELIVERED' | 'CANCELLED'
    total_amount FLOAT8 NOT NULL,
    delivery_address TEXT,
    payment_mode TEXT NOT NULL,
    items JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Realtime for live updates (Optional but Recommended)
-- Run these individually if the dashboard UI is preferred
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE stores;

-- 7. Basic Row Level Security (RLS)
-- By default, for a Kirana shop, we'll allow authenticated users to read/write for now.
-- In a strict production app, you would add policies based on auth.uid().
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Allow public access for testing (Remove in final production)
CREATE POLICY "Enable all for authenticated users" ON stores FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated users" ON bills FOR ALL USING (auth.role() = 'authenticated');
```

---

### Next Steps:
Once you run the script:
1. Restart your Expo development server.
2. The app will automatically detect the Supabase connection.
3. Data will now sync between your device and the cloud in real-time!
