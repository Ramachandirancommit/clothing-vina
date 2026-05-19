import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  // 🔷 CATEGORY DATA
  const categories = [
    {
      name: "Electronics",
      sold: 102,
      income: "₹1.03 Cr",
      pending: 25,
      rating: 4.5,
    },
    { name: "Civil", sold: 80, income: "₹75 L", pending: 40, rating: 4.2 },
    { name: "Vehicles", sold: 45, income: "₹2.5 Cr", pending: 10, rating: 4.6 },
    {
      name: "Agriculture",
      sold: 120,
      income: "₹60 L",
      pending: 30,
      rating: 4.3,
    },
    { name: "Real Estate", sold: 15, income: "₹5 Cr", pending: 5, rating: 4.8 },
    {
      name: "Apps Store",
      sold: 300,
      income: "₹20 L",
      pending: 50,
      rating: 4.1,
    },
    {
      name: "Home Products",
      sold: 210,
      income: "₹35 L",
      pending: 60,
      rating: 4.4,
    },
    {
      name: "Super Market",
      sold: 500,
      income: "₹10 L",
      pending: 100,
      rating: 4.0,
    },
    { name: "Clothings", sold: 350, income: "₹18 L", pending: 70, rating: 4.2 },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f6f8" }}>
      {/* 🔷 TOP BAR */}
      <View style={styles.topBar}>
        <TopIcon name="briefcase" onPress={() => router.push("/career")} />
        <TopIcon name="person" onPress={() => router.push("/profile")} />
        <TopIcon name="log-in" onPress={() => router.push("/login")} />
      </View>

      {/* 🔷 DASHBOARD */}
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText style={styles.pageTitle}>📊 Product Dashboard</ThemedText>

        <View style={styles.grid}>
          {categories.map((item) => {
            const total = item.sold + item.pending;
            const progress = (item.sold / total) * 100;

            return (
              <View key={item.name} style={styles.card}>
                {/* HEADER */}
                <View style={styles.header}>
                  <Ionicons name="cube" size={20} color="#1976d2" />
                  <ThemedText style={styles.title}>{item.name}</ThemedText>
                </View>

                {/* INCOME */}
                <ThemedText style={styles.income}>{item.income}</ThemedText>
                <ThemedText style={styles.subLabel}>This Month</ThemedText>

                {/* DIVIDER */}
                <View style={styles.divider} />

                {/* STATS */}
                <View style={styles.row}>
                  <ThemedText>✔ Sold</ThemedText>
                  <ThemedText>{item.sold}</ThemedText>
                </View>

                <View style={styles.row}>
                  <ThemedText>📦 Pending</ThemedText>
                  <ThemedText>{item.pending}</ThemedText>
                </View>

                <View style={styles.row}>
                  <ThemedText>⭐ Rating</ThemedText>
                  <ThemedText>{item.rating}</ThemedText>
                </View>

                {/* PROGRESS BAR */}
                <View style={styles.progressBg}>
                  <View
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

//
// 🔷 ICON COMPONENT
//
function TopIcon({ name, onPress }: any) {
  return (
    <Ionicons
      name={name}
      size={22}
      color="#0b3c49"
      onPress={onPress}
      style={{ marginHorizontal: 10 }}
    />
  );
}

//
// 🔷 STYLES (MUI-LIKE)
//
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 12,
    elevation: 3,
  },

  pageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 4,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
  },

  income: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2e7d32",
  },

  subLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },

  progressBg: {
    height: 6,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginTop: 8,
  },

  progressFill: {
    height: 6,
    backgroundColor: "#1976d2",
    borderRadius: 10,
  },
});

// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { ScrollView, StyleSheet, View } from "react-native";

// import { ThemedText } from "@/components/themed-text";
// import { ThemedView } from "@/components/themed-view";

// export default function HomeScreen() {
//   const router = useRouter();

//   return (
//     <View style={{ flex: 1 }}>
//       {/* 🔷 TOP ICON BAR (fixed) */}
//       <View style={styles.topBar}>
//         <TopIcon name="briefcase" onPress={() => router.push("/career")} />
//         <TopIcon
//           name="information-circle"
//           onPress={() => router.push("/about")}
//         />
//         <TopIcon name="person" onPress={() => router.push("/profile")} />
//         <TopIcon name="log-in" onPress={() => router.push("/login")} />
//         <TopIcon name="log-out" onPress={() => router.push("/logout")} />
//       </View>

//       {/* 🔷 CONTENT */}
//       <ScrollView contentContainerStyle={{ padding: 16 }}>
//         {/* TITLE */}
//         <ThemedView style={styles.section}>
//           <ThemedText type="title">🏪 Products Marketplace</ThemedText>
//           <ThemedText>
//             Trusted platform for quality products across multiple industries.
//           </ThemedText>
//         </ThemedView>

//         {/* QUALITY */}
//         <ThemedView style={styles.section}>
//           <ThemedText type="subtitle">⭐ Product Quality</ThemedText>
//           <ThemedText>
//             All products are verified with strict quality checks and vendor
//             validation.
//           </ThemedText>
//         </ThemedView>

//         {/* WARRANTY */}
//         <ThemedView style={styles.section}>
//           <ThemedText type="subtitle">🛡 Warranty Assurance</ThemedText>
//           <ThemedText>
//             Secure transactions and warranty support for all purchases.
//           </ThemedText>
//         </ThemedView>

//         {/* ACHIEVEMENTS */}
//         <ThemedView style={styles.section}>
//           <ThemedText type="subtitle">📈 Achievements</ThemedText>
//           <ThemedText>✔ 10,000+ Products Listed</ThemedText>
//           <ThemedText>✔ 5,000+ Happy Customers</ThemedText>
//           <ThemedText>✔ Trusted Vendors Across India</ThemedText>
//         </ThemedView>

//         {/* CATEGORIES */}
//         <ThemedView style={styles.section}>
//           <ThemedText type="subtitle">🧭 Categories</ThemedText>

//           <View style={styles.grid}>
//             {[
//               "Electronics",
//               "Civil",
//               "Vehicles",
//               "Agriculture",
//               "Real Estate",
//               "Apps Store",
//               "Home Products",
//               "Super Market",
//               "Clothings",
//             ].map((item) => (
//               <View key={item} style={styles.card}>
//                 <ThemedText>{item}</ThemedText>
//               </View>
//             ))}
//           </View>
//         </ThemedView>
//       </ScrollView>
//     </View>
//   );
// }

// //
// // 🔹 ICON COMPONENT
// //
// function TopIcon({ name, onPress }: any) {
//   return (
//     <Ionicons
//       name={name}
//       size={22}
//       color="#0b3c49"
//       onPress={onPress}
//       style={{ marginHorizontal: 10 }}
//     />
//   );
// }

// //
// // 🔹 STYLES
// //
// const styles = StyleSheet.create({
//   topBar: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     alignItems: "center",
//     backgroundColor: "#A1CEDC",
//     paddingVertical: 12,
//     paddingHorizontal: 12,
//   },

//   section: {
//     marginBottom: 20,
//     gap: 6,
//   },

//   grid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//   },

//   card: {
//     backgroundColor: "#eef6f9",
//     padding: 12,
//     borderRadius: 10,
//     minWidth: 120,
//   },
// });
