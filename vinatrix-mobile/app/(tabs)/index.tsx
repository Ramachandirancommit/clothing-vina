import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

import React, { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import SellProductModal from "../../components/SellProductModal";
import { ThemedText } from "../../components/themed-text";

interface Product {
  id: string;
  product_name: string;
  product_category: string;
  price: string;
  quantity: number;
  description: string;
  image: string;
  sold?: number;
  rating?: number;
  reviews?: number;
  createdAt?: string;
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [version, setVersion] = useState(0); // THIS IS THE KEY

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);

  const BASE_URL = "http://192.168.1.4:5000";
  const API_URL = `${BASE_URL}/api/products`;

  // =========================
  // FETCH PRODUCTS
  // =========================

  const fetchProducts = useCallback(async () => {
    try {
      console.log("📡 Fetching products...");

      const response = await fetch(`${API_URL}?t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      const data = await response.json();
      console.log("✅ Received products count:", data.length);

      const formattedProducts = data.map((product: any) => ({
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

      // THIS WILL TRIGGER RE-RENDER
      setProducts([...formattedProducts]);

      console.log(`✅ Set ${formattedProducts.length} products`);

      return formattedProducts;
    } catch (error) {
      console.error("❌ Fetch Error:", error);
      Alert.alert("Error", "Failed to load products");
      return [];
    }
  }, []);

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchProducts();
      setLoading(false);
    };
    loadData();
  }, [version]); // Re-fetch when version changes

  // =========================
  // PULL TO REFRESH
  // =========================

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, [fetchProducts]);

  // =========================
  // PRODUCT ADDED CALLBACK - THIS WILL TRIGGER AUTO REFRESH
  // =========================

  const handleProductAdded = useCallback(async () => {
    console.log("🔄 Product added - auto refreshing...");

    // Show refreshing indicator
    setRefreshing(true);

    // Fetch latest products
    await fetchProducts();

    // Increment version to trigger useEffect and force re-render
    setVersion((prev) => prev + 1);

    // Hide refreshing indicator
    setRefreshing(false);

    console.log("✅ Auto refresh complete!");
  }, [fetchProducts]);

  // =========================
  // ADD TO CART
  // =========================

  const addToCart = (productId: string) => {
    if (cart.includes(productId)) {
      Alert.alert("Info", "Product already in cart!");
    } else {
      setCart([...cart, productId]);
      Alert.alert("Success", "Product added to cart!");
    }
  };

  // =========================
  // BUY NOW
  // =========================

  const buyNow = (product: Product) => {
    Alert.alert(
      "Buy Now",
      `Proceed to buy ${product.product_name} for ₹${parseFloat(
        product.price,
      ).toFixed(2)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Buy Now",
          onPress: () => Alert.alert("Success", "Order placed successfully!"),
        },
      ],
    );
  };

  // =========================
  // WISHLIST
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
  // LOADING SCREEN
  // =========================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e53935" />
        <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
      </View>
    );
  }

  // =========================
  // MAIN RENDER
  // =========================

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        key={version} // THIS FORCES COMPLETE RE-RENDER
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerContainer}>
          <ThemedText style={styles.pageTitle}>🔥 Trending Now</ThemedText>
          <ThemedText style={styles.pageSubtitle}>
            {products.length} products available
          </ThemedText>
        </View>

        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="shopping-bag" size={80} color="#ccc" />
            <ThemedText style={styles.emptyTitle}>No Products Yet</ThemedText>
            <ThemedText style={styles.emptyText}>
              Click the Sell button to add your first product!
            </ThemedText>
          </View>
        ) : (
          <View style={styles.grid}>
            {products.map((item, index) => (
              <View key={`${item.id}-${version}`} style={styles.card}>
                <TouchableOpacity
                  style={styles.wishlistIcon}
                  onPress={() => toggleWishlist(item.id)}
                >
                  <Ionicons
                    name={
                      wishlist.includes(item.id) ? "heart" : "heart-outline"
                    }
                    size={20}
                    color={wishlist.includes(item.id) ? "#e53935" : "#999"}
                  />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.9}>
                  <Image
                    source={{ uri: `${BASE_URL}${item.image}?v=${version}` }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>

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
                    {item.rating} ({item.reviews} reviews)
                  </ThemedText>
                </View>

                <ThemedText style={styles.price}>
                  ₹{parseFloat(item.price).toFixed(2)}
                </ThemedText>

                <View style={styles.divider} />

                <View style={styles.row}>
                  <View style={styles.rowItem}>
                    <Feather name="package" size={12} color="#666" />
                    <ThemedText style={styles.label}>Stock:</ThemedText>
                    <ThemedText style={styles.stock}>
                      {item.quantity}
                    </ThemedText>
                  </View>
                  <View style={styles.rowItem}>
                    <Feather name="trending-up" size={12} color="#1976d2" />
                    <ThemedText style={styles.label}>Sold:</ThemedText>
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
                    onPress={() => addToCart(item.id)}
                  >
                    <MaterialIcons
                      name="shopping-cart"
                      size={16}
                      color="#fff"
                    />
                    <ThemedText style={styles.btnText}>Cart</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.buyNowBtn]}
                    onPress={() => buyNow(item)}
                  >
                    <Ionicons name="flash" size={14} color="#fff" />
                    <ThemedText style={styles.btnText}>Buy</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#f4f6f8" },
  container: { padding: 12, paddingBottom: 80 },
  headerContainer: { marginBottom: 16, paddingHorizontal: 4 },
  pageTitle: { fontSize: 24, fontWeight: "bold", color: "#111" },
  pageSubtitle: { fontSize: 14, color: "#666", marginTop: 4 },
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
  categoryText: { fontSize: 10, color: "#1976d2", fontWeight: "600" },
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
});

