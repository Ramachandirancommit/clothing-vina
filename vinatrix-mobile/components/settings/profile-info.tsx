import * as Device from "expo-device";
import * as Network from "expo-network";
import React, { useEffect, useState } from "react";
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

export default function ProfileInfo({ goBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userUuid, setUserUuid] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // ✅ Single address fields (flat)
  const [addressLabel, setAddressLabel] = useState("Home");
  const [addressText, setAddressText] = useState("");
  const [addressType, setAddressType] = useState("home");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const BASE_URL = "https://api.vinatrix-api.workers.dev";

  // Get device info
  const getDeviceInfo = async () => {
    try {
      const deviceName = Device.deviceName || "unknown";
      const ipAddress = await Network.getIpAddressAsync();
      return { deviceName, ipAddress };
    } catch {
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
        body: JSON.stringify({ device_id: deviceId, ip_address: ipAddress }),
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
      if (!userData) return;

      const response = await fetch(
        `${BASE_URL}/api/user/profile/${userData.user.user_uuid}`,
        {
          headers: { Accept: "application/json" },
        },
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const profileData = await response.json();
      if (profileData.success) {
        const user = profileData.user;

        setFullName(user.full_name || "");
        setUserName(user.user_name || "");
        setPhone(user.phone || "");
        setEmail(user.email || "");

        // ✅ Load single address fields
        setAddressLabel(user.address_label || "Home");
        setAddressText(user.address_text || "");
        setAddressType(user.address_type || "home");
        setCity(user.city || "");
        setState(user.state || "");
        setPincode(user.pincode || "");

        const hasProfileData =
          user.full_name || user.email || user.address_text;
        setIsEditing(!hasProfileData);
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
    if (!addressText.trim() || !city.trim() || !pincode.trim()) {
      Alert.alert(
        "Error",
        "Please fill in complete address (Address, City, Pincode)",
      );
      return false;
    }
    if (pincode.length < 6) {
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
        address_label: addressLabel.trim() || "Home",
        address_text: addressText.trim(),
        address_type: addressType.trim() || "home",
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      };

      console.log("Saving profile:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${BASE_URL}/api/user/profile/${userUuid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          Alert.alert(
            "Duplicate Entry",
            data.error || "Email or phone already registered.",
          );
        } else {
          Alert.alert("Error", data.error || "Failed to save profile");
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
      Alert.alert("Connection Error", "Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // View Mode (not editing)
  if (!isEditing) {
    const hasData = fullName || email || addressText;
    if (!hasData) {
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
            onPress={() => setIsEditing(true)}
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
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
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
          <Text style={styles.sectionTitle}>Address</Text>
          <View style={styles.addressDisplayCard}>
            <Text style={styles.addressLabel}>{addressLabel}</Text>
            <Text style={styles.addressDisplayText}>
              {addressText || "Not set"}
            </Text>
            {city && <Text style={styles.addressDisplayText}>{city}</Text>}
            {state && <Text style={styles.addressDisplayText}>{state}</Text>}
            {pincode && (
              <Text style={styles.addressDisplayText}>Pincode: {pincode}</Text>
            )}
          </View>
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
        style={styles.container}
        showsVerticalScrollIndicator={false}
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
              placeholder="Full name"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Username <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={userName}
              onChangeText={setUserName}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Phone <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Primary Address</Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Street address *"
            multiline
            numberOfLines={2}
            value={addressText}
            onChangeText={setAddressText}
          />
          <TextInput
            style={styles.input}
            placeholder="City *"
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={styles.input}
            placeholder="State"
            value={state}
            onChangeText={setState}
          />
          <TextInput
            style={styles.input}
            placeholder="Pincode *"
            keyboardType="numeric"
            maxLength={6}
            value={pincode}
            onChangeText={setPincode}
          />

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
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  addressDisplayText: { fontSize: 13, color: "#666", lineHeight: 18 },
  divider: { height: 1, backgroundColor: "#e0e0e0", marginVertical: 20 },
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
  textArea: { minHeight: 80, textAlignVertical: "top" },
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
