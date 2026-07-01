// app/explore.tsx

import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BuyNowModal } from "../components/common/BuyNowModal";
import SellProductModal from "../components/SellProductModal";
import { ThemedText } from "../components/themed-text";
import { useCart } from "../hooks/useCart";
import { useProducts } from "../hooks/useProducts";
import { useWishlist } from "../hooks/useWishlist";
import { Product } from "../utils/types";
import { useTheme } from "./context/ThemeContext";

const { width } = Dimensions.get("window");

// Category images mapping
const categoryImages = {
  Tshirt: require("../assets/icons/tshirt.png"),
  Shirt: require("../assets/icons/shirt.png"),
  Pant: require("../assets/icons/pant.png"),
  Track: require("../assets/icons/track.png"),
  "Jeans Pant": require("../assets/icons/jeans.png"),
  "Party Wears": require("../assets/icons/party.png"),
  "Colorful Picks": require("../assets/icons/colorful.png"),
  All: require("../assets/icons/all.png"),
};

const allCategories = [
  "Pant",
  "Track",
  "Jeans Pant",
  "Party Wears",
  "Tshirt",
  "Shirt",
  "Colorful Picks",
  "All",
];

export default function ExploreScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [version, setVersion] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const flatListRef = useRef<FlatList>(null);

  // Custom hooks
  const {
    products,
    loading: productsLoading,
    fetchProducts,
  } = useProducts("all");
  const {
    wishlist,
    wishlistCount,
    loading: wishlistLoading,
    refreshing,
    setRefreshing,
    fetchWishlist,
    toggleWishlist,
  } = useWishlist();
  const { cartCount, addToCart } = useCart();

  // Buy Now Modal State
  const [buyNowModalVisible, setBuyNowModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const loading = productsLoading || wishlistLoading;

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    if (selectedCategory === "All") {
      return products;
    }
    return products.filter(
      (product) => product.product_category === selectedCategory,
    );
  }, [products, selectedCategory]);

  // Scroll to top when category changes
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, [selectedCategory]);

  // Handle image load errors
  const handleImageError = useCallback((productId: string, url: string) => {
    setFailedImages((prev) => new Set(prev).add(productId));
  }, []);

  // Handle Buy Now
  const handleBuyNow = useCallback((product: Product) => {
    setSelectedProduct(product);
    setBuyNowModalVisible(true);
  }, []);

  // Handle category press
  const handleCategoryPress = useCallback(
    (category: string) => {
      if (selectedCategory === category) return;
      setSelectedCategory(category);
    },
    [selectedCategory],
  );

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProducts(), fetchWishlist(true)]);
    setRefreshing(false);
  }, [fetchProducts, fetchWishlist, setRefreshing]);

  // Handle product added from Sell modal
  const handleProductAdded = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setVersion((prev) => prev + 1);
    setRefreshing(false);
  }, [fetchProducts, setRefreshing]);

  // Render sidebar category
  const renderSidebarCategory = (category: string) => {
    const isActive = selectedCategory === category;

    return (
      <Pressable
        key={category}
        style={({ pressed }) => [
          styles.sidebarIconButton,
          isActive && styles.sidebarIconButtonActive,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => handleCategoryPress(category)}
      >
        <View
          style={[
            styles.sidebarIconCircle,
            isActive && styles.sidebarIconCircleActive,
          ]}
        >
          <Image
            source={categoryImages[category as keyof typeof categoryImages]}
            style={[
              styles.sidebarIconImage,
              { tintColor: isActive ? "#fff" : isDark ? "#ccc" : undefined },
            ]}
            resizeMode="contain"
          />
        </View>
        <Text
          style={[
            styles.sidebarIconLabel,
            isActive && styles.sidebarIconLabelActive,
            isDark && styles.darkIconLabel,
          ]}
        >
          {category === "Jeans Pant"
            ? "Jeans"
            : category === "Party Wears"
              ? "Party"
              : category === "Colorful Picks"
                ? "Colorful"
                : category}
        </Text>
      </Pressable>
    );
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchProducts(), fetchWishlist()]);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.mainContainer, isDark && styles.darkMainContainer]}
        edges={[]}
      >
        <View
          style={[
            styles.loadingContainer,
            isDark && styles.darkLoadingContainer,
          ]}
        >
          <ActivityIndicator size="large" color="#e53935" />
          <ThemedText style={[styles.loadingText, isDark && styles.darkText]}>
            Loading products...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.mainContainer, isDark && styles.darkMainContainer]}
      edges={[]}
    >
      <View style={styles.mainLayout}>
        {/* Left Sidebar - Categories */}
        <ScrollView
          style={[styles.categoriesSidebar, isDark && styles.darkSidebar]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sidebarContent}>
            <Text style={[styles.sidebarTitle, isDark && styles.darkText]}>
              Categories
            </Text>
            {allCategories.map((category) => renderSidebarCategory(category))}
          </View>
        </ScrollView>

        {/* Right - Products */}
        <FlatList
          ref={flatListRef}
          data={filteredProducts}
          keyExtractor={(item) => `${item.id}-${version}`}
          numColumns={2}
          renderItem={({ item }) => {
            const isInWishlist = wishlist.includes(item.id);
            let finalImageUrl = item.image;
            const hasImageError = failedImages.has(item.id);

            if (hasImageError) {
              finalImageUrl =
                "https://pub-9370fc1d39014a0982f66c754476d059.r2.dev/placeholder.jpg";
            }

            return (
              <View style={[styles.card, isDark && styles.darkCard]}>
                <Pressable
                  style={styles.wishlistIcon}
                  onPress={() => toggleWishlist(item)}
                >
                  <Text style={{ fontSize: 20 }}>
                    {isInWishlist ? "❤️" : "🤍"}
                  </Text>
                </Pressable>

                <Image
                  source={{ uri: finalImageUrl }}
                  style={styles.productImage}
                  resizeMode="cover"
                  onError={() => handleImageError(item.id, finalImageUrl)}
                />

                {hasImageError && (
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => {
                      setFailedImages((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(item.id);
                        return newSet;
                      });
                    }}
                  >
                    <Text style={styles.retryText}>Tap to retry</Text>
                  </TouchableOpacity>
                )}

                <ThemedText
                  style={[styles.productName, isDark && styles.darkText]}
                  numberOfLines={2}
                >
                  {item.product_name}
                </ThemedText>

                <View style={styles.categorySizeRow}>
                  <View style={styles.categoryBadge}>
                    <ThemedText style={styles.categoryText}>
                      {item.product_category}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.sizeBadge,
                      { backgroundColor: getSizeColor(item.size) },
                    ]}
                  >
                    <Text style={styles.sizeText}>{item.size}</Text>
                  </View>
                </View>

                <View style={styles.ratingContainer}>
                  <View style={styles.starsContainer}>
                    {renderStars(Number(item.rating))}
                  </View>
                  <ThemedText
                    style={[styles.ratingText, isDark && styles.darkSubtitle]}
                  >
                    {item.rating} ({item.reviews})
                  </ThemedText>
                </View>

                <ThemedText style={styles.price}>
                  ₹{parseFloat(item.price).toFixed(2)}
                </ThemedText>

                <View style={styles.actionButtons}>
                  <Pressable
                    style={[styles.actionBtn, styles.addToCartBtn]}
                    onPress={() => addToCart(item)}
                  >
                    <Text style={{ fontSize: 16, color: "#fff" }}>🛒</Text>
                    <ThemedText style={styles.btnText}>+Cart</ThemedText>
                  </Pressable>

                  <Pressable
                    style={[styles.actionBtn, styles.buyNowBtn]}
                    onPress={() => handleBuyNow(item)}
                  >
                    <Text style={{ fontSize: 14, color: "#fff" }}>⚡</Text>
                    <ThemedText style={styles.btnText}>Buy</ThemedText>
                  </Pressable>
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.container}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <View
              style={[
                styles.countContainer,
                isDark && styles.darkCountContainer,
              ]}
            >
              <Text style={[styles.countText, isDark && styles.darkSubtitle]}>
                {filteredProducts.length} products found
              </Text>
              <View style={styles.activeCategoryBadge}>
                <Text style={styles.activeCategoryText}>
                  {selectedCategory}
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={() => (
            <View style={{ padding: 50, alignItems: "center" }}>
              <Text style={{ color: isDark ? "#fff" : "#333" }}>
                No products found. Pull to refresh.
              </Text>
            </View>
          )}
        />
      </View>

      {/* FAB Button */}
      <Pressable style={styles.fabButton} onPress={() => setModalVisible(true)}>
        <Text style={{ fontSize: 24, color: "#fff" }}>➕</Text>
        <Text style={styles.fabText}>Sell</Text>
      </Pressable>

      {/* Modals */}
      <SellProductModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onProductAdded={handleProductAdded}
      />

      {selectedProduct && (
        <BuyNowModal
          visible={buyNowModalVisible}
          onClose={() => {
            setBuyNowModalVisible(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}
    </SafeAreaView>
  );
}

// Helper functions
const getSizeColor = (size: string) => {
  const colors: { [key: string]: string } = {
    S: "#4CAF50",
    M: "#2196F3",
    L: "#FF9800",
    XL: "#9C27B0",
    XXL: "#F44336",
    XXXL: "#795548",
  };
  return colors[size] || "#666";
};

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = "";
  for (let i = 0; i < fullStars; i++) stars += "⭐";
  if (hasHalfStar) stars += "⭐";
  return <Text style={{ fontSize: 12, color: "#FFB800" }}>{stars}</Text>;
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#f4f6f8" },
  darkMainContainer: { backgroundColor: "#1a1a1a" },
  mainLayout: { flex: 1, flexDirection: "row", marginTop: 56 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  darkLoadingContainer: { backgroundColor: "#1a1a1a" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  darkText: { color: "#fff" },
  darkSubtitle: { color: "#999" },

  // Sidebar
  categoriesSidebar: {
    width: 85,
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  darkSidebar: {
    backgroundColor: "#2a2a2a",
    borderRightColor: "#444",
  },
  sidebarContent: {
    alignItems: "center",
    paddingHorizontal: 5,
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  sidebarIconButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    paddingVertical: 8,
    marginBottom: 5,
    borderRadius: 10,
    flexShrink: 0,
    flexGrow: 0,
  },
  sidebarIconButtonActive: {
    backgroundColor: "#ffebee",
  },
  sidebarIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  sidebarIconCircleActive: {
    backgroundColor: "#e53935",
  },
  sidebarIconImage: {
    width: 26,
    height: 26,
  },
  sidebarIconLabel: {
    fontSize: 9,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 12,
  },
  sidebarIconLabelActive: {
    color: "#e53935",
    fontWeight: "700",
  },
  darkIconLabel: {
    color: "#999",
  },

  // Product grid
  container: {
    paddingHorizontal: 10,
    paddingBottom: 120,
    paddingTop: 0,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  countContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  darkCountContainer: {
    backgroundColor: "#2a2a2a",
  },
  countText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeCategoryBadge: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeCategoryText: {
    fontSize: 12,
    color: "#e53935",
    fontWeight: "600",
  },
  card: {
    width: "45%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    position: "relative",
  },
  darkCard: {
    backgroundColor: "#2a2a2a",
  },
  wishlistIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 6,
  },
  productImage: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  categorySizeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flex: 1,
  },
  categoryText: {
    fontSize: 10,
    color: "#1976d2",
    fontWeight: "600",
  },
  sizeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 45,
    alignItems: "center",
  },
  sizeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 5,
  },
  ratingText: {
    fontSize: 10,
    color: "#666",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e53935",
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  addToCartBtn: {
    backgroundColor: "#ff9800",
  },
  buyNowBtn: {
    backgroundColor: "#e53935",
  },
  btnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  retryButton: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 4,
    borderRadius: 4,
    alignItems: "center",
  },
  retryText: {
    color: "#fff",
    fontSize: 10,
  },

  // FAB
  fabButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#e53935",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
  },
  fabText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 6,
  },
});

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Device from "expo-device";
// import * as Network from "expo-network";
// import { useRouter } from "expo-router";
// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";

