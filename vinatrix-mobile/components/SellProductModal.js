import { AntDesign, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "https://api.vinatrix-api.workers.dev";
const API_URL = `${BASE_URL}/api/products`;

const SellProductModal = ({ visible, onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    product_category: "",
    product_name: "",
    size: "",
    price: "",
    quantity: "1",
    description: "",
    product_image: null,
  });

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const categories = [
    "Tshirt",
    "Shirt",
    "Pant",
    "Track",
    "Jeans Pant",
    "Party Wears",
    "Colorful Picks",
    "Trending",
  ];

  const sizes = ["S", "M", "L", "XL", "XXL", "XXXL"];

  // Web: Create file input
  const pickImageWeb = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setFormData({
            ...formData,
            product_image: file,
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Mobile: Pick image from gallery
  const pickImageMobile = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Needed",
          "Please grant permission to access your photos",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        setFormData({
          ...formData,
          product_image: selectedImage,
        });
        setImagePreview(selectedImage.uri);
      }
    } catch (error) {
      console.error("❌ Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // Mobile: Take photo with camera
  const takePhotoMobile = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Needed", "Please grant camera permission");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const capturedImage = result.assets[0];
        setFormData({
          ...formData,
          product_image: capturedImage,
        });
        setImagePreview(capturedImage.uri);
      }
    } catch (error) {
      console.error("❌ Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  // Platform-specific image picker
  const showImageOptions = () => {
    if (Platform.OS === "web") {
      pickImageWeb();
    } else {
      Alert.alert(
        "Add Product Image",
        "Choose an option",
        [
          { text: "Take Photo", onPress: takePhotoMobile },
          { text: "Choose from Gallery", onPress: pickImageMobile },
          { text: "Cancel", style: "cancel" },
        ],
        { cancelable: true },
      );
    }
  };

  const incrementQuantity = () => {
    const currentQty = parseInt(formData.quantity) || 0;
    setFormData({
      ...formData,
      quantity: (currentQty + 1).toString(),
    });
  };

  const decrementQuantity = () => {
    const currentQty = parseInt(formData.quantity) || 0;
    if (currentQty > 1) {
      setFormData({
        ...formData,
        quantity: (currentQty - 1).toString(),
      });
    }
  };

  const submitProduct = async () => {
    // Validation
    if (!formData.product_category) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    if (!formData.product_name.trim()) {
      Alert.alert("Error", "Please enter product name");
      return;
    }
    if (!formData.size) {
      Alert.alert("Error", "Please select a size");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert("Error", "Please enter valid price");
      return;
    }
    if (!formData.product_image) {
      Alert.alert("Error", "Please add product image");
      return;
    }

    setLoading(true);

    try {
      const apiFormData = new FormData();
      apiFormData.append("product_category", formData.product_category);
      apiFormData.append("product_name", formData.product_name);
      apiFormData.append("size", formData.size);
      apiFormData.append("price", formData.price);
      apiFormData.append("quantity", formData.quantity);
      apiFormData.append("description", formData.description);

      // Handle image for web vs mobile
      if (Platform.OS === "web") {
        const file = formData.product_image;
        apiFormData.append("product_image", file);
      } else {
        const imageUri = formData.product_image.uri;
        const filename = imageUri.split("/").pop() || "product.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        apiFormData.append("product_image", {
          uri:
            Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
          type: type,
          name: filename,
        });
      }

      console.log("📤 Uploading product...");

      const response = await fetch(API_URL, {
        method: "POST",
        body: apiFormData,
      });

      const data = await response.json();
      console.log("✅ Server Response:", data);

      if (response.ok && data.success) {
        // Reset form
        setFormData({
          product_category: "",
          product_name: "",
          size: "",
          price: "",
          quantity: "1",
          description: "",
          product_image: null,
        });
        setImagePreview(null);
        setLoading(false);
        onClose();

        Alert.alert(
          "Success",
          "Product added successfully!",
          [
            {
              text: "OK",
              onPress: async () => {
                if (onProductAdded) {
                  await onProductAdded();
                }
              },
            },
          ],
          { cancelable: false },
        );
      } else {
        setLoading(false);
        Alert.alert("Error", data.error || "Failed to add product");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setLoading(false);
      Alert.alert("Error", "Network error. Please check your connection");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sell Your Product</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AntDesign name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category */}
            <Text style={styles.label}>Product Category *</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    formData.product_category === cat &&
                      styles.categoryButtonActive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, product_category: cat })
                  }
                >
                  <Text
                    style={[
                      styles.categoryText,
                      formData.product_category === cat &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Product Name */}
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter product name"
              value={formData.product_name}
              onChangeText={(text) =>
                setFormData({ ...formData, product_name: text })
              }
            />

            {/* Size */}
            <Text style={styles.label}>Size *</Text>
            <View style={styles.sizeContainer}>
              {sizes.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.sizeButton,
                    formData.size === s && styles.sizeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, size: s })}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      formData.size === s && styles.sizeTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price */}
            <Text style={styles.label}>Price (in Rs) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter price"
              keyboardType="numeric"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
            />

            {/* Quantity */}
            <Text style={styles.label}>Quantity *</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={decrementQuantity}
              >
                <Feather name="minus" size={20} color="#e53935" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{formData.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={incrementQuantity}
              >
                <Feather name="plus" size={20} color="#e53935" />
              </TouchableOpacity>
            </View>

            {/* Product Image */}
            <Text style={styles.label}>Product Image *</Text>
            <TouchableOpacity
              style={styles.imageUploadButton}
              onPress={showImageOptions}
            >
              <Feather name="camera" size={24} color="#e53935" />
              <Text style={styles.imageUploadText}>
                {imagePreview ? "Change Image" : "Upload Product Image"}
              </Text>
            </TouchableOpacity>

            {imagePreview && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: imagePreview }}
                  style={styles.imagePreview}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => {
                    setFormData({ ...formData, product_image: null });
                    setImagePreview(null);
                  }}
                >
                  <Feather name="x" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your product"
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={submitProduct}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="shopping-bag" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Sell Product</Text>
                </>
              )}
            </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#e53935",
  },
  closeButton: {
    padding: 5,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 15,
    color: "#333",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  categoryButtonActive: {
    backgroundColor: "#e53935",
    borderColor: "#e53935",
  },
  categoryText: {
    color: "#666",
  },
  categoryTextActive: {
    color: "#fff",
  },
  sizeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sizeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  sizeButtonActive: {
    backgroundColor: "#e53935",
    borderColor: "#e53935",
  },
  sizeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  sizeTextActive: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fafafa",
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffebee",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  imageUploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 2,
    borderColor: "#e53935",
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#fff5f5",
  },
  imageUploadText: {
    color: "#e53935",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreviewContainer: {
    marginTop: 15,
    alignItems: "center",
    position: "relative",
  },
  imagePreview: {
    width: 220,
    height: 220,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: 40,
    backgroundColor: "#e53935",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#e53935",
    padding: 15,
    borderRadius: 12,
    marginTop: 25,
    marginBottom: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SellProductModal;
