// components/common/ProductCard.tsx

import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../app/context/ThemeContext";
import { PLACEHOLDER_IMAGE, SIZE_COLORS } from "../../utils/constants";
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
}) => {
  const { isDark } = useTheme();

  return (
    <View style={[styles.card, isDark && styles.darkCard]}>
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
        style={styles.productImage}
        resizeMode="cover"
        onError={() => onImageError(product.id, product.image)}
      />

      <ThemedText
        style={[styles.productName, isDark && styles.darkText]}
        numberOfLines={2}
      >
        {product.product_name}
      </ThemedText>

      <View style={styles.categorySizeRow}>
        <View style={styles.categoryBadge}>
          <ThemedText style={styles.categoryText}>
            {product.product_category}
          </ThemedText>
        </View>
        <View
          style={[
            styles.sizeBadge,
            { backgroundColor: SIZE_COLORS[product.size] || "#666" },
          ]}
        >
          <Text style={styles.sizeText}>{product.size}</Text>
        </View>
      </View>

      <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>
          {renderStars(Number(product.rating))}
        </View>
        <ThemedText style={[styles.ratingText, isDark && styles.darkSubtitle]}>
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

      <View style={styles.actionButtons}>
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
  );
};

const styles = StyleSheet.create({
  card: {
    width: "25%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    position: "relative",
  },
  darkCard: {
    backgroundColor: "#2a2a2a",
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
    height: 140,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },
  darkText: { color: "#fff" },
  darkSubtitle: { color: "#999" },
  categorySizeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flex: 1,
  },
  categoryText: { fontSize: 10, color: "#1976d2", fontWeight: "600" },
  sizeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 45,
    alignItems: "center",
  },
  sizeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },
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
  darkDivider: { backgroundColor: "#444" },
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
});
