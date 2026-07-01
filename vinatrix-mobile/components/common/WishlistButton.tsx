// components/common/WishlistButton.tsx

import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";

interface WishlistButtonProps {
  isInWishlist: boolean;
  onToggle: () => void;
  size?: number;
  loading?: boolean;
  disabled?: boolean;
  showText?: boolean;
  textStyle?: any;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  isInWishlist,
  onToggle,
  size = 24,
  loading = false,
  disabled = false,
  showText = false,
  textStyle,
}) => {
  const iconSize = size;
  const heartColor = isInWishlist ? "#e53935" : "#999";

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isInWishlist && styles.activeContainer,
        disabled && styles.disabled,
      ]}
      onPress={onToggle}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#e53935" />
      ) : (
        <>
          <Text style={{ fontSize: iconSize, color: heartColor }}>
            {isInWishlist ? "❤️" : "🤍"}
          </Text>
          {showText && (
            <Text style={[styles.text, textStyle]}>
              {isInWishlist ? "Remove" : "Add to Wishlist"}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    gap: 4,
  },
  activeContainer: {
    backgroundColor: "#ffebee",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
});
