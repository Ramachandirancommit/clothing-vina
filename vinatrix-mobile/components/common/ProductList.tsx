// components/common/ProductList.tsx

import React, { useCallback, useMemo } from "react";
import {
    FlatList,
    ListRenderItem,
    RefreshControl,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";
import { EmptyState } from "../../components/common/EmptyState";
import { Product } from "../../utils/types";
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
  contentContainerStyle?: StyleProp<ViewStyle>;
  gridKey?: string;
  numColumns?: number;
  ListHeaderComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement | null;
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
  gridKey = "default",
  numColumns = 1,
  ListHeaderComponent,
  ListEmptyComponent,
  isDark = false,
}) => {
  // Memoize wishlist as a Set for faster lookups
  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist]);

  // Memoize render item with proper typing
  const renderItem: ListRenderItem<Product> = useCallback(
    ({ item }) => {
      // For horizontal scroll, use a different width
      const cardStyle = horizontal
        ? styles.horizontalCard
        : styles.verticalCard;

      return (
        <View style={[styles.cardWrapper, cardStyle]}>
          <ProductCard
            product={item}
            isInWishlist={wishlistSet.has(item.id)}
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
    },
    [
      wishlistSet,
      horizontal,
      onWishlistToggle,
      onAddToCart,
      onBuyNow,
      onImageError,
      failedImages,
      isDark,
    ],
  );

  // Memoize key extractor
  const keyExtractor = useCallback(
    (item: Product) => `${item.id}-${gridKey}`,
    [gridKey],
  );

  // Memoize empty component
  const defaultEmptyComponent = useMemo(
    () => (
      <EmptyState
        icon="📦"
        title="No Products Found"
        message="No products available at the moment. Pull to refresh."
        isDark={isDark}
      />
    ),
    [isDark],
  );

  const emptyComponent = ListEmptyComponent || defaultEmptyComponent;

  // Memoize refresh control (only for vertical lists)
  const refreshControl = useMemo(
    () =>
      !horizontal ? (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#e53935"]}
          tintColor={isDark ? "#fff" : "#e53935"}
        />
      ) : undefined,
    [horizontal, refreshing, onRefresh, isDark],
  );

  // Memoize content container style
  const containerStyle = useMemo(
    () => [
      styles.container,
      horizontal && styles.horizontalContainer,
      contentContainerStyle,
    ],
    [horizontal, contentContainerStyle],
  );

  // Calculate column wrapper style for vertical grid
  const columnWrapperStyle = useMemo(
    () => (numColumns > 1 ? styles.columnWrapper : undefined),
    [numColumns],
  );

  return (
    <FlatList
      key={gridKey}
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      numColumns={horizontal ? undefined : numColumns}
      contentContainerStyle={containerStyle}
      columnWrapperStyle={columnWrapperStyle}
      refreshControl={refreshControl}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={emptyComponent}
      showsVerticalScrollIndicator={!horizontal}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={6}
      getItemLayout={
        horizontal
          ? (data, index) => ({
              length: 220, // Card width + margin
              offset: 220 * index,
              index,
            })
          : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  } as ViewStyle,
  horizontalContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  } as ViewStyle,
  columnWrapper: {
    justifyContent: "space-between",
    gap: 8,
  } as ViewStyle,
  cardWrapper: {
    margin: 4,
  } as ViewStyle,
  horizontalCard: {
    width: 200,
  } as ViewStyle,
  verticalCard: {
    flex: 1,
  } as ViewStyle,
});

export default ProductList;
