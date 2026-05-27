import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import SellProductModal from "../../components/SellProductModal";
import { ThemedText } from "../../components/themed-text";
// ========== ADD THIS IMPORT ==========
import { eventEmitter, EVENTS } from "../../utils/eventEmitter";

const { width } = Dimensions.get("window");

interface Product {
  id: string;
  product_name: string;
  product_category: string;
  price: string;
  quantity: number;
  description: string;
  image: string;
  sold?: number;
  rating?: any;
  reviews?: number;
}

interface CartItemFromAPI {
  id: number;
  cart_id: number;
  product_id: number;
  product_name: string;
  product_category: string;
  price: number;
  quantity: number;
  product_image: string;
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [version, setVersion] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("Pant");
  const [cartCount, setCartCount] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const [wishlist, setWishlist] = useState<string[]>([]);

  const BASE_URL = "http://192.168.1.4:5000";
  const API_URL = `${BASE_URL}/api/products`;
  const CART_URL = `${BASE_URL}/api/cart`;

  const categoryImages = {
    Tshirt: require("../../assets/icons/tshirt.png"),
    Shirt: require("../../assets/icons/shirt.png"),
    Pant: require("../../assets/icons/pant.png"),
    Track: require("../../assets/icons/track.png"),
    "Jeans Pant": require("../../assets/icons/jeans.png"),
    "Party Wears": require("../../assets/icons/party.png"),
    "Colorful Picks": require("../../assets/icons/colorful.png"),
    All: require("../../assets/icons/all.png"),
  };

