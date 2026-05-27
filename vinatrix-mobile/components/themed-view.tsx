import { View, type ViewProps, StyleSheet } from "react-native";

export function ThemedView(props: ViewProps) {
  return <View {...props} style={[styles.view, props.style]} />;
}

const styles = StyleSheet.create({
  view: {
    backgroundColor: "#ffffff",
  },
});
