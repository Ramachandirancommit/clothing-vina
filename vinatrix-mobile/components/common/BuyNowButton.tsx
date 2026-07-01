// components/common/BuyNowButton.tsx

import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";

interface BuyNowButtonProps {
  onPress: () => void;
  price?: number;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
}

export const BuyNowButton: React.FC<BuyNowButtonProps> = ({
  onPress,
  price,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "medium",
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    switch (variant) {
      case "primary":
        baseStyle.push(styles.primaryButton);
        break;
      case "secondary":
        baseStyle.push(styles.secondaryButton);
        break;
      case "outline":
        baseStyle.push(styles.outlineButton);
        break;
    }
    switch (size) {
      case "small":
        baseStyle.push(styles.smallButton);
        break;
      case "large":
        baseStyle.push(styles.largeButton);
        break;
    }
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];
    switch (variant) {
      case "outline":
        baseStyle.push(styles.outlineText);
        break;
      default:
        baseStyle.push(styles.primaryText);
        break;
    }
    switch (size) {
      case "small":
        baseStyle.push(styles.smallText);
        break;
      case "large":
        baseStyle.push(styles.largeText);
        break;
    }
    return baseStyle;
  };

  const getLabel = () => {
    if (loading) return "Processing...";
    if (price !== undefined) {
      return `Buy Now • ₹${price.toFixed(2)}`;
    }
    return "Buy Now";
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Text style={{ fontSize: size === "small" ? 12 : 14 }}>⚡</Text>
          <Text style={getTextStyle()}>{getLabel()}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    gap: 4,
  },
  primaryButton: {
    backgroundColor: "#e53935",
  },
  secondaryButton: {
    backgroundColor: "#ff9800",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e53935",
  },
  disabled: {
    opacity: 0.5,
  },
  smallButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mediumButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  largeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    fontWeight: "600",
  },
  primaryText: {
    color: "#fff",
  },
  outlineText: {
    color: "#e53935",
  },
  smallText: {
    fontSize: 10,
  },
  largeText: {
    fontSize: 16,
  },
});