// import {
//   ActivityIndicator,
//   Alert,
//   Dimensions,
//   FlatList,
//   Image,
//   Modal,
//   Platform,
//   Pressable,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// import { SafeAreaView } from "react-native-safe-area-context";

// import SellProductModal from "../../components/SellProductModal";
// import { ThemedText } from "../../components/themed-text";
// import { eventEmitter, EVENTS } from "../../utils/eventEmitter";
// import { useTheme } from "../context/ThemeContext";

// const { width } = Dimensions.get("window");

// interface Product {
//   id: string;
//   product_name: string;
//   product_category: string;
//   size: string;
//   price: string;
//   quantity: number;
//   description: string;
//   image: string;
//   sold?: number;
//   rating?: any;
//   reviews?: number;
// }

// interface Address {
//   id: number;
//   address_label: string;
//   address_text: string;
//   city: string;
//   state: string;
//   pincode: string;
//   is_primary: number;
// }

// export default function ExploreScreen() {
//   const router = useRouter();
//   const { isDark } = useTheme();

//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [version, setVersion] = useState(0);
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [cartCount, setCartCount] = useState(0);
//   const flatListRef = useRef<FlatList>(null);

//   const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

//   const [wishlist, setWishlist] = useState<string[]>([]);
//   const [wishlistCount, setWishlistCount] = useState(0);

//   const [buyNowModalVisible, setBuyNowModalVisible] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
//   const [addresses, setAddresses] = useState<Address[]>([]);
//   const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
//   const [processing, setProcessing] = useState(false);

//   const [showAddAddressForm, setShowAddAddressForm] = useState(false);
//   const [newAddress, setNewAddress] = useState({
//     address_label: "Home",
//     address_text: "",
//     city: "",
//     state: "",
//     pincode: "",
//   });

//   const [cardNumber, setCardNumber] = useState("");
//   const [cardExpiry, setCardExpiry] = useState("");
//   const [cardCvv, setCardCvv] = useState("");
//   const [cardName, setCardName] = useState("");

//   const [customerName, setCustomerName] = useState("");
//   const [customerPhone, setCustomerPhone] = useState("");
//   const [customerEmail, setCustomerEmail] = useState("");

//   const BASE_URL = "https://api.vinatrix-api.workers.dev";
//   const API_URL = `${BASE_URL}/api/products`;
//   const CART_URL = `${BASE_URL}/api/cart`;
//   const WISHLIST_URL = `${BASE_URL}/api/wishlist`;

//   const PLACEHOLDER_IMAGE =
//     "https://pub-9370fc1d39014a0982f66c754476d059.r2.dev/placeholder.jpg";

//   const categoryImages = {
//     Tshirt: require("../../assets/icons/tshirt.png"),
//     Shirt: require("../../assets/icons/shirt.png"),
//     Pant: require("../../assets/icons/pant.png"),
//     Track: require("../../assets/icons/track.png"),
//     "Jeans Pant": require("../../assets/icons/jeans.png"),
//     "Party Wears": require("../../assets/icons/party.png"),
//     "Colorful Picks": require("../../assets/icons/colorful.png"),
//     All: require("../../assets/icons/all.png"),
//   };

//   const allCategories = [
//     "Pant",
//     "Track",
//     "Jeans Pant",
//     "Party Wears",
//     "Tshirt",
//     "Shirt",
//     "Colorful Picks",
//     "All",
//   ];

//   const filteredProducts = useMemo(() => {
//     if (!products.length) return [];
//     if (selectedCategory === "All") {
//       return products;
//     }
//     return products.filter(
//       (product) => product.product_category === selectedCategory,
//     );
//   }, [products, selectedCategory]);

//   // Scroll to top when category changes
//   useEffect(() => {
//     if (flatListRef.current) {
//       flatListRef.current.scrollToOffset({ offset: 0, animated: false });
//     }
//   }, [selectedCategory]);

//   // =========================
//   // GET USER ID - FIXED FOR WEB & MOBILE
//   // =========================
//   const getUserId = async (): Promise<string> => {
//     try {
//       let userId = await AsyncStorage.getItem("app_user_id");

//       if (!userId) {
//         if (Platform.OS === "web") {
//           const browserInfo = navigator.userAgent.substring(0, 50);
//           const timestamp = Date.now();
//           const randomId = Math.random().toString(36).substring(2, 8);
//           userId = `WEB_${browserInfo.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}_${randomId}`;
//         } else {
//           const deviceName = Device.deviceName || "unknown";
//           const ipAddress = await Network.getIpAddressAsync();
//           const timestamp = Date.now();
//           userId = `USER_${deviceName.substring(0, 5)}_${ipAddress.split(".").pop()}_${timestamp}`;
//         }

//         await AsyncStorage.setItem("app_user_id", userId);
//       }

//       return userId;
//     } catch (error) {
//       console.error("Error getting user ID:", error);
//       return `GUEST_${Date.now()}`;
//     }
//   };

//   // =========================
//   // GET DEVICE INFO - FIXED WITH SYNC FALLBACK FOR WEB
//   // =========================
//   const getDeviceInfo = async () => {
//     try {
//       if (Platform.OS === "web") {
//         // Get browser info synchronously (always available)
//         const userAgent = navigator.userAgent || "unknown";
//         const screenResolution = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
//         const timezone =
//           Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
//         const language = navigator.language || "unknown";

