// utils/constants.ts

import { Platform } from "react-native";

export const BASE_URL =
  Platform.OS === "web"
    ? "https://api.vinatrix-api.workers.dev"
    : "https://api.vinatrix-api.workers.dev";

export const API_URLS = {
  products: `${BASE_URL}/api/products`,
  trending: `${BASE_URL}/api/products/trending`,
  wishlist: `${BASE_URL}/api/wishlist`,
  cart: `${BASE_URL}/api/cart`,
  orders: `${BASE_URL}/api/orders`,
  user: `${BASE_URL}/api/user`,
  profile: `${BASE_URL}/api/user/profile`,
};

export const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/400x400/cccccc/666666?text=No+Image";

export const SIZE_COLORS: Record<string, string> = {
  S: "#4CAF50",
  M: "#2196F3",
  L: "#FF9800",
  XL: "#9C27B0",
  XXL: "#F44336",
  XXXL: "#795548",
};

export const PAYMENT_METHODS = [
  { id: "cash", name: "Cash on Delivery", icon: "💰", color: "#4caf50" },
  { id: "upi", name: "UPI", icon: "📱", color: "#2196f3" },
  { id: "card", name: "Credit/Debit Card", icon: "💳", color: "#ff9800" },
];
