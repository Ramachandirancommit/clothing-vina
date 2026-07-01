// services/storage.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import webStorage from "../utils/webCompatibleStorage";

const storage = Platform.OS === "web" ? webStorage : AsyncStorage;

export class StorageService {
  private static instance: StorageService;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async getItem(key: string): Promise<string | null> {
    return storage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    return storage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    return storage.removeItem(key);
  }

  // User
  async getUserId(): Promise<string | null> {
    return this.getItem("app_user_id");
  }

  async setUserId(userId: string): Promise<void> {
    return this.setItem("app_user_id", userId);
  }

  // Wishlist
  async getWishlist(): Promise<string[] | null> {
    const data = await this.getItem("wishlist");
    return data ? JSON.parse(data) : null;
  }

  async setWishlist(items: string[]): Promise<void> {
    return this.setItem("wishlist", JSON.stringify(items));
  }

  async getWishlistCount(): Promise<number> {
    const count = await this.getItem("wishlistCount");
    return count ? parseInt(count) : 0;
  }

  async setWishlistCount(count: number): Promise<void> {
    return this.setItem("wishlistCount", String(count));
  }

  async getWishlistItems(): Promise<any[] | null> {
    const data = await this.getItem("wishlist_items");
    return data ? JSON.parse(data) : null;
  }

  async setWishlistItems(items: any[]): Promise<void> {
    return this.setItem("wishlist_items", JSON.stringify(items));
  }

  async getWishlistLastFetch(): Promise<number | null> {
    const data = await this.getItem("wishlist_last_fetch");
    return data ? parseInt(data) : null;
  }

  async setWishlistLastFetch(): Promise<void> {
    return this.setItem("wishlist_last_fetch", String(Date.now()));
  }
}

export const storageService = StorageService.getInstance();
