export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // ==================== STATUS ====================
    if (url.pathname === "/api/status" && method === "GET") {
      return Response.json(
        {
          status: "ok",
          message: "Vinatrix API is running!",
          timestamp: new Date().toISOString(),
        },
        { headers: corsHeaders },
      );
    }

    // ==================== PRODUCTS - GET ====================
    if (url.pathname === "/api/products" && method === "GET") {
      try {
        const products = await env.DB.prepare(
          "SELECT * FROM allproducts ORDER BY id DESC",
        ).all();
        return Response.json(products.results, { headers: corsHeaders });
      } catch (err) {
        return Response.json(
          { error: err.message },
          { status: 500, headers: corsHeaders },
        );
      }
    }

    // ==================== PRODUCTS - POST (WITH R2 UPLOAD) ====================
    if (url.pathname === "/api/products" && method === "POST") {
      try {
        const contentType = request.headers.get("Content-Type") || "";

        if (contentType.includes("multipart/form-data")) {
          const formData = await request.formData();

          const product_category = formData.get("product_category");
          const product_name = formData.get("product_name");
          const size = formData.get("size");
          const price = formData.get("price");
          const quantity = formData.get("quantity") || "1";
          const description = formData.get("description") || "";
          const imageFile = formData.get("product_image");

          if (!product_category || !product_name || !size || !price) {
            return Response.json(
              {
                error: "Missing required fields",
              },
              {
                status: 400,
                headers: corsHeaders,
              },
            );
          }

          if (!imageFile) {
            return Response.json(
              {
                error: "Product image is required",
              },
              {
                status: 400,
                headers: corsHeaders,
              },
            );
          }

          let imageUrl = null;

          console.log("R2_BUCKET exists:", !!env.R2_BUCKET);

          if (!env.R2_BUCKET) {
            return Response.json(
              {
                success: false,
                error: "R2_BUCKET binding not found",
              },
              {
                status: 500,
                headers: corsHeaders,
              },
            );
          }

          try {
            const fileName = `${Date.now()}-${imageFile.name}`;
            const fileBuffer = await imageFile.arrayBuffer();

            console.log("Uploading File:", fileName);
            console.log("Content Type:", imageFile.type);
            console.log("File Size:", imageFile.size);

            await env.R2_BUCKET.put(fileName, fileBuffer, {
              httpMetadata: {
                contentType: imageFile.type || "image/jpeg",
              },
            });

            imageUrl = `https://pub-9370fc1d39014a0982f66c754476d059.r2.dev/${fileName}`;

            console.log("R2 Upload Success:", imageUrl);
          } catch (r2Error) {
            console.error("R2 Upload Failed:", r2Error);

            return Response.json(
              {
                success: false,
                error: "R2 Upload Failed",
                details: r2Error.message || String(r2Error),
              },
              {
                status: 500,
                headers: corsHeaders,
              },
            );
          }

          const result = await env.DB.prepare(
            `INSERT INTO allproducts (
                    product_category,
                    product_name,
                    size,
                    price,
                    quantity,
                    product_image,
                    description,
                    created_at,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                RETURNING *`,
          )
            .bind(
              product_category,
              product_name,
              size,
              parseFloat(price),
              parseInt(quantity),
              imageUrl,
              description,
            )
            .run();

          return Response.json(
            {
              success: true,
              message: "Product created successfully",
              imageUrl: imageUrl,
              product: result.results?.[0],
            },
            {
              headers: corsHeaders,
            },
          );
        }

        const body = await request.json();

        const result = await env.DB.prepare(
          `INSERT INTO allproducts (
                product_category,
                product_name,
                size,
                price,
                quantity,
                product_image,
                description,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            RETURNING *`,
        )
          .bind(
            body.product_category,
            body.product_name,
            body.size,
            parseFloat(body.price),
            parseInt(body.quantity || 1),
            body.product_image || null,
            body.description || "",
          )
          .run();

        return Response.json(
          {
            success: true,
            product: result.results?.[0],
          },
          {
            headers: corsHeaders,
          },
        );
      } catch (err) {
        console.error("Error creating product:", err);

        return Response.json(
          {
            success: false,
            error: err.message,
            details: String(err),
          },
          {
            status: 500,
            headers: corsHeaders,
          },
        );
      }
    }
    // ==================== PRODUCTS - TRENDING ====================
    if (url.pathname === "/api/products/trending" && method === "GET") {
      try {
        const products = await env.DB.prepare(
          "SELECT * FROM allproducts WHERE product_category = 'Trending' ORDER BY id DESC",
        ).all();
        return Response.json(products.results, { headers: corsHeaders });
      } catch (err) {
        return Response.json(
          { error: err.message },
          { status: 500, headers: corsHeaders },
        );
      }
    }

    // ==================== CART ====================
    if (url.pathname === "/api/cart" && method === "GET") {
      const cust_id = url.searchParams.get("cust_id");
      if (!cust_id) {
        return Response.json(
          { error: "cust_id required" },
          { status: 400, headers: corsHeaders },
        );
      }
      try {
        const items = await env.DB.prepare(
          "SELECT * FROM cart_items WHERE cust_id = ? ORDER BY created_at DESC",
        )
          .bind(cust_id)
          .all();
        let total = 0;
        for (const item of items.results) {
          total += parseFloat(item.price) * item.quantity;
        }
        return Response.json(
          { success: true, items: items.results, total },
          { headers: corsHeaders },
        );
      } catch (err) {
        return Response.json(
          { error: err.message },
          { status: 500, headers: corsHeaders },
        );
      }
    }

    // ==================== CART - ADD ====================
    if (url.pathname === "/api/cart/add" && method === "POST") {
      const body = await request.json();
      const {
        cust_id,
        product_id,
        product_name,
        product_category,
        price,
        product_image,
        quantity = 1,
      } = body;

      if (!cust_id || !product_id) {
        return Response.json(
          { error: "cust_id and product_id required" },
          { status: 400, headers: corsHeaders },
        );
      }

      try {
        const existing = await env.DB.prepare(
          "SELECT id, quantity FROM cart_items WHERE cust_id = ? AND product_id = ?",
        )
          .bind(cust_id, product_id)
          .first();

        if (existing) {
          const newQty = existing.quantity + quantity;
          await env.DB.prepare(
            "UPDATE cart_items SET quantity = ?, updated_at = datetime('now') WHERE id = ?",
          )
            .bind(newQty, existing.id)
            .run();
          return Response.json(
            { success: true, message: "Cart updated", quantity: newQty },
            { headers: corsHeaders },
          );
        } else {
          await env.DB.prepare(
            `INSERT INTO cart_items (cust_id, product_id, product_name, product_category, price, product_image, quantity, created_at, updated_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          )
            .bind(
              cust_id,
              product_id,
              product_name,
              product_category,
              price,
              product_image,
              quantity,
            )
            .run();
          return Response.json(
            { success: true, message: "Added to cart", quantity },
            { headers: corsHeaders },
          );
        }
      } catch (err) {
        return Response.json(
          { error: err.message },
          { status: 500, headers: corsHeaders },
        );
      }
    }

    // ==================== CART - REMOVE ====================
    if (url.pathname === "/api/cart/remove" && method === "DELETE") {
      const body = await request.json();
      const { cust_id, product_id } = body;
      await env.DB.prepare(
        "DELETE FROM cart_items WHERE cust_id = ? AND product_id = ?",
      )
        .bind(cust_id, product_id)
        .run();
      return Response.json(
        { success: true, message: "Removed from cart" },
        { headers: corsHeaders },
      );
    }

    // ==================== CART - COUNT ====================
    if (url.pathname === "/api/cart/count" && method === "GET") {
      const cust_id = url.searchParams.get("cust_id");
      const result = await env.DB.prepare(
        "SELECT SUM(quantity) as total_count FROM cart_items WHERE cust_id = ?",
      )
        .bind(cust_id)
        .first();
      return Response.json(
        { success: true, count: result?.total_count || 0 },
        { headers: corsHeaders },
      );
    }

    // ==================== WISHLIST ====================
    if (url.pathname === "/api/wishlist" && method === "GET") {
      const cust_id = url.searchParams.get("cust_id");
      if (!cust_id) {
        return Response.json(
          { error: "cust_id required" },
          { status: 400, headers: corsHeaders },
        );
      }
      const items = await env.DB.prepare(
        "SELECT * FROM wishlist WHERE cust_id = ? ORDER BY created_at DESC",
      )
        .bind(cust_id)
        .all();
      return Response.json(
        { success: true, items: items.results, count: items.results.length },
        { headers: corsHeaders },
      );
    }

    // ==================== WISHLIST - ADD ====================
    if (url.pathname === "/api/wishlist/add" && method === "POST") {
      const body = await request.json();
      const {
        cust_id,
        product_id,
        product_name,
        product_category,
        price,
        product_image,
      } = body;

      const existing = await env.DB.prepare(
        "SELECT id FROM wishlist WHERE cust_id = ? AND product_id = ?",
      )
        .bind(cust_id, product_id)
        .first();

      if (existing) {
        return Response.json(
          { success: true, message: "Already in wishlist" },
          { headers: corsHeaders },
        );
      }

      await env.DB.prepare(
        `INSERT INTO wishlist (cust_id, product_id, product_name, product_category, price, product_image, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      )
        .bind(
          cust_id,
          product_id,
          product_name,
          product_category,
          price,
          product_image,
        )
        .run();

      return Response.json(
        { success: true, message: "Added to wishlist" },
        { headers: corsHeaders },
      );
    }

    // ==================== WISHLIST - REMOVE ====================
    if (url.pathname === "/api/wishlist/remove" && method === "DELETE") {
      const body = await request.json();
      const { cust_id, product_id } = body;
      await env.DB.prepare(
        "DELETE FROM wishlist WHERE cust_id = ? AND product_id = ?",
      )
        .bind(cust_id, product_id)
        .run();
      return Response.json(
        { success: true, message: "Removed from wishlist" },
        { headers: corsHeaders },
      );
    }

    // ==================== WISHLIST - COUNT ====================
    if (url.pathname === "/api/wishlist/count" && method === "GET") {
      const cust_id = url.searchParams.get("cust_id");
      const result = await env.DB.prepare(
        "SELECT COUNT(*) as count FROM wishlist WHERE cust_id = ?",
      )
        .bind(cust_id)
        .first();
      return Response.json(
        { success: true, count: result?.count || 0 },
        { headers: corsHeaders },
      );
    }

    // ==================== USERS ====================
    if (url.pathname === "/api/user/get-or-create" && method === "POST") {
      const { device_id, ip_address } = await request.json();
      let user = await env.DB.prepare("SELECT * FROM users WHERE device_id = ?")
        .bind(device_id)
        .first();
      if (user) {
        await env.DB.prepare(
          "UPDATE users SET last_login = datetime('now'), ip_address = ? WHERE id = ?",
        )
          .bind(ip_address, user.id)
          .run();
        return Response.json(
          { success: true, user, isNew: false },
          { headers: corsHeaders },
        );
      } else {
        const user_uuid = `WEB_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        const result = await env.DB.prepare(
          `INSERT INTO users (user_uuid, device_id, ip_address, user_type, created_at)
                     VALUES (?, ?, ?, 'guest', datetime('now')) RETURNING *`,
        )
          .bind(user_uuid, device_id, ip_address)
          .run();
        return Response.json(
          { success: true, user: result.results[0], isNew: true },
          { headers: corsHeaders },
        );
      }
    }

    // ==================== USER PROFILE - GET ====================
    if (url.pathname.startsWith("/api/user/profile/") && method === "GET") {
      const user_uuid = url.pathname.split("/").pop();
      const user = await env.DB.prepare(
        "SELECT * FROM users WHERE user_uuid = ?",
      )
        .bind(user_uuid)
        .first();
      if (!user) {
        return Response.json(
          { error: "User not found" },
          { status: 404, headers: corsHeaders },
        );
      }
      const addresses = await env.DB.prepare(
        "SELECT * FROM addresses WHERE user_uuid = ? ORDER BY is_primary DESC",
      )
        .bind(user_uuid)
        .all();
      return Response.json(
        { success: true, user, addresses: addresses.results },
        { headers: corsHeaders },
      );
    }

    // ==================== USER PROFILE - POST ====================
    if (url.pathname.startsWith("/api/user/profile/") && method === "POST") {
      const user_uuid = url.pathname.split("/").pop();
      const { full_name, user_name, email, phone, addresses } =
        await request.json();
      await env.DB.prepare(
        `UPDATE users SET full_name = ?, user_name = ?, email = ?, phone = ?, 
                 profile_completed = 1, updated_at = datetime('now') WHERE user_uuid = ?`,
      )
        .bind(full_name, user_name, email, phone, user_uuid)
        .run();
      if (addresses && addresses.length > 0) {
        await env.DB.prepare("DELETE FROM addresses WHERE user_uuid = ?")
          .bind(user_uuid)
          .run();
        for (const addr of addresses) {
          await env.DB.prepare(
            `INSERT INTO addresses (user_uuid, address_label, address_text, is_primary, address_type, city, state, pincode, created_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
          )
            .bind(
              user_uuid,
              addr.label,
              addr.address,
              addr.isPrimary ? 1 : 0,
              addr.address_type,
              addr.city,
              addr.state,
              addr.pincode,
            )
            .run();
        }
      }
      const user = await env.DB.prepare(
        "SELECT * FROM users WHERE user_uuid = ?",
      )
        .bind(user_uuid)
        .first();
      const updatedAddresses = await env.DB.prepare(
        "SELECT * FROM addresses WHERE user_uuid = ?",
      )
        .bind(user_uuid)
        .all();
      return Response.json(
        { success: true, user, addresses: updatedAddresses.results },
        { headers: corsHeaders },
      );
    }

    // ==================== ORDERS ====================
    if (url.pathname === "/api/orders/create" && method === "POST") {
      const body = await request.json();
      const {
        cust_id,
        customer_name,
        customer_phone,
        address,
        city,
        state,
        pincode,
        total_amount,
        grand_total,
        item_count,
        payment_method,
        cart_items,
      } = body;
      const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const orderDate = new Date().toISOString().slice(0, 19).replace("T", " ");
      const result = await env.DB.prepare(
        `INSERT INTO orders (order_number, cust_id, customer_name, customer_phone, address, city, state, pincode, 
                 total_amount, grand_total, item_count, payment_method, payment_status, order_status, order_date, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, datetime('now')) RETURNING id`,
      )
        .bind(
          orderNumber,
          cust_id,
          customer_name,
          customer_phone,
          address,
          city,
          state,
          pincode,
          total_amount,
          grand_total,
          item_count,
          payment_method,
          orderDate,
        )
        .run();
      const orderId = result.results[0].id;
      for (const item of cart_items) {
        await env.DB.prepare(
          `INSERT INTO order_items (order_id, product_id, product_name, product_category, price, quantity, total_price, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        )
          .bind(
            orderId,
            item.product_id,
            item.product_name,
            item.product_category,
            item.price,
            item.quantity,
            item.price * item.quantity,
          )
          .run();
      }
      if (cust_id) {
        await env.DB.prepare("DELETE FROM cart_items WHERE cust_id = ?")
          .bind(cust_id)
          .run();
      }
      return Response.json(
        { success: true, order: { id: orderId, order_number: orderNumber } },
        { headers: corsHeaders },
      );
    }

    // ==================== ORDERS - USER ====================
    if (url.pathname.startsWith("/api/orders/user/") && method === "GET") {
      const cust_id = url.pathname.split("/").pop();
      const orders = await env.DB.prepare(
        "SELECT * FROM orders WHERE cust_id = ? ORDER BY created_at DESC",
      )
        .bind(cust_id)
        .all();
      return Response.json(
        { success: true, orders: orders.results },
        { headers: corsHeaders },
      );
    }

    // ==================== RAZORPAY ====================
    if (url.pathname === "/api/create-order" && method === "POST") {
      try {
        const body = await request.json();
        const { amount, currency = "INR" } = body;
        return Response.json(
          {
            success: true,
            id: `order_${Date.now()}`,
            amount: amount * 100,
            currency: currency,
          },
          { headers: corsHeaders },
        );
      } catch (error) {
        console.error("Razorpay error:", error);
        return Response.json(
          { error: error.message },
          { status: 500, headers: corsHeaders },
        );
      }
    }

    // ==================== VERIFY PAYMENT ====================
    if (url.pathname === "/api/verify-payment" && method === "POST") {
      try {
        const body = await request.json();
        const { order_id, payment_id, signature } = body;
        return Response.json(
          { success: true, message: "Payment verified (mock)" },
          { headers: corsHeaders },
        );
      } catch (error) {
        return Response.json(
          { error: error.message },
          { status: 500, headers: corsHeaders },
        );
      }
    }

    // ==================== ROOT ====================
    return Response.json(
      {
        message: "Vinatrix API is live",
        status: "ok",
        endpoints: [
          "/api/status",
          "/api/products",
          "/api/products/trending",
          "/api/cart",
          "/api/wishlist",
          "/api/orders",
          "/api/user",
          "/api/create-order",
          "/api/verify-payment",
        ],
      },
      { headers: corsHeaders },
    );
  },
};
