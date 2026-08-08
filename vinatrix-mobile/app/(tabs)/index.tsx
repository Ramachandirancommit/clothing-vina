// app/index.tsx - FIXED VERSION WITH STORAGE CLEAR

import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { storageService } from "../../services/storage";

import SellProductModal from "../../components/SellProductModal";
import BuyNowModal from "../../components/common/BuyNowModal";
import ProductGrid from "../../components/common/ProductGrid";
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

  // FIXED: Use the hook with proper options
  const {
    products,
    loading: productsLoading,
    refreshProducts,
    error: productsError,
  } = useProducts({
    sortBy: "popularity",
    sortOrder: "desc",
    limit: 20,
  });

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

  // =========================
  // TEMPORARY: Clear storage to test new device ID logic
  // REMOVE THIS AFTER TESTING
  // =========================
  useEffect(() => {
    const resetStorage = async () => {
      await storageService.clearAll();
      console.log("🗑️ Storage cleared - Starting fresh with new device ID");
      const allData = await storageService.getAllData();
      console.log("📦 Storage after clear:", allData);
    };

    resetStorage();
  }, []);

  // =========================
  // DEBUG: Check user ID on home screen
  // =========================
  useEffect(() => {
    const checkUserId = async () => {
      const userId = await storageService.getUserId();
      console.log("🏠 Home Screen - Current User ID:", userId);
    };
    checkUserId();
  }, []);

  // FIXED: Use refreshProducts instead of fetchProducts
  const onRefresh = useCallback(async () => {
    console.log("🔄 HomeScreen - Pull to refresh");
    setRefreshing(true);
    try {
      await Promise.all([refreshProducts(), fetchWishlist(true)]);
      console.log("✅ HomeScreen - Refresh completed");
    } catch (error) {
      console.error("❌ HomeScreen - Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshProducts, fetchWishlist, setRefreshing]);

  // FIXED: Use refreshProducts instead of fetchProducts
  const handleProductAdded = useCallback(async () => {
    console.log("🔄 HomeScreen - Product added, refreshing...");
    setRefreshing(true);
    try {
      await refreshProducts();
      setVersion((prev) => prev + 1);
      console.log("✅ HomeScreen - Product refresh completed");
    } catch (error) {
      console.error("❌ HomeScreen - Product refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshProducts, setRefreshing]);

  const handleImageError = useCallback((productId: string, url: string) => {
    setFailedImages((prev) => new Set(prev).add(productId));
  }, []);

  const handleBuyNow = useCallback((product: Product) => {
    setSelectedProduct(product);
    setBuyNowModalVisible(true);
  }, []);

  // ADDED: Log products for debugging
  useEffect(() => {
    console.log("📊 HomeScreen - Products:", products?.length || 0);
    console.log("📊 HomeScreen - Loading:", loading);
    console.log("📊 HomeScreen - Error:", productsError);
  }, [products, loading, productsError]);

  // FIXED: Only show loading if loading AND no products
  if (loading && products.length === 0) {
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

  // ADDED: Error state
  if (productsError && products.length === 0) {
    return (
      <View
        style={[styles.loadingContainer, isDark && styles.darkLoadingContainer]}
      >
        <Text style={[styles.errorText, isDark && styles.darkText]}>
          ⚠️ {productsError}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
            {/* ❌ HEART ICON REMOVED */}
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

  errorText: {
    fontSize: 16,
    color: "#e53935",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#e53935",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

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
