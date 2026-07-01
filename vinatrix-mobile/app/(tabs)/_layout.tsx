import { Tabs, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
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
              onError={(e) => {
                console.log("Logo failed to load");
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
                <Text style={{ fontSize: 16, color: "#e53935" }}>🛍️</Text>
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
                <Text style={{ fontSize: 18, color: isDark ? "#fff" : "#333" }}>
                  ⚙️
                </Text>
              </TouchableOpacity>
            </View>
          ),
          tabBarStyle: {
            backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
            borderTopWidth: 0.5,
            borderTopColor: isDark ? "#333333" : "#e0e0e0",
            height: Platform.OS === "web" ? 60 : 70,
            paddingBottom: Platform.OS === "ios" ? 8 : 8,
            paddingTop: 6,
            ...(Platform.OS !== "web" && {
              position: "absolute",
              bottom: 10,
              marginStart: 10,
              marginEnd: 10,
            }),
          },
          tabBarItemStyle: {
            flex: 1,
            marginHorizontal: 0,
            paddingHorizontal: 0,
          },
          tabBarActiveTintColor: "#e53935",
          tabBarInactiveTintColor: isDark ? "#666666" : "#999999",
          tabBarLabelStyle: {
            fontSize: Platform.OS === "web" ? 10 : 12,
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
            tabBarLabel: "Trending",
            tabBarIcon: ({ focused, color, size }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 24 }}>🔥</Text>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            title: "All Cloths",
            tabBarLabel: "All Cloths",
            tabBarIcon: ({ focused, color, size }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 24 }}>👕</Text>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="cart"
          options={{
            title: "Your Cart",
            tabBarLabel: "Your Cart",
            tabBarIcon: ({ focused, color, size }) => (
              <View
                style={{
                  position: "relative",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 24 }}>🛒</Text>
                {cartCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -10,
                      backgroundColor: "#e53935",
                      borderRadius: 12,
                      minWidth: 18,
                      height: 18,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 4,
                      borderWidth: 1.5,
                      borderColor: "#ffffff",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 9,
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
            title: "Wishlist",
            tabBarLabel: "Wishlist",
            tabBarIcon: ({ focused, color, size }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 24 }}>❤️</Text>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="track-orders"
          options={{
            title: "Track Orders",
            tabBarLabel: "Track Orders",
            tabBarIcon: ({ focused, color, size }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 24 }}>🚚</Text>
              </View>
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

// import { Tabs, useRouter } from "expo-router";
// import React, { useState } from "react";
// import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
// import SellProductModal from "../../components/SellProductModal";
// import SettingsModal from "../../components/settings/settings-modal";
// import { useCartCount } from "../../hooks/useCartCount";
// import { eventEmitter, EVENTS } from "../../utils/eventEmitter";
// import { useTheme } from "../context/ThemeContext";

// export default function TabsLayout() {
//   const router = useRouter();
//   const { isDark } = useTheme();
//   const [modalVisible, setModalVisible] = useState(false);
//   const [settingsModalVisible, setSettingsModalVisible] = useState(false);
//   const { cartCount } = useCartCount();

//   const refreshProducts = () => {
//     eventEmitter.emit(EVENTS.PRODUCT_ADDED);
//     console.log("📢 Product added event emitted - HomeScreen will refresh");
//   };

//   return (
//     <>
//       <Tabs
//         screenOptions={{
//           headerShown: true,
//           headerStyle: {
//             backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
//           },
//           headerShadowVisible: false,
//           headerTitle: () => (
//             <Image
//               source={require("../../assets/images/vinatrixlogo.png")}
//               style={{
//                 width: 200,
//                 height: 210,
//                 marginLeft: -40,
//                 resizeMode: "contain",
//               }}
//               onError={(e) => {
//                 console.log("Logo failed to load");
//               }}
//             />
//           ),
//           headerTitleAlign: "left",
//           headerRight: () => (
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 marginRight: 10,
//               }}
//             >
//               {/* Sell Button */}
//               <TouchableOpacity
//                 onPress={() => setModalVisible(true)}
//                 style={{
//                   flexDirection: "row",
//                   alignItems: "center",
//                   backgroundColor: "#ffebee",
//                   paddingHorizontal: 12,
//                   paddingVertical: 8,
//                   borderRadius: 12,
//                   marginRight: 10,
//                 }}
//               >
//                 <Text style={{ fontSize: 16, color: "#e53935" }}>🛍️</Text>
//                 <Text
//                   style={{
//                     marginLeft: 6,
//                     color: "#e53935",
//                     fontWeight: "700",
//                     fontSize: 12,
//                   }}
//                 >
//                   Sell
//                 </Text>
//               </TouchableOpacity>

//               {/* Settings Button */}
//               <TouchableOpacity
//                 onPress={() => setSettingsModalVisible(true)}
//                 style={{
//                   width: 38,
//                   height: 38,
//                   borderRadius: 10,
//                   backgroundColor: isDark ? "#2a2a2a" : "#f3f4f6",
//                   justifyContent: "center",
//                   alignItems: "center",
//                 }}
//               >
//                 <Text style={{ fontSize: 18, color: isDark ? "#fff" : "#333" }}>
//                   ⚙️
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           ),
//           tabBarStyle: {
//             backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
//             borderTopWidth: 0.5,
//             borderTopColor: isDark ? "#333333" : "#e0e0e0",
//             height: Platform.OS === "web" ? 60 : 70,
//             paddingBottom: Platform.OS === "ios" ? 8 : 8,
//             paddingTop: 6,
//             ...(Platform.OS !== "web" && {
//               position: "absolute",
//               bottom: 10,
//               marginStart: 10,
//               marginEnd: 10,
//             }),
//           },
//           tabBarItemStyle: {
//             flex: 1,
//             marginHorizontal: 0,
//             paddingHorizontal: 0,
//           },
//           tabBarActiveTintColor: "#e53935",
//           tabBarInactiveTintColor: isDark ? "#666666" : "#999999",
//           tabBarLabelStyle: {
//             fontSize: Platform.OS === "web" ? 10 : 12,
//             fontWeight: "500",
//             marginTop: 4,
//           },
//           tabBarIconStyle: {
//             marginBottom: 0,
//           },
//         }}
//       >
//         <Tabs.Screen
//           name="index"
//           options={{
//             title: "Trending",
//             tabBarLabel: "Trending",
//             tabBarIcon: ({ focused }) => (
//               <Text style={{ fontSize: 24 }}>🔥</Text>
//             ),
//           }}
//         />

//         <Tabs.Screen
//           name="explore"
//           options={{
//             title: "All Cloths",
//             tabBarLabel: "All Cloths",
//             tabBarIcon: ({ focused }) => (
//               <Text style={{ fontSize: 24 }}>👕</Text>
//             ),
//           }}
//         />

//         <Tabs.Screen
//           name="cart"
//           options={{
//             title: "Your Cart",
//             tabBarLabel: "Your Cart",
//             tabBarIcon: ({ focused }) => (
//               <View style={{ position: "relative" }}>
//                 <Text style={{ fontSize: 24 }}>🛒</Text>
//                 {cartCount > 0 && (
//                   <View
//                     style={{
//                       position: "absolute",
//                       top: -6,
//                       right: -10,
//                       backgroundColor: "#e53935",
//                       borderRadius: 12,
//                       minWidth: 18,
//                       height: 18,
//                       justifyContent: "center",
//                       alignItems: "center",
//                       paddingHorizontal: 4,
//                       borderWidth: 1.5,
//                       borderColor: "#ffffff",
//                     }}
//                   >
//                     <Text
//                       style={{
//                         color: "white",
//                         fontSize: 9,
//                         fontWeight: "bold",
//                       }}
//                     >
//                       {cartCount > 99 ? "99+" : cartCount}
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             ),
//           }}
//         />

//         <Tabs.Screen
//           name="wishlist"
//           options={{
//             title: "Wishlist",
//             tabBarLabel: "Wishlist",
//             tabBarIcon: ({ focused }) => (
//               <Text style={{ fontSize: 24 }}>❤️</Text>
//             ),
//           }}
//         />

//         <Tabs.Screen
//           name="track-orders"
//           options={{
//             title: "Track Orders",
//             tabBarLabel: "Track Orders",
//             tabBarIcon: ({ focused }) => (
//               <Text style={{ fontSize: 24 }}>🚚</Text>
//             ),
//           }}
//         />
//       </Tabs>

//       <SellProductModal
//         visible={modalVisible}
//         onClose={() => setModalVisible(false)}
//         onProductAdded={refreshProducts}
//       />

//       <SettingsModal
//         visible={settingsModalVisible}
//         onClose={() => setSettingsModalVisible(false)}
//       />
//     </>
//   );
// }
