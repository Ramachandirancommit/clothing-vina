// components/common/HorizontalProductCard.tsx - COMPLETE FINAL VERSION

import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Product } from "../../utils/types";

interface HorizontalProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onWishlistToggle: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onImageError: (productId: string, url: string) => void;
  hasImageError: boolean;
  isMobile?: boolean;
  isTablet?: boolean;
  isDesktop?: boolean;
}

export const HorizontalProductCard: React.FC<HorizontalProductCardProps> = ({
  product,
  isWishlisted,
  onWishlistToggle,
  onAddToCart,
  onBuyNow,
  onImageError,
  hasImageError,
  isMobile = false,
  isTablet = false,
  isDesktop = false,
}) => {
  const [localImageError, setLocalImageError] = useState(false);

  // Helper function to get clean image URL
  const getImageUrl = (imagePath: string | null | undefined): string | null => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return imagePath;
  };

  const imageUrl = getImageUrl(
    product.product_image ||
      product.image ||
      product.images?.[0] ||
      "https://pub-9370fc1d39014a0982f66c754476d059.r2.dev/placeholder.jpg",
  );

  const showError = hasImageError || localImageError;

  // Get price as number
  const getPriceValue = (price: any): number => {
    if (typeof price === "number") return price;
    if (typeof price === "string") return parseFloat(price) || 0;
    return 0;
  };

  const priceValue = getPriceValue(product.price || product.selling_price);

  // Get rating as number
  const getRatingValue = (rating: any): number => {
    if (typeof rating === "number") return rating;
    if (typeof rating === "string") return parseFloat(rating) || 0;
    return 0;
  };

  const ratingValue = getRatingValue(product.rating || product.averageRating);
  const reviewCount = product.reviewCount || product.reviews?.length || 0;

  // Render stars
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Text key={i} style={styles.starFilled}>
            ★
          </Text>,
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Text key={i} style={styles.starHalf}>
            ★
          </Text>,
        );
      } else {
        stars.push(
          <Text key={i} style={styles.starEmpty}>
            ★
          </Text>,
        );
      }
    }
    return stars;
  };

  // 📱 Responsive sizes based on device
  const getCardHeight = () => {
    if (isMobile) return 130;
    if (isTablet) return 160;
    return 180;
  };

  const getFontSizeName = () => {
    if (isMobile) return 13;
    if (isTablet) return 14;
    return 15;
  };

  const getFontSizePrice = () => {
    if (isMobile) return 14;
    if (isTablet) return 16;
    return 17;
  };

  const getFontSizeSmall = () => {
    if (isMobile) return 10;
    if (isTablet) return 11;
    return 12;
  };

  const cardHeight = getCardHeight();
  const fontSizeName = getFontSizeName();
  const fontSizePrice = getFontSizePrice();
  const fontSizeSmall = getFontSizeSmall();

  return (
    <View style={[styles.card, { height: cardHeight }]}>
      {/* ✅ Left Side - Image (30%) */}
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => onBuyNow(product)}
        activeOpacity={0.9}
      >
        {imageUrl && !showError ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
            onError={() => {
              setLocalImageError(true);
              onImageError(product.id, imageUrl);
            }}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📸</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ✅ Right Side - Content (70%) */}
      <View style={styles.contentContainer}>
        {/* ✅ Product Name */}
        <TouchableOpacity onPress={() => onBuyNow(product)}>
          <Text
            style={[styles.productName, { fontSize: fontSizeName }]}
            numberOfLines={2}
          >
            {product.product_name || product.name}
          </Text>
        </TouchableOpacity>

        {/* ✅ Price */}
        <Text style={[styles.productPrice, { fontSize: fontSizePrice }]}>
          ₹{priceValue.toFixed(2)}
        </Text>

        {/* ✅ Review Stars */}
        <View style={styles.reviewContainer}>
          <View style={styles.starsContainer}>{renderStars(ratingValue)}</View>
          <Text style={[styles.reviewCount, { fontSize: fontSizeSmall }]}>
            ({reviewCount})
          </Text>
        </View>

        {/* ✅ Action Buttons - INSIDE CARD at Bottom */}
        <View style={styles.actionButtonsContainer}>
          {/* ✅ Heart Icon - Add to Wishlist */}
          <TouchableOpacity
            style={[styles.actionButton, styles.wishlistButton]}
            onPress={() => onWishlistToggle(product)}
            activeOpacity={0.7}
          >
            <Feather
              name="heart"
              size={isMobile ? 14 : 16}
              color={isWishlisted ? "#e53935" : "#999"}
            />
            <Text
              style={[
                styles.actionButtonText,
                { fontSize: fontSizeSmall },
                isWishlisted && styles.wishlistActiveText,
              ]}
            >
              Wishlist
            </Text>
          </TouchableOpacity>

          {/* ✅ Cart Icon - Add to Cart */}
          <TouchableOpacity
            style={[styles.actionButton, styles.cartButton]}
            onPress={() => onAddToCart(product)}
            activeOpacity={0.7}
          >
            <Feather
              name="shopping-cart"
              size={isMobile ? 12 : 14}
              color="#fff"
            />
            <Text style={[styles.cartButtonText, { fontSize: fontSizeSmall }]}>
              Add to Cart
            </Text>
          </TouchableOpacity>

          {/* ✅ Buy Icon - Buy Now */}
          <TouchableOpacity
            style={[styles.actionButton, styles.buyButton]}
            onPress={() => onBuyNow(product)}
            activeOpacity={0.7}
          >
            <Feather
              name="credit-card"
              size={isMobile ? 12 : 14}
              color="#fff"
            />
            <Text style={[styles.buyButtonText, { fontSize: fontSizeSmall }]}>
              Buy Now
            </Text>
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
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 0,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  // ✅ Left Side - Image (30%)
  imageContainer: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    alignSelf: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  placeholderText: {
    fontSize: 30,
  },

  // ✅ Right Side - Content (70%)
  contentContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  productName: {
    fontWeight: "600",
    color: "#333",
    lineHeight: 18,
    marginBottom: 2,
  },
  productPrice: {
    fontWeight: "bold",
    color: "#e53935",
    marginBottom: 2,
  },

  // ✅ Review Stars
  reviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starFilled: {
    color: "#FFD700",
    fontSize: 12,
    marginRight: 1,
  },
  starHalf: {
    color: "#FFD700",
    fontSize: 12,
    marginRight: 1,
  },
  starEmpty: {
    color: "#ddd",
    fontSize: 12,
    marginRight: 1,
  },
  reviewCount: {
    color: "#999",
    marginLeft: 4,
  },

  // ✅ Action Buttons - INSIDE CARD at Bottom
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    gap: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    flex: 1,
  },
  actionButtonText: {
    color: "#666",
    marginLeft: 2,
    fontWeight: "500",
  },

  // ✅ Wishlist Button
  wishlistButton: {
    backgroundColor: "#f5f5f5",
    flex: 1,
  },
  wishlistActiveText: {
    color: "#e53935",
  },

  // ✅ Cart Button
  cartButton: {
    backgroundColor: "#e53935",
    flex: 1.2,
  },
  cartButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 2,
  },

  // ✅ Buy Button
  buyButton: {
    backgroundColor: "#2e7d32",
    flex: 1,
  },
  buyButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 2,
  },
});

export default HorizontalProductCard;
