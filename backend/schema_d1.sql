-- ============================================
-- VINATRIX DATABASE SCHEMA FOR CLOUDFLARE D1
-- Converted from MySQL dump
-- ============================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_uuid TEXT UNIQUE NOT NULL,
    full_name TEXT,
    user_name TEXT UNIQUE,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    device_id TEXT,
    ip_address TEXT,
    user_type TEXT DEFAULT 'guest',
    profile_completed INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    last_login INTEGER
);

-- 2. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_uuid TEXT NOT NULL,
    address_label TEXT DEFAULT 'Home',
    address_text TEXT NOT NULL,
    is_primary INTEGER DEFAULT 0,
    address_type TEXT DEFAULT 'home',
    city TEXT,
    state TEXT,
    pincode TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_uuid) REFERENCES users(user_uuid) ON DELETE CASCADE
);

-- 3. ALLPRODUCTS TABLE
CREATE TABLE IF NOT EXISTS allproducts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_category TEXT NOT NULL,
    product_name TEXT NOT NULL,
    size TEXT CHECK(size IN ('S', 'M', 'L', 'XL', 'XXL', 'XXXL')) NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER DEFAULT 0,
    product_image TEXT NOT NULL,
    description TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- 4. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cust_id TEXT,
    ip_address TEXT,
    cust_deviceid TEXT,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    product_category TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER DEFAULT 1,
    product_image TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (product_id) REFERENCES allproducts(id) ON DELETE CASCADE
);

-- 5. WISHLIST TABLE
CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cust_id TEXT NOT NULL,
    ip_address TEXT,
    cust_deviceid TEXT,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    product_category TEXT NOT NULL,
    price REAL NOT NULL,
    product_image TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    UNIQUE(cust_id, product_id)
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    cust_id TEXT,
    customer_name TEXT DEFAULT 'Guest',
    customer_phone TEXT DEFAULT '',
    address TEXT NOT NULL,
    city TEXT,
    state TEXT,
    pincode TEXT,
    total_amount REAL NOT NULL,
    delivery_fee REAL DEFAULT 0,
    tax_amount REAL DEFAULT 0,
    grand_total REAL NOT NULL,
    item_count INTEGER NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    order_status TEXT DEFAULT 'pending',
    order_date TEXT,
    delivery_date TEXT,
    notes TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- 7. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    product_category TEXT,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    total_price REAL NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 8. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_cart_cust_id ON cart_items(cust_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_cust_id ON wishlist(cust_id);
CREATE INDEX IF NOT EXISTS idx_orders_cust_id ON orders(cust_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_addresses_user_uuid ON addresses(user_uuid);
CREATE INDEX IF NOT EXISTS idx_allproducts_category ON allproducts(product_category);
CREATE INDEX IF NOT EXISTS idx_allproducts_size ON allproducts(size);