// config.ts
import Constants from "expo-constants";

// Base URL from environment (injected via app.config.js)
export const BASE_URL =
  Constants.expoConfig?.extra?.API_BASE_URL ||
  "https://api.vinatrix-api.workers.dev";

// All API endpoints (based on your backend)
export const API_URL = `${BASE_URL}/api/products`;
export const CART_URL = `${BASE_URL}/api/cart`;
export const WISHLIST_URL = `${BASE_URL}/api/wishlist`;
export const ORDERS_URL = `${BASE_URL}/api/orders`;
export const USER_URL = `${BASE_URL}/api/user`;

// If you have other specific endpoints, add them here
// e.g., export const PRODUCT_CATEGORY_URL = `${BASE_URL}/api/products/category`;
