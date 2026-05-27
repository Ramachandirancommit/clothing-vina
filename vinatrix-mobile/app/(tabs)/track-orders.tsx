import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ThemedText } from "../../components/themed-text";

export default function TrackOrdersScreen() {
  const orders = [
    {
      id: "ORD-001",
      date: "2026-05-15",
      status: "Delivered",
      total: "$128",
      items: 3,
    },
    {
      id: "ORD-002",
      date: "2026-05-18",
      status: "Shipped",
      total: "$89",
      items: 2,
    },
    {
      id: "ORD-003",
      date: "2026-05-20",
      status: "Processing",
      total: "$199",
      items: 1,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "#4caf50";
      case "Shipped":
        return "#2196f3";
      case "Processing":
        return "#ff9800";
      default:
        return "#999";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return "check-circle";
      case "Shipped":
        return "truck";
      case "Processing":
        return "clock";
      default:
        return "package";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Track Orders 🚚</ThemedText>
          <Text style={styles.subtitle}>Your order history</Text>
        </View>

        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>{order.id}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.status) + "20" },
                ]}
              >
                <Feather
                  name={getStatusIcon(order.status)}
                  size={14}
                  color={getStatusColor(order.status)}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(order.status) },
                  ]}
                >
                  {order.status}
                </Text>
              </View>
            </View>
            <View style={styles.orderDetails}>
              <Text style={styles.orderDate}>📅 {order.date}</Text>
              <Text style={styles.orderItems}>📦 {order.items} items</Text>
              <Text style={styles.orderTotal}>💰 {order.total}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  orderCard: {
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: { fontSize: 16, fontWeight: "600", color: "#333" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  orderDetails: { gap: 6 },
  orderDate: { fontSize: 14, color: "#666" },
  orderItems: { fontSize: 14, color: "#666" },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e53935",
    marginTop: 6,
  },
});
