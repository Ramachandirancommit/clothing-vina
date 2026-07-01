// components/common/EmptyState.tsx

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../themed-text";

interface EmptyStateProps {
  icon?: string;
  title?: string;
  message?: string;
  buttonText?: string;
  onButtonPress?: () => void;
  isDark?: boolean;
  image?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "📦",
  title = "Nothing Here",
  message = "No items available at the moment.",
  buttonText,
  onButtonPress,
  isDark = false,
  image,
}) => {
  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      {image || (
        <Text style={[styles.icon, isDark && styles.darkText]}>{icon}</Text>
      )}
      <ThemedText style={[styles.title, isDark && styles.darkText]}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.message, isDark && styles.darkSubtitle]}>
        {message}
      </ThemedText>
      {buttonText && onButtonPress && (
        <TouchableOpacity style={styles.button} onPress={onButtonPress}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    paddingVertical: 80,
  },
  darkContainer: {
    backgroundColor: "#1a1a1a",
  },
  icon: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#e53935",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  darkText: {
    color: "#fff",
  },
  darkSubtitle: {
    color: "#999",
  },
});
