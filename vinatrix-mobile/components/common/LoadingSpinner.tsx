// components/common/LoadingSpinner.tsx

import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  text?: string;
  fullScreen?: boolean;
  isDark?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  color = "#e53935",
  text = "Loading...",
  fullScreen = false,
  isDark = false,
}) => {
  const containerStyle = [
    styles.container,
    fullScreen && styles.fullScreen,
    isDark && styles.darkContainer,
  ];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <ThemedText style={[styles.text, isDark && styles.darkText]}>
          {text}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  fullScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    zIndex: 999,
  },
  darkContainer: {
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  darkText: {
    color: "#fff",
  },
});
