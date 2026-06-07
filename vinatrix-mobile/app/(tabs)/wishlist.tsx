import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Network from "expo-network";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../../components/themed-text";
import { eventEmitter, EVENTS } from "../../utils/eventEmitter";
import { useTheme } from "../context/ThemeContext";

interface WishlistItem {
  id: number;
  product_id: number;
  product_name: string;
  product_category: string;
  price: number | string;
  product_image: string;
  created_at?: string;
}

export default function WishlistScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [custId, setCustId] = useState<string>("");
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const BASE_URL = "https://api.vinatrix-api.workers.dev";
  const WISHLIST_URL = `${BASE_URL}/api/wishlist`;
  const CART_URL = `${BASE_URL}/api/cart`;

  // Helper function to safely get price as number
  const getPriceAsNumber = (price: number | string | undefined): number => {
    if (price === undefined || price === null) return 0;
    if (typeof price === "number") return price;
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper function to get clean image URL (SAME AS CART.TSX)
  const getImageUrl = (imagePath: string | undefined | null): string | null => {
    if (!imagePath || imagePath === null || imagePath === undefined) {
      return null;
    }

    // If it's already a full URL
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // Remove duplicate slashes and ensure proper format
    let cleanPath = imagePath;
    if (cleanPath.startsWith("/")) {
      cleanPath = cleanPath;
    } else if (cleanPath.startsWith("uploads/")) {
      cleanPath = `/${cleanPath}`;
    } else {
      cleanPath = `/${cleanPath}`;
    }

    // Return full URL
    return `${BASE_URL}${cleanPath}`;
  };

  // Get device info
  const getDeviceInfo = async () => {
    try {
      const deviceName = Device.deviceName || "unknown";
      const ipAddress = await Network.getIpAddressAsync();
      return { deviceName, ipAddress };
    } catch (error) {
      return { deviceName: "unknown", ipAddress: "0.0.0.0" };
    }
  };

  // Get or create user from backend
  const getOrCreateUser = async (): Promise<string | null> => {
    try {
      const { deviceName, ipAddress } = await getDeviceInfo();
      const deviceId = `${deviceName}_${Device.osBuildId || Date.now()}`;

      const response = await fetch(`${BASE_URL}/api/user/get-or-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: deviceId,
          ip_address: ipAddress,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await AsyncStorage.setItem("app_user_id", data.user.user_uuid);
        return data.user.user_uuid;
      }
    } catch (error) {
      console.error("Error getting/creating user:", error);
    }
    return null;
  };

  // Fetch wishlist from API
  const fetchWishlist = useCallback(async () => {
    try {
      if (!custId) return;

      console.log("fetchWishlist called");

      const url = `${WISHLIST_URL}?cust_id=${custId}`;
      console.log("📡 Fetching URL:", url);

      const response = await fetch(url);
      const data = await response.json();

      console.log("📥 Wishlist API Response:", JSON.stringify(data, null, 2));

      if (data.success && data.items) {
        console.log("✅ Items count:", data.items.length);
        if (data.items.length > 0) {
          console.log("📦 First item structure:", data.items[0]);
        }
        setWishlistItems(data.items);
        // Reset image errors when new items load
        setImageErrors({});
      } else {
        console.log("⚠️ API returned success false or no items:", data.error);
        setWishlistItems([]);
      }
    } catch (error) {
      console.error("❌ Error fetching wishlist:", error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [custId]);

  useEffect(() => {
    const init = async () => {
      const userId = await getOrCreateUser();
      if (userId) {
        setCustId(userId);
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (custId) {
      fetchWishlist();
    }
  }, [custId, fetchWishlist]);

  // Listen for wishlist updated events
  useEffect(() => {
    const handleWishlistUpdated = () => {
      fetchWishlist();
    };

    eventEmitter.on(EVENTS.WISHLIST_UPDATED, handleWishlistUpdated);

    return () => {
      eventEmitter.off(EVENTS.WISHLIST_UPDATED, handleWishlistUpdated);
    };
  }, [fetchWishlist]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWishlist();
  }, [fetchWishlist]);

  // Remove item from wishlist
  const removeFromWishlist = (productId: number, productName: string) => {
    Alert.alert(
      "Remove from Wishlist",
      `Remove ${productName} from your wishlist?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: async () => {
            try {
              const userId = await getOrCreateUser();
              const response = await fetch(`${WISHLIST_URL}/remove`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  cust_id: userId,
                  productId: productId,
                }),
              });

              const data = await response.json();
              if (data.success) {
                fetchWishlist();
                eventEmitter.emit(EVENTS.WISHLIST_UPDATED);
                eventEmitter.emit(EVENTS.WISHLIST_COUNT_UPDATED);
                Alert.alert("Success", "Item removed from wishlist");
              } else {
                Alert.alert("Error", data.error || "Failed to remove");
              }
            } catch (error) {
              console.error("Error removing:", error);
              Alert.alert("Error", "Failed to remove item");
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  // Add item to cart
  const addToCart = async (item: WishlistItem) => {
    try {
      const userId = await getOrCreateUser();
      const { ipAddress, deviceName } = await getDeviceInfo();
      const itemPrice = getPriceAsNumber(item.price);

      const response = await fetch(`${CART_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cust_id: userId,
          ip_address: ipAddress,
          device_id: deviceName,
          productId: item.product_id,
          productName: item.product_name,
          productCategory: item.product_category,
          price: itemPrice,
          productImage: item.product_image,
        }),
      });

      const data = await response.json();
      if (data.success) {
        eventEmitter.emit(EVENTS.CART_UPDATED);
        eventEmitter.emit(EVENTS.CART_COUNT_UPDATED);
        Alert.alert("Success", `${item.product_name} added to cart`);
      } else {
        Alert.alert("Error", data.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Failed to add to cart");
    }
  };

  // View product details
  const viewProduct = (productId: number) => {
    router.push(`/product/${productId}` as any);
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    if (wishlistItems.length === 0) return;

    Alert.alert(
      "Clear Wishlist",
      "Are you sure you want to clear your entire wishlist?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          onPress: async () => {
            try {
              const userId = await getOrCreateUser();
              const response = await fetch(`${WISHLIST_URL}/clear`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cust_id: userId }),
              });

              const data = await response.json();
              if (data.success) {
                fetchWishlist();
                eventEmitter.emit(EVENTS.WISHLIST_UPDATED);
                eventEmitter.emit(EVENTS.WISHLIST_COUNT_UPDATED);
                Alert.alert("Success", "Wishlist cleared");
              } else {
                Alert.alert("Error", data.error || "Failed to clear");
              }
            } catch (error) {
              console.error("Error clearing:", error);
              Alert.alert("Error", "Failed to clear wishlist");
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, isDark && styles.darkLoadingContainer]}
      >
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={[styles.loadingText, isDark && styles.darkText]}>
          Loading wishlist...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkSafeArea]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.header, isDark && styles.darkHeader]}>
          <ThemedText style={[styles.title, isDark && styles.darkText]}>
            Wishlist ❤️
          </ThemedText>
          <Text style={[styles.subtitle, isDark && styles.darkSubtitle]}>
            {wishlistItems.length} items
          </Text>
          {wishlistItems.length > 0 && (
            <TouchableOpacity
              onPress={clearWishlist}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {wishlistItems.length === 0 ? (
          <View style={styles.emptyWishlist}>
            <Feather name="heart" size={80} color={isDark ? "#666" : "#ccc"} />
            <Text style={[styles.emptyText, isDark && styles.darkText]}>
              Your wishlist is empty
            </Text>
            <Text style={[styles.emptySubText, isDark && styles.darkSubtitle]}>
              Add items you love from the home screen
            </Text>
            <TouchableOpacity
              style={styles.shopNowButton}
              onPress={() => router.push("/")}
            >
              <Text style={styles.shopNowText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {wishlistItems.map((item) => {
              const safePrice = getPriceAsNumber(item.price);
              const imageUrl = getImageUrl(item.product_image);
              const hasImageError = imageErrors[item.id];

              return (
                <View
                  key={item.id}
                  style={[
                    styles.wishlistItem,
                    isDark && styles.darkWishlistItem,
                  ]}
                >
                  <View style={styles.itemImageContainer}>
                    {imageUrl && !hasImageError ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.itemImage}
                        resizeMode="cover"
                        onError={() => {
                          console.log(
                            `Failed to load image for ${item.product_name}: ${imageUrl}`,
                          );
                          setImageErrors((prev) => ({
                            ...prev,
                            [item.id]: true,
                          }));
                        }}
                      />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Feather name="heart" size={30} color="#ccc" />
                      </View>
                    )}
                  </View>

                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, isDark && styles.darkText]}>
                      {item.product_name}
                    </Text>
                    <Text
                      style={[
                        styles.itemCategory,
                        isDark && styles.darkSubtitle,
                      ]}
                    >
                      {item.product_category}
                    </Text>
                    <Text style={styles.itemPrice}>
                      ₹{safePrice.toFixed(2)}
                    </Text>

                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={() => addToCart(item)}
                      >
                        <Feather name="shopping-cart" size={16} color="#fff" />
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() =>
                          removeFromWishlist(item.product_id, item.product_name)
                        }
                      >
                        <Feather name="trash-2" size={20} color="#e53935" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}

            <View style={styles.bottomPadding} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  darkSafeArea: { backgroundColor: "#1a1a1a" },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  darkLoadingContainer: { backgroundColor: "#1a1a1a" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  darkText: { color: "#fff" },
  darkSubtitle: { color: "#999" },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  darkHeader: { backgroundColor: "#2a2a2a", borderBottomColor: "#3a3a3a" },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  clearButton: { position: "absolute", right: 20, top: 20 },
  clearButtonText: { color: "#e53935", fontSize: 14, fontWeight: "500" },
  emptyWishlist: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    paddingBottom: 100,
  },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#999", marginTop: 16 },
  emptySubText: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 8,
    textAlign: "center",
  },
  shopNowButton: {
    backgroundColor: "#e53935",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
  },
  shopNowText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  wishlistItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  darkWishlistItem: { backgroundColor: "#2a2a2a" },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  itemImage: { width: "100%", height: "100%" },
  placeholderImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 2 },
  itemCategory: { fontSize: 12, color: "#999", marginTop: 2 },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e53935",
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e53935",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    flex: 1,
    justifyContent: "center",
  },
  addToCartText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  removeButton: { padding: 8 },
  bottomPadding: { height: 80 },
});
