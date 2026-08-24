import { Feather } from "@expo/vector-icons";
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
import { BASE_URL } from "../../constants/config";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
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

  // ✅ USE THE HOOK INSTEAD OF MANAGING STATE
  const {
    wishlist,
    wishlistCount,
    loading,
    refreshing,
    setRefreshing,
    fetchWishlist,
    toggleWishlist,
    clearWishlist: clearWishlistHook,
  } = useWishlist();

  const { addToCart } = useCart();

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Helper function to safely get price as number
  const getPriceAsNumber = (price: number | string | undefined): number => {
    if (price === undefined || price === null) return 0;
    if (typeof price === "number") return price;
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper function to get clean image URL
  const getImageUrl = (imagePath: string | undefined | null): string | null => {
    if (!imagePath || imagePath === null || imagePath === undefined) {
      return null;
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    let cleanPath = imagePath;
    if (cleanPath.startsWith("/")) {
      cleanPath = cleanPath;
    } else if (cleanPath.startsWith("uploads/")) {
      cleanPath = `/${cleanPath}`;
    } else {
      cleanPath = `/${cleanPath}`;
    }

    return `${BASE_URL}${cleanPath}`;
  };

  // =========================
  // FETCH FULL PRODUCT DETAILS
  // =========================
  const fetchProductDetails = useCallback(async (productIds: string[]) => {
    try {
      if (!productIds || productIds.length === 0) {
        setWishlistItems([]);
        return;
      }

      console.log(`🔍 Fetching details for ${productIds.length} products...`);

      // Fetch product details for each ID
      const productPromises = productIds.map(async (id) => {
        try {
          const response = await fetch(`${BASE_URL}/api/product/${id}`);
          const data = await response.json();
          if (data.success && data.product) {
            return {
              id: parseInt(id),
              product_id: parseInt(id),
              product_name:
                data.product.product_name ||
                data.product.name ||
                `Product ${id}`,
              product_category:
                data.product.product_category ||
                data.product.category ||
                "Uncategorized",
              price: data.product.price || 0,
              product_image:
                data.product.product_image ||
                data.product.image ||
                data.product.image_url ||
                "",
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching product ${id}:`, error);
          return null;
        }
      });

      const products = await Promise.all(productPromises);
      const validProducts = products.filter(
        (p): p is WishlistItem => p !== null,
      );
      setWishlistItems(validProducts);
      console.log(`✅ Fetched ${validProducts.length} product details`);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  }, []);

  // =========================
  // LOAD WISHLIST ITEMS
  // =========================
  useEffect(() => {
    // Fetch wishlist IDs
    console.log("🔄 Fetching wishlist...");
    fetchWishlist(true);
  }, []);

  // When wishlist IDs change, fetch product details
  useEffect(() => {
    if (wishlist && wishlist.length > 0) {
      console.log(`🔄 Wishlist IDs changed: ${wishlist.length} items`);
      fetchProductDetails(wishlist);
    } else if (wishlist && wishlist.length === 0) {
      setWishlistItems([]);
    }
  }, [wishlist]);

  // =========================
  // PULL TO REFRESH
  // =========================
  const onRefresh = useCallback(() => {
    console.log("🔄 Pull to refresh triggered");
    setRefreshing(true);
    fetchWishlist(true);
  }, [fetchWishlist, setRefreshing]);

  // =========================
  // REMOVE FROM WISHLIST - USE HOOK
  // =========================
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
              // Create a fake product object for the hook
              const product = {
                id: String(productId),
                product_name: productName,
              };
              await toggleWishlist(product);
              Alert.alert("Success", "Item removed from wishlist");
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

  // =========================
  // CLEAR WISHLIST - USE HOOK
  // =========================
  const handleClearWishlist = () => {
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
              await clearWishlistHook();
              Alert.alert("Success", "Wishlist cleared");
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

  // =========================
  // ADD TO CART - USE HOOK
  // =========================
  const handleAddToCart = async (item: WishlistItem) => {
    try {
      const product = {
        id: item.product_id,
        product_name: item.product_name,
        product_category: item.product_category,
        price: getPriceAsNumber(item.price),
        image: item.product_image,
      };
      await addToCart(product);
      Alert.alert("Success", `${item.product_name} added to cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Failed to add to cart");
    }
  };

  // =========================
  // VIEW PRODUCT DETAILS
  // =========================
  const viewProduct = (productId: number) => {
    router.push(`/product/${productId}` as any);
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
              onPress={handleClearWishlist}
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
                  key={item.id || item.product_id}
                  style={[
                    styles.wishlistItem,
                    isDark && styles.darkWishlistItem,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.itemImageContainer}
                    onPress={() => viewProduct(item.product_id)}
                  >
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
                  </TouchableOpacity>

                  <View style={styles.itemInfo}>
                    <TouchableOpacity
                      onPress={() => viewProduct(item.product_id)}
                    >
                      <Text
                        style={[styles.itemName, isDark && styles.darkText]}
                      >
                        {item.product_name}
                      </Text>
                    </TouchableOpacity>
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
                        onPress={() => handleAddToCart(item)}
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
