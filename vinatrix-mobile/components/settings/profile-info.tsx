import * as Device from "expo-device";
import * as Network from "expo-network";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  goBack?: () => void;
}

interface Address {
  id?: number;
  label: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isPrimary: boolean;
  addressType: "home" | "office" | "guest" | "other";
}

// Custom Radio Button Component
const CustomRadioButton = ({
  selected,
  onPress,
  label,
}: {
  selected: boolean;
  onPress: () => void;
  label: string;
}) => {
  return (
    <TouchableOpacity style={styles.radioContainer} onPress={onPress}>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

export default function ProfileInfo({ goBack }: Props) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userUuid, setUserUuid] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Addresses - Initialize with Home address by default
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: undefined,
      label: "Home",
      address: "",
      city: "",
      state: "",
      pincode: "",
      isPrimary: true,
      addressType: "home",
    },
  ]);

  const BASE_URL = "https://api.vinatrix-api.workers.dev";

  // Get device info
  const getDeviceInfo = async () => {
    try {
      const deviceName = Device.deviceName || "unknown";
      const ipAddress = await Network.getIpAddressAsync();
      return { deviceName, ipAddress };
    } catch (error) {
      console.error("Error getting device info:", error);
      return { deviceName: "unknown", ipAddress: "0.0.0.0" };
    }
  };

  // Get or create user from backend
  const getOrCreateUser = async () => {
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
        setUserUuid(data.user.user_uuid);
        return data;
      }
    } catch (error) {
      console.error("Error getting/creating user:", error);
    }
    return null;
  };

  // Load profile from backend
  const loadProfile = async () => {
    try {
      setLoading(true);

      const userData = await getOrCreateUser();

      if (userData && userData.user.user_uuid) {
        const response = await fetch(
          `${BASE_URL}/api/user/profile/${userData.user.user_uuid}`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const profileData = await response.json();

        if (profileData.success) {
          setFullName(profileData.user.full_name || "");
          setUserName(profileData.user.user_name || "");
          setPhone(profileData.user.phone || "");
          setEmail(profileData.user.email || "");

          // Load addresses from backend
          if (profileData.addresses && profileData.addresses.length > 0) {
            const formattedAddresses = profileData.addresses.map(
              (addr: any) => ({
                id: addr.id,
                label: addr.address_label || "Home",
                address: addr.address_text || "",
                city: addr.city || "",
                state: addr.state || "",
                pincode: addr.pincode || "",
                isPrimary: addr.is_primary === 1,
                addressType: addr.address_type || "home",
              }),
            );
            setAddresses(formattedAddresses);
          } else {
            setAddresses([
              {
                id: undefined,
                label: "Home",
                address: "",
                city: "",
                state: "",
                pincode: "",
                isPrimary: true,
                addressType: "home",
              },
            ]);
          }

          const hasProfileData =
            profileData.user.full_name ||
            profileData.user.email ||
            (profileData.addresses && profileData.addresses.length > 0);
          setIsEditing(!hasProfileData);
        } else {
          console.error("Profile data success false:", profileData);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Scroll to bottom when new address is added
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Add new address
  const addAddress = () => {
    const guestCount = addresses.filter((a) =>
      a.label.startsWith("Guest"),
    ).length;
    const hasSecondary = addresses.some((a) => a.label === "Secondary");

    let newLabel = "";
    let newType: "home" | "office" | "guest" | "other" = "guest";

    if (!hasSecondary && addresses.length === 1) {
      newLabel = "Secondary";
      newType = "office";
    } else {
      const nextGuestNum = guestCount + 1;
      newLabel = `Guest ${nextGuestNum}`;
      newType = "guest";
    }

    const newAddress: Address = {
      id: undefined,
      label: newLabel,
      address: "",
      city: "",
      state: "",
      pincode: "",
      isPrimary: false,
      addressType: newType,
    };
    setAddresses([...addresses, newAddress]);
    scrollToBottom();
  };

  // Update address
  const updateAddressField = (
    index: number,
    field: keyof Address,
    value: string | boolean,
  ) => {
    const updated = [...addresses];
    updated[index] = { ...updated[index], [field]: value };
    setAddresses(updated);
  };

  // Remove address
  const removeAddress = (index: number) => {
    const addressToRemove = addresses[index];

    if (addressToRemove.label === "Home") {
      Alert.alert(
        "Cannot Remove",
        "Home address is required and cannot be deleted",
      );
      return;
    }

    if (addresses.length === 1) {
      Alert.alert("Error", "You need at least one address");
      return;
    }

    const updated = addresses.filter((_, i) => i !== index);

    if (addressToRemove.isPrimary && updated.length > 0) {
      const homeIndex = updated.findIndex((a) => a.label === "Home");
      if (homeIndex !== -1) {
        updated[homeIndex].isPrimary = true;
      } else {
        updated[0].isPrimary = true;
      }
    }

    setAddresses(updated);
  };

  // Set primary address
  const setPrimaryAddress = (index: number) => {
    const updated = addresses.map((addr, i) => ({
      ...addr,
      isPrimary: i === index,
    }));
    setAddresses(updated);
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return false;
    }
    if (!userName.trim()) {
      Alert.alert("Error", "Please enter a username");
      return false;
    }
    if (!phone.trim() || phone.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number (10 digits)");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    const homeAddress = addresses.find((a) => a.label === "Home");
    if (
      !homeAddress ||
      !homeAddress.address.trim() ||
      !homeAddress.city.trim() ||
      !homeAddress.pincode.trim()
    ) {
      Alert.alert(
        "Error",
        "Home address with complete details (Address, City, Pincode) is required",
      );
      return false;
    }

    if (homeAddress.pincode.length < 6) {
      Alert.alert("Error", "Please enter a valid pincode (6 digits)");
      return false;
    }

    return true;
  };

  // Save profile to backend
  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        full_name: fullName.trim(),
        user_name: userName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        addresses: addresses.map((addr) => ({
          label: addr.label,
          address: addr.address.trim(),
          city: addr.city.trim(),
          state: addr.state.trim(),
          pincode: addr.pincode.trim(),
          isPrimary: addr.isPrimary,
          address_type: addr.addressType,
        })),
      };

      console.log("Saving profile:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${BASE_URL}/api/user/profile/${userUuid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases based on status code
        switch (response.status) {
          case 409:
            Alert.alert(
              "Duplicate Email",
              data.error ||
                "This email address is already registered with another account. Please use a different email.",
            );
            break;
          case 400:
            Alert.alert(
              "Validation Error",
              data.error || "Please check your information and try again.",
            );
            break;
          case 500:
            Alert.alert(
              "Server Error",
              data.error ||
                "Something went wrong on our end. Please try again later.",
            );
            break;
          default:
            Alert.alert(
              "Error",
              data.error || `Server responded with status ${response.status}`,
            );
        }
        return;
      }

      if (data.success) {
        Alert.alert("Success", "Profile saved successfully!");
        setIsEditing(false);
        if (goBack) goBack();
      } else {
        Alert.alert("Error", data.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert(
        "Connection Error",
        "Unable to connect to the server. Please check your internet connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // View Mode (No Edit)
  if (!isEditing) {
    const hasProfileData =
      fullName || email || addresses.some((a) => a.address);

    if (!hasProfileData) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>👤</Text>
          </View>
          <Text style={styles.emptyTitle}>No Profile Found</Text>
          <Text style={styles.emptyText}>
            Add your profile information to get started
          </Text>
          <TouchableOpacity
            style={styles.addProfileButton}
            onPress={handleEdit}
          >
            <Text style={styles.addProfileButtonText}>+ Add Profile</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView style={styles.container}>
        <View style={styles.formCard}>
          <View style={styles.viewHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name:</Text>
            <Text style={styles.infoValue}>{fullName || "Not set"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Username:</Text>
            <Text style={styles.infoValue}>{userName || "Not set"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{phone || "Not set"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{email || "Not set"}</Text>
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Addresses</Text>

          {addresses.map((address, index) => (
            <View key={index} style={styles.addressDisplayCard}>
              <View style={styles.addressDisplayHeader}>
                <Text style={styles.addressLabel}>{address.label}</Text>
                {address.isPrimary && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>Primary</Text>
                  </View>
                )}
              </View>
              <Text style={styles.addressDisplayText}>
                {address.address || "Not added yet"}
              </Text>
              {address.city && (
                <Text style={styles.addressDisplayText}>{address.city}</Text>
              )}
              {address.state && (
                <Text style={styles.addressDisplayText}>{address.state}</Text>
              )}
              {address.pincode && (
                <Text style={styles.addressDisplayText}>
                  Pincode: {address.pincode}
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  // Edit Mode
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Edit Profile</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Username <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Choose a username"
              value={userName}
              onChangeText={setUserName}
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Phone Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email Address <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Addresses</Text>
            <TouchableOpacity style={styles.addButton} onPress={addAddress}>
              <Text style={styles.addButtonText}>+ Add More</Text>
            </TouchableOpacity>
          </View>

          {addresses.map((address, index) => (
            <View key={index} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Text style={styles.addressLabelStatic}>
                  {address.label}{" "}
                  {address.label === "Home" && (
                    <Text style={styles.required}>*</Text>
                  )}
                </Text>

                {address.label !== "Home" && (
                  <TouchableOpacity onPress={() => removeAddress(index)}>
                    <Text style={styles.removeIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Street Address Input */}
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter your address"
                placeholderTextColor="#999"
                value={address.address}
                onChangeText={(text) =>
                  updateAddressField(index, "address", text)
                }
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />

              {/* City Input */}
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor="#999"
                value={address.city}
                onChangeText={(text) => updateAddressField(index, "city", text)}
              />

              {/* State Input */}
              <TextInput
                style={styles.input}
                placeholder="State"
                placeholderTextColor="#999"
                value={address.state}
                onChangeText={(text) =>
                  updateAddressField(index, "state", text)
                }
              />

              {/* Pincode Input */}
              <TextInput
                style={[styles.input, styles.pincodeInput]}
                placeholder="Pincode"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={6}
                value={address.pincode}
                onChangeText={(text) =>
                  updateAddressField(index, "pincode", text)
                }
              />

              <CustomRadioButton
                selected={address.isPrimary}
                onPress={() => setPrimaryAddress(index)}
                label="Use as primary delivery address"
              />
            </View>
          ))}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.disabledButton]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  scrollContentContainer: { paddingBottom: 300 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: { marginTop: 12, fontSize: 14, color: "#666" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 20,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ffebee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  addProfileButton: {
    backgroundColor: "#e53935",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addProfileButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  viewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  editButton: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: { color: "#e53935", fontSize: 12, fontWeight: "600" },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: { width: 100, fontSize: 14, fontWeight: "500", color: "#666" },
  infoValue: { flex: 1, fontSize: 14, color: "#333" },
  addressDisplayCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  addressDisplayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  addressLabel: { fontSize: 14, fontWeight: "600", color: "#333" },
  addressDisplayText: { fontSize: 13, color: "#666", lineHeight: 18 },
  divider: { height: 1, backgroundColor: "#e0e0e0", marginVertical: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", color: "#333", marginBottom: 8 },
  required: { color: "#e53935" },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  textArea: { minHeight: 80, textAlignVertical: "top", marginBottom: 12 },
  pincodeInput: { width: "40%" },
  addButton: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: { color: "#e53935", fontSize: 12, fontWeight: "600" },
  addressCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addressLabelStatic: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    paddingVertical: 4,
    paddingHorizontal: 8,
    flex: 1,
  },
  primaryBadge: {
    backgroundColor: "#e53935",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  primaryBadgeText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  removeIcon: {
    color: "#e53935",
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 8,
  },
  radioContainer: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e53935",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioOuterSelected: { borderColor: "#e53935" },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e53935",
  },
  radioLabel: { fontSize: 12, color: "#666" },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: { color: "#666", fontSize: 16, fontWeight: "500" },
  saveButton: {
    flex: 1,
    backgroundColor: "#e53935",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  disabledButton: { opacity: 0.6 },
});
