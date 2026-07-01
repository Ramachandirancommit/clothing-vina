const express = require("express");
const mysql = require("mysql2/promise"); // ✅ CHANGED to promise version
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads folder setup
const uploadsDir = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsDir));

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created uploads folder at:", uploadsDir);
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Database connection - Using PROMISE version
let db;
let pool;

async function initDatabase() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "Password@123",
      database: process.env.DB_NAME || "vinatrix_clothing",
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL database:", process.env.DB_NAME);
    connection.release();
    db = pool;
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
}

// Initialize database before starting server
initDatabase();

// ============ PRODUCT API ENDPOINTS ============

// GET all products
app.get("/api/products", async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM allproducts ORDER BY created_at DESC, id DESC",
    );

    const products = results.map((product) => ({
      id: product.id,
      product_name: product.product_name,
      product_category: product.product_category,
      size: product.size, // ✅ ADD THIS LINE
      price: product.price.toString(),
      quantity: product.quantity,
      description: product.description || "",
      image: product.product_image,
      created_at: product.created_at,
    }));

    console.log("First product size:", products[0]?.size); // Debug log
    res.json(products);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ FIXED CODE (includes size)
app.get("/api/products", async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM allproducts ORDER BY created_at DESC, id DESC",
    );

    const products = results.map((product) => ({
      id: product.id,
      product_name: product.product_name,
      product_category: product.product_category,
      size: product.size, // ✅ ADD THIS LINE
      price: product.price.toString(),
      quantity: product.quantity,
      description: product.description || "",
      image: product.product_image,
      created_at: product.created_at,
    }));

    // Debug log to verify size is being sent
    console.log(`📤 Sending ${products.length} products`);
    if (products.length > 0) {
      console.log(`📏 First product size: ${products[0].size}`);
    }

    res.json(products);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: err.message });
  }
});
// POST new product
app.post("/api/products", upload.single("product_image"), async (req, res) => {
  console.log("📦 Received product data:", req.body);
  console.log("🖼️ Received file:", req.file);

  const { product_category, product_name, size, price, quantity, description } =
    req.body;
  const product_image = req.file ? `/uploads/${req.file.filename}` : null;

  if (!product_image) {
    return res.status(400).json({ error: "Product image is required" });
  }

  if (!product_category || !product_name || !size || !price) {
    return res.status(400).json({
      error:
        "Missing required fields: category, name, size, and price are required",
    });
  }

  // Validate size
  const validSizes = ["S", "M", "L", "XL", "XXL", "XXXL"];
  if (!validSizes.includes(size)) {
    return res
      .status(400)
      .json({ error: "Invalid size. Must be one of: S, M, L, XL, XXL, XXXL" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO allproducts (product_category, product_name, size, price, quantity, product_image, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        product_category,
        product_name,
        size, // Added size
        price,
        quantity || 1,
        product_image,
        description || "",
      ],
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      productId: result.insertId,
      imageUrl: product_image,
    });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE product
app.put(
  "/api/products/:id",
  upload.single("product_image"),
  async (req, res) => {
    const { id } = req.params;
    const {
      product_category,
      product_name,
      size,
      price,
      quantity,
      description,
    } = req.body;
    let product_image = req.body.existing_image;

    if (req.file) {
      product_image = `/uploads/${req.file.filename}`;
    }

    // Validate size if provided
    if (size) {
      const validSizes = ["S", "M", "L", "XL", "XXL", "XXXL"];
      if (!validSizes.includes(size)) {
        return res.status(400).json({
          error: "Invalid size. Must be one of: S, M, L, XL, XXL, XXXL",
        });
      }
    }

    try {
      const [result] = await db.query(
        `UPDATE allproducts 
       SET product_category = ?, product_name = ?, size = ?, price = ?, quantity = ?, product_image = ?, description = ?
       WHERE id = ?`,
        [
          product_category,
          product_name,
          size, // Added size
          price,
          quantity,
          product_image,
          description,
          id,
        ],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json({ success: true, message: "Product updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

// DELETE product
app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query(
      "SELECT product_image FROM allproducts WHERE id = ?",
      [id],
    );

    if (results.length > 0 && results[0].product_image) {
      const imagePath = path.join(
        uploadsDir,
        path.basename(results[0].product_image),
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("🗑️ Deleted image:", imagePath);
      }
    }

    const [result] = await db.query("DELETE FROM allproducts WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET all products (with size included - add this if not present)
app.get("/api/products", async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT id, product_category, product_name, size, price, quantity, product_image, description, created_at FROM allproducts ORDER BY created_at DESC",
    );
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ============ CART API ENDPOINTS ============

// Get cart items for a user
app.get("/api/cart", async (req, res) => {
  const { cust_id } = req.query;

  if (!cust_id) {
    return res.status(400).json({ error: "cust_id is required" });
  }

  try {
    const [items] = await db.query(
      "SELECT * FROM cart_items WHERE cust_id = ? ORDER BY created_at DESC",
      [cust_id],
    );

    const total = items.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0,
    );

    res.json({
      success: true,
      items: items,
      total: total,
    });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add item to cart
app.post("/api/cart/add", async (req, res) => {
  const {
    cust_id,
    ip_address,
    device_id,
    productId,
    productName,
    productCategory,
    price,
    productImage,
  } = req.body;

  if (!cust_id || !productId || !productName || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [results] = await db.query(
      "SELECT id, quantity FROM cart_items WHERE cust_id = ? AND product_id = ?",
      [cust_id, productId],
    );

    if (results.length > 0) {
      const newQuantity = results[0].quantity + 1;
      await db.query(
        "UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?",
        [newQuantity, results[0].id],
      );
      res.json({
        success: true,
        message: "Cart updated",
        quantity: newQuantity,
      });
    } else {
      await db.query(
        `INSERT INTO cart_items (cust_id, ip_address, cust_deviceid, product_id, product_name, product_category, price, product_image, quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          cust_id,
          ip_address || "unknown",
          device_id || "unknown",
          productId,
          productName,
          productCategory,
          price,
          productImage,
        ],
      );
      res.json({
        success: true,
        message: "Item added to cart",
        quantity: 1,
      });
    }
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update cart item quantity
app.put("/api/cart/update", async (req, res) => {
  const { cust_id, productId, quantity } = req.body;

  if (!cust_id || !productId || quantity === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    if (quantity < 1) {
      await db.query(
        "DELETE FROM cart_items WHERE cust_id = ? AND product_id = ?",
        [cust_id, productId],
      );
      res.json({ success: true, message: "Item removed" });
    } else {
      await db.query(
        "UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE cust_id = ? AND product_id = ?",
        [quantity, cust_id, productId],
      );
      res.json({ success: true, message: "Cart updated" });
    }
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ error: err.message });
  }
});

// Remove item from cart
app.delete("/api/cart/remove", async (req, res) => {
  const { cust_id, productId } = req.body;

  if (!cust_id || !productId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await db.query(
      "DELETE FROM cart_items WHERE cust_id = ? AND product_id = ?",
      [cust_id, productId],
    );
    res.json({ success: true, message: "Item removed from cart" });
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get cart count for badge
app.get("/api/cart/count", async (req, res) => {
  const { cust_id } = req.query;

  if (!cust_id) {
    return res.status(400).json({ error: "cust_id is required" });
  }

  try {
    const [results] = await db.query(
      "SELECT SUM(quantity) as total_count FROM cart_items WHERE cust_id = ?",
      [cust_id],
    );
    const totalCount = results[0]?.total_count || 0;
    res.json({ success: true, count: totalCount });
  } catch (err) {
    console.error("Error fetching cart count:", err);
    res.status(500).json({ error: err.message });
  }
});

// Clear entire cart
app.delete("/api/cart/clear", async (req, res) => {
  const { cust_id } = req.body;

  if (!cust_id) {
    return res.status(400).json({ error: "cust_id is required" });
  }

  try {
    await db.query("DELETE FROM cart_items WHERE cust_id = ?", [cust_id]);
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============ WISHLIST API ENDPOINTS ============

// GET - Fetch user's wishlist
app.get("/api/wishlist", async (req, res) => {
  const { cust_id } = req.query;

  console.log("🔍 GET wishlist for cust_id:", cust_id);

  if (!cust_id) {
    return res.status(400).json({
      success: false,
      error: "cust_id is required",
    });
  }

  try {
    const [items] = await db.query(
      `SELECT id, product_id, product_name, product_category, 
              price, product_image, created_at 
       FROM wishlist 
       WHERE cust_id = ? 
       ORDER BY created_at DESC`,
      [cust_id],
    );

    console.log("📊 Found items:", items.length);

    res.json({
      success: true,
      items: items,
      count: items.length,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch wishlist",
    });
  }
});

// POST - Add item to wishlist
app.post("/api/wishlist/add", async (req, res) => {
  console.log("📥 Full request body:", req.body);

  const {
    cust_id,
    product_id,
    product_name,
    product_category,
    price,
    product_image,
    ip_address,
    device_id,
  } = req.body;

  if (!cust_id) {
    console.log("❌ Missing: cust_id");
    return res
      .status(400)
      .json({ error: "Missing cust_id", received: req.body });
  }
  if (!product_id) {
    console.log("❌ Missing: product_id");
    return res
      .status(400)
      .json({ error: "Missing product_id", received: req.body });
  }
  if (!product_name) {
    console.log("❌ Missing: product_name");
    return res
      .status(400)
      .json({ error: "Missing product_name", received: req.body });
  }

  console.log("✅ All fields valid, inserting into database...");

  try {
    // Check if product already exists
    const [existing] = await db.query(
      "SELECT id FROM wishlist WHERE cust_id = ? AND product_id = ?",
      [cust_id, product_id],
    );

    if (existing.length > 0) {
      console.log("⚠️ Product already in wishlist");
      return res.json({
        success: true,
        message: "Item already in wishlist",
        already_exists: true,
      });
    }

    // Insert into wishlist
    const [result] = await db.query(
      `INSERT INTO wishlist 
       (cust_id, ip_address, cust_deviceid, product_id, 
        product_name, product_category, price, product_image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cust_id,
        ip_address || null,
        device_id || null,
        product_id,
        product_name,
        product_category || null,
        price || 0,
        product_image || null,
      ],
    );

    console.log("✅ Insert successful:", result);
    res.json({ success: true, message: "Item added to wishlist" });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Remove item from wishlist
app.delete("/api/wishlist/remove", async (req, res) => {
  const { cust_id, productId } = req.body;

  console.log("📥 DELETE request body:", { cust_id, productId });

  if (!cust_id) {
    return res.status(400).json({ error: "Missing cust_id" });
  }
  if (!productId) {
    return res.status(400).json({ error: "Missing productId" });
  }

  try {
    const [result] = await db.query(
      "DELETE FROM wishlist WHERE cust_id = ? AND product_id = ?",
      [cust_id, productId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ success: true, message: "Item removed from wishlist" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Clear entire wishlist
app.delete("/api/wishlist/clear", async (req, res) => {
  const { cust_id } = req.body;

  if (!cust_id) {
    return res.status(400).json({ error: "cust_id is required" });
  }

  try {
    await db.query("DELETE FROM wishlist WHERE cust_id = ?", [cust_id]);
    res.json({ success: true, message: "Wishlist cleared successfully" });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Get wishlist count only (for badge)
app.get("/api/wishlist/count", async (req, res) => {
  const { cust_id } = req.query;

  if (!cust_id) {
    return res.status(400).json({ error: "cust_id is required" });
  }

  try {
    const [result] = await db.query(
      "SELECT COUNT(*) as count FROM wishlist WHERE cust_id = ?",
      [cust_id],
    );

    res.json({ success: true, count: result[0].count });
  } catch (error) {
    console.error("Error getting wishlist count:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============ USER PROFILE API ENDPOINTS ============

// Get or create user
app.post("/api/user/get-or-create", async (req, res) => {
  const { device_id, ip_address } = req.body;

  try {
    const [users] = await db.execute(
      "SELECT * FROM users WHERE device_id = ?",
      [device_id],
    );

    if (users.length > 0) {
      await db.execute(
        "UPDATE users SET last_login = NOW(), ip_address = ? WHERE id = ?",
        [ip_address, users[0].id],
      );

      const [addresses] = await db.execute(
        "SELECT * FROM addresses WHERE user_uuid = ? ORDER BY is_primary DESC, created_at DESC",
        [users[0].user_uuid],
      );

      return res.json({
        success: true,
        user: users[0],
        addresses: addresses || [],
        isNew: false,
      });
    } else {
      const user_uuid = `USER_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

      const [result] = await db.execute(
        `INSERT INTO users (user_uuid, device_id, ip_address, user_type, last_login) 
         VALUES (?, ?, ?, 'guest', NOW())`,
        [user_uuid, device_id, ip_address],
      );

      const [newUser] = await db.execute("SELECT * FROM users WHERE id = ?", [
        result.insertId,
      ]);

      res.json({
        success: true,
        user: newUser[0],
        addresses: [],
        isNew: true,
      });
    }
  } catch (err) {
    console.error("Error in get-or-create user:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// User profile update
app.get("/api/user/profile/:user_uuid", async (req, res) => {
  const { user_uuid } = req.params;

  try {
    const [users] = await db.execute(
      "SELECT id, user_uuid, full_name, user_name, email, phone, user_type, profile_completed FROM users WHERE user_uuid = ?",
      [user_uuid],
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const [addresses] = await db.execute(
      "SELECT * FROM addresses WHERE user_uuid = ? ORDER BY is_primary DESC, created_at DESC",
      [user_uuid],
    );

    res.json({
      success: true,
      user: users[0],
      addresses: addresses || [],
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
// Create or update user profile - with duplicate email/phone handling
app.post("/api/user/profile/:user_uuid", async (req, res) => {
  const { user_uuid } = req.params;
  const { full_name, user_name, email, phone, addresses } = req.body;

  // Input validation
  if (!full_name || !full_name.trim()) {
    return res.status(400).json({ error: "Full name is required" });
  }
  if (!phone || !phone.trim()) {
    return res.status(400).json({ error: "Phone number is required" });
  }
  if (phone.length < 10) {
    return res
      .status(400)
      .json({ error: "Please enter a valid 10-digit phone number" });
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // ✅ CHECK 1: Duplicate Email (if email is provided)
    if (email && email.trim()) {
      const [existingUsers] = await connection.execute(
        "SELECT user_uuid FROM users WHERE email = ? AND user_uuid != ?",
        [email.trim(), user_uuid],
      );

      if (existingUsers.length > 0) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          error:
            "This email is already registered with another account. Please use a different email.",
          code: "DUPLICATE_EMAIL",
        });
      }
    }

    // ✅ CHECK 2: Duplicate Phone Number
    if (phone && phone.trim()) {
      const [existingPhones] = await connection.execute(
        "SELECT user_uuid FROM users WHERE phone = ? AND user_uuid != ?",
        [phone.trim(), user_uuid],
      );

      if (existingPhones.length > 0) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          error:
            "This phone number is already registered. Please use a different number.",
          code: "DUPLICATE_PHONE",
        });
      }
    }

    // ✅ UPDATE user profile
    await connection.execute(
      `UPDATE users SET 
        full_name = ?, 
        user_name = ?, 
        email = ?, 
        phone = ?, 
        profile_completed = TRUE,
        updated_at = NOW() 
      WHERE user_uuid = ?`,
      [
        full_name.trim(),
        user_name?.trim() || null,
        email?.trim() || null,
        phone.trim(),
        user_uuid,
      ],
    );

    // ✅ UPDATE addresses
    await connection.execute("DELETE FROM addresses WHERE user_uuid = ?", [
      user_uuid,
    ]);

    if (addresses && addresses.length > 0) {
      for (const address of addresses) {
        await connection.execute(
          `INSERT INTO addresses (user_uuid, address_label, address_text, is_primary, address_type, city, state, pincode) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user_uuid,
            address.label || "Home",
            address.address || "",
            address.isPrimary ? 1 : 0,
            address.address_type || "home",
            address.city || "",
            address.state || "",
            address.pincode || "",
          ],
        );
      }
    }

    await connection.commit();

    // ✅ FETCH updated data
    const [users] = await db.execute(
      "SELECT * FROM users WHERE user_uuid = ?",
      [user_uuid],
    );
    const [newAddresses] = await db.execute(
      "SELECT * FROM addresses WHERE user_uuid = ? ORDER BY is_primary DESC, created_at DESC",
      [user_uuid],
    );

    res.json({
      success: true,
      message: "Profile saved successfully",
      user: users[0],
      addresses: newAddresses || [],
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error updating profile:", err);

    // ✅ HANDLE database unique constraint errors
    if (err.code === "ER_DUP_ENTRY") {
      if (err.sqlMessage && err.sqlMessage.includes("email")) {
        return res.status(409).json({
          success: false,
          error:
            "This email address is already registered. Please use a different email.",
          code: "DUPLICATE_EMAIL",
        });
      }
      if (err.sqlMessage && err.sqlMessage.includes("phone")) {
        return res.status(409).json({
          success: false,
          error:
            "This phone number is already registered. Please use a different number.",
          code: "DUPLICATE_PHONE",
        });
      }
    }

    res.status(500).json({
      success: false,
      error: "Failed to save profile. Please try again.",
    });
  } finally {
    connection.release();
  }
});

// ============ ORDERS API ENDPOINTS ============

// Create order from cart
app.post("/api/orders/create", async (req, res) => {
  const {
    cust_id,
    customer_name,
    customer_phone,
    address,
    city,
    state,
    pincode,
    total_amount,
    delivery_fee,
    tax_amount,
    grand_total,
    item_count,
    payment_method,
    order_date,
    cart_items,
  } = req.body;

  const formatMySQLDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const currentDatetime = formatMySQLDate(new Date());
  const formattedOrderDate = order_date
    ? formatMySQLDate(order_date)
    : currentDatetime;

  const deliveryDateObj = new Date();
  deliveryDateObj.setDate(deliveryDateObj.getDate() + 1);
  const formattedDeliveryDate = formatMySQLDate(deliveryDateObj).split(" ")[0];

  const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (
        order_number, cust_id, customer_name, customer_phone, 
        address, city, state, pincode,
        total_amount, delivery_fee, tax_amount, grand_total,
        item_count, payment_method, payment_status, order_status,
        order_date, delivery_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?)`,
      [
        orderNumber,
        cust_id || null,
        customer_name || "Guest",
        customer_phone || "",
        address,
        city || "",
        state || "",
        pincode || "",
        total_amount,
        delivery_fee || 0,
        tax_amount || 0,
        grand_total || total_amount,
        item_count || cart_items.length,
        payment_method || "cash",
        formattedOrderDate,
        formattedDeliveryDate,
      ],
    );

    const orderId = orderResult.insertId;

    for (const item of cart_items) {
      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, product_name, product_category, price, quantity, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.product_name,
          item.product_category,
          item.price,
          item.quantity,
          item.price * item.quantity,
        ],
      );
    }

    if (cust_id) {
      await connection.execute("DELETE FROM cart_items WHERE cust_id = ?", [
        cust_id,
      ]);
    }

    await connection.commit();

    res.json({
      success: true,
      order: {
        id: orderId,
        order_number: orderNumber,
        total_amount: total_amount,
        item_count: item_count || cart_items.length,
      },
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error creating order:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    connection.release();
  }
});

// Get order by ID
app.get("/api/orders/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE order_number = ? OR id = ?",
      [orderId, orderId],
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const [items] = await db.query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [orders[0].id],
    );

    res.json({ success: true, order: orders[0], items: items });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all orders for a user
app.get("/api/orders/user/:cust_id", async (req, res) => {
  const { cust_id } = req.params;

  try {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE cust_id = ? ORDER BY created_at DESC",
      [cust_id],
    );
    res.json({ success: true, orders: orders });
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET trending products only (for Home Screen)
app.get("/api/products/trending", async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM allproducts WHERE product_category = 'Trending' ORDER BY created_at DESC, id DESC",
    );

    const products = results.map((product) => ({
      id: product.id,
      product_name: product.product_name,
      product_category: product.product_category,
      size: product.size,
      price: product.price.toString(),
      quantity: product.quantity,
      description: product.description || "",
      image: product.product_image,
      created_at: product.created_at,
    }));

    console.log(`📤 Sending ${products.length} trending products`);
    res.json(products);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET products by specific category (for filtering)
app.get("/api/products/category/:category", async (req, res) => {
  const { category } = req.params;

  try {
    const [results] = await db.query(
      "SELECT * FROM allproducts WHERE product_category = ? ORDER BY created_at DESC, id DESC",
      [category],
    );

    const products = results.map((product) => ({
      id: product.id,
      product_name: product.product_name,
      product_category: product.product_category,
      size: product.size,
      price: product.price.toString(),
      quantity: product.quantity,
      description: product.description || "",
      image: product.product_image,
      created_at: product.created_at,
    }));

    console.log(
      `📤 Sending ${products.length} products for category: ${category}`,
    );
    res.json(products);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Keep original endpoint for all products (admin use)
app.get("/api/products/all", async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM allproducts ORDER BY created_at DESC, id DESC",
    );

    const products = results.map((product) => ({
      id: product.id,
      product_name: product.product_name,
      product_category: product.product_category,
      size: product.size,
      price: product.price.toString(),
      quantity: product.quantity,
      description: product.description || "",
      image: product.product_image,
      created_at: product.created_at,
    }));

    res.json(products);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============ TEST ROUTE ============

app.get("/", (req, res) => {
  res.json({
    message: "Vinatrix API is running!",
    version: "2.0.0",
    uploadsFolder: uploadsDir,
    endpoints: {
      products: "GET /api/products",
      createProduct: "POST /api/products",
      getProduct: "GET /api/products/:id",
      updateProduct: "PUT /api/products/:id",
      deleteProduct: "DELETE /api/products/:id",
      cart: "GET /api/cart?cust_id=USER_xxx",
      addToCart: "POST /api/cart/add",
      updateCart: "PUT /api/cart/update",
      removeFromCart: "DELETE /api/cart/remove",
      clearCart: "DELETE /api/cart/clear",
      cartCount: "GET /api/cart/count?cust_id=USER_xxx",
      wishlist: "GET /api/wishlist?cust_id=USER_xxx",
      addToWishlist: "POST /api/wishlist/add",
      removeFromWishlist: "DELETE /api/wishlist/remove",
      clearWishlist: "DELETE /api/wishlist/clear",
      wishlistCount: "GET /api/wishlist/count?cust_id=USER_xxx",
      user: "POST /api/user/get-or-create",
      userProfile: "GET /api/user/profile/:user_uuid",
      updateProfile: "POST /api/user/profile/:user_uuid",
      createOrder: "POST /api/orders/create",
      getOrder: "GET /api/orders/:orderId",
      getUserOrders: "GET /api/orders/user/:cust_id",
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads folder: ${uploadsDir}`);
  console.log(`💾 Database: ${process.env.DB_NAME || "vinatrix_clothing"}`);
  console.log(`✅ Server is ready to accept requests!\n`);
});
