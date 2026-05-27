import { Text, type TextProps, StyleSheet } from "react-native";

export function ThemedText(props: TextProps) {
  return <Text {...props} style={[styles.text, props.style]} />;
}

const styles = StyleSheet.create({
  text: {
    color: "#333333",
  },
});
