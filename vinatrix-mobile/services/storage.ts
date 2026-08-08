// services/storage.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  USER_ID: "user_id",
  DEVICE_ID: "device_id", // ADD THIS
  WISHLIST: "wishlist",
  WISHLIST_COUNT: "wishlist_count",
  WISHLIST_LAST_FETCH: "wishlist_last_fetch",
  CART: "cart",
  CART_COUNT: "cart_count",
  RECENTLY_VIEWED: "recently_viewed",
  USER_TOKEN: "user_token",
  USER_PROFILE: "user_profile",
  THEME: "theme",
  ONBOARDING_COMPLETED: "onboarding_completed",
  LAST_SYNC: "last_sync",
};

class StorageService {
  // =========================
  // USER ID METHODS
  // =========================
  async getUserId(): Promise<string | null> {
    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      console.log("📦 storageService.getUserId - Retrieved:", userId);
      return userId;
    } catch (error) {
      console.error("Error getting user ID:", error);
      return null;
    }
  }

  async setUserId(userId: string): Promise<void> {
    try {
      console.log("💾 storageService.setUserId - Saving:", userId);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
      console.log("✅ storageService.setUserId - Saved successfully");
    } catch (error) {
      console.error("Error setting user ID:", error);
    }
  }

  async removeUserId(): Promise<void> {
    try {
      console.log("🗑️ storageService.removeUserId - Removing user ID");
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
      console.log("✅ storageService.removeUserId - Removed successfully");
    } catch (error) {
      console.error("Error removing user ID:", error);
    }
  }

  // =========================
  // DEVICE ID METHODS - ADD THESE
  // =========================
  async getDeviceId(): Promise<string | null> {
    try {
      const deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      console.log("📦 storageService.getDeviceId - Retrieved:", deviceId);
      return deviceId;
    } catch (error) {
      console.error("Error getting device ID:", error);
      return null;
    }
  }

  async setDeviceId(deviceId: string): Promise<void> {
    try {
      console.log("💾 storageService.setDeviceId - Saving:", deviceId);
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
      console.log("✅ storageService.setDeviceId - Saved successfully");
    } catch (error) {
      console.error("Error setting device ID:", error);
    }
  }

  async removeDeviceId(): Promise<void> {
    try {
      console.log("🗑️ storageService.removeDeviceId - Removing device ID");
      await AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_ID);
      console.log("✅ storageService.removeDeviceId - Removed successfully");
    } catch (error) {
      console.error("Error removing device ID:", error);
    }
  }

  // =========================
  // WISHLIST METHODS
  // =========================
  async getWishlist(): Promise<string[] | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WISHLIST);
      const parsed = data ? JSON.parse(data) : null;
      console.log(
        `📦 storageService.getWishlist - ${parsed ? parsed.length : 0} items`,
      );
      return parsed;
    } catch (error) {
      console.error("Error getting wishlist:", error);
      return null;
    }
  }

  async setWishlist(items: string[]): Promise<void> {
    try {
      console.log(`💾 storageService.setWishlist - ${items.length} items`);
      await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(items));
    } catch (error) {
      console.error("Error setting wishlist:", error);
    }
  }

  async getWishlistCount(): Promise<number> {
    try {
      const count = await AsyncStorage.getItem(STORAGE_KEYS.WISHLIST_COUNT);
      const parsed = count ? parseInt(count, 10) : 0;
      console.log(`📦 storageService.getWishlistCount - ${parsed}`);
      return parsed;
    } catch (error) {
      console.error("Error getting wishlist count:", error);
      return 0;
    }
  }

  async setWishlistCount(count: number): Promise<void> {
    try {
      console.log(`💾 storageService.setWishlistCount - ${count}`);
      await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST_COUNT, String(count));
    } catch (error) {
      console.error("Error setting wishlist count:", error);
    }
  }

  async getWishlistLastFetch(): Promise<string | null> {
    try {
      const timestamp = await AsyncStorage.getItem(
        STORAGE_KEYS.WISHLIST_LAST_FETCH,
      );
      console.log(`📦 storageService.getWishlistLastFetch - ${timestamp}`);
      return timestamp;
    } catch (error) {
      console.error("Error getting wishlist last fetch:", error);
      return null;
    }
  }

  async setWishlistLastFetch(): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      console.log(`💾 storageService.setWishlistLastFetch - ${timestamp}`);
      await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST_LAST_FETCH, timestamp);
    } catch (error) {
      console.error("Error setting wishlist last fetch:", error);
    }
  }

  // =========================
  // CART METHODS
  // =========================
  async getCart(): Promise<any[] | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      const parsed = data ? JSON.parse(data) : null;
      console.log(
        `📦 storageService.getCart - ${parsed ? parsed.length : 0} items`,
      );
      return parsed;
    } catch (error) {
      console.error("Error getting cart:", error);
      return null;
    }
  }

  async setCart(items: any[]): Promise<void> {
    try {
      console.log(`💾 storageService.setCart - ${items.length} items`);
      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
    } catch (error) {
      console.error("Error setting cart:", error);
    }
  }

  async getCartCount(): Promise<number> {
    try {
      const count = await AsyncStorage.getItem(STORAGE_KEYS.CART_COUNT);
      const parsed = count ? parseInt(count, 10) : 0;
      console.log(`📦 storageService.getCartCount - ${parsed}`);
      return parsed;
    } catch (error) {
      console.error("Error getting cart count:", error);
      return 0;
    }
  }

  async setCartCount(count: number): Promise<void> {
    try {
      console.log(`💾 storageService.setCartCount - ${count}`);
      await AsyncStorage.setItem(STORAGE_KEYS.CART_COUNT, String(count));
    } catch (error) {
      console.error("Error setting cart count:", error);
    }
  }

  // =========================
  // RECENTLY VIEWED METHODS
  // =========================
  async getRecentlyViewed(): Promise<string[] | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting recently viewed:", error);
      return null;
    }
  }

  async setRecentlyViewed(items: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.RECENTLY_VIEWED,
        JSON.stringify(items),
      );
    } catch (error) {
      console.error("Error setting recently viewed:", error);
    }
  }

  // =========================
  // USER PROFILE METHODS
  // =========================
  async getUserProfile(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  }

  async setUserProfile(profile: any): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(profile),
      );
    } catch (error) {
      console.error("Error setting user profile:", error);
    }
  }

  // =========================
  // THEME METHODS
  // =========================
  async getTheme(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    } catch (error) {
      console.error("Error getting theme:", error);
      return null;
    }
  }

  async setTheme(theme: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error("Error setting theme:", error);
    }
  }

  // =========================
  // ONBOARDING METHODS
  // =========================
  async getOnboardingCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(
        STORAGE_KEYS.ONBOARDING_COMPLETED,
      );
      return value === "true";
    } catch (error) {
      console.error("Error getting onboarding status:", error);
      return false;
    }
  }

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        String(completed),
      );
    } catch (error) {
      console.error("Error setting onboarding status:", error);
    }
  }

  // =========================
  // TOKEN METHODS
  // =========================
  async getUserToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error("Error getting user token:", error);
      return null;
    }
  }

  async setUserToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
    } catch (error) {
      console.error("Error setting user token:", error);
    }
  }

  // =========================
  // LAST SYNC METHODS
  // =========================
  async getLastSync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error("Error getting last sync:", error);
      return null;
    }
  }

  async setLastSync(): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      console.log(`💾 storageService.setLastSync - ${timestamp}`);
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
    } catch (error) {
      console.error("Error setting last sync:", error);
    }
  }

  // =========================
  // CLEAR ALL DATA
  // =========================
  async clearAll(): Promise<void> {
    try {
      console.log("🗑️ storageService.clearAll - Clearing all storage");
      const keysToRemove: string[] = [
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.DEVICE_ID,
        STORAGE_KEYS.WISHLIST,
        STORAGE_KEYS.WISHLIST_COUNT,
        STORAGE_KEYS.WISHLIST_LAST_FETCH,
        STORAGE_KEYS.CART,
        STORAGE_KEYS.CART_COUNT,
        STORAGE_KEYS.RECENTLY_VIEWED,
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.THEME,
      ];
      await AsyncStorage.multiRemove(keysToRemove);
      console.log("✅ storageService.clearAll - All storage cleared");
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  }

  // =========================
  // HELPER METHODS
  // =========================
  async hasUserId(): Promise<boolean> {
    try {
      const userId = await this.getUserId();
      const exists = userId !== null && userId !== undefined;
      console.log(`🔍 storageService.hasUserId - ${exists}`);
      return exists;
    } catch (error) {
      console.error("Error checking user ID:", error);
      return false;
    }
  }

  async getAllKeys(): Promise<readonly string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log(`📦 storageService.getAllKeys - ${keys.length} keys:`, keys);
      return keys;
    } catch (error) {
      console.error("Error getting all keys:", error);
      return [];
    }
  }

  async getAllData(): Promise<Record<string, any>> {
    try {
      const keys = await this.getAllKeys();
      const items = await AsyncStorage.multiGet(keys as string[]);
      const data: Record<string, any> = {};
      items.forEach(([key, value]) => {
        try {
          data[key] = value ? JSON.parse(value) : null;
        } catch {
          data[key] = value;
        }
      });
      console.log("📦 storageService.getAllData - All data:", data);
      return data;
    } catch (error) {
      console.error("Error getting all data:", error);
      return {};
    }
  }
}

export const storageService = new StorageService();
export default storageService;
