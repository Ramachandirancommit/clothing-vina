// services/api.ts

import { API_URLS, BASE_URL } from "../utils/constants"; // Import BASE_URL
import { Address, Order, Product, WishlistItem } from "../utils/types";

export class ApiService {
  private static instance: ApiService;

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    const data = await response.json();
    return data;
  }

  // ==================== PRODUCTS ====================

  // Get products with filters
  async getProducts(params: {
    limit?: number;
    offset?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    minPrice?: number;
    maxPrice?: number;
    sizes?: string;
  }): Promise<{
    success: boolean;
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    error?: string;
  }> {
    try {
      const queryString = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params)
            .filter(
              ([_, value]) =>
                value !== undefined && value !== null && value !== "",
            )
            .map(([key, value]) => [key, String(value)]),
        ),
      ).toString();

      const url = `${API_URLS.products}${queryString ? `?${queryString}` : ""}`;
      return this.request(url);
    } catch (error) {
      console.error("Error fetching products:", error);
      return {
        success: false,
        error: "Failed to fetch products",
        products: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
    }
  }

  // Search products
  async searchProducts(query: string): Promise<{
    success: boolean;
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    error?: string;
  }> {
    try {
      const url = `${API_URLS.products}/search?q=${encodeURIComponent(query)}`;
      return this.request(url);
    } catch (error) {
      console.error("Error searching products:", error);
      return {
        success: false,
        error: "Search failed",
        products: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
    }
  }

  async getTrendingProducts(): Promise<Product[]> {
    const response = await this.request<{ data: Product[] }>(API_URLS.trending);
    return response.data || [];
  }

  async getAllProducts(): Promise<Product[]> {
    const response = await this.request<{ data: Product[] }>(API_URLS.products);
    return response.data || [];
  }

  // ==================== RECENTLY VIEWED ====================

  async addRecentlyViewed(
    userId: string,
    productId: string,
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Use BASE_URL instead of API_URLS.base
      const url = `${BASE_URL}/api/recently-viewed`;
      return this.request(url, {
        method: "POST",
        body: JSON.stringify({ userId, productId }),
      });
    } catch (error) {
      console.error("Error adding recently viewed:", error);
      return { success: false, error: "Failed to add recently viewed" };
    }
  }

  async getRecentlyViewed(userId: string): Promise<{
    success: boolean;
    products: Product[];
    error?: string;
  }> {
    try {
      // Use BASE_URL instead of API_URLS.base
      const url = `${BASE_URL}/api/recently-viewed/${userId}`;
      return this.request(url);
    } catch (error) {
      console.error("Error fetching recently viewed:", error);
      return {
        success: false,
        error: "Failed to fetch recently viewed",
        products: [],
      };
    }
  }

  // ==================== WISHLIST ====================

  async getWishlist(
    custId: string,
  ): Promise<{ success: boolean; items: WishlistItem[] }> {
    const url = `${API_URLS.wishlist}?cust_id=${encodeURIComponent(custId)}`;
    return this.request(url);
  }

  async addToWishlist(
    data: any,
  ): Promise<{ success: boolean; message?: string }> {
    return this.request(`${API_URLS.wishlist}/add`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async removeFromWishlist(
    custId: string,
    productId: number,
  ): Promise<{ success: boolean }> {
    return this.request(`${API_URLS.wishlist}/remove`, {
      method: "DELETE",
      body: JSON.stringify({ cust_id: custId, product_id: productId }),
    });
  }

  async clearWishlist(custId: string): Promise<{ success: boolean }> {
    return this.request(`${API_URLS.wishlist}/clear`, {
      method: "DELETE",
      body: JSON.stringify({ cust_id: custId }),
    });
  }

  // ==================== CART ====================

  async getCart(custId: string): Promise<{ success: boolean; items: any[] }> {
    return this.request(
      `${API_URLS.cart}?cust_id=${encodeURIComponent(custId)}`,
    );
  }

  async addToCart(data: any): Promise<{ success: boolean }> {
    return this.request(`${API_URLS.cart}/add`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==================== ORDERS ====================

  async createOrder(data: any): Promise<{ success: boolean; order: Order }> {
    return this.request(`${API_URLS.orders}/create`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getOrders(
    custId: string,
  ): Promise<{ success: boolean; orders: Order[] }> {
    return this.request(
      `${API_URLS.orders}?cust_id=${encodeURIComponent(custId)}`,
    );
  }

  // ==================== USER ====================

  async getOrCreateUser(data: any): Promise<{ success: boolean; user: any }> {
    return this.request(`${API_URLS.user}/get-or-create`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUserProfile(
    uuid: string,
  ): Promise<{ success: boolean; user: any; addresses: Address[] }> {
    return this.request(`${API_URLS.profile}/${uuid}`);
  }

  async updateUserProfile(
    uuid: string,
    data: any,
  ): Promise<{ success: boolean }> {
    return this.request(`${API_URLS.profile}/${uuid}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const api = ApiService.getInstance();
