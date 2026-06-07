import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../app/context/ThemeContext";

interface Props {
  navigateTo?: (screen: string) => void;
  onClose?: () => void;
}

export default function SettingsContent({ navigateTo, onClose }: Props) {
  const { isDark, toggleTheme } = useTheme();
  const [pushEnabled, setPushEnabled] = useState(true);

  // Load push notification preference
  useEffect(() => {
    const loadPushPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem("pushEnabled");
        if (saved !== null) {
          setPushEnabled(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Error loading push preference:", error);
      }
    };
    loadPushPreference();
  }, []);

  // Save push notification preference
  const togglePush = async (value: boolean) => {
    setPushEnabled(value);
    try {
      await AsyncStorage.setItem("pushEnabled", JSON.stringify(value));
      // Here you would also call your push notification service
      if (value) {
        // Request push notification permissions
        console.log("Push notifications enabled");
      } else {
        console.log("Push notifications disabled");
      }
    } catch (error) {
      console.error("Error saving push preference:", error);
    }
  };

  const handleNavigation = (screen: string) => {
    if (navigateTo) {
      navigateTo(screen);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("userData");
          if (onClose) onClose();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Preferences Section */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text
            style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}
          >
            Preferences
          </Text>

          {/* Push Notifications - Toggle inline (no navigation) */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Feather name="bell" size={22} color={isDark ? "#999" : "#555"} />
              <Text style={[styles.settingText, isDark && styles.darkText]}>
                Push Notifications
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={togglePush}
              trackColor={{ false: "#767577", true: "#e53935" }}
            />
          </View>

          {/* Dark Mode - Toggle inline (no navigation) */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Feather name="moon" size={22} color={isDark ? "#999" : "#555"} />
              <Text style={[styles.settingText, isDark && styles.darkText]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: "#e53935" }}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text
            style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}
          >
            Account
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleNavigation("profile-info")}
          >
            <View style={styles.settingLeft}>
              <Feather name="user" size={22} color={isDark ? "#999" : "#555"} />
              <Text style={[styles.settingText, isDark && styles.darkText]}>
                Profile Information
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={isDark ? "#666" : "#999"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleNavigation("change-password")}
          >
            <View style={styles.settingLeft}>
              <Feather name="lock" size={22} color={isDark ? "#999" : "#555"} />
              <Text style={[styles.settingText, isDark && styles.darkText]}>
                Change Password
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={isDark ? "#666" : "#999"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleNavigation("addresses")}
          >
            <View style={styles.settingLeft}>
              <Feather
                name="map-pin"
                size={22}
                color={isDark ? "#999" : "#555"}
              />
              <Text style={[styles.settingText, isDark && styles.darkText]}>
                Addresses
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={isDark ? "#666" : "#999"}
            />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text
            style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}
          >
            Support
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleNavigation("help-center")}
          >
            <View style={styles.settingLeft}>
              <Feather
                name="help-circle"
                size={22}
                color={isDark ? "#999" : "#555"}
              />
              <Text style={[styles.settingText, isDark && styles.darkText]}>
                Help Center
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={isDark ? "#666" : "#999"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleNavigation("about-us")}
          >
            <View style={styles.settingLeft}>
              <Feather name="info" size={22} color={isDark ? "#999" : "#555"} />
              <Text style={[styles.settingText, isDark && styles.darkText]}>
                About Us
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={isDark ? "#666" : "#999"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <View style={styles.settingLeft}>
              <Feather name="log-out" size={22} color="#e53935" />
              <Text style={[styles.settingText, { color: "#e53935" }]}>
                Logout
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#e53935" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  darkContainer: { backgroundColor: "#1a1a1a" },

  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  darkSection: { backgroundColor: "#2a2a2a" },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  darkSectionTitle: { color: "#999" },

  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingText: { fontSize: 16, color: "#333" },
  darkText: { color: "#fff" },
  logoutItem: { borderBottomWidth: 0 },
});
