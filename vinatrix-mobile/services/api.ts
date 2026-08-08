// services/api.ts

import { API_URLS, BASE_URL } from "../utils/constants";
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
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      // Handle non-200 responses gracefully
      if (!response.ok) {
        console.error(
          `❌ API Error: ${response.status} ${response.statusText}`,
        );
        return { success: false, error: `HTTP ${response.status}` } as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("❌ API Request error:", errorMessage);
      return { success: false, error: errorMessage } as T;
    }
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch products";
      console.error("Error fetching products:", errorMessage);
      return {
        success: false,
        error: errorMessage,
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
      const errorMessage =
        error instanceof Error ? error.message : "Search failed";
      console.error("Error searching products:", errorMessage);
      return {
        success: false,
        error: errorMessage,
        products: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
    }
  }

  async getTrendingProducts(): Promise<Product[]> {
    try {
      const response = await this.request<{ data: Product[] }>(
        API_URLS.trending,
      );
      return response.data || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch trending products";
      console.error("Error fetching trending products:", errorMessage);
      return [];
    }
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await this.request<{ data: Product[] }>(
        API_URLS.products,
      );
      return response.data || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch all products";
      console.error("Error fetching all products:", errorMessage);
      return [];
    }
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
      const url = `${BASE_URL}/api/recently-viewed`;
      return this.request(url, {
        method: "POST",
        body: JSON.stringify({ userId, productId }),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to add recently viewed";
      console.error("Error adding recently viewed:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async getRecentlyViewed(userId: string): Promise<{
    success: boolean;
    products: Product[];
    error?: string;
  }> {
    try {
      const url = `${BASE_URL}/api/recently-viewed/${userId}`;
      return this.request(url);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch recently viewed";
      console.error("Error fetching recently viewed:", errorMessage);
      return {
        success: false,
        error: errorMessage,
        products: [],
      };
    }
  }

  // ==================== WISHLIST ====================

  async getWishlist(
    custId: string,
  ): Promise<{ success: boolean; items: WishlistItem[]; error?: string }> {
    try {
      console.log(`📡 API - Getting wishlist for user: ${custId}`);
      const url = `${API_URLS.wishlist}?cust_id=${encodeURIComponent(custId)}`;
      console.log(`📡 API - URL: ${url}`);
      return this.request(url);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get wishlist";
      console.error("❌ API - Error getting wishlist:", errorMessage);
      return { success: false, items: [], error: errorMessage };
    }
  }

  async addToWishlist(
    data: any,
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log(
        "📤 API - Adding to wishlist:",
        JSON.stringify(data, null, 2),
      );
      console.log(`📤 API - URL: ${API_URLS.wishlist}`);
      return this.request(API_URLS.wishlist, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add to wishlist";
      console.error("❌ API - Error adding to wishlist:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async removeFromWishlist(
    custId: string,
    productId: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🗑️ API - Removing product ${productId} from wishlist`);
      console.log(`🗑️ API - URL: ${API_URLS.wishlist}`);
      return this.request(API_URLS.wishlist, {
        method: "DELETE",
        body: JSON.stringify({ cust_id: custId, product_id: productId }),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to remove from wishlist";
      console.error("❌ API - Error removing from wishlist:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async clearWishlist(
    custId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🗑️ API - Clearing wishlist for user: ${custId}`);
      const url = `${API_URLS.wishlist}/clear`;
      return this.request(url, {
        method: "DELETE",
        body: JSON.stringify({ cust_id: custId }),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to clear wishlist";
      console.error("❌ API - Error clearing wishlist:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // ==================== CART ====================

  async getCart(custId: string): Promise<{ success: boolean; items: any[] }> {
    try {
      return this.request(
        `${API_URLS.cart}?cust_id=${encodeURIComponent(custId)}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get cart";
      console.error("Error getting cart:", errorMessage);
      return { success: false, items: [] };
    }
  }

  async addToCart(data: any): Promise<{ success: boolean }> {
    try {
      return this.request(`${API_URLS.cart}/add`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add to cart";
      console.error("Error adding to cart:", errorMessage);
      return { success: false };
    }
  }

  // ==================== ORDERS ====================

  async createOrder(data: any): Promise<{ success: boolean; order: Order }> {
    try {
      return this.request(`${API_URLS.orders}/create`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create order";
      console.error("Error creating order:", errorMessage);
      return { success: false, order: {} as Order };
    }
  }

  async getOrders(
    custId: string,
  ): Promise<{ success: boolean; orders: Order[] }> {
    try {
      return this.request(
        `${API_URLS.orders}?cust_id=${encodeURIComponent(custId)}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get orders";
      console.error("Error getting orders:", errorMessage);
      return { success: false, orders: [] };
    }
  }

  // ==================== USER ====================

  async getOrCreateUser(
    data: any,
  ): Promise<{ success: boolean; user: any; error?: string }> {
    try {
      console.log("📤 API - Getting/Creating user with data:", data);
      console.log(`📤 API - URL: ${API_URLS.user}`);
      return this.request(API_URLS.user, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get or create user";
      console.error("❌ API - Error in getOrCreateUser:", errorMessage);
      return { success: false, user: null, error: errorMessage };
    }
  }

  async getUserProfile(
    uuid: string,
  ): Promise<{ success: boolean; user: any; addresses: Address[] }> {
    try {
      return this.request(`${API_URLS.profile}/${uuid}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get user profile";
      console.error("Error getting user profile:", errorMessage);
      return { success: false, user: null, addresses: [] };
    }
  }

  async updateUserProfile(
    uuid: string,
    data: any,
  ): Promise<{ success: boolean }> {
    try {
      return this.request(`${API_URLS.profile}/${uuid}`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update user profile";
      console.error("Error updating user profile:", errorMessage);
      return { success: false };
    }
  }
}

export const api = ApiService.getInstance();
