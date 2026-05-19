import { Slot, Tabs, usePathname, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function Layout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  if (isDesktop) {
    return <SidebarLayout />;
  }

  return <MobileTabs />;
}

//
// 📱 MOBILE → Bottom Tabs (keep minimal)
//
function MobileTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
    </Tabs>
  );
}

//
// 💻 WEB → Sidebar Layout
//
function SidebarLayout() {
  const router = useRouter();
  const pathname = usePathname(); // 🔥 current route

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      {/* Sidebar */}
      <View
        style={{
          width: 240,
          backgroundColor: "#ffffff",
          paddingTop: 30,
          paddingHorizontal: 12,
        }}
      >
        {/* Logo / Title */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 20,
            color: "#0b3c49",
          }}
        >
          🏪 Products Marketplace
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <SidebarItem
            title="Dashboards"
            active={pathname === "/"}
            onPress={() => router.push("/")}
          />

          <SidebarItem
            title="Top Sellers"
            active={pathname === "/explore"}
            onPress={() => router.push("/explore")}
          />

          <SidebarItem
            title="Electronics"
            active={pathname === "/electronics"}
            onPress={() => router.push("/electronics")}
          />

          <SidebarItem
            title="Civil"
            active={pathname === "/civil"}
            onPress={() => router.push("/civil")}
          />

          <SidebarItem
            title="Vehicles"
            active={pathname === "/vehicles"}
            onPress={() => router.push("/vehicles")}
          />

          <SidebarItem
            title="Agriculture"
            active={pathname === "/agriculture"}
            onPress={() => router.push("/agriculture")}
          />

          <SidebarItem
            title="Real Estate"
            active={pathname === "/realestate"}
            onPress={() => router.push("/realestate")}
          />

          <SidebarItem
            title="Apps Store"
            active={pathname === "/apps"}
            onPress={() => router.push("/apps")}
          />

          <SidebarItem
            title="Home Products"
            active={pathname === "/home-products"}
            onPress={() => router.push("/home-products")}
          />

          <SidebarItem
            title="Super Market"
            active={pathname === "/super-market"}
            onPress={() => router.push("/super-market")}
          />

          <SidebarItem
            title="Clothings"
            active={pathname === "/clothings"}
            onPress={() => router.push("/clothings")}
          />
        </ScrollView>
      </View>

      {/* Page Content */}
      <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <Slot />
      </View>
    </View>
  );
}

//
// 🔹 Sidebar Item (with ACTIVE highlight)
//
type SidebarItemProps = {
  title: string;
  onPress: () => void;
  active: boolean;
};

function SidebarItem({ title, onPress, active }: SidebarItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginBottom: 6,

        // 🔥 ACTIVE STYLE
        backgroundColor: active ? "#e3f2fd" : "transparent",
        borderLeftWidth: active ? 4 : 0,
        borderLeftColor: "#1976d2",
      }}
    >
      <Text
        style={{
          color: active ? "#1976d2" : "#0b3c49",
          fontSize: 15,
          fontWeight: active ? "700" : "500",
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
// import { Slot, Tabs, useRouter } from "expo-router";
// import React from "react";
// import {
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   useWindowDimensions,
//   View,
// } from "react-native";

// export default function Layout() {
//   const { width } = useWindowDimensions();
//   const isDesktop = width >= 768;

//   if (isDesktop) {
//     return <SidebarLayout />;
//   }

//   return <MobileTabs />;
// }

// //
// // 📱 MOBILE → Bottom Tabs (keep minimal)
// //
// function MobileTabs() {
//   return (
//     <Tabs screenOptions={{ headerShown: false }}>
//       <Tabs.Screen name="index" options={{ title: "Home" }} />
//       <Tabs.Screen name="explore" options={{ title: "Explore" }} />
//     </Tabs>
//   );
// }

// //
// // 💻 WEB → Sidebar Layout
// //
// function SidebarLayout() {
//   const router = useRouter();

//   return (
//     <View style={{ flex: 1, flexDirection: "row" }}>
//       {/* Sidebar */}
//       <View
//         style={{
//           width: 240,
//           backgroundColor: "rgb(255, 255, 255)", // ✅ light sky blue
//           paddingTop: 30,
//           paddingHorizontal: 12,
//         }}
//       >
//         {/* Logo / Title */}
//         <Text
//           style={{
//             fontSize: 18,
//             fontWeight: "bold",
//             marginBottom: 20,
//             color: "#0b3c49",
//           }}
//         >
//           🏪 Products Marketplace
//         </Text>

//         <ScrollView showsVerticalScrollIndicator={false}>
//           <SidebarItem title="Dashboards" onPress={() => router.push("/")} />
//           <SidebarItem
//             title="Top Sellers"
//             onPress={() => router.push("/explore")}
//           />

//           <SidebarItem
//             title="Electronics"
//             onPress={() => router.push("/electronics")}
//           />
//           <SidebarItem title="Civil" onPress={() => router.push("/civil")} />
//           <SidebarItem
//             title="Vehicles"
//             onPress={() => router.push("/vehicles")}
//           />
//           <SidebarItem
//             title="Agriculture"
//             onPress={() => router.push("/agriculture")}
//           />
//           <SidebarItem
//             title="Real Estate"
//             onPress={() => router.push("/realestate")}
//           />
//           <SidebarItem
//             title="Apps Store"
//             onPress={() => router.push("/apps")}
//           />
//           <SidebarItem
//             title="Home Products"
//             onPress={() => router.push("/home-products")}
//           />
//           <SidebarItem
//             title="Super Market"
//             onPress={() => router.push("/super-market")}
//           />
//           <SidebarItem
//             title="Clothings"
//             onPress={() => router.push("/clothings")}
//           />
//         </ScrollView>
//       </View>

//       {/* Page Content */}
//       <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
//         <Slot />
//       </View>
//     </View>
//   );
// }

// //
// // 🔹 Sidebar Item (Type Safe)
// //
// type SidebarItemProps = {
//   title: string;
//   onPress: () => void;
// };

// function SidebarItem({ title, onPress }: SidebarItemProps) {
//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       style={{
//         paddingVertical: 12,
//         paddingHorizontal: 10,
//         borderRadius: 8,
//         marginBottom: 6,
//       }}
//     >
//       <Text
//         style={{
//           color: "#0b3c49", // dark text for light bg
//           fontSize: 15,
//           fontWeight: "500",
//         }}
//       >
//         {title}
//       </Text>
//     </TouchableOpacity>
//   );
// }