//         // Create a unique device fingerprint for web (SYNC - always works)
//         const deviceFingerprint = `WEB_${userAgent.substring(0, 30).replace(/[^a-zA-Z0-9]/g, "_")}_${screenResolution}_${timezone}`;

//         // Try to get IP asynchronously, but don't wait too long
//         let ipAddress = "web_client";
//         try {
//           // Use a timeout to prevent hanging
//           const controller = new AbortController();
//           const timeoutId = setTimeout(() => controller.abort(), 3000);

//           const ipResponse = await fetch("https://api.ipify.org?format=json", {
//             signal: controller.signal,
//           });
//           clearTimeout(timeoutId);

//           if (ipResponse.ok) {
//             const ipData = await ipResponse.json();
//             if (ipData.ip) {
//               ipAddress = ipData.ip;
//             }
//           }
//         } catch (ipError) {
//           console.log("IP fetch failed, using fallback");
//           // Try alternative IP service with timeout
//           try {
//             const controller = new AbortController();
//             const timeoutId = setTimeout(() => controller.abort(), 3000);

//             const ipResponse = await fetch("https://api.ipapi.co/json/", {
//               signal: controller.signal,
//             });
//             clearTimeout(timeoutId);

//             if (ipResponse.ok) {
//               const ipData = await ipResponse.json();
//               if (ipData.ip) {
//                 ipAddress = ipData.ip;
//               }
//             }
//           } catch (e) {
//             console.log("Alternative IP fetch failed, using fallback");
//           }
//         }

//         console.log("📱 Web Device Info:", {
//           deviceName: deviceFingerprint.substring(0, 50),
//           ipAddress: ipAddress,
//           userAgent: userAgent,
//           screenResolution: screenResolution,
//           timezone: timezone,
//         });

//         return {
//           deviceName: deviceFingerprint.substring(0, 50),
//           ipAddress: ipAddress,
//           userAgent: userAgent,
//           screenResolution: screenResolution,
//           timezone: timezone,
//           language: language,
//         };
//       }

//       // Mobile platform
//       const deviceName = Device.deviceName || "unknown";
//       const ipAddress = await Network.getIpAddressAsync();
//       return {
//         deviceName: deviceName,
//         ipAddress: ipAddress,
//       };
//     } catch (error) {
//       console.error("Error getting device info:", error);
//       // Return fallback values
//       return {
//         deviceName: Platform.OS === "web" ? "web_fallback" : "unknown_device",
//         ipAddress: "0.0.0.0",
//       };
//     }
//   };

//   const fetchAddresses = async (uuid: string) => {
//     try {
//       const response = await fetch(`${BASE_URL}/api/user/profile/${uuid}`);
//       const data = await response.json();

//       if (data.success && data.addresses && data.addresses.length > 0) {
//         setAddresses(data.addresses);
//         const primaryAddress = data.addresses.find(
//           (addr: Address) => addr.is_primary === 1,
//         );
//         if (primaryAddress) {
//           setSelectedAddress(primaryAddress);
//         } else {
//           setSelectedAddress(data.addresses[0]);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching addresses:", error);
//     }
//   };

//   const addNewAddress = async () => {
//     if (!newAddress.address_text || !newAddress.city || !newAddress.pincode) {
//       Alert.alert("Error", "Please fill address, city and pincode");
//       return;
//     }

//     try {
//       const userUuid = await getUserId();
//       const response = await fetch(`${BASE_URL}/api/user/profile/${userUuid}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           full_name: customerName,
//           user_name: "",
//           email: customerEmail,
//           phone: customerPhone,
//           addresses: [
//             ...addresses.map((addr) => ({
//               label: addr.address_label,
//               address: addr.address_text,
//               city: addr.city,
//               state: addr.state,
//               pincode: addr.pincode,
//               isPrimary: addr.is_primary === 1,
//               address_type: addr.address_label === "Home" ? "home" : "other",
//             })),
//             {
//               label: newAddress.address_label,
//               address: newAddress.address_text,
//               city: newAddress.city,
//               state: newAddress.state,
//               pincode: newAddress.pincode,
//               isPrimary: addresses.length === 0,
//               address_type:
//                 newAddress.address_label === "Home" ? "home" : "other",
//             },
//           ],
//         }),
//       });

//       const data = await response.json();
//       if (data.success) {
//         await fetchAddresses(userUuid);
//         setShowAddAddressForm(false);
//         setNewAddress({
//           address_label: "Home",
//           address_text: "",
//           city: "",
//           state: "",
//           pincode: "",
//         });
//         Alert.alert("Success", "Address added successfully");
//       }
//     } catch (error) {
//       console.error("Error adding address:", error);
//       Alert.alert("Error", "Failed to add address");
//     }
//   };

//   const getValidImageUrl = (imagePath: string | null | undefined): string => {
//     if (
//       !imagePath ||
//       imagePath === "null" ||
//       imagePath === "undefined" ||
//       imagePath === ""
//     ) {
//       return PLACEHOLDER_IMAGE;
//     }

//     if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
//       return imagePath;
//     }

//     if (imagePath.startsWith("/uploads/")) {
//       return `${BASE_URL}${imagePath}`;
//     }

//     if (imagePath.match(/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|gif|webp)$/i)) {
//       return `https://pub-9370fc1d39014a0982f66c754476d059.r2.dev/${imagePath}`;
//     }

//     return PLACEHOLDER_IMAGE;
//   };

//   const handleImageError = (productId: string, failedUrl: string) => {
//     console.log(
//       `🖼️ Image failed to load for product ${productId}: ${failedUrl}`,
//     );
//     setFailedImages((prev) => new Set(prev).add(productId));
//   };

//   const retryImage = useCallback((productId: string) => {
//     setFailedImages((prev) => {
//       const newSet = new Set(prev);
//       newSet.delete(productId);
//       return newSet;
//     });
//   }, []);

//   // =========================
//   // FETCH WISHLIST - FIXED WITH URL ENCODING
//   // =========================
//   const fetchWishlist = useCallback(async () => {
//     try {
//       const cust_id = await getUserId();
//       const deviceInfo = await getDeviceInfo();
//       const { ipAddress, deviceName } = deviceInfo;

//       console.log(`📡 Fetching wishlist for user: ${cust_id}`);
//       console.log(`📡 Device: ${deviceName}, IP: ${ipAddress}`);

//       // Try to load from storage first
//       const storedWishlist = await AsyncStorage.getItem("wishlist");
//       const storedCount = await AsyncStorage.getItem("wishlistCount");

//       if (storedWishlist && storedCount) {
//         try {
//           const parsedWishlist = JSON.parse(storedWishlist);
//           setWishlist(parsedWishlist);
//           setWishlistCount(parseInt(storedCount));
//           console.log(
//             `📦 Loaded wishlist from storage: ${parsedWishlist.length} items`,
//           );
//         } catch (e) {
//           console.error("Error parsing stored wishlist:", e);
//         }
//       }

//       // Build URL with proper encoding
//       const params = new URLSearchParams();
//       params.append("cust_id", cust_id);
//       if (ipAddress && ipAddress !== "0.0.0.0" && ipAddress !== "web_client") {
//         params.append("ip_address", ipAddress);
//       }
//       if (
//         deviceName &&
//         deviceName !== "unknown_device" &&
//         deviceName !== "web_fallback"
//       ) {
//         params.append("device_id", deviceName);
//       }

//       const url = `${WISHLIST_URL}?${params.toString()}`;
//       console.log("📡 Fetching URL:", url);

//       // Fetch from server
//       const response = await fetch(url, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       const data = await response.json();

//       if (data.success && data.items) {
//         const wishlistIds = data.items.map((item: any) =>
//           String(item.product_id || item.id || item.productId),
//         );
//         setWishlist(wishlistIds);
//         setWishlistCount(wishlistIds.length);

//         // Save to storage
//         await AsyncStorage.setItem("wishlist", JSON.stringify(wishlistIds));
//         await AsyncStorage.setItem("wishlistCount", String(wishlistIds.length));

//         eventEmitter.emit(EVENTS.WISHLIST_COUNT_UPDATED, wishlistIds.length);
//         console.log(`✅ Wishlist synced: ${wishlistIds.length} items`);
//       } else {
//         console.warn("⚠️ Wishlist API returned:", data);
//       }
//     } catch (error) {
//       console.error("❌ Error fetching wishlist:", error);
//       // Keep storage data as fallback
//     }
//   }, []);

//   // =========================
//   // TOGGLE WISHLIST - FIXED WITH PROPER DEVICE INFO
//   // =========================
//   const toggleWishlist = useCallback(
//     async (product: Product) => {
//       const productId = product.id;
//       const isInWishlist = wishlist.includes(productId);

