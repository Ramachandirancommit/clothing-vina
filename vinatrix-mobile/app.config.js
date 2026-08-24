import "dotenv/config";

export default {
  expo: {
    name: "vina-clothing",
    slug: "vina-clothing",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mirrormarketplace",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.app.vinatrix",
      infoPlist: {
        LSApplicationQueriesSchemes: [
          "tez",
          "phonepe",
          "paytmmp",
          "googlepay",
          "paytm",
          "bhim",
        ],
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.app.vinatrix",
      permissions: ["INTERNET"],
      // Allow HTTP for local development (safe)
      usesCleartextTraffic: true,
      intentFilters: [
        {
          action: "VIEW",
          data: [
            { scheme: "tez", host: "*" },
            { scheme: "phonepe", host: "*" },
            { scheme: "paytmmp", host: "*" },
            { scheme: "googlepay", host: "*" },
            { scheme: "paytm", host: "*" },
            { scheme: "bhim", host: "*" },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-notifications",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: { backgroundColor: "#000000" },
        },
      ],
      "expo-build-properties",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    // 🔥 Environment variable injected here
    extra: {
      API_BASE_URL:
        process.env.API_BASE_URL || "https://api.vinatrix-api.workers.dev",
    },
  },
};
