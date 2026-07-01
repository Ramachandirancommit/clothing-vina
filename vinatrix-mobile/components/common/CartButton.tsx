// components/common/CartButton.tsx

import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface CartButtonProps {
  onPress: () => void;
  count?: number;
  loading?: boolean;
  disabled?: boolean;
  size?: number;
  showCount?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

export const CartButton: React.FC<CartButtonProps> = ({
  onPress,
  count = 0,
  loading = false,
  disabled = false,
  size = 20,
  showCount = true,
  variant = "primary",
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return styles.primaryButton;
      case "secondary":
        return styles.secondaryButton;
      case "outline":
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "outline":
        return styles.outlineText;
      default:
        return styles.buttonText;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, getButtonStyle(), disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Text style={{ fontSize: size }}>🛒</Text>
          <Text style={[styles.text, getTextStyle()]}>Add to Cart</Text>
          {showCount && count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    position: "relative",
  },
  primaryButton: {
    backgroundColor: "#ff9800",
  },
  secondaryButton: {
    backgroundColor: "#e53935",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e53935",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 2,
  },
  buttonText: {
    color: "#fff",
  },
  outlineText: {
    color: "#e53935",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#e53935",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