//       console.log(`🔄 Toggling wishlist for product ${productId}`);
//       console.log(
//         `Current state: ${isInWishlist ? "In wishlist" : "Not in wishlist"}`,
//       );

//       // Optimistic update
//       const newWishlist = isInWishlist
//         ? wishlist.filter((id) => id !== productId)
//         : [...wishlist, productId];

//       setWishlist(newWishlist);
//       setWishlistCount(newWishlist.length);

//       try {
//         const cust_id = await getUserId();
//         const deviceInfo = await getDeviceInfo();
//         const { ipAddress, deviceName } = deviceInfo;

//         console.log("📱 Device Info for POST:", { ipAddress, deviceName });

//         let response;
//         let data;

//         if (isInWishlist) {
//           // REMOVE from wishlist
//           console.log(`🗑️ Removing product ${productId} from wishlist...`);
//           const requestBody = {
//             cust_id: cust_id,
//             product_id: parseInt(productId),
//           };
//           console.log(`Request body:`, requestBody);

//           response = await fetch(`${WISHLIST_URL}/remove`, {
//             method: "DELETE",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(requestBody),
//           });

//           data = await response.json();
//           console.log("📤 Remove response:", data);

//           if (!data.success) {
//             // Try alternative endpoint
//             console.log("Trying alternative remove endpoint...");
//             response = await fetch(`${WISHLIST_URL}`, {
//               method: "DELETE",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 cust_id: cust_id,
//                 product_id: parseInt(productId),
//               }),
//             });
//             data = await response.json();
//             console.log("Alternative remove response:", data);
//           }
//         } else {
//           // ADD to wishlist - INCLUDING device_id and ip_address
//           console.log(`➕ Adding product ${productId} to wishlist...`);
//           const requestBody = {
//             cust_id: cust_id,
//             ip_address: ipAddress || "web_client",
//             device_id: deviceName || "web_device",
//             product_id: parseInt(productId),
//             product_name: product.product_name,
//             product_category: product.product_category,
//             size: product.size || "XXL",
//             price: parseFloat(product.price) || 0,
//             product_image: product.image || "",
//           };
//           console.log("📤 Request body:", JSON.stringify(requestBody, null, 2));

//           response = await fetch(`${WISHLIST_URL}/add`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(requestBody),
//           });

//           data = await response.json();
//           console.log("📤 Add response:", data);
//         }

//         if (data.success) {
//           // Save to storage
//           await AsyncStorage.setItem("wishlist", JSON.stringify(newWishlist));
//           await AsyncStorage.setItem(
//             "wishlistCount",
//             String(newWishlist.length),
//           );

//           // Emit events
//           eventEmitter.emit(EVENTS.WISHLIST_UPDATED);
//           eventEmitter.emit(EVENTS.WISHLIST_COUNT_UPDATED, newWishlist.length);

//           console.log(
//             `✅ Wishlist updated successfully (${newWishlist.length} items)`,
//           );
//         } else {
//           // Rollback on API failure
//           console.error("❌ API returned error:", data);
//           setWishlist(
//             isInWishlist
//               ? [...wishlist, productId]
//               : wishlist.filter((id) => id !== productId),
//           );
//           setWishlistCount(
//             isInWishlist ? wishlist.length + 1 : wishlist.length - 1,
//           );
//           Alert.alert(
//             "Error",
//             data.message || data.error || "Failed to update wishlist",
//           );
//         }
//       } catch (error) {
//         console.error("❌ Error toggling wishlist:", error);
//         // Rollback on error
//         setWishlist(
//           isInWishlist
//             ? [...wishlist, productId]
//             : wishlist.filter((id) => id !== productId),
//         );
//         setWishlistCount(
//           isInWishlist ? wishlist.length + 1 : wishlist.length - 1,
//         );
//         Alert.alert("Error", "Network error. Please check your connection.");
//       }
//     },
//     [wishlist],
//   );

//   const fetchProducts = useCallback(async () => {
//     setLoading(true);
//     try {
//       console.log("📡 Fetching products for Explore...");

//       const response = await fetch(`${API_URL}?t=${Date.now()}`, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log("✅ Received products count:", data.length);

//       const formattedProducts: Product[] = data.map((product: any) => {
//         let imageUrl = PLACEHOLDER_IMAGE;
//         const productImage = product.product_image || product.image;

//         if (
//           productImage &&
//           productImage !== "null" &&
//           productImage !== "undefined"
//         ) {
//           if (productImage.startsWith("http")) {
//             imageUrl = productImage;
//           } else if (productImage.startsWith("/uploads/")) {
//             imageUrl = `${BASE_URL}${productImage}`;
//           } else if (productImage.includes("r2.dev")) {
//             imageUrl = productImage;
//           } else if (
//             productImage.match(/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|gif|webp)$/i)
//           ) {
//             imageUrl = `https://pub-9370fc1d39014a0982f66c754476d059.r2.dev/${productImage}`;
//           }
//         }

//         return {
//           id: String(product.id),
//           product_name: product.product_name || "Unnamed Product",
//           product_category: product.product_category || "Uncategorized",
//           size: product.size || "XXL",
//           price: String(product.price || 0),
//           quantity: Number(product.quantity || 0),
//           description: product.description || "",
//           image: imageUrl,
//           rating: (3.5 + Math.random() * 1.5).toFixed(1),
//           reviews: Math.floor(Math.random() * 500) + 50,
//           sold: Math.floor(Math.random() * 100) + 1,
//         };
//       });

//       setProducts(formattedProducts);
//       setFailedImages(new Set());
//       console.log(`✅ Set ${formattedProducts.length} products`);
//     } catch (error) {
//       console.error("❌ Fetch Error:", error);
//       Alert.alert("Error", "Failed to load products");
//       setProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const fetchCart = useCallback(async () => {
//     try {
//       const cust_id = await getUserId();
//       const response = await fetch(`${CART_URL}?cust_id=${cust_id}`);
//       const data = await response.json();
//       if (data.success) {
//         const totalItems = data.items.reduce(
//           (sum: number, item: any) => sum + item.quantity,
//           0,
//         );
//         setCartCount(totalItems);
//       }
//     } catch (error) {
//       console.error("Error fetching cart:", error);
//     }
//   }, []);

//   const addToCart = useCallback(async (product: Product) => {
//     try {
//       const cust_id = await getUserId();
//       const { deviceName, ipAddress } = await getDeviceInfo();

//       const response = await fetch(`${CART_URL}/add`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           cust_id: cust_id,
//           ip_address: ipAddress || "web_client",
//           device_id: deviceName || "web_device",
//           productId: parseInt(product.id),
//           productName: product.product_name,
//           productCategory: product.product_category,
//           size: product.size,
//           price: parseFloat(product.price),
//           productImage: product.image,
//         }),
//       });

//       const data = await response.json();
//       if (data.success) {
//         setCartCount((prev) => prev + 1);
//         eventEmitter.emit(EVENTS.CART_UPDATED);
//         eventEmitter.emit(EVENTS.CART_COUNT_UPDATED);
//         Alert.alert(
//           "Success",
//           `${product.product_name} (Size: ${product.size}) added to cart!`,
//         );
//       }
//     } catch (error) {
//       console.error("Error adding to cart:", error);
//       Alert.alert("Error", "Failed to add to cart");
//     }
//   }, []);

//   const getMySQLDate = () => {
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = String(now.getMonth() + 1).padStart(2, "0");
//     const day = String(now.getDate()).padStart(2, "0");
//     const hours = String(now.getHours()).padStart(2, "0");
//     const minutes = String(now.getMinutes()).padStart(2, "0");
//     const seconds = String(now.getSeconds()).padStart(2, "0");
//     return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//   };

//   const openBuyNowModal = async (product: Product) => {
//     setSelectedProduct(product);

//     const userId = await getUserId();
//     if (userId) {
//       await fetchAddresses(userId);

//       const response = await fetch(`${BASE_URL}/api/user/profile/${userId}`);
//       const data = await response.json();
//       if (data.success && data.user) {
//         if (data.user.full_name) setCustomerName(data.user.full_name);
//         if (data.user.phone) setCustomerPhone(data.user.phone);
//         if (data.user.email) setCustomerEmail(data.user.email);
//       }
//     }

//     setBuyNowModalVisible(true);
//   };

//   const handleBuyNowOrder = async () => {
//     if (!selectedAddress) {
//       Alert.alert("Error", "Please select a delivery address");
//       return;
//     }

//     if (!customerName.trim()) {
//       Alert.alert("Error", "Please enter your name");
//       return;
//     }

//     if (!customerPhone.trim() || customerPhone.length < 10) {
//       Alert.alert("Error", "Please enter a valid phone number (10 digits)");
//       return;
//     }

