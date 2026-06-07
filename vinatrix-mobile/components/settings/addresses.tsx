import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  landmark: string;
  isDefault: boolean;
}

interface Props {
  goBack?: () => void; // Add this
}

export default function Addresses({ goBack }: Props) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    landmark: "",
  });

  const handleAddAddress = () => {
    if (
      !newAddress.fullName ||
      !newAddress.phone ||
      !newAddress.address ||
      !newAddress.city ||
      !newAddress.pincode
    ) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    const address: Address = {
      id: Date.now().toString(),
      ...newAddress,
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, address]);
    setShowForm(false);
    setNewAddress({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
      landmark: "",
    });
    Alert.alert("Success", "Address added successfully");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setShowForm(true)}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Add Address</Text>
        </TouchableOpacity>
      </View>

      {addresses.map((address) => (
        <View key={address.id} style={styles.addressCard}>
          <Text style={styles.addressName}>{address.fullName}</Text>
          <Text style={styles.addressText}>{address.address}</Text>
          <Text style={styles.addressText}>
            {address.city} - {address.pincode}
          </Text>
          <Text style={styles.addressPhone}>📞 {address.phone}</Text>
        </View>
      ))}

      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Add New Address</Text>
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
              style={styles.cancelButton}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddAddress}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { padding: 16 },
  addButton: {
    backgroundColor: "#e53935",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  addressCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  addressName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  addressText: { fontSize: 14, color: "#666", marginBottom: 2 },
  addressPhone: { fontSize: 12, color: "#999", marginTop: 8 },
  formCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  formTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  formButtons: { flexDirection: "row", gap: 12 },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#e53935",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: { color: "#666" },
  saveButtonText: { color: "#fff", fontWeight: "bold" },
});
