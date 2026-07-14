// components/common/ProductGrid.tsx

import React from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Product } from "../../utils/types";
import { HorizontalProductCard } from "./HorizontalProductCard";

interface ProductGridProps {
  products: Product[];
  wishlist: string[];
  refreshing: boolean;
  onRefresh: () => void;
  onWishlistToggle: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onImageError: (productId: string, url: string) => void;
  failedImages: Set<string>;
  numColumns?: number;
  gridKey?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  wishlist,
  refreshing,
  onRefresh,
  onWishlistToggle,
  onAddToCart,
  onBuyNow,
  onImageError,
  failedImages,
  numColumns = 2,
  gridKey = "default",
}) => {
  // 📱 USE WINDOW DIMENSIONS HOOK - This updates automatically
  const { width } = useWindowDimensions();

  // 📱 RESPONSIVE BREAKPOINTS
  const getColumns = () => {
    // Mobile (phones) - 1 column
    if (width < 768) {
      return 1;
    }
    // Tablet and Desktop - 2 columns
    else {
      return numColumns || 2;
    }
  };

  const columns = getColumns();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  console.log(`📦 ProductGrid - ${products?.length || 0} products`);
  console.log(
    `📱 Width: ${width}px - ${isMobile ? "Mobile" : isTablet ? "Tablet" : "Desktop"} - ${columns} column(s)`,
  );

  if (!products || !Array.isArray(products)) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>⚠️</Text>
        <Text style={styles.emptyTitle}>Invalid Product Data</Text>
        <Text style={styles.emptySubtitle}>Please try again later</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📦</Text>
        <Text style={styles.emptyTitle}>No Products Found</Text>
        <Text style={styles.emptySubtitle}>
          Try adjusting your filters or search terms
        </Text>
      </View>
    );
  }

  // Group products into rows based on columns
  const getRows = () => {
    const rows = [];
    for (let i = 0; i < products.length; i += columns) {
      const rowProducts = products.slice(i, i + columns);
      rows.push(rowProducts);
    }
    return rows;
  };

  const rows = getRows();

  // Get card width based on device
  const getCardWidth = () => {
    if (isMobile) return "100%";
    return "48%";
  };

  // Force re-render when width changes
  const key = `${gridKey}-${columns}-${width}`;

  return (
    <FlatList
      key={key}
      data={rows}
      keyExtractor={(_, index) => `row-${index}-${key}`}
      renderItem={({ item: rowProducts, index }) => (
        <View style={styles.rowContainer}>
          {rowProducts.map((product, productIndex) => {
            const isWishlisted = wishlist.includes(product.id);
            const hasImageError = failedImages.has(product.id);

            return (
              <View
                key={`${product.id}-${index}-${productIndex}`}
                style={[styles.cardWrapper, { width: getCardWidth() }]}
              >
                <HorizontalProductCard
                  product={product}
                  isWishlisted={isWishlisted}
                  onWishlistToggle={onWishlistToggle}
                  onAddToCart={onAddToCart}
                  onBuyNow={onBuyNow}
                  onImageError={onImageError}
                  hasImageError={hasImageError}
                  isMobile={isMobile}
                  isTablet={isTablet}
                  isDesktop={isDesktop}
                />
              </View>
            );
          })}
          {/* Fill empty space if odd number of products */}
          {columns === 2 && rowProducts.length === 1 && (
            <View
              style={[
                styles.cardWrapper,
                { width: getCardWidth() },
                styles.emptyCard,
              ]}
            />
          )}
        </View>
      )}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#e53935"]}
          tintColor="#e53935"
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📦</Text>
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your filters or search terms
          </Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingBottom: 120,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  cardWrapper: {
    flex: 1,
  },
  emptyCard: {
    backgroundColor: "transparent",
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

export default ProductGrid;
