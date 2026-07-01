// services/api.ts

import { API_URLS } from "../utils/constants";
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

  // Products
  async getTrendingProducts(): Promise<Product[]> {
    const response = await this.request<{ data: Product[] }>(API_URLS.trending);
    return response.data || [];
  }

  async getAllProducts(): Promise<Product[]> {
    const response = await this.request<{ data: Product[] }>(API_URLS.products);
    return response.data || [];
  }

  // Wishlist
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

  // Cart
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

  // Orders
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

  // User
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
