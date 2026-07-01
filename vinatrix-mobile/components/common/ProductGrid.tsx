// components/common/ProductGrid.tsx

import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Product } from "../../utils/types";
import { ProductCard } from "./ProductCard";

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
  key?: string;
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
  key,
}) => {
  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      isInWishlist={wishlist.includes(item.id)}
      onWishlistToggle={onWishlistToggle}
      onAddToCart={onAddToCart}
      onBuyNow={onBuyNow}
      onImageError={onImageError}
      hasImageError={failedImages.has(item.id)}
    />
  );

  return (
    <FlatList
      key={key || "default"}
      data={products}
      renderItem={renderItem}
      numColumns={numColumns}
      keyExtractor={(item) => `${item.id}-${key || "default"}`}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.columnWrapper}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 80 }}>📦</Text>
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingBottom: 120,
    paddingTop: 0,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  emptyContainer: {
    padding: 50,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: "#999",
  },
});
