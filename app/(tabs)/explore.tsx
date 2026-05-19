import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function ExploreScreen() {
  // 🔷 FLAT PRODUCT LIST (NOT grouped)
  const products = [
    ...generateProducts("Electronics"),
    ...generateProducts("Civil"),
    ...generateProducts("Vehicles"),
    ...generateProducts("Agriculture"),
    ...generateProducts("Real Estate"),
    ...generateProducts("Apps Store"),
    ...generateProducts("Home Products"),
    ...generateProducts("Super Market"),
    ...generateProducts("Clothings"),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f6f8" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🔷 HEADER */}
        <ThemedText style={styles.title}>🔥 Top Picks</ThemedText>
        <ThemedText style={styles.subtitle}>
          Discover the best products across all categories
        </ThemedText>

        {/* 🔷 GRID */}
        <View style={styles.grid}>
          {products.map((item, index) => (
            <View key={index} style={styles.card}>
              {/* IMAGE PLACEHOLDER */}
              <View style={styles.imageBox}>
                <Ionicons name="image" size={30} color="#bbb" />
              </View>

              {/* NAME */}
              <ThemedText style={styles.productName}>{item.name}</ThemedText>

              {/* CATEGORY */}
              <ThemedText style={styles.category}>{item.category}</ThemedText>

              {/* PRICE */}
              <ThemedText style={styles.price}>₹{item.price}</ThemedText>

              {/* RATING */}
              <ThemedText style={styles.rating}>⭐ {item.rating}</ThemedText>

              {/* ACTIONS */}
              <View style={styles.actions}>
                <IconBtn icon="cart" />
                <IconBtn icon="eye" />
                <IconBtn icon="call" />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

//
// 🔷 DUMMY DATA GENERATOR
//
function generateProducts(category: string) {
  return [1, 2, 3].map((i) => ({
    name: `${category} Item ${i}`,
    category,
    price: i * 1000,
    rating: (4 + Math.random()).toFixed(1),
  }));
}

//
// 🔷 ICON BUTTON
//
function IconBtn({ icon }: any) {
  return (
    <TouchableOpacity style={styles.iconBtn}>
      <Ionicons name={icon} size={16} color="#fff" />
    </TouchableOpacity>
  );
}

//
// 🔷 STYLES (MUI-LIKE GRID)
//
const styles = StyleSheet.create({
  container: {
    padding: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "23%", // 🔥 4 per row
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    elevation: 3,
  },

  imageBox: {
    height: 60,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  productName: {
    fontSize: 11,
    fontWeight: "600",
  },

  category: {
    fontSize: 9,
    color: "#888",
  },

  price: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2e7d32",
  },

  rating: {
    fontSize: 10,
    marginBottom: 4,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },

  iconBtn: {
    backgroundColor: "#1976d2",
    padding: 6,
    borderRadius: 6,
  },
});


// import { ScrollView, StyleSheet, View } from "react-native";

// import { ThemedText } from "@/components/themed-text";
// import { ThemedView } from "@/components/themed-view";

// const categories = [
//   "Electronics",
//   "Civil",
//   "Vehicles",
//   "Agriculture",
//   "Real Estate",
//   "Apps Store",
//   "Home Products",
//   "Super Market",
//   "Clothings",
// ];

// export default function ExploreScreen() {
//   return (
//     <View style={{ flex: 1 }}>
//       <ScrollView contentContainerStyle={{ padding: 16 }}>
//         {/* 🔷 Title */}
//         <ThemedView style={styles.section}>
//           <ThemedText type="title">🔥 Top Picks</ThemedText>
//           <ThemedText>
//             Discover the best products from each category.
//           </ThemedText>
//         </ThemedView>

//         {/* 🔷 Categories */}
//         {categories.map((category) => (
//           <ThemedView key={category} style={styles.section}>
//             <ThemedText type="subtitle">{category}</ThemedText>

//             {/* Top 3 items */}
//             <View style={styles.row}>
//               {[1, 2, 3].map((item) => (
//                 <View key={item} style={styles.card}>
//                   <ThemedText style={styles.productTitle}>
//                     {category} Item {item}
//                   </ThemedText>
//                   <ThemedText style={styles.price}>₹{item * 1000}</ThemedText>
//                 </View>
//               ))}
//             </View>
//           </ThemedView>
//         ))}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   section: {
//     marginBottom: 20,
//     gap: 8,
//   },

//   row: {
//     flexDirection: "row",
//     gap: 10,
//     flexWrap: "wrap",
//   },

//   card: {
//     backgroundColor: "#eef6f9",
//     padding: 12,
//     borderRadius: 12,
//     width: 110,
//     height: 110,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   productTitle: {
//     fontSize: 12,
//     textAlign: "center",
//   },

//   price: {
//     fontSize: 12,
//     marginTop: 4,
//     color: "#0b3c49",
//     fontWeight: "bold",
//   },
// });
