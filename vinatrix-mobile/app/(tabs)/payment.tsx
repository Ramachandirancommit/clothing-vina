import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { ThemedText } from "../../components/themed-text";

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_category: string;
  price: number;
  quantity: number;
  product_image: string;
}

interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Card details state (only for card payment)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // New address form
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  // Load data from params
  useEffect(() => {
    if (params.total) {
      setTotal(parseFloat(params.total as string));
    }
    if (params.itemCount) {
      setItemCount(parseInt(params.itemCount as string));
    }
    if (params.items) {
      try {
        const items = JSON.parse(params.items as string);
        setCartItems(items);
      } catch (error) {
        console.error("Error parsing cart items:", error);
      }
    }

    // Load saved addresses (mock data - replace with API call)
    loadAddresses();
  }, []);

  const loadAddresses = () => {
    // Mock addresses - replace with actual API call
    const mockAddresses: Address[] = [
      {
        id: "1",
        fullName: "John Doe",
        phone: "9876543210",
        address: "123 Main Street, Near Park",
        city: "Mumbai",
        pincode: "400001",
        isDefault: true,
      },
    ];
    setAddresses(mockAddresses);
    const defaultAddress = mockAddresses.find((addr) => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    }
  };

  const handleAddAddress = () => {
    if (
      !newAddress.fullName ||
      !newAddress.phone ||
      !newAddress.address ||
      !newAddress.city ||
      !newAddress.pincode
    ) {
      Alert.alert("Error", "Please fill all address fields");
      return;
    }

    const address: Address = {
      id: Date.now().toString(),
      ...newAddress,
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, address]);
    setSelectedAddress(address);
    setShowAddAddress(false);
    setNewAddress({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
    });
    Alert.alert("Success", "Address added successfully");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Please select or add a delivery address");
      return;
    }

    if (selectedPaymentMethod === "card") {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        Alert.alert("Error", "Please fill all card details");
        return;
      }
      // Basic card validation
      if (cardNumber.replace(/\s/g, "").length < 16) {
        Alert.alert("Error", "Please enter valid card number");
        return;
      }
      if (cardCvv.length < 3) {
        Alert.alert("Error", "Please enter valid CVV");
        return;
      }
    }

    setProcessing(true);

    // Simulate order placement
    setTimeout(() => {
      setProcessing(false);
      Alert.alert(
        "Order Placed Successfully! 🎉",
        `Your order has been placed successfully.\nOrder Total: ₹${total.toFixed(2)}\nItems: ${itemCount}\nPayment Method: ${selectedPaymentMethod.toUpperCase()}\nDelivery Address: ${selectedAddress.address}, ${selectedAddress.city}`,
        [
          {
            text: "Track Order",
            onPress: () => router.push("/track-orders"),
          },
          {
            text: "Continue Shopping",
            onPress: () => router.push("/"),
          },
        ],
      );
    }, 2000);
  };

  const paymentMethods = [
    { id: "cash", name: "Cash on Delivery", icon: "money", color: "#4caf50" },
    {
      id: "upi",
      name: "UPI (PhonePe, GPay)",
      icon: "qrcode",
      color: "#2196f3",
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: "credit-card",
      color: "#ff9800",
    },
  ];

  if (processing) {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={styles.processingText}>Placing your order...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Payment</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryValue}>₹{total.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Number of Products</Text>
            <Text style={styles.summaryValue}>{itemCount} items</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>₹{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Delivery Address Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>

          {addresses.length > 0 && !showAddAddress ? (
            <>
              {addresses.map((address) => (
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
                    <Text style={styles.addressName}>{address.fullName}</Text>
                    <Text style={styles.addressText}>{address.address}</Text>
                    <Text style={styles.addressText}>
                      {address.city} - {address.pincode}
                    </Text>
                    <Text style={styles.addressPhone}>📞 {address.phone}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.addAddressButton}
                onPress={() => setShowAddAddress(true)}
              >
                <Feather name="plus" size={20} color="#e53935" />
                <Text style={styles.addAddressText}>Add New Address</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.addAddressForm}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={newAddress.fullName}
                onChangeText={(text) =>
                  setNewAddress({ ...newAddress, fullName: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={newAddress.phone}
                onChangeText={(text) =>
                  setNewAddress({ ...newAddress, phone: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Address"
                value={newAddress.address}
                onChangeText={(text) =>
                  setNewAddress({ ...newAddress, address: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="City"
                value={newAddress.city}
                onChangeText={(text) =>
                  setNewAddress({ ...newAddress, city: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Pincode"
                keyboardType="numeric"
                value={newAddress.pincode}
                onChangeText={(text) =>
                  setNewAddress({ ...newAddress, pincode: text })
                }
              />
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.formButton, styles.cancelButton]}
                  onPress={() => setShowAddAddress(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formButton, styles.saveButton]}
                  onPress={handleAddAddress}
                >
                  <Text style={styles.saveButtonText}>Save Address</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Payment Method Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
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
              <Text style={styles.paymentOptionText}>{method.name}</Text>
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
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Card Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Card Number (16 digits)"
              keyboardType="numeric"
              maxLength={19}
              value={cardNumber}
              onChangeText={(text) => {
                let formatted = text.replace(/\s/g, "");
                if (formatted.length > 16) formatted = formatted.slice(0, 16);
                let display = "";
                for (let i = 0; i < formatted.length; i++) {
                  if (i > 0 && i % 4 === 0) display += " ";
                  display += formatted[i];
                }
                setCardNumber(display);
              }}
            />
            <TextInput
              style={styles.input}
              placeholder="Cardholder Name"
              value={cardName}
              onChangeText={setCardName}
            />
            <View style={styles.rowInputs}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="MM/YY"
                maxLength={5}
                value={cardExpiry}
                onChangeText={setCardExpiry}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="CVV"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                value={cardCvv}
                onChangeText={setCardCvv}
              />
            </View>
            <View style={styles.cardIcons}>
              <FontAwesome name="cc-visa" size={40} color="#1a1f71" />
              <FontAwesome name="cc-mastercard" size={40} color="#eb001b" />
              <FontAwesome name="cc-amex" size={40} color="#2e77bc" />
            </View>
          </View>
        )}

        {/* UPI Apps (only for UPI payment) */}
        {selectedPaymentMethod === "upi" && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>UPI Apps</Text>
            <View style={styles.upiApps}>
              <TouchableOpacity style={styles.upiApp}>
                <Text style={styles.upiAppText}>📱 Google Pay</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.upiApp}>
                <Text style={styles.upiAppText}>💛 PhonePe</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.upiApp}>
                <Text style={styles.upiAppText}>💙 Paytm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.upiApp}>
                <Text style={styles.upiAppText}>🟣 Amazon Pay</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Place Order Button */}
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeOrderText}>
            Place Order • ₹{total.toFixed(2)}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    paddingBottom: 30,
  },
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  summaryCard: {
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 12,
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
  addressOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    marginBottom: 12,
  },
  addressOptionSelected: {
    borderColor: "#e53935",
    backgroundColor: "#ffebee",
  },
  addressRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e53935",
    marginRight: 12,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e53935",
  },
  addressDetails: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  addAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e53935",
    borderRadius: 10,
    borderStyle: "dashed",
  },
  addAddressText: {
    color: "#e53935",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  addAddressForm: {
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  formButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  saveButton: {
    backgroundColor: "#e53935",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "500",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: "#e53935",
    backgroundColor: "#ffebee",
  },
  paymentOptionText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
  },
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
  cardIcons: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    justifyContent: "center",
  },
  upiApps: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  upiApp: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  upiAppText: {
    fontSize: 14,
    color: "#333",
  },
  placeOrderButton: {
    backgroundColor: "#e53935",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomPadding: {
    height: 30,
  },
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});
