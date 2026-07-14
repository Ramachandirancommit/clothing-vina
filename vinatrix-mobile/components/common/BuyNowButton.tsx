// components/common/BuyNowButton.tsx

import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
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
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button];

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: styles.primaryButton,
      secondary: styles.secondaryButton,
      outline: styles.outlineButton,
    };

    if (variantStyles[variant]) {
      baseStyle.push(variantStyles[variant]);
    }

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: styles.smallButton,
      medium: styles.mediumButton,
      large: styles.largeButton,
    };

    if (sizeStyles[size]) {
      baseStyle.push(sizeStyles[size]);
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.text];

    // Variant text styles
    if (variant === "outline") {
      baseStyle.push(styles.outlineText);
    } else {
      baseStyle.push(styles.primaryText);
    }

    // Size text styles
    const sizeTextStyles: Record<string, TextStyle> = {
      small: styles.smallText,
      medium: styles.mediumText,
      large: styles.largeText,
    };

    if (sizeTextStyles[size]) {
      baseStyle.push(sizeTextStyles[size]);
    }

    return baseStyle;
  };

  const getLabel = (): string => {
    if (loading) return "Processing...";
    if (price !== undefined && price !== null) {
      return `Buy Now • ₹${price.toFixed(2)}`;
    }
    return "Buy Now";
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <>
          <Text style={styles.iconText}>⚡</Text>
          <Text style={getTextStyle()}>{getLabel()}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base button styles
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    gap: 6,
  } as ViewStyle,

  // Variant styles
  primaryButton: {
    backgroundColor: "#e53935",
  } as ViewStyle,

  secondaryButton: {
    backgroundColor: "#ff9800",
  } as ViewStyle,

  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#e53935",
  } as ViewStyle,

  // Size styles
  smallButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 32,
  } as ViewStyle,

  mediumButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
  } as ViewStyle,

  largeButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 48,
  } as ViewStyle,

  // Disabled state
  disabled: {
    opacity: 0.5,
  } as ViewStyle,

  // Text styles
  text: {
    fontWeight: "600",
    textAlign: "center",
  } as TextStyle,

  primaryText: {
    color: "#ffffff",
  } as TextStyle,

  outlineText: {
    color: "#e53935",
  } as TextStyle,

  // Text size styles
  smallText: {
    fontSize: 11,
  } as TextStyle,

  mediumText: {
    fontSize: 14,
  } as TextStyle,

  largeText: {
    fontSize: 16,
  } as TextStyle,

  // Icon styles
  iconText: {
    fontSize: 14,
  } as TextStyle,
});