  const firstRowCategories = ["Pant", "Track", "Jeans Pant", "Party Wears"];
  const secondRowCategories = ["Tshirt", "Shirt", "Colorful Picks", "All"];

  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    if (selectedCategory === "All") {
      return products;
    }
    return products.filter(
      (product) => product.product_category === selectedCategory,
    );
  }, [products, selectedCategory]);

  // =========================
  // FETCH PRODUCTS FROM API
  // =========================

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}?t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      const data = await response.json();

      const formattedProducts: Product[] = data.map((product: any) => ({
        id: String(product.id),
        product_name: product.product_name,
        product_category: product.product_category,
        price: String(product.price),
        quantity: Number(product.quantity),
        description: product.description || "",
        image: product.image,
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        reviews: Math.floor(Math.random() * 500) + 50,
        sold: Math.floor(Math.random() * 100) + 1,
      }));

      setProducts(formattedProducts);
    } catch (error) {
      Alert.alert("Error", "Failed to load products");
    }
  }, []);

  // =========================
  // FETCH CART FROM API (GET CART COUNT)
  // =========================

  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch(`${CART_URL}`);
      const data = await response.json();
      if (data.success) {
        const totalItems = data.items.reduce(
          (sum: number, item: CartItemFromAPI) => sum + item.quantity,
          0,
        );
        setCartCount(totalItems);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  }, []);

  // =========================
  // ADD TO CART API
  // =========================

  // Add to Cart
  const addToCart = useCallback(async (product: Product) => {
    try {
      const response = await fetch(`${CART_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: parseInt(product.id),
          productName: product.product_name,
          productCategory: product.product_category,
          price: parseFloat(product.price),
          productImage: product.image,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCartCount((prev) => prev + 1);
        // Emit both events to update cart count everywhere
        eventEmitter.emit(EVENTS.CART_UPDATED);
        eventEmitter.emit(EVENTS.CART_COUNT_UPDATED);
        Alert.alert("Success", `${product.product_name} added to cart!`);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Failed to add to cart");
    }
  }, []);

  // =========================
  // BUY NOW
  // =========================

  const buyNow = useCallback(async (product: Product) => {
    try {
      const response = await fetch(`${CART_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: parseInt(product.id),
          productName: product.product_name,
          productCategory: product.product_category,
          price: parseFloat(product.price),
          productImage: product.image,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCartCount((prev) => prev + 1);

        Alert.alert(
          "Buy Now",
          `Proceed to buy ${product.product_name} for ₹${parseFloat(product.price).toFixed(2)}?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Buy Now",
              onPress: () =>
                Alert.alert("Success", "Order placed successfully!"),
            },
          ],
        );
      }
    } catch (error) {
      console.error("Error in buy now:", error);
      Alert.alert("Error", "Failed to process");
    }
  }, []);

  // =========================
  // TOGGLE WISHLIST
  // =========================

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
      Alert.alert("Removed", "Product removed from wishlist");
    } else {
      setWishlist([...wishlist, productId]);
      Alert.alert("Added", "Product saved for later");
    }
  };

  // =========================
  // REFRESH FUNCTION
  // =========================

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProducts(), fetchCart()]);
    setRefreshing(false);
  }, [fetchProducts, fetchCart]);

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchCart()]);
      setLoading(false);
    };
    loadData();
  }, [version]);

  // ========== ADD THIS useEffect HERE ==========
  // Listen for product added events from Layout
  useEffect(() => {
    const handleProductAdded = () => {
      console.log("🔄 Event received: Product added - refreshing products");
      onRefresh();
    };

    eventEmitter.on(EVENTS.PRODUCT_ADDED, handleProductAdded);

    return () => {
      eventEmitter.off(EVENTS.PRODUCT_ADDED, handleProductAdded);
    };
  }, [onRefresh]);

  // =========================
  // PRODUCT ADDED CALLBACK
  // =========================

  const handleProductAdded = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setVersion((prev) => prev + 1);
    setRefreshing(false);
  }, [fetchProducts]);

  // =========================
  // HANDLE CATEGORY PRESS
  // =========================

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 50);
  };

  // =========================
  // RENDER STARS
  // =========================

  const renderStars = useCallback((rating: number) => {
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
  }, []);

  // =========================
  // RENDER IMAGE BUTTON
  // =========================

  const renderImageButton = (category: string) => {
    const isActive = selectedCategory === category;

    return (
      <Pressable
        key={category}
        style={({ pressed }) => [
          styles.iconButton,
          isActive && styles.iconButtonActive,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => handleCategoryPress(category)}
      >
        <View style={[styles.iconCircle, isActive && styles.iconCircleActive]}>
          <Image
            source={categoryImages[category as keyof typeof categoryImages]}
            style={[
              styles.iconImage,
              { tintColor: isActive ? "#fff" : undefined },
            ]}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.iconLabel, isActive && styles.iconLabelActive]}>
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

  // =========================
  // RENDER PRODUCT CARD
  // =========================

  const renderProductCard = useCallback(
    ({ item }: { item: Product }) => {
      return (
        <View style={styles.card}>
          <Pressable
            style={styles.wishlistIcon}
            onPress={() => toggleWishlist(item.id)}
          >
            <Ionicons
              name={wishlist.includes(item.id) ? "heart" : "heart-outline"}
              size={20}
              color={wishlist.includes(item.id) ? "#e53935" : "#999"}
            />
          </Pressable>

          <Image
            source={{ uri: `${BASE_URL}${item.image}?v=${version}` }}
            style={styles.productImage}
            resizeMode="cover"
          />

          <ThemedText style={styles.productName} numberOfLines={2}>
            {item.product_name}
          </ThemedText>

          <View style={styles.categoryBadge}>
            <ThemedText style={styles.categoryText}>
              {item.product_category}
            </ThemedText>
          </View>

          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(Number(item.rating))}
            </View>
            <ThemedText style={styles.ratingText}>
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
              <MaterialIcons name="shopping-cart" size={16} color="#fff" />
              <ThemedText style={styles.btnText}>Cart</ThemedText>
            </Pressable>

            <Pressable
              style={[styles.actionBtn, styles.buyNowBtn]}
              onPress={() => buyNow(item)}
            >
              <Ionicons name="flash" size={14} color="#fff" />
              <ThemedText style={styles.btnText}>Buy</ThemedText>
            </Pressable>
          </View>
        </View>
      );
    },
    [wishlist, version, addToCart, buyNow],
  );

  // =========================
  // LIST HEADER COMPONENT
  // =========================

  const ListHeaderComponent = () => (
    <>
      <View style={styles.categoriesContainer}>
        <View style={styles.categoryRow}>
          {firstRowCategories.map((category) => renderImageButton(category))}
        </View>
        <View style={styles.categoryRow}>
          {secondRowCategories.map((category) => renderImageButton(category))}
        </View>
      </View>

      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredProducts.length} products found
        </Text>
        <View style={styles.activeCategoryBadge}>
          <Text style={styles.activeCategoryText}>{selectedCategory}</Text>
        </View>
      </View>
    </>
  );

  // =========================
  // LOADING SCREEN
  // =========================

  if (loading) {
    return (
      <SafeAreaView style={styles.mainContainer} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e53935" />
          <ThemedText style={styles.loadingText}>
            Loading products...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // =========================
  // MAIN RENDER
  // =========================

  return (
    <SafeAreaView style={styles.mainContainer} edges={[]}>
      <FlatList
        ref={flatListRef}
        data={filteredProducts}
        keyExtractor={(item) => `${item.id}-${version}`}
        numColumns={2}
        ListHeaderComponent={ListHeaderComponent}
        renderItem={renderProductCard}
        contentContainerStyle={styles.container}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        removeClippedSubviews={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <Pressable style={styles.fabButton} onPress={() => setModalVisible(true)}>
        <Feather name="plus" size={24} color="#fff" />
        <Text style={styles.fabText}>Sell</Text>
      </Pressable>

      <SellProductModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onProductAdded={handleProductAdded}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  categoriesContainer: {
    paddingTop: 0,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: 56,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 6,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    paddingVertical: 2,
  },
  iconButtonActive: {
    transform: [{ scale: 1.03 }],
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  iconCircleActive: {
    backgroundColor: "#e53935",
  },
  iconImage: {
    width: 32,
    height: 32,
  },
  iconLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  iconLabelActive: {
    color: "#e53935",
    fontWeight: "700",
  },
  countContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
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
  container: {
    paddingHorizontal: 10,
    paddingBottom: 120,
    paddingTop: 0,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  card: {
    width: (width - 32) / 2,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    position: "relative",
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
  categoryBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 10,
    color: "#1976d2",
    fontWeight: "600",
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
    position: "relative",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
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