// import {
//   Feather,
//   FontAwesome,
//   Ionicons,
//   MaterialIcons,
// } from "@expo/vector-icons";

// import React, { useCallback, useEffect, useState } from "react";

// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// import SellProductModal from "../../components/SellProductModal";
// import { ThemedText } from "../../components/themed-text";

// interface Product {
//   id: string;
//   product_name: string;
//   product_category: string;
//   price: string;
//   quantity: number;
//   description: string;
//   image: string;
//   sold?: number;
//   rating?: number;
//   reviews?: number;
//   createdAt?: string;
// }

// export default function HomeScreen() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const [wishlist, setWishlist] = useState<string[]>([]);
//   const [cart, setCart] = useState<string[]>([]);

//   const [modalVisible, setModalVisible] = useState(false);

//   const BASE_URL = "http://172.20.10.2:5000";
//   const API_URL = `${BASE_URL}/api/products`;

//   // =========================
//   // FETCH PRODUCTS
//   // =========================

//   const fetchProducts = useCallback(async (skipFullScreenLoader = false) => {
//     try {
//       if (!skipFullScreenLoader) {
//         setLoading(true);
//       }

//       console.log("📡 Fetching products...");

//       const response = await fetch(API_URL);
//       const data = await response.json();

//       console.log("✅ API Response:", data);

//       const productsArray = data.products || data;

//       const formattedProducts = productsArray.map((product: any) => ({
//         ...product,
//         rating: (4 + Math.random()).toFixed(1),
//         reviews: Math.floor(Math.random() * 500) + 50,
//         sold: Math.floor(Math.random() * 100) + 1,
//       }));

//       formattedProducts.reverse();

//       // CRITICAL FIX: Force state update
//       setProducts(() => [...formattedProducts]);

//       console.log(`✅ Loaded ${formattedProducts.length} products`);
//     } catch (error) {
//       console.error("❌ Fetch Error:", error);
//       Alert.alert("Error", "Failed to load products");
//     } finally {
//       if (!skipFullScreenLoader) {
//         setLoading(false);
//       }
//     }
//   }, []);

//   // =========================
//   // INITIAL LOAD
//   // =========================

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   // =========================
//   // PULL TO REFRESH
//   // =========================

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await fetchProducts(true);
//     setRefreshing(false);
//   }, [fetchProducts]);

//   // =========================
//   // PRODUCT ADDED CALLBACK - CRITICAL FIX
//   // =========================

//   const handleProductAdded = async () => {
//     console.log("🔄 Starting force refresh...");

//     // Force refresh by calling fetchProducts directly
//     setRefreshing(true);

//     // Wait a moment for database to commit
//     await new Promise((resolve) => setTimeout(resolve, 500));

//     // Fetch products WITHOUT skipFullScreenLoader to force UI update
//     try {
//       const response = await fetch(API_URL);
//       const data = await response.json();

//       const productsArray = data.products || data;
//       const formattedProducts = productsArray.map((product: any) => ({
//         ...product,
//         rating: (4 + Math.random()).toFixed(1),
//         reviews: Math.floor(Math.random() * 500) + 50,
//         sold: Math.floor(Math.random() * 100) + 1,
//       }));

