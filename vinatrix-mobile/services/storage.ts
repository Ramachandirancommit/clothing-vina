// services/storage.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  USER_ID: "user_id",
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
  // User ID
  async getUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error("Error getting user ID:", error);
      return null;
    }
  }

  async setUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    } catch (error) {
      console.error("Error setting user ID:", error);
    }
  }

  async removeUserId(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error("Error removing user ID:", error);
    }
  }

  // Wishlist
  async getWishlist(): Promise<string[] | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WISHLIST);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting wishlist:", error);
      return null;
    }
  }

  async setWishlist(items: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(items));
    } catch (error) {
      console.error("Error setting wishlist:", error);
    }
  }

  async getWishlistCount(): Promise<number> {
    try {
      const count = await AsyncStorage.getItem(STORAGE_KEYS.WISHLIST_COUNT);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error("Error getting wishlist count:", error);
      return 0;
    }
  }

  async setWishlistCount(count: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST_COUNT, String(count));
    } catch (error) {
      console.error("Error setting wishlist count:", error);
    }
  }

  async getWishlistLastFetch(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.WISHLIST_LAST_FETCH);
    } catch (error) {
      console.error("Error getting wishlist last fetch:", error);
      return null;
    }
  }

  async setWishlistLastFetch(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.WISHLIST_LAST_FETCH,
        new Date().toISOString(),
      );
    } catch (error) {
      console.error("Error setting wishlist last fetch:", error);
    }
  }

  // Cart
  async getCart(): Promise<any[] | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting cart:", error);
      return null;
    }
  }

  async setCart(items: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
    } catch (error) {
      console.error("Error setting cart:", error);
    }
  }

  async getCartCount(): Promise<number> {
    try {
      const count = await AsyncStorage.getItem(STORAGE_KEYS.CART_COUNT);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error("Error getting cart count:", error);
      return 0;
    }
  }

  async setCartCount(count: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CART_COUNT, String(count));
    } catch (error) {
      console.error("Error setting cart count:", error);
    }
  }

  // Recently Viewed
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

  // User Profile
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

  // Theme
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

  // Onboarding
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

  // Token
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

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.WISHLIST,
        STORAGE_KEYS.WISHLIST_COUNT,
        STORAGE_KEYS.WISHLIST_LAST_FETCH,
        STORAGE_KEYS.CART,
        STORAGE_KEYS.CART_COUNT,
        STORAGE_KEYS.RECENTLY_VIEWED,
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.THEME,
      ]);
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  }

  // Last sync
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
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_SYNC,
        new Date().toISOString(),
      );
    } catch (error) {
      console.error("Error setting last sync:", error);
    }
  }
}

export const storageService = new StorageService();
export default storageService;
