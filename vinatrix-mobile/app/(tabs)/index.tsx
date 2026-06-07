import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Device from "expo-device";
import * as Network from "expo-network";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import SellProductModal from "../../components/SellProductModal";
import { ThemedText } from "../../components/themed-text";
import { eventEmitter, EVENTS } from "../../utils/eventEmitter";
import webStorage from "../../utils/webCompatibleStorage";
import { useTheme } from "../context/ThemeContext";

interface Product {
  id: string;
  product_name: string;
  product_category: string;
  size: string;
  price: string;
  quantity: number;
  description: string;
  image: string;
  sold?: number;
  rating?: number;
  reviews?: number;
  createdAt?: string;
}

interface Address {
  id: number;
  address_label: string;
  address_text: string;
  city: string;
  state: string;
  pincode: string;
  is_primary: number;
}

// =========================
// BASE URL - Web & Mobile Compatible
// =========================
const getBaseUrl = () => {
  if (Platform.OS === "web") {
    // On web, use localhost or your backend IP
    return "https://api.vinatrix-api.workers.dev";
  }
  // On mobile, use your local network IP
  return "https://api.vinatrix-api.workers.dev";
};

const BASE_URL = getBaseUrl();

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [version, setVersion] = useState(0);

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cart, setCart] = useState<string[]>([]);

  // Buy Now Modal State
  const [buyNowModalVisible, setBuyNowModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [processing, setProcessing] = useState(false);

  // Add Address Form State for Buy Now
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address_label: "Home",
    address_text: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Card details for Buy Now
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // Customer details for Buy Now
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Track failed images to avoid repeated errors
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const TRENDING_API_URL = `${getBaseUrl()}/api/products/trending`;
  const CART_URL = `${getBaseUrl()}/api/cart`;
  const WISHLIST_URL = `${getBaseUrl()}/api/wishlist`;

  // Placeholder image
  const PLACEHOLDER_IMAGE =
    "https://via.placeholder.com/400x400/cccccc/666666?text=No+Image";

  // =========================
  // GET USER ID
  // =========================
  // =========================
  // GET USER ID (Web & Mobile Compatible)
  // =========================
  const getUserId = async (): Promise<string> => {
    try {
      let userId = await webStorage.getItem("app_user_id");

      if (!userId) {
        if (Platform.OS === "web") {
          // Web: generate ID based on browser + timestamp
          const browserInfo = navigator.userAgent.substring(0, 50);
          const timestamp = Date.now();
          userId = `WEB_${browserInfo.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}`;
        } else {
          // Mobile: use device info
          const deviceName = Device.deviceName || "unknown";
          const ipAddress = await Network.getIpAddressAsync();
          const timestamp = Date.now();
          userId = `USER_${deviceName.substring(0, 5)}_${ipAddress.split(".").pop()}_${timestamp}`;
        }

        await webStorage.setItem("app_user_id", userId);
      }

      return userId;
    } catch (error) {
      console.error("Error getting user ID:", error);
      return `GUEST_${Date.now()}`;
    }
  };

  // =========================
  // GET DEVICE INFO (Web & Mobile Compatible)
  // =========================
  const getDeviceInfo = async () => {
    try {
      // Check if running on web
      if (Platform.OS === "web") {
        return {
          deviceName: "web_browser",
          ipAddress: window.location.hostname || "web_client",
        };
      }

      // Mobile: use expo-device and expo-network
      const deviceName = Device.deviceName || "unknown";
      const ipAddress = await Network.getIpAddressAsync();
      return { deviceName, ipAddress };
    } catch (error) {
      console.error("Error getting device info:", error);
      return { deviceName: "unknown", ipAddress: "0.0.0.0" };
    }
  };

  // =========================
  // FETCH WISHLIST
  // =========================
  const fetchWishlist = useCallback(async () => {
    try {
      const cust_id = await getUserId();
      const { ipAddress, deviceName } = await getDeviceInfo();

      const response = await fetch(
        `${WISHLIST_URL}?cust_id=${cust_id}&ip_address=${ipAddress}&device_id=${deviceName}`,
      );
      const data = await response.json();

      if (data.success) {
        const wishlistIds = data.items.map((item: any) =>
          String(item.product_id),
        );
        setWishlist(wishlistIds);
        setWishlistCount(wishlistIds.length);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  }, []);

  // =========================
  // FETCH ADDRESSES
  // =========================
  const fetchAddresses = async (uuid: string) => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/user/profile/${uuid}`);
      const data = await response.json();

      if (data.success && data.addresses && data.addresses.length > 0) {
        setAddresses(data.addresses);
        const primaryAddress = data.addresses.find(
          (addr: Address) => addr.is_primary === 1,
        );
        if (primaryAddress) {
          setSelectedAddress(primaryAddress);
        } else {
          setSelectedAddress(data.addresses[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  // =========================
  // ADD NEW ADDRESS
  // =========================
  const addNewAddress = async () => {
    if (!newAddress.address_text || !newAddress.city || !newAddress.pincode) {
      Alert.alert("Error", "Please fill address, city and pincode");
      return;
    }

    try {
      const userUuid = await getUserId();
      const response = await fetch(
        `${getBaseUrl()}/api/user/profile/${userUuid}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: customerName,
            user_name: "",
            email: "",
            phone: customerPhone,
            addresses: [
              ...addresses.map((addr) => ({
                label: addr.address_label,
                address: addr.address_text,
                city: addr.city,
                state: addr.state,
                pincode: addr.pincode,
                isPrimary: addr.is_primary === 1,
                address_type: addr.address_label === "Home" ? "home" : "other",
              })),
              {
                label: newAddress.address_label,
                address: newAddress.address_text,
                city: newAddress.city,
                state: newAddress.state,
                pincode: newAddress.pincode,
                isPrimary: addresses.length === 0,
                address_type:
                  newAddress.address_label === "Home" ? "home" : "other",
              },
            ],
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        await fetchAddresses(userUuid);
        setShowAddAddressForm(false);
        setNewAddress({
          address_label: "Home",
          address_text: "",
          city: "",
          state: "",
          pincode: "",
        });
        Alert.alert("Success", "Address added successfully");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      Alert.alert("Error", "Failed to add address");
    }
  };

  // =========================
  // TOGGLE WISHLIST
  // =========================
  const toggleWishlist = async (product: Product) => {
    const productId = product.id;
    const isInWishlist = wishlist.includes(productId);

    try {
      const cust_id = await getUserId();
      const { ipAddress, deviceName } = await getDeviceInfo();

      if (isInWishlist) {
        const response = await fetch(`${WISHLIST_URL}/remove`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cust_id: cust_id,
            productId: parseInt(productId),
          }),
        });
        const data = await response.json();

        if (data.success) {
          setWishlist(wishlist.filter((id) => id !== productId));
          setWishlistCount((prev) => prev - 1);
          eventEmitter.emit(EVENTS.WISHLIST_UPDATED);
          eventEmitter.emit(EVENTS.WISHLIST_COUNT_UPDATED);
        } else {
          Alert.alert("Error", data.error || "Failed to remove");
        }
      } else {
        const response = await fetch(`${WISHLIST_URL}/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cust_id: cust_id,
            ip_address: ipAddress,
            device_id: deviceName,
            product_id: parseInt(productId),
            product_name: product.product_name,
            product_category: product.product_category,
            size: product.size,
            price: parseFloat(product.price),
            product_image: product.image,
          }),
        });
        const data = await response.json();

        if (data.success) {
          setWishlist([...wishlist, productId]);
          setWishlistCount((prev) => prev + 1);
          eventEmitter.emit(EVENTS.WISHLIST_UPDATED);
          eventEmitter.emit(EVENTS.WISHLIST_COUNT_UPDATED);
        } else {
          Alert.alert("Error", data.error || "Failed to add");
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      Alert.alert("Error", "Failed to update wishlist");
    }
  };

  // =========================
  // VALIDATE AND FIX IMAGE URL
  // =========================
  const getValidImageUrl = (imagePath: string | null | undefined): string => {
    if (
      !imagePath ||
      imagePath === "null" ||
      imagePath === "undefined" ||
      imagePath === ""
    ) {
      return PLACEHOLDER_IMAGE;
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    if (imagePath.startsWith("/uploads/")) {
      return `${getBaseUrl()}${imagePath}`;
    }

    if (imagePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return `${getBaseUrl()}/uploads/${imagePath}`;
    }

    return PLACEHOLDER_IMAGE;
  };

  // =========================
  // HANDLE IMAGE ERROR
  // =========================
  const handleImageError = (productId: string, failedUrl: string) => {
    console.log(
      `🖼️ Image failed to load for product ${productId}: ${failedUrl}`,
    );
    setFailedImages((prev) => new Set(prev).add(productId));
  };

  // =========================
  // FETCH PRODUCTS - ONLY TRENDING
  // =========================
  const fetchProducts = useCallback(async () => {
    try {
      console.log("📡 Fetching trending products...");

      const response = await fetch(`${TRENDING_API_URL}?t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      const data = await response.json();
      console.log("✅ Received trending products count:", data.length);

      const formattedProducts = data.map((product: any) => {
        const validImageUrl = getValidImageUrl(
          product.product_image || product.image,
        );

        return {
          id: String(product.id),
          product_name: product.product_name || "Unnamed Product",
          product_category: product.product_category || "Uncategorized",
          size: product.size,
          price: String(product.price || 0),
          quantity: Number(product.quantity || 0),
          description: product.description || "",
          image: validImageUrl,
          rating: (3.5 + Math.random() * 1.5).toFixed(1),
          reviews: Math.floor(Math.random() * 500) + 50,
          sold: Math.floor(Math.random() * 100) + 1,
        };
      });

      setProducts([...formattedProducts]);
      setFailedImages(new Set());

      return formattedProducts;
    } catch (error) {
      console.error("❌ Fetch Error:", error);
      Alert.alert("Error", "Failed to load trending products");
      return [];
    }
  }, []);

  // =========================
  // ADD TO CART
  // =========================
  const addToCart = async (product: Product) => {
    try {
      const cust_id = await getUserId();
      const { deviceName, ipAddress } = await getDeviceInfo();

      const response = await fetch(`${CART_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cust_id: cust_id,
          ip_address: ipAddress,
          device_id: deviceName,
          productId: parseInt(product.id),
          productName: product.product_name,
          productCategory: product.product_category,
          size: product.size,
          price: parseFloat(product.price),
          productImage: product.image,
        }),
      });

      const data = await response.json();
      if (data.success) {
        eventEmitter.emit(EVENTS.CART_UPDATED);
        eventEmitter.emit(EVENTS.CART_COUNT_UPDATED);
        Alert.alert("Success", `${product.product_name} added to cart!`);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Failed to add to cart");
    }
  };

  // =========================
  // OPEN BUY NOW MODAL
  // =========================
  const openBuyNowModal = async (product: Product) => {
    setSelectedProduct(product);

    // Get user details
    const userId = await getUserId();
    if (userId) {
      await fetchAddresses(userId);

      // Try to get saved customer details
      const response = await fetch(`${BASE_URL}/api/user/profile/${userId}`);
      const data = await response.json();
      if (data.success && data.user) {
        if (data.user.full_name) setCustomerName(data.user.full_name);
        if (data.user.phone) setCustomerPhone(data.user.phone);
      }
    }

    setBuyNowModalVisible(true);
  };

  // =========================
  // GET MYSQL DATE
  // =========================
  const getMySQLDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // =========================
  // HANDLE BUY NOW ORDER
  // =========================
  const handleBuyNowOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }

    if (!customerName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number (10 digits)");
      return;
    }

    if (selectedPaymentMethod === "card") {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        Alert.alert("Error", "Please fill all card details");
        return;
      }
      if (cardNumber.replace(/\s/g, "").length < 16) {
        Alert.alert("Error", "Please enter valid card number");
        return;
      }
    }

    setProcessing(true);

    const orderData = {
      cust_id: await getUserId(),
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      address: selectedAddress.address_text,
      city: selectedAddress.city,
      state: selectedAddress.state,
      pincode: selectedAddress.pincode,
      total_amount: parseFloat(selectedProduct!.price),
      delivery_fee: 0,
      tax_amount: 0,
      grand_total: parseFloat(selectedProduct!.price),
      item_count: 1,
      payment_method: selectedPaymentMethod,
      order_date: getMySQLDate(),
      cart_items: [
        {
          product_id: parseInt(selectedProduct!.id),
          product_name: selectedProduct!.product_name,
          product_category: selectedProduct!.product_category,
          price: parseFloat(selectedProduct!.price),
          quantity: 1,
        },
      ],
    };

    try {
      const response = await fetch(`${BASE_URL}/api/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        setBuyNowModalVisible(false);

        // Reset form
        setSelectedProduct(null);
        setCardNumber("");
        setCardExpiry("");
        setCardCvv("");
        setCardName("");

        Alert.alert(
          "✅ Order Placed Successfully! 🎉🎉🎉",
          `Order #${data.order.order_number}\nTotal: ₹${parseFloat(selectedProduct!.price).toFixed(2)}\nPayment: ${getPaymentMethodName(selectedPaymentMethod)}\n\nDelivery to: ${selectedAddress.address_text}`,
          [
            {
              text: "Track Order",
              onPress: () => router.push("/track-orders"),
            },
          ],
        );
      } else {
        Alert.alert("Error", data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentMethodName = (methodId: string) => {
    const methods: Record<string, string> = {
      cash: "Cash on Delivery",
      upi: "UPI",
      card: "Credit/Debit Card",
    };
    return methods[methodId] || methodId;
  };

  const paymentMethods = [
    { id: "cash", name: "Cash on Delivery", icon: "money", color: "#4caf50" },
    { id: "upi", name: "UPI", icon: "qr-code-scanner", color: "#2196f3" },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: "credit-card",
      color: "#ff9800",
    },
  ];

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchWishlist()]);
      setLoading(false);
    };
    loadData();
  }, [version]);

  // =========================
  // PULL TO REFRESH
  // =========================
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProducts(), fetchWishlist()]);
    setRefreshing(false);
  }, [fetchProducts, fetchWishlist]);

  // =========================
  // PRODUCT ADDED CALLBACK
  // =========================
  const handleProductAdded = useCallback(async () => {
    console.log("🔄 Product added - auto refreshing trending products...");
    setRefreshing(true);
    await fetchProducts();
    setVersion((prev) => prev + 1);
    setRefreshing(false);
  }, [fetchProducts]);

  // Listen for wishlist events
  useEffect(() => {
    const handleWishlistUpdate = () => {
      fetchWishlist();
    };

    eventEmitter.on(EVENTS.WISHLIST_UPDATED, handleWishlistUpdate);

    return () => {
      eventEmitter.off(EVENTS.WISHLIST_UPDATED, handleWishlistUpdate);
    };
  }, [fetchWishlist]);

  // =========================
  // RENDER STARS
  // =========================
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FontAwesome key={i} name="star" size={12} color="#FFB800" />,
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FontAwesome key={i} name="star-half-o" size={12} color="#FFB800" />,
        );
      } else {
        stars.push(
          <FontAwesome key={i} name="star-o" size={12} color="#FFB800" />,
        );
      }
    }
    return stars;
  };

  // =========================
  // GET SIZE COLOR
  // =========================
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

  // =========================
  // LOADING SCREEN
  // =========================
  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, isDark && styles.darkLoadingContainer]}
      >
        <ActivityIndicator size="large" color="#e53935" />
        <ThemedText style={[styles.loadingText, isDark && styles.darkText]}>
          Loading trending products...
        </ThemedText>
      </View>
    );
  }

  // =========================
  // MAIN RENDER
  // =========================
  return (
    <View style={[styles.mainContainer, isDark && styles.darkMainContainer]}>
      <ScrollView
        key={version}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Ionicons name="flame" size={28} color="#e53935" />
              <ThemedText style={[styles.pageTitle, isDark && styles.darkText]}>
                Trending Now
              </ThemedText>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/wishlist")}
              style={styles.wishlistHeaderButton}
            >
              <Ionicons name="heart" size={22} color="#e53935" />
              {wishlistCount > 0 && (
                <View style={styles.wishlistBadge}>
                  <Text style={styles.wishlistBadgeText}>{wishlistCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <ThemedText
            style={[styles.pageSubtitle, isDark && styles.darkSubtitle]}
          >
            🔥 {products.length} trending products available
          </ThemedText>
        </View>

        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather
              name="trending-up"
              size={80}
              color={isDark ? "#666" : "#ccc"}
            />
            <ThemedText style={[styles.emptyTitle, isDark && styles.darkText]}>
              No Trending Products Yet
            </ThemedText>
            <ThemedText
              style={[styles.emptyText, isDark && styles.darkSubtitle]}
            >
              Add products with category "Trending" to see them here!
            </ThemedText>
          </View>
        ) : (
          <View style={styles.grid}>
            {products.map((item) => {
              let finalImageUrl = item.image;
              if (failedImages.has(item.id)) {
                finalImageUrl = PLACEHOLDER_IMAGE;
              }

              return (
                <View
                  key={`${item.id}-${version}`}
                  style={[styles.card, isDark && styles.darkCard]}
                >
                  <TouchableOpacity
                    style={styles.wishlistIcon}
                    onPress={() => toggleWishlist(item)}
                  >
                    <Ionicons
                      name={
                        wishlist.includes(item.id) ? "heart" : "heart-outline"
                      }
                      size={20}
                      color={
                        wishlist.includes(item.id)
                          ? "#e53935"
                          : isDark
                            ? "#666"
                            : "#999"
                      }
                    />
                  </TouchableOpacity>

                  <View style={styles.trendingImageBadge}>
                    <Ionicons name="flame" size={12} color="#fff" />
                    <Text style={styles.trendingImageText}>Trending</Text>
                  </View>

                  <TouchableOpacity activeOpacity={0.9}>
                    <Image
                      source={{ uri: finalImageUrl }}
                      style={styles.productImage}
                      resizeMode="cover"
                      onError={() => handleImageError(item.id, finalImageUrl)}
                    />
                  </TouchableOpacity>

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
                      {item.rating} ({item.reviews} reviews)
                    </ThemedText>
                  </View>

                  <ThemedText style={styles.price}>
                    ₹{parseFloat(item.price).toFixed(2)}
                  </ThemedText>

                  <View
                    style={[styles.divider, isDark && styles.darkDivider]}
                  />

                  <View style={styles.row}>
                    <View style={styles.rowItem}>
                      <Feather
                        name="package"
                        size={12}
                        color={isDark ? "#999" : "#666"}
                      />
                      <ThemedText
                        style={[styles.label, isDark && styles.darkSubtitle]}
                      >
                        Stock:
                      </ThemedText>
                      <ThemedText style={styles.stock}>
                        {item.quantity}
                      </ThemedText>
                    </View>
                    <View style={styles.rowItem}>
                      <Feather
                        name="trending-up"
                        size={12}
                        color={isDark ? "#64B5F6" : "#1976d2"}
                      />
                      <ThemedText
                        style={[styles.label, isDark && styles.darkSubtitle]}
                      >
                        Sold:
                      </ThemedText>
                      <ThemedText style={styles.sold}>{item.sold}+</ThemedText>
                    </View>
                  </View>

                  <View style={styles.progressBg}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(
                            ((item.sold || 1) /
                              ((item.sold || 1) + item.quantity)) *
                              100,
                            100,
                          )}%`,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.addToCartBtn]}
                      onPress={() => addToCart(item)}
                    >
                      <MaterialIcons
                        name="shopping-cart"
                        size={16}
                        color="#fff"
                      />
                      <ThemedText style={styles.btnText}>+Cart</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.buyNowBtn]}
                      onPress={() => openBuyNowModal(item)}
                    >
                      <Ionicons name="flash" size={14} color="#fff" />
                      <ThemedText style={styles.btnText}>Buy</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setModalVisible(true)}
      >
        <Feather name="plus" size={24} color="#fff" />
        <Text style={styles.fabText}>Sell</Text>
      </TouchableOpacity>

      <SellProductModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onProductAdded={handleProductAdded}
      />

      {/* Buy Now Checkout Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={buyNowModalVisible}
        onRequestClose={() => setBuyNowModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, isDark && styles.darkModalContainer]}
          >
            <View
              style={[styles.modalHeader, isDark && styles.darkModalHeader]}
            >
              <Text style={[styles.modalTitle, isDark && styles.darkText]}>
                Buy Now - Checkout
              </Text>
              <TouchableOpacity
                onPress={() => setBuyNowModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color={isDark ? "#fff" : "#333"} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Product Details */}
              {selectedProduct && (
                <View style={[styles.summaryCard, isDark && styles.darkCard]}>
                  <Text
                    style={[styles.sectionTitle, isDark && styles.darkText]}
                  >
                    Product Details
                  </Text>
                  <View style={styles.buyNowProductRow}>
                    <Image
                      source={{ uri: getValidImageUrl(selectedProduct.image) }}
                      style={styles.buyNowProductImage}
                      resizeMode="cover"
                    />
                    <View style={styles.buyNowProductInfo}>
                      <Text
                        style={[
                          styles.buyNowProductName,
                          isDark && styles.darkText,
                        ]}
                      >
                        {selectedProduct.product_name}
                      </Text>
                      <Text
                        style={[
                          styles.buyNowProductCategory,
                          isDark && styles.darkSubtitle,
                        ]}
                      >
                        {selectedProduct.product_category} | Size:{" "}
                        {selectedProduct.size}
                      </Text>
                      <Text style={styles.buyNowProductPrice}>
                        ₹{parseFloat(selectedProduct.price).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Customer Details Section */}
              <View style={[styles.sectionCard, isDark && styles.darkCard]}>
                <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
                  Customer Details
                </Text>
                <TextInput
                  style={[styles.input, isDark && styles.darkInput]}
                  placeholder="Full Name *"
                  placeholderTextColor={isDark ? "#999" : "#666"}
                  value={customerName}
                  onChangeText={setCustomerName}
                />
                <TextInput
                  style={[styles.input, isDark && styles.darkInput]}
                  placeholder="Phone Number *"
                  placeholderTextColor={isDark ? "#999" : "#666"}
                  keyboardType="phone-pad"
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  maxLength={10}
                />
              </View>

              {/* Order Summary */}
              <View style={[styles.summaryCard, isDark && styles.darkCard]}>
                <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
                  Order Summary
                </Text>
                <View style={styles.summaryRow}>
                  <Text
                    style={[styles.summaryLabel, isDark && styles.darkSubtitle]}
                  >
                    Item Total
                  </Text>
                  <Text
                    style={[styles.summaryValue, isDark && styles.darkText]}
                  >
                    ₹
                    {selectedProduct
                      ? parseFloat(selectedProduct.price).toFixed(2)
                      : "0.00"}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text
                    style={[styles.summaryLabel, isDark && styles.darkSubtitle]}
                  >
                    Delivery Fee
                  </Text>
                  <Text
                    style={[styles.summaryValue, isDark && styles.darkText]}
                  >
                    ₹0.00
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text
                    style={[styles.totalLabelLarge, isDark && styles.darkText]}
                  >
                    Total to Pay
                  </Text>
                  <Text
                    style={[styles.totalAmountLarge, isDark && styles.darkText]}
                  >
                    ₹
                    {selectedProduct
                      ? parseFloat(selectedProduct.price).toFixed(2)
                      : "0.00"}
                  </Text>
                </View>
              </View>

              {/* Delivery Address */}
              <View style={[styles.sectionCard, isDark && styles.darkCard]}>
                <View style={styles.sectionHeaderRow}>
                  <Text
                    style={[styles.sectionTitle, isDark && styles.darkText]}
                  >
                    Delivery Address
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowAddAddressForm(!showAddAddressForm)}
                    style={styles.addButton}
                  >
                    <Feather name="plus" size={20} color="#e53935" />
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {showAddAddressForm && (
                  <View
                    style={[
                      styles.addAddressForm,
                      isDark && styles.darkAddAddressForm,
                    ]}
                  >
                    <TextInput
                      style={[styles.input, isDark && styles.darkInput]}
                      placeholder="Label (Home, Office)"
                      placeholderTextColor={isDark ? "#999" : "#666"}
                      value={newAddress.address_label}
                      onChangeText={(text) =>
                        setNewAddress({ ...newAddress, address_label: text })
                      }
                    />
                    <TextInput
                      style={[
                        styles.input,
                        styles.textArea,
                        isDark && styles.darkInput,
                      ]}
                      placeholder="Address *"
                      placeholderTextColor={isDark ? "#999" : "#666"}
                      value={newAddress.address_text}
                      onChangeText={(text) =>
                        setNewAddress({ ...newAddress, address_text: text })
                      }
                      multiline
                    />
                    <TextInput
                      style={[styles.input, isDark && styles.darkInput]}
                      placeholder="City *"
                      placeholderTextColor={isDark ? "#999" : "#666"}
                      value={newAddress.city}
                      onChangeText={(text) =>
                        setNewAddress({ ...newAddress, city: text })
                      }
                    />
                    <TextInput
                      style={[styles.input, isDark && styles.darkInput]}
                      placeholder="State"
                      placeholderTextColor={isDark ? "#999" : "#666"}
                      value={newAddress.state}
                      onChangeText={(text) =>
                        setNewAddress({ ...newAddress, state: text })
                      }
                    />
                    <TextInput
                      style={[styles.input, isDark && styles.darkInput]}
                      placeholder="Pincode *"
                      placeholderTextColor={isDark ? "#999" : "#666"}
                      keyboardType="numeric"
                      value={newAddress.pincode}
                      onChangeText={(text) =>
                        setNewAddress({ ...newAddress, pincode: text })
                      }
                    />
                    <View style={styles.formButtons}>
                      <TouchableOpacity
                        style={styles.cancelFormButton}
                        onPress={() => setShowAddAddressForm(false)}
                      >
                        <Text style={styles.cancelFormText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveFormButton}
                        onPress={addNewAddress}
                      >
                        <Text style={styles.saveFormText}>Save Address</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {addresses.length === 0 && !showAddAddressForm ? (
                  <View style={styles.noAddressContainer}>
                    <Text
                      style={[
                        styles.noAddressText,
                        isDark && styles.darkSubtitle,
                      ]}
                    >
                      No saved addresses found
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowAddAddressForm(true)}
                    >
                      <Text style={styles.addAddressLinkText}>
                        + Add Address
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  addresses.map((address) => (
                    <TouchableOpacity
                      key={address.id}
                      style={[
                        styles.addressOption,
                        selectedAddress?.id === address.id &&
                          styles.addressOptionSelected,
                      ]}
                      onPress={() => setSelectedAddress(address)}
                    >
                      <View style={styles.addressRadio}>
                        {selectedAddress?.id === address.id && (
                          <View style={styles.radioSelected} />
                        )}
                      </View>
                      <View style={styles.addressDetails}>
                        <Text
                          style={[
                            styles.addressLabel,
                            isDark && styles.darkText,
                          ]}
                        >
                          {address.address_label}
                        </Text>
                        <Text
                          style={[
                            styles.addressText,
                            isDark && styles.darkSubtitle,
                          ]}
                        >
                          {address.address_text}
                        </Text>
                        <Text
                          style={[
                            styles.addressText,
                            isDark && styles.darkSubtitle,
                          ]}
                        >
                          {address.city}, {address.state} - {address.pincode}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              {/* Payment Method */}
              <View style={[styles.sectionCard, isDark && styles.darkCard]}>
                <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
                  Payment Method
                </Text>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentOption,
                      selectedPaymentMethod === method.id &&
                        styles.paymentOptionSelected,
                    ]}
                    onPress={() => setSelectedPaymentMethod(method.id)}
                  >
                    <MaterialIcons
                      name={method.icon as any}
                      size={24}
                      color={method.color}
                    />
                    <Text
                      style={[
                        styles.paymentOptionText,
                        isDark && styles.darkText,
                      ]}
                    >
                      {method.name}
                    </Text>
                    <View style={styles.radioCircle}>
                      {selectedPaymentMethod === method.id && (
                        <View style={styles.radioSelectedDot} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Card Details */}
              {selectedPaymentMethod === "card" && (
                <View style={[styles.sectionCard, isDark && styles.darkCard]}>
                  <Text
                    style={[styles.sectionTitle, isDark && styles.darkText]}
                  >
                    Card Details
                  </Text>
                  <TextInput
                    style={[styles.input, isDark && styles.darkInput]}
                    placeholder="Card Number (16 digits)"
                    placeholderTextColor={isDark ? "#999" : "#666"}
                    keyboardType="numeric"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    maxLength={16}
                  />
                  <TextInput
                    style={[styles.input, isDark && styles.darkInput]}
                    placeholder="Cardholder Name"
                    placeholderTextColor={isDark ? "#999" : "#666"}
                    value={cardName}
                    onChangeText={setCardName}
                  />
                  <View style={styles.rowInputs}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.halfInput,
                        isDark && styles.darkInput,
                      ]}
                      placeholder="MM/YY"
                      placeholderTextColor={isDark ? "#999" : "#666"}
                      value={cardExpiry}
                      onChangeText={setCardExpiry}
                      maxLength={5}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        styles.halfInput,
                        isDark && styles.darkInput,
                      ]}
                      placeholder="CVV"
                      placeholderTextColor={isDark ? "#999" : "#666"}
                      keyboardType="numeric"
                      secureTextEntry
                      value={cardCvv}
                      onChangeText={setCardCvv}
                      maxLength={4}
                    />
                  </View>
                </View>
              )}

              {/* Place Order Button */}
              <TouchableOpacity
                style={[
                  styles.placeOrderButton,
                  processing && styles.disabledButton,
                ]}
                onPress={handleBuyNowOrder}
                disabled={processing}
              >
                <Text style={styles.placeOrderText}>
                  {processing
                    ? "Processing..."
                    : `Place Order • ₹${selectedProduct ? parseFloat(selectedProduct.price).toFixed(2) : "0.00"}`}
                </Text>
              </TouchableOpacity>

              <View style={styles.bottomModalPadding} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#f4f6f8" },
  darkMainContainer: { backgroundColor: "#1a1a1a" },
  container: { padding: 12, paddingBottom: 80 },
  headerContainer: { marginBottom: 16, paddingHorizontal: 4 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pageTitle: { fontSize: 24, fontWeight: "bold", color: "#111" },
  pageSubtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  darkText: { color: "#fff" },
  darkSubtitle: { color: "#999" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48.5%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
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
  trendingImageBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: "#e53935",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendingImageText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  wishlistHeaderButton: {
    position: "relative",
    padding: 8,
  },
  wishlistBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#e53935",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  wishlistBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
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
    marginBottom: 6,
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
  categoryText: { fontSize: 10, color: "#1976d2", fontWeight: "600" },
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
    gap: 6,
  },
  starsContainer: { flexDirection: "row", gap: 2 },
  ratingText: { fontSize: 10, color: "#666" },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e53935",
    marginBottom: 8,
  },
  divider: { height: 1, backgroundColor: "#eeeeee", marginVertical: 8 },
  darkDivider: { backgroundColor: "#444" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  rowItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  label: { color: "#666", fontSize: 11, marginLeft: 2 },
  stock: { color: "#4caf50", fontWeight: "700", fontSize: 12 },
  sold: { color: "#1976d2", fontWeight: "700", fontSize: 12 },
  progressBg: {
    height: 4,
    backgroundColor: "#eeeeee",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: { height: 4, backgroundColor: "#1976d2", borderRadius: 10 },
  actionButtons: { flexDirection: "row", gap: 8, marginTop: 4 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addToCartBtn: { backgroundColor: "#ff9800" },
  buyNowBtn: { backgroundColor: "#e53935" },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
  },
  darkLoadingContainer: {
    backgroundColor: "#1a1a1a",
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  emptyText: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 8 },
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
    elevation: 5,
    gap: 8,
  },
  fabText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  darkModalContainer: { backgroundColor: "#1a1a1a" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  darkModalHeader: { borderBottomColor: "#3a3a3a" },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  modalCloseButton: { padding: 4 },
  modalContent: { padding: 16 },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  addButtonText: { color: "#e53935", fontSize: 14, fontWeight: "500" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 14, color: "#666" },
  summaryValue: { fontSize: 14, fontWeight: "500", color: "#333" },
  totalLabelLarge: { fontSize: 16, fontWeight: "bold", color: "#333" },
  totalAmountLarge: { fontSize: 18, fontWeight: "bold", color: "#e53935" },
  addressOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    marginBottom: 12,
  },
  addressOptionSelected: { borderColor: "#e53935", backgroundColor: "#ffebee" },
  addressRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e53935",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e53935",
  },
  addressDetails: { flex: 1 },
  addressLabel: { fontSize: 16, fontWeight: "600", color: "#333" },
  addressText: { fontSize: 14, color: "#666", marginBottom: 2 },
  noAddressContainer: { alignItems: "center", padding: 20 },
  noAddressText: { fontSize: 14, color: "#666", marginBottom: 12 },
  addAddressLinkText: { color: "#e53935", fontSize: 14, fontWeight: "500" },
  addAddressForm: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  darkAddAddressForm: { backgroundColor: "#2a2a2a", borderColor: "#444" },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  darkInput: { borderColor: "#444", backgroundColor: "#333", color: "#fff" },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  rowInputs: { flexDirection: "row", gap: 12 },
  halfInput: { flex: 1 },
  formButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelFormButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveFormButton: {
    flex: 1,
    backgroundColor: "#e53935",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelFormText: { color: "#666", fontWeight: "500" },
  saveFormText: { color: "#fff", fontWeight: "500" },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    marginBottom: 12,
  },
  paymentOptionSelected: { borderColor: "#e53935", backgroundColor: "#ffebee" },
  paymentOptionText: { flex: 1, fontSize: 14, color: "#333", marginLeft: 12 },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e53935",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e53935",
  },
  placeOrderButton: {
    backgroundColor: "#e53935",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  placeOrderText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  disabledButton: { opacity: 0.6 },
  bottomModalPadding: { height: 30 },
  buyNowProductRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  buyNowProductImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  buyNowProductInfo: {
    flex: 1,
  },
  buyNowProductName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  buyNowProductCategory: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  buyNowProductPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e53935",
    marginTop: 4,
  },
});