//       formattedProducts.reverse();

//       // Force update products state
//       setProducts(formattedProducts);

//       console.log(
//         `✅ Force refresh complete! ${formattedProducts.length} products`,
//       );
//     } catch (error) {
//       console.error("❌ Refresh error:", error);
//     }

//     setRefreshing(false);
//     console.log("✅ Products refreshed in UI");
//   };

//   // =========================
//   // ADD TO CART
//   // =========================

//   const addToCart = (productId: string) => {
//     if (cart.includes(productId)) {
//       Alert.alert("Info", "Product already in cart!");
//     } else {
//       setCart([...cart, productId]);
//       Alert.alert("Success", "Product added to cart!");
//     }
//   };

//   // =========================
//   // BUY NOW
//   // =========================

//   const buyNow = (product: Product) => {
//     Alert.alert(
//       "Buy Now",
//       `Proceed to buy ${product.product_name} for ₹${parseFloat(
//         product.price,
//       ).toFixed(2)}?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Buy Now",
//           onPress: () => Alert.alert("Success", "Order placed successfully!"),
//         },
//       ],
//     );
//   };

//   // =========================
//   // WISHLIST
//   // =========================

//   const toggleWishlist = (productId: string) => {
//     if (wishlist.includes(productId)) {
//       setWishlist(wishlist.filter((id) => id !== productId));
//       Alert.alert("Removed", "Product removed from wishlist");
//     } else {
//       setWishlist([...wishlist, productId]);
//       Alert.alert("Added", "Product saved for later");
//     }
//   };

//   // =========================
//   // RENDER STARS
//   // =========================

//   const renderStars = (rating: number) => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;

//     for (let i = 1; i <= 5; i++) {
//       if (i <= fullStars) {
//         stars.push(
//           <FontAwesome key={i} name="star" size={12} color="#FFB800" />,
//         );
//       } else if (i === fullStars + 1 && hasHalfStar) {
//         stars.push(
//           <FontAwesome key={i} name="star-half-o" size={12} color="#FFB800" />,
//         );
//       } else {
//         stars.push(
//           <FontAwesome key={i} name="star-o" size={12} color="#FFB800" />,
//         );
//       }
//     }
//     return stars;
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#e53935" />
//         <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.mainContainer}>
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.container}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         <View style={styles.headerContainer}>
//           <ThemedText style={styles.pageTitle}>🔥 Trending Now</ThemedText>
//           <ThemedText style={styles.pageSubtitle}>
//             {products.length} products available
//           </ThemedText>
//         </View>

//         {products.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <Feather name="shopping-bag" size={80} color="#ccc" />
//             <ThemedText style={styles.emptyTitle}>No Products Yet</ThemedText>
//             <ThemedText style={styles.emptyText}>
//               Click the Sell button to add your first product!
//             </ThemedText>
//           </View>
//         ) : (
//           <View style={styles.grid}>
//             {products.map((item) => (
//               <View key={item.id} style={styles.card}>
//                 <TouchableOpacity
//                   style={styles.wishlistIcon}
//                   onPress={() => toggleWishlist(item.id)}
//                 >
//                   <Ionicons
//                     name={
//                       wishlist.includes(item.id) ? "heart" : "heart-outline"
//                     }
//                     size={20}
//                     color={wishlist.includes(item.id) ? "#e53935" : "#999"}
//                   />
//                 </TouchableOpacity>

//                 <TouchableOpacity activeOpacity={0.9}>
//                   <Image
//                     source={{
//                       uri: `${BASE_URL}${item.image}?t=${new Date().getTime()}`,
//                     }}
//                     style={styles.productImage}
//                     resizeMode="cover"
//                   />
//                 </TouchableOpacity>

//                 <ThemedText style={styles.productName} numberOfLines={2}>
//                   {item.product_name}
//                 </ThemedText>

//                 <View style={styles.categoryBadge}>
//                   <ThemedText style={styles.categoryText}>
//                     {item.product_category}
//                   </ThemedText>
//                 </View>

//                 <View style={styles.ratingContainer}>
//                   <View style={styles.starsContainer}>
//                     {renderStars(Number(item.rating))}
//                   </View>
//                   <ThemedText style={styles.ratingText}>
//                     {item.rating} ({item.reviews} reviews)
//                   </ThemedText>
//                 </View>

//                 <ThemedText style={styles.price}>
//                   ₹{parseFloat(item.price).toFixed(2)}
//                 </ThemedText>

//                 <View style={styles.divider} />