//     if (selectedPaymentMethod === "card") {
//       if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
//         Alert.alert("Error", "Please fill all card details");
//         return;
//       }
//       if (cardNumber.replace(/\s/g, "").length < 16) {
//         Alert.alert("Error", "Please enter valid card number");
//         return;
//       }
//     }

//     setProcessing(true);

//     const orderData = {
//       cust_id: await getUserId(),
//       customer_name: customerName.trim(),
//       customer_phone: customerPhone.trim(),
//       address: selectedAddress.address_text,
//       city: selectedAddress.city,
//       state: selectedAddress.state,
//       pincode: selectedAddress.pincode,
//       total_amount: parseFloat(selectedProduct!.price),
//       delivery_fee: 0,
//       tax_amount: 0,
//       grand_total: parseFloat(selectedProduct!.price),
//       item_count: 1,
//       payment_method: selectedPaymentMethod,
//       order_date: getMySQLDate(),
//       cart_items: [
//         {
//           product_id: parseInt(selectedProduct!.id),
//           product_name: selectedProduct!.product_name,
//           product_category: selectedProduct!.product_category,
//           price: parseFloat(selectedProduct!.price),
//           quantity: 1,
//         },
//       ],
//     };

//     try {
//       const response = await fetch(`${BASE_URL}/api/orders/create`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(orderData),
//       });

//       const data = await response.json();

//       if (data.success) {
//         setBuyNowModalVisible(false);

//         setSelectedProduct(null);
//         setCardNumber("");
//         setCardExpiry("");
//         setCardCvv("");
//         setCardName("");

//         Alert.alert(
//           "✅ Order Placed Successfully! 🎉🎉🎉",
//           `Order #${data.order.order_number}\nTotal: ₹${parseFloat(selectedProduct!.price).toFixed(2)}\nPayment: ${getPaymentMethodName(selectedPaymentMethod)}\n\nDelivery to: ${selectedAddress.address_text}`,
//           [
//             {
//               text: "Track Order",
//               onPress: () => router.push("/track-orders"),
//             },
//           ],
//         );
//       } else {
//         Alert.alert("Error", data.error || "Failed to place order");
//       }
//     } catch (error) {
//       console.error("Error placing order:", error);
//       Alert.alert("Error", "Failed to place order. Please try again.");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const getPaymentMethodName = (methodId: string) => {
//     const methods: Record<string, string> = {
//       cash: "Cash on Delivery",
//       upi: "UPI",
//       card: "Credit/Debit Card",
//     };
//     return methods[methodId] || methodId;
//   };

//   const paymentMethods = [
//     { id: "cash", name: "Cash on Delivery", icon: "💰", color: "#4caf50" },
//     { id: "upi", name: "UPI", icon: "📱", color: "#2196f3" },
//     { id: "card", name: "Credit/Debit Card", icon: "💳", color: "#ff9800" },
//   ];

//   const getSizeColor = (size: string) => {
//     const colors: { [key: string]: string } = {
//       S: "#4CAF50",
//       M: "#2196F3",
//       L: "#FF9800",
//       XL: "#9C27B0",
//       XXL: "#F44336",
//       XXXL: "#795548",
//     };
//     return colors[size] || "#666";
//   };

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await Promise.all([fetchProducts(), fetchCart(), fetchWishlist()]);
//     setRefreshing(false);
//   }, [fetchProducts, fetchCart, fetchWishlist]);

//   // =========================
//   // INITIAL LOAD - FIXED
//   // =========================
//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);

//       // Load wishlist from storage first
//       try {
//         const storedWishlist = await AsyncStorage.getItem("wishlist");
//         const storedCount = await AsyncStorage.getItem("wishlistCount");

//         if (storedWishlist && storedCount) {
//           const parsedWishlist = JSON.parse(storedWishlist);
//           setWishlist(parsedWishlist);
//           setWishlistCount(parseInt(storedCount));
//           console.log(
//             `📦 Initial wishlist from storage: ${parsedWishlist.length} items`,
//           );
//         }
//       } catch (error) {
//         console.error("Error loading wishlist from storage:", error);
//       }

//       await Promise.all([fetchProducts(), fetchCart(), fetchWishlist()]);
//       setLoading(false);
//     };
//     loadData();
//   }, [version, fetchProducts, fetchCart, fetchWishlist]);

//   useEffect(() => {
//     const handleProductAdded = () => {
//       console.log("🔄 Event received: Product added - refreshing products");
//       onRefresh();
//     };

//     eventEmitter.on(EVENTS.PRODUCT_ADDED, handleProductAdded);

//     return () => {
//       eventEmitter.off(EVENTS.PRODUCT_ADDED, handleProductAdded);
//     };
//   }, [onRefresh]);

//   useEffect(() => {
//     const handleWishlistUpdate = () => {
//       fetchWishlist();
//     };

//     eventEmitter.on(EVENTS.WISHLIST_UPDATED, handleWishlistUpdate);

//     return () => {
//       eventEmitter.off(EVENTS.WISHLIST_UPDATED, handleWishlistUpdate);
//     };
//   }, [fetchWishlist]);

//   const handleProductAdded = useCallback(async () => {
//     setRefreshing(true);
//     await fetchProducts();
//     setVersion((prev) => prev + 1);
//     setRefreshing(false);
//   }, [fetchProducts]);

//   const handleCategoryPress = useCallback(
//     (category: string) => {
//       if (selectedCategory === category) return;
//       setSelectedCategory(category);
//     },
//     [selectedCategory],
//   );

//   const renderStars = useCallback((rating: number) => {
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;
//     let stars = "";
//     for (let i = 0; i < fullStars; i++) stars += "⭐";
//     if (hasHalfStar) stars += "⭐";
//     return <Text style={{ fontSize: 12, color: "#FFB800" }}>{stars}</Text>;
//   }, []);

//   // Updated render for sidebar categories
//   const renderSidebarCategory = (category: string) => {
//     const isActive = selectedCategory === category;

//     return (
//       <Pressable
//         key={category}
//         style={({ pressed }) => [
//           styles.sidebarIconButton,
//           isActive && styles.sidebarIconButtonActive,
//           pressed && { opacity: 0.7 },
//         ]}
//         onPress={() => handleCategoryPress(category)}
//       >
//         <View
//           style={[
//             styles.sidebarIconCircle,
//             isActive && styles.sidebarIconCircleActive,
//           ]}
//         >
//           <Image
//             source={categoryImages[category as keyof typeof categoryImages]}
//             style={[
//               styles.sidebarIconImage,
//               { tintColor: isActive ? "#fff" : isDark ? "#ccc" : undefined },
//             ]}
//             resizeMode="contain"
//           />
//         </View>
//         <Text
//           style={[
//             styles.sidebarIconLabel,
//             isActive && styles.sidebarIconLabelActive,
//             isDark && styles.darkIconLabel,
//           ]}
//         >
//           {category === "Jeans Pant"
//             ? "Jeans"
//             : category === "Party Wears"
//               ? "Party"
//               : category === "Colorful Picks"
//                 ? "Colorful"
//                 : category}
//         </Text>
//       </Pressable>
//     );
//   };

//   const renderProductCard = useCallback(
//     ({ item }: { item: Product }) => {
//       const isInWishlist = wishlist.includes(item.id);
//       let finalImageUrl = item.image;
//       const hasImageError = failedImages.has(item.id);

//       if (hasImageError) {
//         finalImageUrl = PLACEHOLDER_IMAGE;
//       }

//       return (
//         <View style={[styles.card, isDark && styles.darkCard]}>
//           <Pressable
//             style={styles.wishlistIcon}
//             onPress={() => toggleWishlist(item)}
//           >
//             <Text style={{ fontSize: 20 }}>{isInWishlist ? "❤️" : "🤍"}</Text>
//           </Pressable>

//           <Image
//             source={{ uri: finalImageUrl }}
//             style={styles.productImage}
//             resizeMode="cover"
//             onError={() => handleImageError(item.id, finalImageUrl)}
//           />

//           {hasImageError && (
//             <TouchableOpacity
//               style={styles.retryButton}
//               onPress={() => retryImage(item.id)}
//             >
//               <Text style={styles.retryText}>Tap to retry</Text>
//             </TouchableOpacity>
//           )}

//           <ThemedText
//             style={[styles.productName, isDark && styles.darkText]}
//             numberOfLines={2}
//           >
//             {item.product_name}
//           </ThemedText>

//           <View style={styles.categorySizeRow}>
//             <View style={styles.categoryBadge}>
//               <ThemedText style={styles.categoryText}>
//                 {item.product_category}
//               </ThemedText>
//             </View>

//             <View
//               style={[
//                 styles.sizeBadge,
//                 { backgroundColor: getSizeColor(item.size) },
//               ]}
//             >
//               <Text style={styles.sizeText}>{item.size}</Text>
//             </View>
//           </View>

