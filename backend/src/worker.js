// worker.js - Converted from your server.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers (important for separate domains)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://vinatrix.pages.dev",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // API Routes (copy from your server.js)
    if (url.pathname === "/api/products" && request.method === "GET") {
      const products = await env.DB.prepare("SELECT * FROM products").all();
      return Response.json(products.results, { headers: corsHeaders });
    }

    if (url.pathname === "/api/products/trending" && request.method === "GET") {
      const products = await env.DB.prepare(
        'SELECT * FROM products WHERE category = "trending"',
      ).all();
      return Response.json(products.results, { headers: corsHeaders });
    }

    // Add all your other routes...

    return new Response("Not found", { status: 404 });
  },
};
