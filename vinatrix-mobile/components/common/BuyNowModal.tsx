// components/common/BuyNowModal.tsx

import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../app/context/ThemeContext";
import { useDeviceInfo } from "../../hooks/useDeviceInfo";
import { api } from "../../services/api";
import { PAYMENT_METHODS } from "../../utils/constants";
import { Product } from "../../utils/types";

interface BuyNowModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product;
  onOrderSuccess?: (orderId: string) => void;
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

export const BuyNowModal: React.FC<BuyNowModalProps> = ({
  visible,
  onClose,
  product,
  onOrderSuccess,
}) => {
  const { isDark } = useTheme();
  const { getUserId, getDeviceInfo, getOrCreateUser } = useDeviceInfo();

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [processing, setProcessing] = useState(false);

  // Add address form
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

  const BASE_URL = "https://api.vinatrix-api.workers.dev";

  const fetchAddresses = async (uuid: string) => {
    try {
      const response = await api.getUserProfile(uuid);
      if (
        response.success &&
        response.addresses &&
        response.addresses.length > 0
      ) {
        setAddresses(response.addresses);
        const primaryAddress = response.addresses.find(
          (addr: Address) => addr.is_primary === 1,
        );
        if (primaryAddress) {
          setSelectedAddress(primaryAddress);
        } else {
          setSelectedAddress(response.addresses[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
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

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    if (imagePath.startsWith("/uploads/")) {
      return `${BASE_URL}${imagePath}`;
    }
    return `${BASE_URL}/${imagePath}`;
  };

  const addNewAddress = async () => {
    if (!newAddress.address_text || !newAddress.city || !newAddress.pincode) {
      Alert.alert("Error", "Please fill address, city and pincode");
      return;
    }

    try {
      const userUuid = await getUserId();
      const response = await api.updateUserProfile(userUuid, {
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
      });

      if (response.success) {
        await fetchAddresses(userUuid);
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
      cust_id: await getUserId(),
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      address: selectedAddress.address_text,
      city: selectedAddress.city,
      state: selectedAddress.state,
      pincode: selectedAddress.pincode,
      total_amount: parseFloat(product.price),
      delivery_fee: 0,
      tax_amount: 0,
      grand_total: parseFloat(product.price),
      item_count: 1,
      payment_method: selectedPaymentMethod,
      order_date: getMySQLDate(),
      cart_items: [
        {
          product_id: parseInt(product.id),
          product_name: product.product_name,
          product_category: product.product_category,
          price: parseFloat(product.price),
          quantity: 1,
        },
      ],
    };

    try {
      const response = await api.createOrder(orderData);

      if (response.success) {
        Alert.alert(
          "✅ Order Placed Successfully! 🎉🎉🎉",
          `Order #${response.order.order_number}\nTotal: ₹${parseFloat(product.price).toFixed(2)}\nPayment: ${getPaymentMethodName(selectedPaymentMethod)}\n\nDelivery to: ${selectedAddress.address_text}`,
          [
            {
              text: "Track Order",
              onPress: () => {
                onClose();
                if (onOrderSuccess) {
                  onOrderSuccess(response.order.order_number);
                }
              },
            },
          ],
        );
        onClose();
      } else {
        Alert.alert("Error", response.error || "Failed to place order");
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
    };
    return methods[methodId] || methodId;
  };

  // Load user data when modal opens
  useEffect(() => {
    if (visible && product) {
      const loadUserData = async () => {
        const userId = await getUserId();
        if (userId) {
          await fetchAddresses(userId);
          const response = await api.getUserProfile(userId);
          if (response.success && response.user) {
            if (response.user.full_name)
              setCustomerName(response.user.full_name);
            if (response.user.phone) setCustomerPhone(response.user.phone);
            if (response.user.email) setCustomerEmail(response.user.email);
          }
        }
      };
      loadUserData();
    }
  }, [visible, product]);

  const safePrice = parseFloat(product?.price || "0");

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContainer, isDark && styles.darkModalContainer]}
        >
          <View style={[styles.modalHeader, isDark && styles.darkModalHeader]}>
            <Text style={[styles.modalTitle, isDark && styles.darkText]}>
              Buy Now - Checkout
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Text style={{ fontSize: 24, color: isDark ? "#fff" : "#333" }}>
                ❌
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Product Details */}
            {product && (
              <View style={[styles.summaryCard, isDark && styles.darkCard]}>
                <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
                  Product Details
                </Text>
                <View style={styles.buyNowProductRow}>
                  <Image
                    source={{ uri: getImageUrl(product.image) }}
                    style={styles.buyNowProductImage}
                    resizeMode="cover"
                  />
                  <View style={styles.buyNowProductInfo}>
                    <Text
                      style={[
                        styles.buyNowProductName,
                        isDark && styles.darkText,
                      ]}
                    >
                      {product.product_name}
                    </Text>
                    <Text
                      style={[
                        styles.buyNowProductCategory,
                        isDark && styles.darkSubtitle,
                      ]}
                    >
                      {product.product_category} | Size: {product.size}
                    </Text>
                    <Text style={styles.buyNowProductPrice}>
                      ₹{safePrice.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Customer Details */}
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
              <View style={styles.summaryRow}>
                <Text
                  style={[styles.summaryLabel, isDark && styles.darkSubtitle]}
                >
                  Item Total
                </Text>
                <Text style={[styles.summaryValue, isDark && styles.darkText]}>
                  ₹{safePrice.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text
                  style={[styles.summaryLabel, isDark && styles.darkSubtitle]}
                >
                  Delivery Fee
                </Text>
                <Text style={[styles.summaryValue, isDark && styles.darkText]}>
                  ₹0.00
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text
                  style={[styles.summaryLabel, isDark && styles.darkSubtitle]}
                >
                  Tax (GST)
                </Text>
                <Text style={[styles.summaryValue, isDark && styles.darkText]}>
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
                  ₹{safePrice.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Delivery Address */}
            <View style={[styles.sectionCard, isDark && styles.darkCard]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
                  Delivery Address
                </Text>
                <TouchableOpacity
                  onPress={() => setShowAddAddressForm(!showAddAddressForm)}
                  style={styles.addButton}
                >
                  <Text style={{ fontSize: 20, color: "#e53935" }}>➕</Text>
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
                  <TouchableOpacity onPress={() => setShowAddAddressForm(true)}>
                    <Text style={styles.addAddressLinkText}>+ Add Address</Text>
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
                        style={[styles.addressLabel, isDark && styles.darkText]}
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
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentOption,
                    selectedPaymentMethod === method.id &&
                      styles.paymentOptionSelected,
                  ]}
                  onPress={() => setSelectedPaymentMethod(method.id)}
                >
                  <Text style={{ fontSize: 24 }}>{method.icon}</Text>
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

            {/* Card Details */}
            {selectedPaymentMethod === "card" && (
              <View style={[styles.sectionCard, isDark && styles.darkCard]}>
                <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
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
                  : `Place Order • ₹${safePrice.toFixed(2)}`}
              </Text>
            </TouchableOpacity>

            <View style={styles.bottomModalPadding} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  darkModalContainer: {
    backgroundColor: "#1a1a1a",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  darkModalHeader: {
    borderBottomColor: "#3a3a3a",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  darkText: { color: "#fff" },
  darkSubtitle: { color: "#999" },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  darkCard: {
    backgroundColor: "#2a2a2a",
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addButtonText: {
    color: "#e53935",
    fontSize: 14,
    fontWeight: "500",
  },
  buyNowProductRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  buyNowProductImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  buyNowProductInfo: {
    flex: 1,
  },
  buyNowProductName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  buyNowProductCategory: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  buyNowProductPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e53935",
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
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
  totalLabelLarge: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalAmountLarge: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e53935",
  },
  addressOption: {
    flexDirection: "row",
    alignItems: "center",
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
  addressLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  noAddressContainer: {
    alignItems: "center",
    padding: 20,
  },
  noAddressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  addAddressLinkText: {
    color: "#e53935",
    fontSize: 14,
    fontWeight: "500",
  },
  addAddressForm: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  darkAddAddressForm: {
    backgroundColor: "#2a2a2a",
    borderColor: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  darkInput: {
    borderColor: "#444",
    backgroundColor: "#333",
    color: "#fff",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
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
  cancelFormText: {
    color: "#666",
    fontWeight: "500",
  },
  saveFormText: {
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
  placeOrderButton: {
    backgroundColor: "#e53935",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
  bottomModalPadding: {
    height: 30,
  },
});
