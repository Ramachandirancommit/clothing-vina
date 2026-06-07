import { Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Network from "expo-network";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { ThemedText } from "../../components/themed-text";
import { eventEmitter, EVENTS } from "../../utils/eventEmitter";
import { useTheme } from "../context/ThemeContext";

interface CartItem {
  id: number;
  cust_id: string;
  ip_address: string;
  cust_deviceid: string;
  product_id: number;
  product_name: string;
  product_category: string;
  price: number;
  quantity: number;
  product_image: string;
}

interface Address {
  id: number;
  address_label: string;
  address_text: string;
  city: string;
  state: string;
  pincode: string;
  is_primary: number;
}

export default function CartScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [custId, setCustId] = useState<string>("");
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Payment Modal State
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [processing, setProcessing] = useState(false);

  // Razorpay payment state
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [razorpayAmount, setRazorpayAmount] = useState(0);
  const [currentOrderId, setCurrentOrderId] = useState("");

  // Add Address Form State
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address_label: "Home",
    address_text: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const BASE_URL = "https://api.vinatrix-api.workers.dev";
  const CART_URL = `${BASE_URL}/api/cart`;

  // Razorpay Test Key (replace with your actual test key)
  const RAZORPAY_KEY = "rzp_live_SyeCkmvegychiI";

  // Helper function to get clean image URL
  const getImageUrl = (imagePath: string | undefined | null): string | null => {
    if (!imagePath || imagePath === null || imagePath === undefined) {
      return null;
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    let cleanPath = imagePath;
    if (cleanPath.startsWith("/")) {
      cleanPath = cleanPath;
    } else if (cleanPath.startsWith("uploads/")) {
      cleanPath = `/${cleanPath}`;
    } else {
      cleanPath = `/${cleanPath}`;
    }

    return `${BASE_URL}${cleanPath}`;
  };

  // Get device info
  const getDeviceInfo = async () => {
    try {
      const deviceName = Device.deviceName || "unknown";
      const ipAddress = await Network.getIpAddressAsync();
      return { deviceName, ipAddress };
    } catch (error) {
      return { deviceName: "unknown", ipAddress: "0.0.0.0" };
    }
  };

  // Get or create user from backend
  const getOrCreateUser = async (): Promise<string | null> => {
    try {
      const { deviceName, ipAddress } = await getDeviceInfo();
      const deviceId = `${deviceName}_${Device.osBuildId || Date.now()}`;

      const response = await fetch(`${BASE_URL}/api/user/get-or-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: deviceId,
          ip_address: ipAddress,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await AsyncStorage.setItem("app_user_id", data.user.user_uuid);
        if (data.user.full_name) {
          setCustomerName(data.user.full_name);
        }
        if (data.user.phone) {
          setCustomerPhone(data.user.phone);
        }
        if (data.user.email) {
          setCustomerEmail(data.user.email);
        }
        return data.user.user_uuid;
      }
    } catch (error) {
      console.error("Error getting/creating user:", error);
    }
    return null;
  };

  // Fetch addresses
  const fetchAddresses = async (uuid: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/user/profile/${uuid}`);
      const data = await response.json();

      if (data.success && data.addresses && data.addresses.length > 0) {
        setAddresses(data.addresses);
        const primaryAddress = data.addresses.find(
          (addr: Address) => addr.is_primary === 1,
        );
        if (primaryAddress) {
          setSelectedAddress(primaryAddress);
        } else {
          setSelectedAddress(data.addresses[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  // Add new address
  const addNewAddress = async () => {
    if (!newAddress.address_text || !newAddress.city || !newAddress.pincode) {
      Alert.alert("Error", "Please fill address, city and pincode");
      return;
    }

    try {
      const userUuid = await getOrCreateUser();

      const response = await fetch(`${BASE_URL}/api/user/profile/${userUuid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: customerName,
          user_name: "",
          email: customerEmail,
          phone: customerPhone,
          addresses: [
            ...addresses.map((addr) => ({
              label: addr.address_label,
              address: addr.address_text,
              city: addr.city,
              state: addr.state,
              pincode: addr.pincode,
              isPrimary: addr.is_primary === 1,
              address_type: addr.address_label === "Home" ? "home" : "other",
            })),
            {
              label: newAddress.address_label,
              address: newAddress.address_text,
              city: newAddress.city,
              state: newAddress.state,
              pincode: newAddress.pincode,
              isPrimary: addresses.length === 0,
              address_type:
                newAddress.address_label === "Home" ? "home" : "other",
            },
          ],
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchAddresses(userUuid!);
        setShowAddAddressForm(false);
        setNewAddress({
          address_label: "Home",
          address_text: "",
          city: "",
          state: "",
          pincode: "",
        });
        Alert.alert("Success", "Address added successfully");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      Alert.alert("Error", "Failed to add address");
    }
  };

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    try {
      if (!custId) return;

      const { ipAddress, deviceName } = await getDeviceInfo();

      const response = await fetch(
        `${CART_URL}?cust_id=${custId}&ip_address=${ipAddress}&device_id=${deviceName}`,
      );

      const data = await response.json();

      if (data.success) {
        setCartItems(data.items || []);
        setTotal(data.total || 0);
        setImageErrors({});
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [custId]);

  useEffect(() => {
    const init = async () => {
      const userId = await getOrCreateUser();
      if (userId) {
        setCustId(userId);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (custId) {
      fetchCart();
    }
  }, [custId, fetchCart]);

  // Listen for cart updated events
  useEffect(() => {
    const handleCartUpdated = () => {
      fetchCart();
    };

    eventEmitter.on(EVENTS.CART_UPDATED, handleCartUpdated);

    return () => {
      eventEmitter.off(EVENTS.CART_UPDATED, handleCartUpdated);
    };
  }, [fetchCart]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    try {
      const userId = await getOrCreateUser();
      const response = await fetch(`${CART_URL}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cust_id: userId,
          productId,
          quantity: newQuantity,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchCart();
        eventEmitter.emit(EVENTS.CART_UPDATED);
        eventEmitter.emit(EVENTS.CART_COUNT_UPDATED);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      Alert.alert("Error", "Failed to update quantity");
    }
  };

  const removeItem = (productId: number) => {
    Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        onPress: async () => {
          try {
            const userId = await getOrCreateUser();
            const response = await fetch(`${CART_URL}/remove`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cust_id: userId,
                productId,
              }),
            });

            const data = await response.json();
            if (data.success) {
              fetchCart();
              eventEmitter.emit(EVENTS.CART_UPDATED);
              eventEmitter.emit(EVENTS.CART_COUNT_UPDATED);
              Alert.alert("Success", "Item removed from cart");
            }
          } catch (error) {
            Alert.alert("Error", "Failed to remove item");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const clearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to clear your entire cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          onPress: async () => {
            try {
              const userId = await getOrCreateUser();
              const response = await fetch(`${CART_URL}/clear`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cust_id: userId }),
              });

              const data = await response.json();
              if (data.success) {
                fetchCart();
                eventEmitter.emit(EVENTS.CART_UPDATED);
                eventEmitter.emit(EVENTS.CART_COUNT_UPDATED);
                Alert.alert("Success", "Cart cleared");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to clear cart");
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  // Open payment modal
  const openPaymentModal = async () => {
    if (cartItems.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Please add items to your cart before checkout.",
      );
      return;
    }

    const userId = await getOrCreateUser();
    if (userId) {
      await fetchAddresses(userId);
    }
    setPaymentModalVisible(true);
  };

  const getMySQLDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // ==================== RAZORPAY PAYMENT ====================

  // Create Razorpay Order
  const createRazorpayOrder = async (amount: number) => {
    try {
      const response = await fetch(`${BASE_URL}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  // Initiate Razorpay Checkout
  const initiateRazorpayPayment = async () => {
    setProcessing(true);

    try {
      // Create order on backend
      const orderData = await createRazorpayOrder(total);

      if (!orderData.success && !orderData.id) {
        Alert.alert("Error", "Failed to create payment order");
        setProcessing(false);
        return;
      }

      const options = {
        description: "Vinatrix Order Payment",
        image: "https://vinatrix.com/logo.png",
        currency: "INR",
        key: RAZORPAY_KEY,
        amount: total * 100, // Convert to paise
        name: "Vinatrix",
        order_id: orderData.id,
        prefill: {
          email: customerEmail || "customer@vinatrix.com",
          contact: customerPhone,
          name: customerName,
        },
        theme: { color: "#e53935" },
      };

      RazorpayCheckout.open(options)
        .then(async (data) => {
          // Payment success - verify on backend
          const verifyResponse = await fetch(`${BASE_URL}/api/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_id: orderData.id,
              payment_id: data.razorpay_payment_id,
              signature: data.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            // Payment verified - place order
            await placeOrderAfterPayment();
          } else {
            Alert.alert("Error", "Payment verification failed");
            setProcessing(false);
          }
        })
        .catch((error) => {
          console.error("Razorpay error:", error);
          Alert.alert("Error", error.description || "Payment failed");
          setProcessing(false);
        });
    } catch (error) {
      console.error("Payment initiation error:", error);
      Alert.alert("Error", "Something went wrong");
      setProcessing(false);
    }
  };

  // Place order after successful payment
  const placeOrderAfterPayment = async () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Please select a delivery address");
      setProcessing(false);
      return;
    }

    if (!customerName.trim()) {
      Alert.alert("Error", "Please enter your name");
      setProcessing(false);
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number (10 digits)");
      setProcessing(false);
      return;
    }

    const orderData = {
      cust_id: custId,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      address: selectedAddress.address_text,
      city: selectedAddress.city,
      state: selectedAddress.state,
      pincode: selectedAddress.pincode,
      total_amount: total,
      delivery_fee: 0,
      tax_amount: 0,
      grand_total: total,
      item_count: cartItems.length,
      payment_method: "razorpay",
      order_date: getMySQLDate(),
      cart_items: cartItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_category: item.product_category,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await fetch(`${BASE_URL}/api/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentModalVisible(false);
        setShowRazorpay(false);

        // Clear cart after successful order
        const userId = await getOrCreateUser();
        if (userId) {
          await fetch(`${CART_URL}/clear`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cust_id: userId }),
          });
          fetchCart();
          eventEmitter.emit(EVENTS.CART_UPDATED);
          eventEmitter.emit(EVENTS.CART_COUNT_UPDATED);
        }

        Alert.alert(
          "✅ Order Placed Successfully! 🎉🎉🎉",
          `Order #${data.order.order_number}\nTotal: ₹${total.toFixed(2)}\nItems: ${cartItems.length}\nPayment: Razorpay\n\nDelivery to: ${selectedAddress.address_text}`,
          [
            {
              text: "Track Order",
              onPress: () => router.push("/track-orders"),
            },
          ],
        );
      } else {
        Alert.alert("Error", data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Handle place order button click (for Cash/UPI/Card)
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }

    if (!customerName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number (10 digits)");
      return;
    }

    // For Razorpay, open payment checkout
    if (selectedPaymentMethod === "razorpay") {
      setPaymentModalVisible(false);
      await initiateRazorpayPayment();
      return;
    }

    // For card payment validation
    if (selectedPaymentMethod === "card") {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        Alert.alert("Error", "Please fill all card details");
        return;
      }
      if (cardNumber.replace(/\s/g, "").length < 16) {
        Alert.alert("Error", "Please enter valid card number");
        return;
      }
    }

    setProcessing(true);

    const orderData = {
      cust_id: custId,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      address: selectedAddress.address_text,
      city: selectedAddress.city,
      state: selectedAddress.state,
      pincode: selectedAddress.pincode,
      total_amount: total,
      delivery_fee: 0,
      tax_amount: 0,
      grand_total: total,
      item_count: cartItems.length,
      payment_method: selectedPaymentMethod,
      order_date: getMySQLDate(),
      cart_items: cartItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_category: item.product_category,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await fetch(`${BASE_URL}/api/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentModalVisible(false);

        const userId = await getOrCreateUser();
        if (userId) {
          await fetch(`${CART_URL}/clear`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cust_id: userId }),
          });
          fetchCart();
          eventEmitter.emit(EVENTS.CART_UPDATED);
          eventEmitter.emit(EVENTS.CART_COUNT_UPDATED);
        }

        Alert.alert(
          "✅ Order Placed Successfully! 🎉🎉🎉",
          `Order #${data.order.order_number}\nTotal: ₹${total.toFixed(2)}\nItems: ${cartItems.length}\nPayment: ${getPaymentMethodName(selectedPaymentMethod)}\n\nDelivery to: ${selectedAddress.address_text}`,
          [
            {
              text: "Track Order",
              onPress: () => router.push("/track-orders"),
            },
          ],
        );
      } else {
        Alert.alert("Error", data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentMethodName = (methodId: string) => {
    const methods: Record<string, string> = {
      cash: "Cash on Delivery",
      upi: "UPI",
      card: "Credit/Debit Card",
      razorpay: "Razorpay",
    };
    return methods[methodId] || methodId;
  };

  const paymentMethods = [
    { id: "cash", name: "Cash on Delivery", icon: "money", color: "#4caf50" },
    { id: "upi", name: "UPI", icon: "qr-code-scanner", color: "#2196f3" },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: "credit-card",
      color: "#ff9800",
    },
    {
      id: "razorpay",
      name: "Razorpay (Card/UPI/Wallet)",
      icon: "payment",
      color: "#e53935",
    },
  ];

  const goToProfileInfo = () => {
    setPaymentModalVisible(false);
    router.push("/profile-info" as any);
  };

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, isDark && styles.darkLoadingContainer]}
      >
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={[styles.loadingText, isDark && styles.darkText]}>
          Loading cart...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkSafeArea]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.header, isDark && styles.darkHeader]}>
          <ThemedText style={[styles.title, isDark && styles.darkText]}>
            Your Cart 🛒
          </ThemedText>
          <Text style={[styles.subtitle, isDark && styles.darkSubtitle]}>
            {cartItems.length} items
          </Text>
          {cartItems.length > 0 && (
            <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Feather
              name="shopping-cart"
              size={80}
              color={isDark ? "#666" : "#ccc"}
            />
            <Text style={[styles.emptyText, isDark && styles.darkText]}>
              Your cart is empty
            </Text>
            <Text style={[styles.emptySubText, isDark && styles.darkSubtitle]}>
              Add items from the home screen
            </Text>
          </View>
        ) : (
          <>
            {cartItems.map((item) => {
              const imageUrl = getImageUrl(item.product_image);
              const hasImageError = imageErrors[item.id];

              return (
                <View
                  key={item.id}
                  style={[styles.cartItem, isDark && styles.darkCartItem]}
                >
                  <View style={styles.itemImageContainer}>
                    {imageUrl && !hasImageError ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.itemImage}
                        resizeMode="cover"
                        onError={() => {
                          setImageErrors((prev) => ({
                            ...prev,
                            [item.id]: true,
                          }));
                        }}
                      />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Feather name="shopping-bag" size={30} color="#ccc" />
                      </View>
                    )}
                  </View>

                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, isDark && styles.darkText]}>
                      {item.product_name}
                    </Text>
                    <Text
                      style={[
                        styles.itemCategory,
                        isDark && styles.darkSubtitle,
                      ]}
                    >
                      {item.product_category}
                    </Text>
                    <Text style={styles.itemPrice}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </Text>

                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() =>
                          updateQuantity(item.product_id, item.quantity - 1)
                        }
                      >
                        <Feather name="minus" size={16} color="#e53935" />
                      </TouchableOpacity>
                      <Text style={[styles.qtyText, isDark && styles.darkText]}>
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() =>
                          updateQuantity(item.product_id, item.quantity + 1)
                        }
                      >
                        <Feather name="plus" size={16} color="#e53935" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(item.product_id)}
                  >
                    <Feather name="trash-2" size={20} color="#e53935" />
                  </TouchableOpacity>
                </View>
              );
            })}

            <View
              style={[
                styles.totalContainer,
                isDark && styles.darkTotalContainer,
              ]}
            >
              <Text style={[styles.totalLabel, isDark && styles.darkText]}>
                Total Amount
              </Text>
              <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={openPaymentModal}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>

            <View style={styles.bottomPadding} />
          </>
        )}
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentModalVisible}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, isDark && styles.darkModalContainer]}
          >
            <View
              style={[styles.modalHeader, isDark && styles.darkModalHeader]}
            >
              <Text style={[styles.modalTitle, isDark && styles.darkText]}>
                Checkout
              </Text>
              <TouchableOpacity
                onPress={() => setPaymentModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color={isDark ? "#fff" : "#333"} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Customer Details Section */}
              <View style={[styles.sectionCard, isDark && styles.darkCard]}>
                <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
                  Customer Details
                </Text>
                <TextInput
                  style={[styles.input, isDark && styles.darkInput]}
                  placeholder="Full Name *"
                  placeholderTextColor={isDark ? "#999" : "#666"}
                  value={customerName}
                  onChangeText={setCustomerName}
                />
                <TextInput
                  style={[styles.input, isDark && styles.darkInput]}
                  placeholder="Phone Number *"
                  placeholderTextColor={isDark ? "#999" : "#666"}
                  keyboardType="phone-pad"
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  maxLength={10}
                />
                <TextInput
                  style={[styles.input, isDark && styles.darkInput]}
                  placeholder="Email (Optional)"
                  placeholderTextColor={isDark ? "#999" : "#666"}
                  keyboardType="email-address"
                  value={customerEmail}
                  onChangeText={setCustomerEmail}
                />
              </View>

              {/* Order Summary */}
              <View style={[styles.summaryCard, isDark && styles.darkCard]}>
                <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
                  Order Summary
                </Text>
                {cartItems.map((item, idx) => (
                  <View key={idx} style={styles.orderItemRow}>
                    <Text
                      style={[
                        styles.orderItemName,
                        isDark && styles.darkSubtitle,
                      ]}
                    >
                      {item.product_name} x {item.quantity}
                    </Text>
                    <Text
                      style={[styles.orderItemPrice, isDark && styles.darkText]}
                    >
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text
                    style={[styles.summaryLabel, isDark && styles.darkSubtitle]}
                  >
                    Items Total
                  </Text>
                  <Text
                    style={[styles.summaryValue, isDark && styles.darkText]}
                  >
                    ₹{total.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text
                    style={[styles.summaryLabel, isDark && styles.darkSubtitle]}
                  >
                    Delivery Fee
                  </Text>
                  <Text
                    style={[styles.summaryValue, isDark && styles.darkText]}
                  >
                    ₹0.00
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text
                    style={[styles.totalLabelLarge, isDark && styles.darkText]}
                  >
                    Total to Pay
                  </Text>
                  <Text
                    style={[styles.totalAmountLarge, isDark && styles.darkText]}
                  >
                    ₹{total.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Delivery Address */}
              <View style={[styles.sectionCard, isDark && styles.darkCard]}>
                <View style={styles.sectionHeaderRow}>
                  <Text
                    style={[styles.sectionTitle, isDark && styles.darkText]}
                  >
                    Delivery Address
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowAddAddressForm(!showAddAddressForm)}
                    style={styles.addButton}
                  >
                    <Feather name="plus" size={20} color="#e53935" />
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {showAddAddressForm && (
                  <View
                    style={[
                      styles.addAddressForm,
                      isDark && styles.darkAddAddressForm,
                    ]}
                  >
                    <TextInput
                      style={[styles.input, isDark && styles.darkInput]}
                      placeholder="Label (Home, Office)"
                      placeholderTextColor={isDark ? "#999" : "#666"}
                      value={newAddress.address_label}
                      onChangeText={(text) =>
                        setNewAddress({ ...newAddress, address_label: text })
                      }
                    />
                    <TextInput
                      style={[
                        styles.input,
                        styles.textArea,
                        isDark && styles.darkInput,
                      ]}
                      placeholder="Address *"
                      placeholderTextColor={isDark ? "#999" : "#666"}
                      value={newAddress.address_text}
                      onChangeText={(text) =>
                        setNewAddress({ ...newAddress, address_text: text })
                      }
                      multiline
                    />
                    <TextInput
                      style={[styles.input, isDark && styles.darkInput]}
                      placeholder="City *"
                      placeholderTextColor={isDark ? "#999" : "#666"}
                      value={newAddress.city}
                      onChangeText={(text) =>
                        setNewAddress({ ...newAddress, city: text })
                      }
                    />
                    <TextInput
                      style={[styles.input, isDark && styles.darkInput]}
                      placeholder="State"
                      placeholderTextColor={isDark ? "#999" : "#666"}
                      value={newAddress.state}
                      onChangeText={(text) =>
                        setNewAddress({ ...newAddress, state: text })
                      }
                    />
                    <TextInput
                      style={[styles.input, isDark && styles.darkInput]}
                      placeholder="Pincode *"
                      placeholderTextColor={isDark ? "#999" : "#666"}
                      keyboardType="numeric"
                      value={newAddress.pincode}
                      onChangeText={(text) =>
                        setNewAddress({ ...newAddress, pincode: text })
                      }
                    />
                    <View style={styles.formButtons}>
                      <TouchableOpacity
                        style={styles.cancelFormButton}
                        onPress={() => setShowAddAddressForm(false)}
                      >
                        <Text style={styles.cancelFormText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveFormButton}
                        onPress={addNewAddress}
                      >
                        <Text style={styles.saveFormText}>Save Address</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {addresses.length === 0 && !showAddAddressForm ? (
                  <View style={styles.noAddressContainer}>
                    <Text
                      style={[
                        styles.noAddressText,
                        isDark && styles.darkSubtitle,
                      ]}
                    >
                      No saved addresses found
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowAddAddressForm(true)}
                    >
                      <Text style={styles.addAddressLinkText}>
                        + Add Address
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  addresses.map((address) => (
                    <TouchableOpacity
                      key={address.id}
                      style={[
                        styles.addressOption,
                        selectedAddress?.id === address.id &&
                          styles.addressOptionSelected,
                      ]}
                      onPress={() => setSelectedAddress(address)}
                    >
                      <View style={styles.addressRadio}>
                        {selectedAddress?.id === address.id && (
                          <View style={styles.radioSelected} />
                        )}
                      </View>
                      <View style={styles.addressDetails}>
                        <Text
                          style={[
                            styles.addressLabel,
                            isDark && styles.darkText,
                          ]}
                        >
                          {address.address_label}
                        </Text>
                        <Text
                          style={[
                            styles.addressText,
                            isDark && styles.darkSubtitle,
                          ]}
                        >
                          {address.address_text}
                        </Text>
                        <Text
                          style={[
                            styles.addressText,
                            isDark && styles.darkSubtitle,
                          ]}
                        >
                          {address.city}, {address.state} - {address.pincode}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              {/* Payment Method */}
              <View style={[styles.sectionCard, isDark && styles.darkCard]}>
                <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
                  Payment Method
                </Text>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentOption,
                      selectedPaymentMethod === method.id &&
                        styles.paymentOptionSelected,
                    ]}
                    onPress={() => setSelectedPaymentMethod(method.id)}
                  >
                    <MaterialIcons
                      name={method.icon as any}
                      size={24}
                      color={method.color}
                    />
                    <Text
                      style={[
                        styles.paymentOptionText,
                        isDark && styles.darkText,
                      ]}
                    >
                      {method.name}
                    </Text>
                    <View style={styles.radioCircle}>
                      {selectedPaymentMethod === method.id && (
                        <View style={styles.radioSelectedDot} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Card Details (only for card payment) */}
              {selectedPaymentMethod === "card" && (
                <View style={[styles.sectionCard, isDark && styles.darkCard]}>
                  <Text
                    style={[styles.sectionTitle, isDark && styles.darkText]}
                  >
                    Card Details
                  </Text>
                  <TextInput
                    style={[styles.input, isDark && styles.darkInput]}
                    placeholder="Card Number (16 digits)"
                    placeholderTextColor={isDark ? "#999" : "#666"}
                    keyboardType="numeric"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    maxLength={16}
                  />
                  <TextInput
                    style={[styles.input, isDark && styles.darkInput]}
                    placeholder="Cardholder Name"
                    placeholderTextColor={isDark ? "#999" : "#666"}
                    value={cardName}
                    onChangeText={setCardName}
                  />
                  <View style={styles.rowInputs}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.halfInput,
                        isDark && styles.darkInput,
                      ]}
                      placeholder="MM/YY"
                      placeholderTextColor={isDark ? "#999" : "#666"}
                      value={cardExpiry}
                      onChangeText={setCardExpiry}
                      maxLength={5}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        styles.halfInput,
                        isDark && styles.darkInput,
                      ]}
                      placeholder="CVV"
                      placeholderTextColor={isDark ? "#999" : "#666"}
                      keyboardType="numeric"
                      secureTextEntry
                      value={cardCvv}
                      onChangeText={setCardCvv}
                      maxLength={4}
                    />
                  </View>
                </View>
              )}

              {/* Place Order Button */}
              <TouchableOpacity
                style={[
                  styles.placeOrderButton,
                  processing && styles.disabledButton,
                ]}
                onPress={handlePlaceOrder}
                disabled={processing}
              >
                <Text style={styles.placeOrderText}>
                  {processing
                    ? "Processing..."
                    : `Place Order • ₹${total.toFixed(2)}`}
                </Text>
              </TouchableOpacity>

              <View style={styles.bottomModalPadding} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  darkSafeArea: { backgroundColor: "#1a1a1a" },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  darkLoadingContainer: { backgroundColor: "#1a1a1a" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  darkHeader: { backgroundColor: "#2a2a2a", borderBottomColor: "#3a3a3a" },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  darkText: { color: "#fff" },
  darkSubtitle: { color: "#999" },
  clearButton: { position: "absolute", right: 20, top: 20 },
  clearButtonText: { color: "#e53935", fontSize: 14, fontWeight: "500" },
  emptyCart: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    paddingBottom: 100,
  },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#999", marginTop: 16 },
  emptySubText: { fontSize: 14, color: "#ccc", marginTop: 8 },
  cartItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  darkCartItem: { backgroundColor: "#2a2a2a" },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  itemImage: { width: "100%", height: "100%" },
  placeholderImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 2 },
  itemCategory: { fontSize: 12, color: "#999", marginTop: 2 },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e53935",
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffebee",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    minWidth: 30,
    textAlign: "center",
  },
  removeButton: { justifyContent: "center", paddingHorizontal: 8 },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  darkTotalContainer: { backgroundColor: "#2a2a2a" },
  totalLabel: { fontSize: 18, fontWeight: "600", color: "#333" },
  totalAmount: { fontSize: 24, fontWeight: "bold", color: "#e53935" },
  checkoutButton: {
    flexDirection: "row",
    backgroundColor: "#e53935",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  bottomPadding: { height: 80 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  darkModalContainer: { backgroundColor: "#1a1a1a" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  darkModalHeader: { borderBottomColor: "#3a3a3a" },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  modalCloseButton: { padding: 4 },
  modalContent: { padding: 16 },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  darkCard: { backgroundColor: "#2a2a2a" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  addButtonText: { color: "#e53935", fontSize: 14, fontWeight: "500" },
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderItemName: { fontSize: 14, color: "#666", flex: 1 },
  orderItemPrice: { fontSize: 14, fontWeight: "500", color: "#333" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 14, color: "#666" },
  summaryValue: { fontSize: 14, fontWeight: "500", color: "#333" },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 12 },
  totalLabelLarge: { fontSize: 16, fontWeight: "bold", color: "#333" },
  totalAmountLarge: { fontSize: 18, fontWeight: "bold", color: "#e53935" },
  addressOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    marginBottom: 12,
  },
  addressOptionSelected: { borderColor: "#e53935", backgroundColor: "#ffebee" },
  addressRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e53935",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e53935",
  },
  addressDetails: { flex: 1 },
  addressLabel: { fontSize: 16, fontWeight: "600", color: "#333" },
  addressText: { fontSize: 14, color: "#666", marginBottom: 2 },
  noAddressContainer: { alignItems: "center", padding: 20 },
  noAddressText: { fontSize: 14, color: "#666", marginBottom: 12 },
  addAddressLinkText: { color: "#e53935", fontSize: 14, fontWeight: "500" },
  addAddressForm: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  darkAddAddressForm: { backgroundColor: "#2a2a2a", borderColor: "#444" },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  darkInput: { borderColor: "#444", backgroundColor: "#333", color: "#fff" },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  rowInputs: { flexDirection: "row", gap: 12 },
  halfInput: { flex: 1 },
  formButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelFormButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveFormButton: {
    flex: 1,
    backgroundColor: "#e53935",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelFormText: { color: "#666", fontWeight: "500" },
  saveFormText: { color: "#fff", fontWeight: "500" },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    marginBottom: 12,
  },
  paymentOptionSelected: { borderColor: "#e53935", backgroundColor: "#ffebee" },
  paymentOptionText: { flex: 1, fontSize: 14, color: "#333", marginLeft: 12 },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e53935",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e53935",
  },
  placeOrderButton: {
    backgroundColor: "#e53935",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  placeOrderText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  disabledButton: { opacity: 0.6 },
  bottomModalPadding: { height: 30 },
});
