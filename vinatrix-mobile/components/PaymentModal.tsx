import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { useTheme } from "../app/context/ThemeContext";

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  amount: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (paymentData: any) => void;
  onFailure: (error: any) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  amount,
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure,
}) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);

  const initiatePayment = async () => {
    setLoading(true);

    try {
      // 1. Create order on your backend
      const orderResponse = await fetch(
        "https://api.vinatrix-api.workers.dev/api/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amount }),
        },
      );

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        Alert.alert("Error", "Failed to create order");
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        description: "Vinatrix Order Payment",
        image: "https://vinatrix.com/logo.png",
        currency: "INR",
        key: "rzp_test_xxxxxxxxxxxxx", // Replace with your test key
        amount: amount * 100, // Convert to paise
        name: "Vinatrix",
        order_id: orderData.id,
        prefill: {
          email: customerEmail,
          contact: customerPhone,
          name: customerName,
        },
        theme: { color: "#e53935" },
      };

      RazorpayCheckout.open(options)
        .then((data) => {
          // Payment success
          Alert.alert("Success", "Payment completed!");
          onSuccess(data);
          onClose();
        })
        .catch((error) => {
          // Payment failed
          console.error("Payment error:", error);
          Alert.alert("Error", error.description || "Payment failed");
          onFailure(error);
        });
    } catch (error) {
      console.error("Order creation error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isDark && styles.darkModalContent]}>
          <Text style={[styles.title, isDark && styles.darkText]}>
            Payment Details
          </Text>

          <View style={styles.amountContainer}>
            <Text style={[styles.amountLabel, isDark && styles.darkText]}>
              Total Amount
            </Text>
            <Text style={styles.amountValue}>₹{amount.toFixed(2)}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.payButton}
              onPress={initiatePayment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.payButtonText}>
                  Pay ₹{amount.toFixed(2)}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "80%",
  },
  darkModalContent: {
    backgroundColor: "#1a1a1a",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  darkText: {
    color: "#fff",
  },
  amountContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#e53935",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  payButton: {
    flex: 1,
    backgroundColor: "#e53935",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  payButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PaymentModal;