//           <View style={styles.ratingContainer}>
//             <View style={styles.starsContainer}>
//               {renderStars(Number(item.rating))}
//             </View>
//             <ThemedText
//               style={[styles.ratingText, isDark && styles.darkSubtitle]}
//             >
//               {item.rating} ({item.reviews})
//             </ThemedText>
//           </View>

//           <ThemedText style={styles.price}>
//             ₹{parseFloat(item.price).toFixed(2)}
//           </ThemedText>

//           <View style={styles.actionButtons}>
//             <Pressable
//               style={[styles.actionBtn, styles.addToCartBtn]}
//               onPress={() => addToCart(item)}
//             >
//               <Text style={{ fontSize: 16, color: "#fff" }}>🛒</Text>
//               <ThemedText style={styles.btnText}>+Cart</ThemedText>
//             </Pressable>

//             <Pressable
//               style={[styles.actionBtn, styles.buyNowBtn]}
//               onPress={() => openBuyNowModal(item)}
//             >
//               <Text style={{ fontSize: 14, color: "#fff" }}>⚡</Text>
//               <ThemedText style={styles.btnText}>Buy</ThemedText>
//             </Pressable>
//           </View>
//         </View>
//       );
//     },
//     [
//       wishlist,
//       version,
//       addToCart,
//       toggleWishlist,
//       isDark,
//       renderStars,
//       failedImages,
//       retryImage,
//     ],
//   );

//   if (loading) {
//     return (
//       <SafeAreaView
//         style={[styles.mainContainer, isDark && styles.darkMainContainer]}
//         edges={[]}
//       >
//         <View
//           style={[
//             styles.loadingContainer,
//             isDark && styles.darkLoadingContainer,
//           ]}
//         >
//           <ActivityIndicator size="large" color="#e53935" />
//           <ThemedText style={[styles.loadingText, isDark && styles.darkText]}>
//             Loading products...
//           </ThemedText>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView
//       style={[styles.mainContainer, isDark && styles.darkMainContainer]}
//       edges={[]}
//     >
//       <View style={styles.mainLayout}>
//         {/* Left Sidebar - Categories */}
//         <ScrollView
//           style={[styles.categoriesSidebar, isDark && styles.darkSidebar]}
//           showsVerticalScrollIndicator={false}
//         >
//           <View style={styles.sidebarContent}>
//             <Text style={[styles.sidebarTitle, isDark && styles.darkText]}>
//               Categories
//             </Text>
//             {allCategories.map((category) => renderSidebarCategory(category))}
//           </View>
//         </ScrollView>

//         {/* Right - Products */}
//         <FlatList
//           ref={flatListRef}
//           data={filteredProducts}
//           keyExtractor={(item) => `${item.id}-${version}`}
//           numColumns={2}
//           renderItem={renderProductCard}
//           contentContainerStyle={styles.container}
//           columnWrapperStyle={styles.columnWrapper}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="always"
//           removeClippedSubviews={false}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//           ListHeaderComponent={
//             <View
//               style={[
//                 styles.countContainer,
//                 isDark && styles.darkCountContainer,
//               ]}
//             >
//               <Text style={[styles.countText, isDark && styles.darkSubtitle]}>
//                 {filteredProducts.length} products found
//               </Text>
//               <View style={styles.activeCategoryBadge}>
//                 <Text style={styles.activeCategoryText}>
//                   {selectedCategory}
//                 </Text>
//               </View>
//             </View>
//           }
//           ListEmptyComponent={() => (
//             <View style={{ padding: 50, alignItems: "center" }}>
//               <Text style={{ color: isDark ? "#fff" : "#333" }}>
//                 No products found. Pull to refresh.
//               </Text>
//             </View>
//           )}
//         />
//       </View>

//       <Pressable style={styles.fabButton} onPress={() => setModalVisible(true)}>
//         <Text style={{ fontSize: 24, color: "#fff" }}>➕</Text>
//         <Text style={styles.fabText}>Sell</Text>
//       </Pressable>

//       <SellProductModal
//         visible={modalVisible}
//         onClose={() => setModalVisible(false)}
//         onProductAdded={handleProductAdded}
//       />

//       {/* Buy Now Checkout Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={buyNowModalVisible}
//         onRequestClose={() => setBuyNowModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View
//             style={[styles.modalContainer, isDark && styles.darkModalContainer]}
//           >
//             <View
//               style={[styles.modalHeader, isDark && styles.darkModalHeader]}
//             >
//               <Text style={[styles.modalTitle, isDark && styles.darkText]}>
//                 Buy Now - Checkout
//               </Text>
//               <TouchableOpacity
//                 onPress={() => setBuyNowModalVisible(false)}
//                 style={styles.modalCloseButton}
//               >
//                 <Text style={{ fontSize: 24, color: isDark ? "#fff" : "#333" }}>
//                   ❌
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               style={styles.modalContent}
//               showsVerticalScrollIndicator={false}
//             >
//               {/* Product Details */}
//               {selectedProduct && (
//                 <View style={[styles.summaryCard, isDark && styles.darkCard]}>
//                   <Text
//                     style={[styles.sectionTitle, isDark && styles.darkText]}
//                   >
//                     Product Details
//                   </Text>
//                   <View style={styles.buyNowProductRow}>
//                     <Image
//                       source={{ uri: getValidImageUrl(selectedProduct.image) }}
//                       style={styles.buyNowProductImage}
//                       resizeMode="cover"
//                     />
//                     <View style={styles.buyNowProductInfo}>
//                       <Text
//                         style={[
//                           styles.buyNowProductName,
//                           isDark && styles.darkText,
//                         ]}
//                       >
//                         {selectedProduct.product_name}
//                       </Text>
//                       <Text
//                         style={[
//                           styles.buyNowProductCategory,
//                           isDark && styles.darkSubtitle,
//                         ]}
//                       >
//                         {selectedProduct.product_category} | Size:{" "}
//                         {selectedProduct.size}
//                       </Text>
//                       <Text style={styles.buyNowProductPrice}>
//                         ₹{parseFloat(selectedProduct.price).toFixed(2)}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//               )}

//               {/* Customer Details Section */}
//               <View style={[styles.sectionCard, isDark && styles.darkCard]}>
//                 <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
//                   Customer Details
//                 </Text>
//                 <TextInput
//                   style={[styles.input, isDark && styles.darkInput]}
//                   placeholder="Full Name *"
//                   placeholderTextColor={isDark ? "#999" : "#666"}
//                   value={customerName}
//                   onChangeText={setCustomerName}
//                 />
//                 <TextInput
//                   style={[styles.input, isDark && styles.darkInput]}
//                   placeholder="Phone Number *"
//                   placeholderTextColor={isDark ? "#999" : "#666"}
//                   keyboardType="phone-pad"
//                   value={customerPhone}
//                   onChangeText={setCustomerPhone}
//                   maxLength={10}
//                 />
//                 <TextInput
//                   style={[styles.input, isDark && styles.darkInput]}
//                   placeholder="Email (Optional)"
//                   placeholderTextColor={isDark ? "#999" : "#666"}
//                   keyboardType="email-address"
//                   value={customerEmail}
//                   onChangeText={setCustomerEmail}
//                 />
//               </View>

//               {/* Order Summary */}
//               <View style={[styles.summaryCard, isDark && styles.darkCard]}>
//                 <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
//                   Order Summary
//                 </Text>
//                 <View style={styles.summaryRow}>
//                   <Text
//                     style={[styles.summaryLabel, isDark && styles.darkSubtitle]}
//                   >
//                     Item Total
//                   </Text>
//                   <Text
//                     style={[styles.summaryValue, isDark && styles.darkText]}
//                   >
//                     ₹
//                     {selectedProduct
//                       ? parseFloat(selectedProduct.price).toFixed(2)
//                       : "0.00"}
//                   </Text>
//                 </View>
//                 <View style={styles.summaryRow}>
//                   <Text
//                     style={[styles.summaryLabel, isDark && styles.darkSubtitle]}
//                   >
//                     Delivery Fee
//                   </Text>
//                   <Text
//                     style={[styles.summaryValue, isDark && styles.darkText]}
//                   >
//                     ₹0.00
//                   </Text>
//                 </View>
//                 <View style={styles.summaryRow}>
//                   <Text
//                     style={[styles.summaryLabel, isDark && styles.darkSubtitle]}
//                   >
//                     Tax (GST)
//                   </Text>
//                   <Text
//                     style={[styles.summaryValue, isDark && styles.darkText]}
//                   >
//                     ₹0.00
//                   </Text>
//                 </View>
//                 <View style={styles.divider} />
//                 <View style={styles.summaryRow}>
//                   <Text
//                     style={[styles.totalLabelLarge, isDark && styles.darkText]}
//                   >
//                     Total to Pay
//                   </Text>
//                   <Text
//                     style={[styles.totalAmountLarge, isDark && styles.darkText]}
//                   >
//                     ₹
//                     {selectedProduct
//                       ? parseFloat(selectedProduct.price).toFixed(2)
//                       : "0.00"}
//                   </Text>
//                 </View>
//               </View>

