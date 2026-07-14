// app/explore.tsx - CLEAN VERSION (~420 lines)

import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BuyNowModal } from "../../components/common/BuyNowModal";
import { ProductGrid } from "../../components/common/ProductGrid";
import SellProductModal from "../../components/SellProductModal";
import { ThemedText } from "../../components/themed-text";
import { useCart } from "../../hooks/useCart";
import { useProducts } from "../../hooks/useProducts";
import { useWishlist } from "../../hooks/useWishlist";
import { Product } from "../../utils/types";
import { useTheme } from "./../context/ThemeContext";

// Category icons mapping - using emojis
const categoryIcons: Record<string, string> = {
  Tshirt: "👕",
  Shirt: "👔",
  Pant: "👖",
  Track: "🏃",
  "Jeans Pant": "👖",
  "Party Wears": "🎉",
  "Colorful Picks": "🌈",
  All: "📦",
};

const allCategories = [
  "All",
  "Tshirt",
  "Shirt",
  "Pant",
  "Track",
  "Jeans Pant",
  "Party Wears",
  "Colorful Picks",
];

export default function ExploreScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [version, setVersion] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Custom hooks
  const {
    products,
    loading: productsLoading,
    refreshProducts,
    error: productsError,
  } = useProducts({
    sortBy: "popularity",
    sortOrder: "desc",
    limit: 50,
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

  // Buy Now Modal State
  const [buyNowModalVisible, setBuyNowModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const loading = productsLoading || wishlistLoading;

  // 📱 Responsive columns
  const isMobile = width < 768;
  const numColumns = isMobile ? 1 : 2;

  console.log(`📱 Explore - Width: ${width}, Columns: ${numColumns}`);

  // Filter products by category
  const filteredProducts = React.useMemo(() => {
    if (!products || !Array.isArray(products) || products.length === 0) {
      return [];
    }
    if (selectedCategory === "All") {
      return products;
    }
    return products.filter(
      (product) => product.product_category === selectedCategory,
    );
  }, [products, selectedCategory]);

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
    console.log("🔄 Explore - Pull to refresh");
    setRefreshing(true);
    try {
      await Promise.all([refreshProducts(), fetchWishlist(true)]);
      console.log("✅ Explore - Refresh completed");
    } catch (error) {
      console.error("❌ Explore - Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshProducts, fetchWishlist, setRefreshing]);

  // Handle product added from Sell modal
  const handleProductAdded = useCallback(async () => {
    console.log("🔄 Explore - Product added, refreshing...");
    setRefreshing(true);
    try {
      await refreshProducts();
      setVersion((prev) => prev + 1);
      console.log("✅ Explore - Product refresh completed");
    } catch (error) {
      console.error("❌ Explore - Product refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshProducts, setRefreshing]);

  // Render horizontal category item
  const renderCategoryItem = (category: string) => {
    const isActive = selectedCategory === category;

    return (
      <Pressable
        key={category}
        style={({ pressed }) => [
          styles.categoryItem,
          isActive && styles.categoryItemActive,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => handleCategoryPress(category)}
      >
        <Text style={styles.categoryEmoji}>
          {categoryIcons[category] || "📦"}
        </Text>
        <Text
          style={[
            styles.categoryLabel,
            isActive && styles.categoryLabelActive,
            isDark && styles.darkCategoryLabel,
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
        {isActive && <View style={styles.activeIndicator} />}
      </Pressable>
    );
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      console.log("🚀 Explore - Loading initial data...");
      try {
        await Promise.all([refreshProducts(), fetchWishlist(true)]);
        console.log("✅ Explore - Initial data loaded");
      } catch (error) {
        console.error("❌ Explore - Initial load failed:", error);
      }
    };
    loadData();
  }, []);

  // Show loading state
  if (loading && products.length === 0) {
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

  // Show error state
  if (productsError && products.length === 0) {
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
          <Text style={[styles.errorText, isDark && styles.darkText]}>
            ⚠️ {productsError}
          </Text>
          <Pressable style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
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
        {/* Top Horizontal Category Filter */}
        <View
          style={[styles.categoryHeader, isDark && styles.darkCategoryHeader]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {allCategories.map((category) => renderCategoryItem(category))}
          </ScrollView>
        </View>

        {/* ✅ Using ProductGrid Component */}
        <ProductGrid
          key={`explore-${version}-${selectedCategory}`}
          products={filteredProducts}
          wishlist={wishlist}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onWishlistToggle={toggleWishlist}
          onAddToCart={addToCart}
          onBuyNow={handleBuyNow}
          onImageError={handleImageError}
          failedImages={failedImages}
          numColumns={numColumns}
          gridKey={`explore-${selectedCategory}`}
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

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#f4f6f8" },
  darkMainContainer: { backgroundColor: "#1a1a1a" },
  mainLayout: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  darkLoadingContainer: { backgroundColor: "#1a1a1a" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  darkText: { color: "#fff" },
  darkSubtitle: { color: "#999" },

  // Error styles
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

  // Category Header - Top Horizontal
  categoryHeader: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    zIndex: 10,
  },
  darkCategoryHeader: {
    backgroundColor: "#2a2a2a",
    borderBottomColor: "#444",
  },
  categoryScrollContent: {
    paddingHorizontal: 12,
    gap: 4,
  },
  categoryItem: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 4,
    position: "relative",
  },
  categoryItemActive: {
    backgroundColor: "#ffebee",
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  categoryLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  categoryLabelActive: {
    color: "#e53935",
    fontWeight: "700",
  },
  darkCategoryLabel: {
    color: "#999",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: "30%",
    right: "30%",
    height: 3,
    backgroundColor: "#e53935",
    borderRadius: 2,
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
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 6,
  },
});
