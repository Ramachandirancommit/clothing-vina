// components/common/ProductList.tsx

import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Product } from "../../utils/types";
import { EmptyState } from "./EmptyState";
import { ProductCard } from "./ProductCard";

interface ProductListProps {
  products: Product[];
  wishlist: string[];
  refreshing: boolean;
  onRefresh: () => void;
  onWishlistToggle: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onImageError: (productId: string, url: string) => void;
  failedImages: Set<string>;
  horizontal?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  contentContainerStyle?: any;
  key?: string;
  numColumns?: number;
  ListHeaderComponent?: React.ReactNode;
  ListEmptyComponent?: React.ReactNode;
  isDark?: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  wishlist,
  refreshing,
  onRefresh,
  onWishlistToggle,
  onAddToCart,
  onBuyNow,
  onImageError,
  failedImages,
  horizontal = false,
  showsHorizontalScrollIndicator = false,
  contentContainerStyle,
  key,
  numColumns = 1,
  ListHeaderComponent,
  ListEmptyComponent,
  isDark = false,
}) => {
  const renderItem = ({ item }: { item: Product }) => {
    // For horizontal scroll, use a different width
    const cardStyle = horizontal ? styles.horizontalCard : styles.verticalCard;

    return (
      <View style={[styles.cardWrapper, cardStyle]}>
        <ProductCard
          product={item}
          isInWishlist={wishlist.includes(item.id)}
          onWishlistToggle={onWishlistToggle}
          onAddToCart={onAddToCart}
          onBuyNow={onBuyNow}
          onImageError={onImageError}
          hasImageError={failedImages.has(item.id)}
          horizontal={horizontal}
          isDark={isDark}
        />
      </View>
    );
  };

  return (
    <FlatList
      key={key || "default"}
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => `${item.id}-${key || "default"}`}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      numColumns={horizontal ? undefined : numColumns}
      contentContainerStyle={[
        styles.container,
        horizontal && styles.horizontalContainer,
        contentContainerStyle,
      ]}
      refreshControl={
        !horizontal ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        ListEmptyComponent || (
          <EmptyState
            icon="📦"
            title="No Products Found"
            message="No products available at the moment. Pull to refresh."
            isDark={isDark}
          />
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  horizontalContainer: {
    paddingHorizontal: 12,
  },
  cardWrapper: {
    margin: 4,
  },
  horizontalCard: {
    width: 200,
  },
  verticalCard: {
    flex: 1,
  },
});
