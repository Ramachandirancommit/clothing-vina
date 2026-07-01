import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Device from "expo-device";
import * as Network from "expo-network";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "../../components/themed-text";
import { eventEmitter } from "../../utils/eventEmitter";
import { useTheme } from "../context/ThemeContext";

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_category: string;
  size?: string;
  price: string;
  quantity: number;
  total_price: string;
}

interface Order {
  id: number;
  order_number: string;
  cust_id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  total_amount: string;
  delivery_fee: string;
  tax_amount: string;
  grand_total: string;
  item_count: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  order_date: string;
  delivery_date: string;
  notes: string;
  created_at: string;
}

export default function TrackOrdersScreen() {
  const { isDark } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const BASE_URL = "https://api.vinatrix-api.workers.dev";
  const ORDERS_URL = `${BASE_URL}/api/orders`;

  // =========================
  // GET USER ID
  // =========================
  const getUserId = async (): Promise<string> => {
    try {
      let userId = await AsyncStorage.getItem("app_user_id");

      if (!userId) {
        const deviceName = Device.deviceName || "unknown";
        const ipAddress = await Network.getIpAddressAsync();
        const timestamp = Date.now();
        userId = `USER_${deviceName.substring(0, 5)}_${ipAddress.split(".").pop()}_${timestamp}`;
        await AsyncStorage.setItem("app_user_id", userId);
      }

      return userId;
    } catch (error) {
      console.error("Error getting user ID:", error);
      return `GUEST_${Date.now()}`;
    }
  };

  // =========================
  // GET ORDER STATUS BASED ON DELIVERY DATE
  // =========================
  const getOrderStatus = (deliveryDate: string, orderStatus: string) => {
    if (!deliveryDate) return orderStatus || "Processing";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const delivery = new Date(deliveryDate);
    delivery.setHours(0, 0, 0, 0);

    if (orderStatus === "cancelled") return "Cancelled";
    if (orderStatus === "delivered") return "Delivered";

    if (delivery < today) {
      return "Delivered";
    } else if (delivery.getTime() === today.getTime()) {
      return "Out for Delivery";
    } else {
      return "In Progress";
    }
  };

  // =========================
  // GET STATUS COLOR
  // =========================
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "#4caf50";
      case "Out for Delivery":
        return "#ff9800";
      case "In Progress":
        return "#2196f3";
      case "Cancelled":
        return "#f44336";
      default:
        return "#999";
    }
  };

  // =========================
  // GET STATUS ICON
  // =========================
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return "checkmark-circle";
      case "Out for Delivery":
        return "car";
      case "In Progress":
        return "time";
      case "Cancelled":
        return "close-circle";
      default:
        return "cube";
    }
  };

  // =========================
  // FETCH ORDERS (WITH AUTO REFRESH)
  // =========================
  const fetchOrders = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const cust_id = await getUserId();
      console.log("📡 Fetching orders for customer:", cust_id);

      const response = await fetch(`${ORDERS_URL}/user/${cust_id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        console.log(`✅ Loaded ${data.orders.length} orders`);
        setLastRefresh(Date.now());
      } else {
        Alert.alert("Error", data.error || "Failed to load orders");
      }
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      Alert.alert("Error", "Failed to load orders");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, []);

  // =========================
  // VIEW ORDER DETAILS
  // =========================
  const viewOrderDetails = async (orderId: number | string) => {
    try {
      console.log("📡 Fetching order details for:", orderId);

      const response = await fetch(`${ORDERS_URL}/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedOrder(data.order);
        setSelectedOrderItems(data.items || []);
        setModalVisible(true);
      } else {
        Alert.alert("Error", data.error || "Failed to load order details");
      }
    } catch (error) {
      console.error("❌ Error fetching order details:", error);
      Alert.alert("Error", "Failed to load order details");
    }
  };

  // =========================
  // PULL TO REFRESH
  // =========================
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders(false);
  }, [fetchOrders]);

  // =========================
  // AUTO REFRESH ON FOCUS (When coming from order success)
  // =========================
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 TrackOrders screen focused - auto refreshing orders");
      fetchOrders(true);
    }, [fetchOrders]),
  );

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchOrders(true);
  }, []);

  // =========================
  // Listen for new order events
  // =========================
  useEffect(() => {
    const handleNewOrder = () => {
      console.log("🎉 New order placed event received - refreshing orders");
      fetchOrders(false);
    };

    // Listen for custom event when order is placed
    eventEmitter.on("ORDER_PLACED", handleNewOrder);

    return () => {
      eventEmitter.off("ORDER_PLACED", handleNewOrder);
    };
  }, [fetchOrders]);

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // FORMAT TIME
  // =========================
  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================
  // LOADING SCREEN
  // =========================
  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, isDark && styles.darkLoadingContainer]}
      >
        <ActivityIndicator size="large" color="#e53935" />
        <ThemedText style={[styles.loadingText, isDark && styles.darkText]}>
          Loading orders...
        </ThemedText>
      </View>
    );
  }

  // =========================
  // MAIN RENDER
  // =========================
  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <ThemedText style={[styles.title, isDark && styles.darkText]}>
              Track Orders 🚚
            </ThemedText>
            <Text style={[styles.subtitle, isDark && styles.darkSubtitle]}>
              {orders.length} orders found
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => fetchOrders(false)}
            style={styles.refreshButton}
          >
            <Feather name="refresh-cw" size={20} color="#e53935" />
          </TouchableOpacity>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather
              name="package"
              size={80}
              color={isDark ? "#666" : "#ccc"}
            />
            <ThemedText style={[styles.emptyTitle, isDark && styles.darkText]}>
              No Orders Yet
            </ThemedText>
            <Text style={[styles.emptyText, isDark && styles.darkSubtitle]}>
              Your order history will appear here
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const deliveryDate = order.delivery_date;
            const status = getOrderStatus(deliveryDate, order.order_status);
            const statusColor = getStatusColor(status);

            // Check if order is newly placed (within last 30 seconds)
            const isNewOrder =
              Date.now() - new Date(order.created_at).getTime() < 30000;

            return (
              <View
                key={order.id}
                style={[
                  styles.orderCard,
                  isDark && styles.darkCard,
                  isNewOrder && styles.newOrderCard,
                ]}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <View style={styles.orderNumberRow}>
                      <Text style={[styles.orderId, isDark && styles.darkText]}>
                        {order.order_number}
                      </Text>
                      {isNewOrder && (
                        <View style={styles.newBadge}>
                          <Text style={styles.newBadgeText}>NEW</Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[styles.orderDate, isDark && styles.darkSubtitle]}
                    >
                      📅 {formatDate(order.order_date)} at{" "}
                      {formatTime(order.order_date)}
                    </Text>
                  </View>
                  <View style={styles.headerActions}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusColor + "20" },
                      ]}
                    >
                      <Ionicons
                        name={getStatusIcon(status) as any}
                        size={14}
                        color={statusColor}
                      />
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {status}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.viewIcon}
                      onPress={() => viewOrderDetails(order.order_number)}
                    >
                      <Feather name="eye" size={18} color="#e53935" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <Feather name="box" size={14} color="#666" />
                    <Text
                      style={[styles.detailText, isDark && styles.darkSubtitle]}
                    >
                      {order.item_count} items
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Feather name="calendar" size={14} color="#666" />
                    <Text
                      style={[styles.detailText, isDark && styles.darkSubtitle]}
                    >
                      Est. Delivery: {formatDate(deliveryDate)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Feather name="credit-card" size={14} color="#666" />
                    <Text
                      style={[styles.detailText, isDark && styles.darkSubtitle]}
                    >
                      {order.payment_method?.toUpperCase() || "N/A"}
                      {order.payment_status === "completed" && " ✓"}
                    </Text>
                  </View>
                  <Text style={styles.orderTotal}>
                    ₹{parseFloat(order.grand_total).toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          })
        )}

        {/* Last refresh time indicator */}
        <View style={styles.refreshIndicator}>
          <Text style={[styles.refreshText, isDark && styles.darkSubtitle]}>
            Last updated: {new Date(lastRefresh).toLocaleTimeString()}
          </Text>
        </View>
      </ScrollView>

      {/* Order Details Modal - Keep your existing modal code */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.darkCard]}>
            <View style={styles.modalHeader}>
              <ThemedText
                style={[styles.modalTitle, isDark && styles.darkText]}
              >
                Order Details
              </ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={isDark ? "#fff" : "#333"} />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Order Info */}
                <View style={styles.infoSection}>
                  <Text
                    style={[styles.sectionTitle, isDark && styles.darkText]}
                  >
                    Order Information
                  </Text>
                  <View style={styles.infoRow}>
                    <Text
                      style={[styles.infoLabel, isDark && styles.darkSubtitle]}
                    >
                      Order Number:
                    </Text>
                    <Text style={[styles.infoValue, isDark && styles.darkText]}>
                      {selectedOrder.order_number}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text
                      style={[styles.infoLabel, isDark && styles.darkSubtitle]}
                    >
                      Order Date:
                    </Text>
                    <Text style={[styles.infoValue, isDark && styles.darkText]}>
                      {formatDate(selectedOrder.order_date)}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text
                      style={[styles.infoLabel, isDark && styles.darkSubtitle]}
                    >
                      Delivery Date:
                    </Text>
                    <Text style={[styles.infoValue, isDark && styles.darkText]}>
                      {formatDate(selectedOrder.delivery_date)}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text
                      style={[styles.infoLabel, isDark && styles.darkSubtitle]}
                    >
                      Payment Method:
                    </Text>
                    <Text style={[styles.infoValue, isDark && styles.darkText]}>
                      {selectedOrder.payment_method?.toUpperCase() || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text
                      style={[styles.infoLabel, isDark && styles.darkSubtitle]}
                    >
                      Payment Status:
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        selectedOrder.payment_status === "completed"
                          ? styles.successText
                          : styles.warningText,
                      ]}
                    >
                      {selectedOrder.payment_status || "pending"}
                    </Text>
                  </View>
                </View>

                {/* Customer Info */}
                <View style={styles.infoSection}>
                  <Text
                    style={[styles.sectionTitle, isDark && styles.darkText]}
                  >
                    Customer Information
                  </Text>
                  <View style={styles.infoRow}>
                    <Text
                      style={[styles.infoLabel, isDark && styles.darkSubtitle]}
                    >
                      Name:
                    </Text>
                    <Text style={[styles.infoValue, isDark && styles.darkText]}>
                      {selectedOrder.customer_name || "Guest"}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text
                      style={[styles.infoLabel, isDark && styles.darkSubtitle]}
                    >
                      Phone:
                    </Text>
                    <Text style={[styles.infoValue, isDark && styles.darkText]}>
                      {selectedOrder.customer_phone || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text
                      style={[styles.infoLabel, isDark && styles.darkSubtitle]}
                    >
                      Address:
                    </Text>
                    <Text style={[styles.infoValue, isDark && styles.darkText]}>
                      {selectedOrder.address}, {selectedOrder.city},{" "}
                      {selectedOrder.state} - {selectedOrder.pincode}
                    </Text>
                  </View>
                </View>

                {/* Items List */}
                <View style={styles.infoSection}>
                  <Text
                    style={[styles.sectionTitle, isDark && styles.darkText]}
                  >
                    Items ({selectedOrder.item_count})
                  </Text>
                  {selectedOrderItems.map((item, index) => (
                    <View key={index} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <Text
                          style={[styles.itemName, isDark && styles.darkText]}
                        >
                          {item.product_name}
                        </Text>
                        <Text style={styles.itemPrice}>
                          ₹{parseFloat(item.price).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.itemDetails}>
                        <Text
                          style={[
                            styles.itemMeta,
                            isDark && styles.darkSubtitle,
                          ]}
                        >
                          Category: {item.product_category}
                        </Text>
                        {item.size && (
                          <View style={styles.sizeBadge}>
                            <Text style={styles.sizeText}>
                              Size: {item.size}
                            </Text>
                          </View>
                        )}
                        <Text
                          style={[
                            styles.itemMeta,
                            isDark && styles.darkSubtitle,
                          ]}
                        >
                          Quantity: {item.quantity}
                        </Text>
                        <Text style={styles.itemTotal}>
                          Total: ₹{parseFloat(item.total_price).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Price Summary */}
                <View style={styles.infoSection}>
                  <Text
                    style={[styles.sectionTitle, isDark && styles.darkText]}
                  >
                    Price Summary
                  </Text>
                  <View style={styles.priceRow}>
                    <Text
                      style={[styles.priceLabel, isDark && styles.darkSubtitle]}
                    >
                      Total Amount:
                    </Text>
                    <Text
                      style={[styles.priceValue, isDark && styles.darkText]}
                    >
                      ₹{parseFloat(selectedOrder.total_amount).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text
                      style={[styles.priceLabel, isDark && styles.darkSubtitle]}
                    >
                      Delivery Fee:
                    </Text>
                    <Text
                      style={[styles.priceValue, isDark && styles.darkText]}
                    >
                      ₹
                      {parseFloat(selectedOrder.delivery_fee || "0").toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text
                      style={[styles.priceLabel, isDark && styles.darkSubtitle]}
                    >
                      Tax:
                    </Text>
                    <Text
                      style={[styles.priceValue, isDark && styles.darkText]}
                    >
                      ₹{parseFloat(selectedOrder.tax_amount || "0").toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.priceRow, styles.grandTotalRow]}>
                    <Text
                      style={[
                        styles.grandTotalLabel,
                        isDark && styles.darkText,
                      ]}
                    >
                      Grand Total:
                    </Text>
                    <Text style={styles.grandTotalValue}>
                      ₹{parseFloat(selectedOrder.grand_total).toFixed(2)}
                    </Text>
                  </View>
                </View>

                {selectedOrder.notes && (
                  <View style={styles.infoSection}>
                    <Text
                      style={[styles.sectionTitle, isDark && styles.darkText]}
                    >
                      Notes
                    </Text>
                    <Text style={[styles.notes, isDark && styles.darkSubtitle]}>
                      {selectedOrder.notes}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  darkContainer: {
    backgroundColor: "#1a1a1a",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: "#ffebee",
    borderRadius: 20,
  },
  darkText: {
    color: "#fff",
  },
  darkSubtitle: {
    color: "#999",
  },
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
  darkCard: {
    backgroundColor: "#2a2a2a",
  },
  newOrderCard: {
    borderWidth: 1,
    borderColor: "#e53935",
    backgroundColor: "#fff5f5",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  orderDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  newBadge: {
    backgroundColor: "#e53935",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  viewIcon: {
    padding: 8,
    backgroundColor: "#ffebee",
    borderRadius: 20,
  },
  orderDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e53935",
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  darkLoadingContainer: {
    backgroundColor: "#1a1a1a",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  refreshIndicator: {
    alignItems: "center",
    paddingVertical: 16,
  },
  refreshText: {
    fontSize: 12,
    color: "#999",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "90%",
    maxHeight: "85%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: 120,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  itemCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e53935",
  },
  itemDetails: {
    gap: 4,
  },
  itemMeta: {
    fontSize: 12,
    color: "#666",
  },
  sizeBadge: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  sizeText: {
    fontSize: 10,
    color: "#e53935",
    fontWeight: "600",
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  priceValue: {
    fontSize: 14,
    color: "#333",
  },
  grandTotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e53935",
  },
  successText: {
    color: "#4caf50",
    fontWeight: "600",
  },
  warningText: {
    color: "#ff9800",
    fontWeight: "600",
  },
  notes: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
  },
});
