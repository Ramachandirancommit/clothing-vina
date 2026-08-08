// components/common/ProductCard.tsx

import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../app/context/ThemeContext";
import { PLACEHOLDER_IMAGE } from "../../utils/constants";
import { Product } from "../../utils/types";
import { ThemedText } from "../themed-text";

interface ProductCardProps {
  product: Product;
  isInWishlist: boolean;
  onWishlistToggle: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onImageError: (productId: string, url: string) => void;
  hasImageError: boolean;
  horizontal?: boolean;
  isDark?: boolean;
}

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = "⭐".repeat(fullStars);
  if (hasHalfStar) stars += "⭐";
  return <Text style={{ fontSize: 12, color: "#FFB800" }}>{stars}</Text>;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isInWishlist,
  onWishlistToggle,
  onAddToCart,
  onBuyNow,
  onImageError,
  hasImageError,
  horizontal = false,
  isDark: propIsDark = false,
}) => {
  const { isDark: contextIsDark } = useTheme();
  const isDark = propIsDark || contextIsDark;

  // Dynamic styles based on horizontal prop
  const cardStyles = [
    styles.card,
    isDark && styles.darkCard,
    horizontal && styles.horizontalCard,
  ];

  const imageStyles = [
    styles.productImage,
    horizontal && styles.horizontalImage,
  ];

  const actionButtonsStyles = [
    styles.actionButtons,
    horizontal && styles.horizontalActions,
  ];

  return (
    <View style={cardStyles}>
      {/* LEFT SIDE - 60% Image Section */}
      <View style={styles.imageSection}>
        <TouchableOpacity
          style={styles.wishlistIcon}
          onPress={() => onWishlistToggle(product)}
        >
          <Text style={{ fontSize: 20 }}>{isInWishlist ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>

        <View style={styles.trendingImageBadge}>
          <Text style={{ fontSize: 12, color: "#fff" }}>🔥</Text>
          <Text style={styles.trendingImageText}>Trending</Text>
        </View>

        <Image
          source={{ uri: hasImageError ? PLACEHOLDER_IMAGE : product.image }}
          style={imageStyles}
          resizeMode="cover"
          onError={() => onImageError(product.id, product.image)}
        />
      </View>

      {/* RIGHT SIDE - 40% Details Section */}
      <View style={styles.detailsSection}>
        <ThemedText
          style={[styles.productName, isDark && styles.darkText]}
          numberOfLines={1}
        >
          {product.product_name}
        </ThemedText>

        {/* Category Badge - Size badge removed */}
        <View style={styles.categoryBadge}>
          <ThemedText style={styles.categoryText}>
            {product.product_category}
          </ThemedText>
        </View>

        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            {renderStars(Number(product.rating))}
          </View>
          <ThemedText
            style={[styles.ratingText, isDark && styles.darkSubtitle]}
          >
            {product.rating} ({product.reviews} reviews)
          </ThemedText>
        </View>

        <ThemedText style={styles.price}>
          ₹{parseFloat(product.price).toFixed(2)}
        </ThemedText>

        <View style={[styles.divider, isDark && styles.darkDivider]} />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={{ fontSize: 12 }}>📦</Text>
            <ThemedText style={[styles.label, isDark && styles.darkSubtitle]}>
              Stock:
            </ThemedText>
            <ThemedText style={styles.stock}>{product.quantity}</ThemedText>
          </View>
          <View style={styles.rowItem}>
            <Text style={{ fontSize: 12 }}>📈</Text>
            <ThemedText style={[styles.label, isDark && styles.darkSubtitle]}>
              Sold:
            </ThemedText>
            <ThemedText style={styles.sold}>{product.sold}+</ThemedText>
          </View>
        </View>

        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(
                  ((product.sold || 1) /
                    ((product.sold || 1) + product.quantity)) *
                    100,
                  100,
                )}%`,
              },
            ]}
          />
        </View>

        <View style={actionButtonsStyles}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.addToCartBtn]}
            onPress={() => onAddToCart(product)}
          >
            <Text style={{ fontSize: 14, color: "#fff" }}>🛒</Text>
            <ThemedText style={styles.btnText}>+Cart</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.buyNowBtn]}
            onPress={() => onBuyNow(product)}
          >
            <Text style={{ fontSize: 14, color: "#fff" }}>⚡</Text>
            <ThemedText style={styles.btnText}>Buy</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 0,
    marginHorizontal: 12,
    marginVertical: 8,
    elevation: 2,
    overflow: "hidden",
    height: 200,
  },
  horizontalCard: {
    width: 350,
    marginRight: 8,
    height: 180,
  },
  darkCard: {
    backgroundColor: "#2a2a2a",
  },
  // Image section 60%
  imageSection: {
    width: "60%",
    height: "100%",
    position: "relative",
  },
  // Details section 40%
  detailsSection: {
    width: "40%",
    padding: 10,
    justifyContent: "center",
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
  productImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  horizontalImage: {
    height: "100%",
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  darkText: { color: "#fff" },
  darkSubtitle: { color: "#999" },
  // Category badge only - size badge removed
  categoryBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 9,
    color: "#1976d2",
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 4,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 1,
  },
  ratingText: {
    fontSize: 9,
    color: "#666",
  },
  price: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#e53935",
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginVertical: 4,
  },
  darkDivider: {
    backgroundColor: "#444",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  label: {
    color: "#666",
    fontSize: 9,
    marginLeft: 2,
  },
  stock: {
    color: "#4caf50",
    fontWeight: "700",
    fontSize: 10,
  },
  sold: {
    color: "#1976d2",
    fontWeight: "700",
    fontSize: 10,
  },
  progressBg: {
    height: 3,
    backgroundColor: "#eeeeee",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: 3,
    backgroundColor: "#1976d2",
    borderRadius: 10,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 6,
  },
  horizontalActions: {
    flexDirection: "column",
    gap: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 5,
    borderRadius: 6,
  },
  addToCartBtn: {
    backgroundColor: "#ff9800",
  },
  buyNowBtn: {
    backgroundColor: "#e53935",
  },
  btnText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});

export default ProductCard;
