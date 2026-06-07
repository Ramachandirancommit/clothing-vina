import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import SellProductModal from "../../components/SellProductModal";
import SettingsModal from "../../components/settings/settings-modal";
import { useCartCount } from "../../hooks/useCartCount";
import { eventEmitter, EVENTS } from "../../utils/eventEmitter";
import { useTheme } from "../context/ThemeContext";

export default function TabsLayout() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const { cartCount } = useCartCount();

  const refreshProducts = () => {
    eventEmitter.emit(EVENTS.PRODUCT_ADDED);
    console.log("📢 Product added event emitted - HomeScreen will refresh");
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
          },
          headerShadowVisible: false,
          headerTitle: () => (
            <Image
              source={require("../../assets/images/vinatrixlogo.png")}
              style={{
                width: 200,
                height: 210,
                marginLeft: -40,
                resizeMode: "contain",
              }}
            />
          ),
          headerTitleAlign: "left",
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 10,
              }}
            >
              {/* Sell Button */}
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#ffebee",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  marginRight: 10,
                }}
              >
                <Feather name="shopping-bag" size={16} color="#e53935" />
                <Text
                  style={{
                    marginLeft: 6,
                    color: "#e53935",
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                >
                  Sell
                </Text>
              </TouchableOpacity>

              {/* Settings Button */}
              <TouchableOpacity
                onPress={() => setSettingsModalVisible(true)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: isDark ? "#2a2a2a" : "#f3f4f6",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Feather
                  name="settings"
                  size={18}
                  color={isDark ? "#fff" : "#333"}
                />
              </TouchableOpacity>
            </View>
          ),
          tabBarStyle: {
            backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
            borderTopWidth: 0.5,
            borderTopColor: isDark ? "#333333" : "#e0e0e0",
            height: 70,
            paddingBottom: 8,
            paddingTop: 6,
            position: "absolute",
            bottom: 10,
            marginStart: 10,
            marginEnd: 10,
          },
          tabBarItemStyle: {
            flex: 1,
            marginHorizontal: 0,
            paddingHorizontal: 0,
          },
          tabBarActiveTintColor: "#e53935",
          tabBarInactiveTintColor: isDark ? "#666666" : "#999999",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginBottom: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Trending",
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="fire"
                size={26}
                color={focused ? "#FF5722" : "#FF8C42"}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            title: "All Cloths",
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="tshirt-crew"
                size={26}
                color={focused ? "#2E7D32" : "#66BB6A"}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="cart"
          options={{
            title: "Your Cart",
            tabBarIcon: ({ focused }) => (
              <View>
                <MaterialCommunityIcons
                  name="cart"
                  size={26}
                  color={focused ? "#FF9800" : "#FFB74D"}
                />
                {cartCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -10,
                      backgroundColor: "#e53935",
                      borderRadius: 12,
                      minWidth: 20,
                      height: 20,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 5,
                      borderWidth: 2,
                      borderColor: "#ffffff",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="wishlist"
          options={{
            title: "Whishlist",
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name={focused ? "heart" : "heart-outline"}
                size={26}
                color={focused ? "#e53935" : "#81C784"}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="track-orders"
          options={{
            title: "Track Orders",
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="truck-fast"
                size={26}
                color={focused ? "#2196F3" : "#64B5F6"}
              />
            ),
          }}
        />
      </Tabs>

      <SellProductModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onProductAdded={refreshProducts}
      />

      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
      />
    </>
  );
}