//               {/* Delivery Address */}
//               <View style={[styles.sectionCard, isDark && styles.darkCard]}>
//                 <View style={styles.sectionHeaderRow}>
//                   <Text
//                     style={[styles.sectionTitle, isDark && styles.darkText]}
//                   >
//                     Delivery Address
//                   </Text>
//                   <TouchableOpacity
//                     onPress={() => setShowAddAddressForm(!showAddAddressForm)}
//                     style={styles.addButton}
//                   >
//                     <Text style={{ fontSize: 20, color: "#e53935" }}>➕</Text>
//                     <Text style={styles.addButtonText}>Add</Text>
//                   </TouchableOpacity>
//                 </View>

//                 {showAddAddressForm && (
//                   <View
//                     style={[
//                       styles.addAddressForm,
//                       isDark && styles.darkAddAddressForm,
//                     ]}
//                   >
//                     <TextInput
//                       style={[styles.input, isDark && styles.darkInput]}
//                       placeholder="Label (Home, Office)"
//                       placeholderTextColor={isDark ? "#999" : "#666"}
//                       value={newAddress.address_label}
//                       onChangeText={(text) =>
//                         setNewAddress({ ...newAddress, address_label: text })
//                       }
//                     />
//                     <TextInput
//                       style={[
//                         styles.input,
//                         styles.textArea,
//                         isDark && styles.darkInput,
//                       ]}
//                       placeholder="Address *"
//                       placeholderTextColor={isDark ? "#999" : "#666"}
//                       value={newAddress.address_text}
//                       onChangeText={(text) =>
//                         setNewAddress({ ...newAddress, address_text: text })
//                       }
//                       multiline
//                     />
//                     <TextInput
//                       style={[styles.input, isDark && styles.darkInput]}
//                       placeholder="City *"
//                       placeholderTextColor={isDark ? "#999" : "#666"}
//                       value={newAddress.city}
//                       onChangeText={(text) =>
//                         setNewAddress({ ...newAddress, city: text })
//                       }
//                     />
//                     <TextInput
//                       style={[styles.input, isDark && styles.darkInput]}
//                       placeholder="State"
//                       placeholderTextColor={isDark ? "#999" : "#666"}
//                       value={newAddress.state}
//                       onChangeText={(text) =>
//                         setNewAddress({ ...newAddress, state: text })
//                       }
//                     />
//                     <TextInput
//                       style={[styles.input, isDark && styles.darkInput]}
//                       placeholder="Pincode *"
//                       placeholderTextColor={isDark ? "#999" : "#666"}
//                       keyboardType="numeric"
//                       value={newAddress.pincode}
//                       onChangeText={(text) =>
//                         setNewAddress({ ...newAddress, pincode: text })
//                       }
//                     />
//                     <View style={styles.formButtons}>
//                       <TouchableOpacity
//                         style={styles.cancelFormButton}
//                         onPress={() => setShowAddAddressForm(false)}
//                       >
//                         <Text style={styles.cancelFormText}>Cancel</Text>
//                       </TouchableOpacity>
//                       <TouchableOpacity
//                         style={styles.saveFormButton}
//                         onPress={addNewAddress}
//                       >
//                         <Text style={styles.saveFormText}>Save Address</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 )}