//                 <View style={styles.row}>
//                   <View style={styles.rowItem}>
//                     <Feather name="package" size={12} color="#666" />
//                     <ThemedText style={styles.label}>Stock:</ThemedText>
//                     <ThemedText style={styles.stock}>
//                       {item.quantity}
//                     </ThemedText>
//                   </View>
//                   <View style={styles.rowItem}>
//                     <Feather name="trending-up" size={12} color="#1976d2" />
//                     <ThemedText style={styles.label}>Sold:</ThemedText>
//                     <ThemedText style={styles.sold}>{item.sold}+</ThemedText>
//                   </View>
//                 </View>

//                 <View style={styles.progressBg}>
//                   <View
//                     style={[
//                       styles.progressFill,
//                       {
//                         width: `${Math.min(
//                           ((item.sold || 1) /
//                             ((item.sold || 1) + item.quantity)) *
//                             100,
//                           100,
//                         )}%`,
//                       },
//                     ]}
//                   />
//                 </View>

//                 <View style={styles.actionButtons}>
//                   <TouchableOpacity
//                     style={[styles.actionBtn, styles.addToCartBtn]}
//                     onPress={() => addToCart(item.id)}
//                   >
//                     <MaterialIcons
//                       name="shopping-cart"
//                       size={16}
//                       color="#fff"
//                     />
//                     <ThemedText style={styles.btnText}>Cart</ThemedText>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     style={[styles.actionBtn, styles.buyNowBtn]}
//                     onPress={() => buyNow(item)}
//                   >
//                     <Ionicons name="flash" size={14} color="#fff" />
//                     <ThemedText style={styles.btnText}>Buy</ThemedText>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             ))}
//           </View>
//         )}
//       </ScrollView>

//       <TouchableOpacity
//         style={styles.fabButton}
//         onPress={() => setModalVisible(true)}
//       >
//         <Feather name="plus" size={24} color="#fff" />
//         <Text style={styles.fabText}>Sell</Text>
//       </TouchableOpacity>

//       <SellProductModal
//         visible={modalVisible}
//         onClose={() => setModalVisible(false)}
//         onProductAdded={handleProductAdded}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   mainContainer: { flex: 1, backgroundColor: "#f4f6f8" },
//   container: { padding: 12, paddingBottom: 80 },
//   headerContainer: { marginBottom: 16, paddingHorizontal: 4 },
//   pageTitle: { fontSize: 24, fontWeight: "bold", color: "#111" },
//   pageSubtitle: { fontSize: 14, color: "#666", marginTop: 4 },
//   grid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
//   card: {
//     width: "48.5%",
//     backgroundColor: "#ffffff",
//     borderRadius: 14,
//     padding: 12,
//     marginBottom: 12,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
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
//   categoryBadge: {
//     backgroundColor: "#e3f2fd",
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 12,
//     alignSelf: "flex-start",
//     marginBottom: 6,
//   },
//   categoryText: { fontSize: 10, color: "#1976d2", fontWeight: "600" },
//   ratingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 6,
//     gap: 6,
//   },
//   starsContainer: { flexDirection: "row", gap: 2 },
//   ratingText: { fontSize: 10, color: "#666" },
//   price: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#e53935",
//     marginBottom: 8,
//   },
//   divider: { height: 1, backgroundColor: "#eeeeee", marginVertical: 8 },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 6,
//   },
//   rowItem: { flexDirection: "row", alignItems: "center", gap: 4 },
//   label: { color: "#666", fontSize: 11, marginLeft: 2 },
//   stock: { color: "#4caf50", fontWeight: "700", fontSize: 12 },
//   sold: { color: "#1976d2", fontWeight: "700", fontSize: 12 },
//   progressBg: {
//     height: 4,
//     backgroundColor: "#eeeeee",
//     borderRadius: 10,
//     overflow: "hidden",
//     marginBottom: 10,
//   },
//   progressFill: { height: 4, backgroundColor: "#1976d2", borderRadius: 10 },
//   actionButtons: { flexDirection: "row", gap: 8, marginTop: 4 },
//   actionBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 4,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   addToCartBtn: { backgroundColor: "#ff9800" },
//   buyNowBtn: { backgroundColor: "#e53935" },
//   btnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f4f6f8",
//   },
//   loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//     minHeight: 400,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#333",
//     marginTop: 16,
//   },
//   emptyText: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 8 },
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
//     elevation: 5,
//     gap: 8,
//   },
//   fabText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
// });
