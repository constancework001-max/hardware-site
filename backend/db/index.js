const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Service types table
      CREATE TABLE IF NOT EXISTS service_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        duration_hours INTEGER DEFAULT 24,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true
      );

      -- Service bookings table
      CREATE TABLE IF NOT EXISTS service_bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        service_type_id INTEGER REFERENCES service_types(id),
        device_name VARCHAR(100) NOT NULL,
        device_issue TEXT NOT NULL,
        booking_date DATE NOT NULL,
        booking_time VARCHAR(20) NOT NULL,
        status VARCHAR(30) DEFAULT 'pending',
        total_price NUMERIC(10,2),
        payment_id VARCHAR(100),
        payment_status VARCHAR(30) DEFAULT 'unpaid',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Products (hardware parts) table
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        stock INTEGER DEFAULT 0,
        category VARCHAR(80),
        brand VARCHAR(80),
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Orders table
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total_amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(30) DEFAULT 'pending',
        payment_id VARCHAR(100),
        payment_status VARCHAR(30) DEFAULT 'unpaid',
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Order items table
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price NUMERIC(10,2) NOT NULL
      );

      -- Seed service types if empty
      INSERT INTO service_types (name, description, price, duration_hours)
      SELECT * FROM (VALUES
        ('Parts Replacement', 'Replace faulty hardware components including RAM, HDD, keyboard, screen, battery, etc.', 499.00, 24),
        ('OS Installation', 'Fresh installation or reinstallation of Windows, macOS, Linux, or Android ROMs.', 399.00, 4),
        ('Virus Removal', 'Complete malware and virus removal with security hardening.', 299.00, 3),
        ('Screen Repair', 'LCD/OLED screen replacement for laptops, phones, and tablets.', 999.00, 48),
        ('Data Recovery', 'Recover lost or deleted data from hard drives, SSDs, and USB devices.', 799.00, 72),
        ('Network Setup', 'Configure home/office network, routers, and firewall settings.', 249.00, 2),
        ('Performance Upgrade', 'RAM upgrade, SSD replacement, thermal paste replacement for speed boost.', 599.00, 6),
        ('Water Damage Repair', 'Diagnosis and repair of liquid-damaged devices.', 1199.00, 96)
      ) AS v(name, description, price, duration_hours)
      WHERE NOT EXISTS (SELECT 1 FROM service_types LIMIT 1);

      -- Seed products if empty
      INSERT INTO products (name, description, price, stock, category, brand)
      SELECT * FROM (VALUES
        ('8GB DDR4 RAM', '3200MHz Desktop RAM - Compatible with most modern motherboards', 2499.00, 50, 'Memory', 'Kingston'),
        ('1TB SSD', 'SATA III 2.5 inch SSD - 550MB/s read speed', 4999.00, 30, 'Storage', 'Samsung'),
        ('Mechanical Keyboard', 'TKL mechanical keyboard with Cherry MX Brown switches', 3499.00, 20, 'Peripherals', 'Keychron'),
        ('Gaming Mouse', '12000 DPI optical sensor, 6 programmable buttons', 1299.00, 35, 'Peripherals', 'Logitech'),
        ('CPU Cooler', '120mm RGB air cooler for Intel and AMD CPUs', 1799.00, 15, 'Cooling', 'Cooler Master'),
        ('HDMI Cable 2.0', '4K@60Hz, 2 meter braided HDMI cable', 399.00, 100, 'Cables', 'Ugreen'),
        ('USB-C Hub', '7-in-1 hub with HDMI, USB 3.0 x3, SD card, PD charging', 1599.00, 25, 'Accessories', 'Anker'),
        ('Thermal Paste', 'High-performance thermal compound 3.5g tube', 299.00, 60, 'Accessories', 'Arctic'),
        ('500W PSU', '80+ Bronze certified power supply with modular cables', 3299.00, 12, 'Power', 'Corsair'),
        ('Laptop Battery', 'Universal laptop battery 5000mAh - check compatibility', 1899.00, 20, 'Power', 'Generic')
      ) AS v(name, description, price, stock, category, brand)
      WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);
    `);
    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  } finally {
    client.release();
  }
};

module.exports = { pool, initDB };
