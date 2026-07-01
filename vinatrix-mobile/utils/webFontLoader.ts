import { Platform } from "react-native";

export const loadFontAwesomeForWeb = () => {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    // Check if already loaded
    if (document.querySelector('link[href*="font-awesome"]')) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css";
    document.head.appendChild(link);
  }
};
