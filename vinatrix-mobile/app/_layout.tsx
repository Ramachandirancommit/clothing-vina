import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";
import { loadFontAwesomeForWeb } from "../../vinatrix-mobile/utils/webFontLoader";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// Load Font Awesome for web platform
if (Platform.OS === "web") {
  loadFontAwesomeForWeb();
}

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  // Pre-load on web
  useEffect(() => {
    if (Platform.OS === "web") {
      loadFontAwesomeForWeb();
    }
  }, []);

  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}

function RootLayoutContent() {
  const { isDark } = useTheme();

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </NavigationThemeProvider>
  );
}
