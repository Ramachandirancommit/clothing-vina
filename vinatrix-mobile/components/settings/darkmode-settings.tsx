import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../app/context/ThemeContext";

interface Props {
  goBack?: () => void;
}

export default function DarkModeSettings({ goBack }: Props) {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  return (
    <ScrollView style={[styles.container, isDark && styles.darkContainer]}>
      {/* ✅ Add Header with Back Button */}
      <View style={[styles.header, isDark && styles.darkHeader]}>
        <TouchableOpacity
          onPress={goBack || (() => router.back())}
          style={styles.backButton}
        >
          <Feather
            name="arrow-left"
            size={24}
            color={isDark ? "#fff" : "#333"}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>
          Dark Mode
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.section, isDark && styles.darkSection]}>
        <View style={styles.settingItem}>
          <View>
            <Text style={[styles.settingTitle, isDark && styles.darkText]}>
              Dark Mode
            </Text>
            <Text style={[styles.settingDesc, isDark && styles.darkDesc]}>
              Enable dark theme
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: "#e53935" }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  darkContainer: { backgroundColor: "#1a1a1a" },

  // ✅ Add header styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  darkHeader: {
    backgroundColor: "#2a2a2a",
    borderBottomColor: "#3a3a3a",
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },

  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    overflow: "hidden",
  },
  darkSection: { backgroundColor: "#2a2a2a" },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  settingTitle: { fontSize: 16, fontWeight: "500", color: "#333" },
  darkText: { color: "#fff" },
  settingDesc: { fontSize: 12, color: "#999", marginTop: 2 },
  darkDesc: { color: "#999" },
});
