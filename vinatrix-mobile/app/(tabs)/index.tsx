// app/index.tsx

import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SellProductModal from "../../components/SellProductModal";
import BuyNowModal from "../../components/common/BuyNowModal";
import { ProductGrid } from "../../components/common/ProductGrid";
import { ThemedText } from "../../components/themed-text";
import { useCart } from "../../hooks/useCart";
import { useProducts } from "../../hooks/useProducts";
import { useWishlist } from "../../hooks/useWishlist";
import { Product } from "../../utils/types";
import { useTheme } from "./../context/ThemeContext";

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [version, setVersion] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const {
    products,
    loading: productsLoading,
    fetchProducts,
  } = useProducts("trending");
  const {
    wishlist,
    wishlistCount,
    loading: wishlistLoading,
    refreshing,
    setRefreshing,
    fetchWishlist,
    toggleWishlist,
  } = useWishlist();
  const { addToCart } = useCart();

  const [buyNowModalVisible, setBuyNowModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const loading = productsLoading || wishlistLoading;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProducts(), fetchWishlist(true)]);
    setRefreshing(false);
  }, [fetchProducts, fetchWishlist, setRefreshing]);

  const handleProductAdded = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setVersion((prev) => prev + 1);
    setRefreshing(false);
  }, [fetchProducts, setRefreshing]);

  const handleImageError = useCallback((productId: string, url: string) => {
    setFailedImages((prev) => new Set(prev).add(productId));
  }, []);

  const handleBuyNow = useCallback((product: Product) => {
    setSelectedProduct(product);
    setBuyNowModalVisible(true);
  }, []);

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

  return (
    <View style={[styles.mainContainer, isDark && styles.darkMainContainer]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={{ fontSize: 28 }}>🔥</Text>
              <ThemedText style={[styles.pageTitle, isDark && styles.darkText]}>
                Trending Now
              </ThemedText>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/wishlist")}
              style={styles.wishlistHeaderButton}
            >
              <Text style={{ fontSize: 22 }}>❤️</Text>
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

        <ProductGrid
          key={`trending-${version}`}
          products={products}
          wishlist={wishlist}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onWishlistToggle={toggleWishlist}
          onAddToCart={addToCart}
          onBuyNow={handleBuyNow}
          onImageError={handleImageError}
          failedImages={failedImages}
        />
      </ScrollView>

      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ fontSize: 24, color: "#fff" }}>➕</Text>
        <Text style={styles.fabText}>Sell</Text>
      </TouchableOpacity>

      <SellProductModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onProductAdded={handleProductAdded}
      />

      {selectedProduct && (
        <BuyNowModal
          visible={buyNowModalVisible}
          onClose={() => setBuyNowModalVisible(false)}
          product={selectedProduct}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#f4f6f8" },
  darkMainContainer: { backgroundColor: "#1a1a1a" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
  },
  darkLoadingContainer: { backgroundColor: "#1a1a1a" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  darkText: { color: "#fff" },
  darkSubtitle: { color: "#999" },
  headerContainer: { padding: 16, paddingBottom: 8 },
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
