// components/common/HorizontalProductCard.tsx

import React from "react";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
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
  // Get image URL
  const imageUrl =
    product.product_image ||
    product.image ||
    "https://pub-9370fc1d39014a0982f66c754476d059.r2.dev/placeholder.jpg";

  // Get price as number
  const getPriceValue = (price: any): number => {
    if (typeof price === "number") return price;
    if (typeof price === "string") return parseFloat(price) || 0;
    return 0;
  };

  const priceValue = getPriceValue(product.price);

  // Get rating as number
  const getRatingValue = (rating: any): number => {
    if (typeof rating === "number") return rating;
    if (typeof rating === "string") return parseFloat(rating) || 0;
    return 0;
  };

  const ratingValue = getRatingValue(product.rating);

  // Render stars
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = "";
    for (let i = 0; i < fullStars; i++) stars += "⭐";
    if (hasHalfStar) stars += "⭐";
    if (stars === "") stars = "☆";
    return <Text style={styles.starsText}>{stars}</Text>;
  };

  // Color options (example - you can make this dynamic based on product)
  const getColorOptions = () => {
    const colors = ["#000000", "#0000FF", "#FF0000", "#808080", "#8B4513"];
    return colors.slice(0, 4);
  };

  // 📱 Responsive sizes based on device
  const getCardHeight = () => {
    if (isMobile) return 150;
    if (isTablet) return 200;
    return 220;
  };

  const getImageHeight = () => {
    if (isMobile) return "60%";
    if (isTablet) return "70%";
    return "75%";
  };

  const getButtonHeight = () => {
    if (isMobile) return "40%";
    if (isTablet) return "30%";
    return "25%";
  };

  const getFontSizeName = () => {
    if (isMobile) return 13;
    if (isTablet) return 15;
    return 16;
  };

  const getFontSizePrice = () => {
    if (isMobile) return 15;
    if (isTablet) return 17;
    return 18;
  };

  const getFontSizeSmall = () => {
    if (isMobile) return 10;
    if (isTablet) return 11;
    return 12;
  };

  const getPaddingRight = () => {
    if (isMobile) return 8;
    if (isTablet) return 10;
    return 12;
  };

  const getLeftWidth = () => {
    if (isMobile) return "30%";
    if (isTablet) return "33%";
    return "35%";
  };

  const getRightWidth = () => {
    if (isMobile) return "70%";
    if (isTablet) return "67%";
    return "65%";
  };

  const cardHeight = getCardHeight();
  const imageHeight = getImageHeight();
  const buttonHeight = getButtonHeight();
  const fontSizeName = getFontSizeName();
  const fontSizePrice = getFontSizePrice();
  const fontSizeSmall = getFontSizeSmall();
  const paddingRight = getPaddingRight();
  const leftWidth = getLeftWidth();
  const rightWidth = getRightWidth();

  return (
    <View style={[styles.card, { height: cardHeight }]}>
      {/* Left Section - Image & Buttons */}
      <View style={[styles.leftSection, { width: leftWidth }]}>
        <Image
          source={{ uri: imageUrl }}
          style={[styles.productImage, { height: imageHeight }]}
          resizeMode="cover"
          onError={() => {
            onImageError(product.id, imageUrl);
          }}
        />

        {hasImageError && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              onImageError(product.id, imageUrl);
            }}
          >
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        )}

        {/* Action Buttons at bottom of image */}
        <View style={[styles.actionButtonsContainer, { height: buttonHeight }]}>
          <Pressable
            style={[styles.actionBtn, styles.wishlistBtn]}
            onPress={() => onWishlistToggle(product)}
          >
            <Text
              style={[styles.actionEmoji, isMobile && styles.actionEmojiMobile]}
            >
              {isWishlisted ? "❤️" : "🤍"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, styles.cartBtn]}
            onPress={() => onAddToCart(product)}
          >
            <Text
              style={[styles.actionEmoji, isMobile && styles.actionEmojiMobile]}
            >
              🛒
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, styles.buyBtn]}
            onPress={() => onBuyNow(product)}
          >
            <Text
              style={[styles.actionEmoji, isMobile && styles.actionEmojiMobile]}
            >
              ⚡
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Right Section - Product Details */}
      <View
        style={[
          styles.rightSection,
          { width: rightWidth, padding: paddingRight },
        ]}
      >
        <Text
          style={[styles.productName, { fontSize: fontSizeName }]}
          numberOfLines={1}
        >
          {product.product_name}
        </Text>

        {/* Color */}
        <View style={styles.colorContainer}>
          <Text style={[styles.colorLabel, { fontSize: fontSizeSmall }]}>
            Color:
          </Text>
          <View style={styles.colorOptions}>
            {getColorOptions().map((color, index) => (
              <View
                key={index}
                style={[
                  styles.colorDot,
                  {
                    backgroundColor: color,
                    width: isMobile ? 12 : 14,
                    height: isMobile ? 12 : 14,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Description - Hide on mobile to save space */}
        {!isMobile && (
          <Text
            style={[styles.description, { fontSize: fontSizeSmall }]}
            numberOfLines={1}
          >
            {product.description || "High quality product"}
          </Text>
        )}

        {/* Price */}
        <Text style={[styles.price, { fontSize: fontSizePrice }]}>
          ₹{priceValue.toFixed(2)}
        </Text>

        {/* Orders - Hide on mobile to save space */}
        {!isMobile && (
          <Text style={[styles.orders, { fontSize: fontSizeSmall }]}>
            Orders: {product.sold || 0}
          </Text>
        )}

        {/* Rating and Reviews */}
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>{renderStars(ratingValue)}</View>
          <Text style={[styles.ratingText, { fontSize: fontSizeSmall }]}>
            ({ratingValue.toFixed(1)}) {product.reviews || 0}
            {!isMobile && " reviews"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3.84,
    elevation: 3,
  },
  // Left Section
  leftSection: {
    position: "relative",
    backgroundColor: "#f8f8f8",
  },
  productImage: {
    width: "100%",
    backgroundColor: "#f0f0f0",
  },
  retryButton: {
    position: "absolute",
    top: "35%",
    left: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 4,
    borderRadius: 4,
    alignItems: "center",
  },
  retryText: {
    color: "#fff",
    fontSize: 9,
  },
  // Action Buttons at bottom of image
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 4,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 28,
  },
  actionEmoji: {
    fontSize: 16,
  },
  actionEmojiMobile: {
    fontSize: 12,
  },
  wishlistBtn: {
    backgroundColor: "#fff0f0",
  },
  cartBtn: {
    backgroundColor: "#fff3e0",
  },
  buyBtn: {
    backgroundColor: "#e8f5e9",
  },

  // Right Section
  rightSection: {
    justifyContent: "space-between",
  },
  productName: {
    fontWeight: "700",
    color: "#111",
    marginBottom: 1,
  },
  colorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 1,
  },
  colorLabel: {
    color: "#666",
    marginRight: 4,
  },
  colorOptions: {
    flexDirection: "row",
    gap: 4,
  },
  colorDot: {
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  description: {
    color: "#666",
    marginBottom: 1,
    lineHeight: 14,
  },
  price: {
    fontWeight: "bold",
    color: "#e53935",
    marginBottom: 1,
  },
  orders: {
    color: "#666",
    marginBottom: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 4,
  },
  starsText: {
    fontSize: 10,
    color: "#FFB800",
  },
  ratingText: {
    color: "#666",
  },
});

export default HorizontalProductCard;