//                 {addresses.length === 0 && !showAddAddressForm ? (
//                   <View style={styles.noAddressContainer}>
//                     <Text
//                       style={[
//                         styles.noAddressText,
//                         isDark && styles.darkSubtitle,
//                       ]}
//                     >
//                       No saved addresses found
//                     </Text>
//                     <TouchableOpacity
//                       onPress={() => setShowAddAddressForm(true)}
//                     >
//                       <Text style={styles.addAddressLinkText}>
//                         + Add Address
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 ) : (
//                   addresses.map((address) => (
//                     <TouchableOpacity
//                       key={address.id}
//                       style={[
//                         styles.addressOption,
//                         selectedAddress?.id === address.id &&
//                           styles.addressOptionSelected,
//                       ]}
//                       onPress={() => setSelectedAddress(address)}
//                     >
//                       <View style={styles.addressRadio}>
//                         {selectedAddress?.id === address.id && (
//                           <View style={styles.radioSelected} />
//                         )}
//                       </View>
//                       <View style={styles.addressDetails}>
//                         <Text
//                           style={[
//                             styles.addressLabel,
//                             isDark && styles.darkText,
//                           ]}
//                         >
//                           {address.address_label}
//                         </Text>
//                         <Text
//                           style={[
//                             styles.addressText,
//                             isDark && styles.darkSubtitle,
//                           ]}
//                         >
//                           {address.address_text}
//                         </Text>
//                         <Text
//                           style={[
//                             styles.addressText,
//                             isDark && styles.darkSubtitle,
//                           ]}
//                         >
//                           {address.city}, {address.state} - {address.pincode}
//                         </Text>
//                       </View>
//                     </TouchableOpacity>
//                   ))
//                 )}
//               </View>

//               {/* Payment Method */}
//               <View style={[styles.sectionCard, isDark && styles.darkCard]}>
//                 <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
//                   Payment Method
//                 </Text>
//                 {paymentMethods.map((method) => (
//                   <TouchableOpacity
//                     key={method.id}
//                     style={[
//                       styles.paymentOption,
//                       selectedPaymentMethod === method.id &&
//                         styles.paymentOptionSelected,
//                     ]}
//                     onPress={() => setSelectedPaymentMethod(method.id)}
//                   >
//                     <Text style={{ fontSize: 24 }}>{method.icon}</Text>
//                     <Text
//                       style={[
//                         styles.paymentOptionText,
//                         isDark && styles.darkText,
//                       ]}
//                     >
//                       {method.name}
//                     </Text>
//                     <View style={styles.radioCircle}>
//                       {selectedPaymentMethod === method.id && (
//                         <View style={styles.radioSelectedDot} />
//                       )}
//                     </View>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               {/* Card Details */}
//               {selectedPaymentMethod === "card" && (
//                 <View style={[styles.sectionCard, isDark && styles.darkCard]}>
//                   <Text
//                     style={[styles.sectionTitle, isDark && styles.darkText]}
//                   >
//                     Card Details
//                   </Text>
//                   <TextInput
//                     style={[styles.input, isDark && styles.darkInput]}
//                     placeholder="Card Number (16 digits)"
//                     placeholderTextColor={isDark ? "#999" : "#666"}
//                     keyboardType="numeric"
//                     value={cardNumber}
//                     onChangeText={setCardNumber}
//                     maxLength={16}
//                   />
//                   <TextInput
//                     style={[styles.input, isDark && styles.darkInput]}
//                     placeholder="Cardholder Name"
//                     placeholderTextColor={isDark ? "#999" : "#666"}
//                     value={cardName}
//                     onChangeText={setCardName}
//                   />
//                   <View style={styles.rowInputs}>
//                     <TextInput
//                       style={[
//                         styles.input,
//                         styles.halfInput,
//                         isDark && styles.darkInput,
//                       ]}
//                       placeholder="MM/YY"
//                       placeholderTextColor={isDark ? "#999" : "#666"}
//                       value={cardExpiry}
//                       onChangeText={setCardExpiry}
//                       maxLength={5}
//                     />
//                     <TextInput
//                       style={[
//                         styles.input,
//                         styles.halfInput,
//                         isDark && styles.darkInput,
//                       ]}
//                       placeholder="CVV"
//                       placeholderTextColor={isDark ? "#999" : "#666"}
//                       keyboardType="numeric"
//                       secureTextEntry
//                       value={cardCvv}
//                       onChangeText={setCardCvv}
//                       maxLength={4}
//                     />
//                   </View>
//                 </View>
//               )}

//               {/* Place Order Button */}
//               <TouchableOpacity
//                 style={[
//                   styles.placeOrderButton,
//                   processing && styles.disabledButton,
//                 ]}
//                 onPress={handleBuyNowOrder}
//                 disabled={processing}
//               >
//                 <Text style={styles.placeOrderText}>
//                   {processing
//                     ? "Processing..."
//                     : `Place Order • ₹${selectedProduct ? parseFloat(selectedProduct.price).toFixed(2) : "0.00"}`}
//                 </Text>
//               </TouchableOpacity>

//               <View style={styles.bottomModalPadding} />
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   mainContainer: {
//     flex: 1,
//     backgroundColor: "#f4f6f8",
//   },
//   darkMainContainer: {
//     backgroundColor: "#1a1a1a",
//   },
//   mainLayout: {
//     flex: 1,
//     flexDirection: "row",
//     marginTop: 56,
//   },
//   categoriesSidebar: {
//     width: 85,
//     backgroundColor: "#fff",
//     paddingVertical: 10,
//     borderRightWidth: 1,
//     borderRightColor: "#eee",
//   },
//   darkSidebar: {
//     backgroundColor: "#2a2a2a",
//     borderRightColor: "#444",
//   },
//   sidebarContent: {
//     alignItems: "center",
//     paddingHorizontal: 5,
//   },
//   sidebarTitle: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: "#333",
//     marginBottom: 15,
//     textAlign: "center",
//   },
//   sidebarIconButton: {
//     alignItems: "center",
//     justifyContent: "center",
//     width: 70,
//     paddingVertical: 8,
//     marginBottom: 5,
//     borderRadius: 10,
//     flexShrink: 0,
//     flexGrow: 0,
//   },
//   sidebarIconButtonActive: {
//     backgroundColor: "#ffebee",
//   },
//   sidebarIconCircle: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: "#f5f5f5",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 3,
//   },
//   sidebarIconCircleActive: {
//     backgroundColor: "#e53935",
//   },
//   sidebarIconImage: {
//     width: 26,
//     height: 26,
//   },
//   sidebarIconLabel: {
//     fontSize: 9,
//     color: "#666",
//     fontWeight: "500",
//     textAlign: "center",
//     lineHeight: 12,
//   },
//   sidebarIconLabelActive: {
//     color: "#e53935",
//     fontWeight: "700",
//   },
//   darkIconLabel: {
//     color: "#999",
//   },
//   countContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     backgroundColor: "#fff",
//   },
//   darkCountContainer: {
//     backgroundColor: "#2a2a2a",
//   },
//   countText: {
//     fontSize: 14,
//     color: "#666",
//     fontWeight: "500",
//   },
//   activeCategoryBadge: {
//     backgroundColor: "#ffebee",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   activeCategoryText: {
//     fontSize: 12,
//     color: "#e53935",
//     fontWeight: "600",
//   },
//   container: {
//     paddingHorizontal: 10,
//     paddingBottom: 120,
//     paddingTop: 0,
//   },
//   columnWrapper: {
//     justifyContent: "space-between",
//   },
//   card: {
//     width: "45%",
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     padding: 12,
//     marginBottom: 12,
//     position: "relative",
//   },
//   darkCard: {
//     backgroundColor: "#2a2a2a",
//   },
//   wishlistIcon: {
//     position: "absolute",
//     top: 8,
//     right: 8,
//     zIndex: 10,
//     backgroundColor: "rgba(255,255,255,0.9)",
//     borderRadius: 20,
//     padding: 6,
//   },
//   productImage: {
//     width: "100%",
//     height: 140,
//     borderRadius: 10,
//     marginBottom: 10,
//     backgroundColor: "#f0f0f0",
//   },
//   productName: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#111",
//     marginBottom: 4,
//   },
//   darkText: {
//     color: "#fff",
//   },
//   darkSubtitle: {
//     color: "#999",
//   },
//   retryButton: {
//     position: "absolute",
//     top: 60,
//     left: 0,
//     right: 0,
//     backgroundColor: "rgba(0,0,0,0.7)",
//     padding: 4,
//     borderRadius: 4,
//     alignItems: "center",
//   },
//   retryText: {
//     color: "#fff",
//     fontSize: 10,
//   },
//   categorySizeRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 6,
//     gap: 6,
//   },
//   categoryBadge: {
//     backgroundColor: "#e3f2fd",
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 12,
//     flex: 1,
//   },
//   categoryText: {
//     fontSize: 10,
//     color: "#1976d2",
//     fontWeight: "600",
//   },
//   sizeBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 12,
//     minWidth: 45,
//     alignItems: "center",
//   },
//   sizeText: {
//     fontSize: 10,
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   ratingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 6,
//   },
//   starsContainer: {
//     flexDirection: "row",
//     marginRight: 5,
//   },
//   ratingText: {
//     fontSize: 10,
//     color: "#666",
//   },
//   price: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#e53935",
//     marginBottom: 10,
//   },
//   actionButtons: {
//     flexDirection: "row",
//     gap: 8,
//     marginTop: 4,
//   },
//   actionBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 8,
//     borderRadius: 8,
//     position: "relative",
//   },
//   addToCartBtn: {
//     backgroundColor: "#ff9800",
//   },
//   buyNowBtn: {
//     backgroundColor: "#e53935",
//   },
//   btnText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "600",
//     marginLeft: 4,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   darkLoadingContainer: {
//     backgroundColor: "#1a1a1a",
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: "#666",
//   },
//   fabButton: {
//     position: "absolute",
//     bottom: 20,
//     right: 20,
//     backgroundColor: "#e53935",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 30,
//   },
//   fabText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//     marginLeft: 6,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   modalContainer: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "90%",
//   },
//   darkModalContainer: {
//     backgroundColor: "#1a1a1a",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f0f0f0",
//   },
//   darkModalHeader: {
//     borderBottomColor: "#3a3a3a",
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   modalCloseButton: {
//     padding: 4,
//   },
//   modalContent: {
//     padding: 16,
//   },
//   summaryCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//   },
//   sectionCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 12,
//   },
//   sectionHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   addButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//   },
//   addButtonText: {
//     color: "#e53935",
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   summaryRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: "#666",
//   },
//   summaryValue: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#333",
//   },
//   divider: {
//     height: 1,
//     backgroundColor: "#f0f0f0",
//     marginVertical: 12,
//   },
//   totalLabelLarge: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   totalAmountLarge: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#e53935",
//   },
//   addressOption: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//     borderRadius: 10,
//     marginBottom: 12,
//   },
//   addressOptionSelected: {
//     borderColor: "#e53935",
//     backgroundColor: "#ffebee",
//   },
//   addressRadio: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: "#e53935",
//     marginRight: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   radioSelected: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: "#e53935",
//   },
//   addressDetails: {
//     flex: 1,
//   },
//   addressLabel: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//   },
//   addressText: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 2,
//   },
//   noAddressContainer: {
//     alignItems: "center",
//     padding: 20,
//   },
//   noAddressText: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 12,
//   },
//   addAddressLinkText: {
//     color: "#e53935",
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   addAddressForm: {
//     backgroundColor: "#f9fafb",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//   },
//   darkAddAddressForm: {
//     backgroundColor: "#2a2a2a",
//     borderColor: "#444",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//     borderRadius: 10,
//     padding: 12,
//     fontSize: 14,
//     marginBottom: 12,
//     backgroundColor: "#fff",
//   },
//   darkInput: {
//     borderColor: "#444",
//     backgroundColor: "#333",
//     color: "#fff",
//   },
//   textArea: {
//     minHeight: 80,
//     textAlignVertical: "top",
//   },
//   rowInputs: {
//     flexDirection: "row",
//     gap: 12,
//   },
//   halfInput: {
//     flex: 1,
//   },
//   formButtons: {
//     flexDirection: "row",
//     gap: 12,
//     marginTop: 8,
//   },
//   cancelFormButton: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   saveFormButton: {
//     flex: 1,
//     backgroundColor: "#e53935",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   cancelFormText: {
//     color: "#666",
//     fontWeight: "500",
//   },
//   saveFormText: {
//     color: "#fff",
//     fontWeight: "500",
//   },
//   paymentOption: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//     borderRadius: 10,
//     marginBottom: 12,
//   },
//   paymentOptionSelected: {
//     borderColor: "#e53935",
//     backgroundColor: "#ffebee",
//   },
//   paymentOptionText: {
//     flex: 1,
//     fontSize: 14,
//     color: "#333",
//     marginLeft: 12,
//   },
//   radioCircle: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: "#e53935",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   radioSelectedDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: "#e53935",
//   },
//   placeOrderButton: {
//     backgroundColor: "#e53935",
//     padding: 16,
//     borderRadius: 12,
//     alignItems: "center",
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   placeOrderText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   disabledButton: {
//     opacity: 0.6,
//   },
//   bottomModalPadding: {
//     height: 30,
//   },
//   buyNowProductRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   buyNowProductImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 10,
//   },
//   buyNowProductInfo: {
//     flex: 1,
//   },
//   buyNowProductName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//   },
//   buyNowProductCategory: {
//     fontSize: 12,
//     color: "#666",
//     marginTop: 2,
//   },
//   buyNowProductPrice: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#e53935",
//     marginTop: 4,
//   },
// });
