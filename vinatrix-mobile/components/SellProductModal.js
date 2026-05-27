// import { AntDesign, Feather } from "@expo/vector-icons";
// import * as ImagePicker from "expo-image-picker";
// import React, { useState } from "react";

// import {
//     ActivityIndicator,
//     Alert,
//     Image,
//     Modal,
//     Platform,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from "react-native";

// const BASE_URL = "http://172.20.10.2:5000";
// const API_URL = `${BASE_URL}/api/products`;

// const SellProductModal = ({ visible, onClose, onProductAdded }) => {
//   const [formData, setFormData] = useState({
//     product_category: "",
//     product_name: "",
//     price: "",
//     quantity: "1",
//     description: "",
//     product_image: null,
//   });

//   const [loading, setLoading] = useState(false);
//   const [imagePreview, setImagePreview] = useState(null);

//   const categories = ["Tshirt", "Shirt", "Pant", "Track"];

//   const pickImage = async () => {
//     try {
//       const { status } =
//         await ImagePicker.requestMediaLibraryPermissionsAsync();

//       if (status !== "granted") {
//         Alert.alert(
//           "Permission Needed",
//           "Please grant permission to access your photos",
//         );
//         return;
//       }

//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ["images"], // Updated from deprecated MediaTypeOptions
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.8,
//         base64: false,
//       });

//       if (!result.canceled && result.assets && result.assets[0]) {
//         const selectedImage = result.assets[0];
//         setFormData({
//           ...formData,
//           product_image: selectedImage,
//         });
//         setImagePreview(selectedImage.uri);
//       }
//     } catch (error) {
//       console.error("❌ Error picking image:", error);
//       Alert.alert("Error", "Failed to pick image. Please try again.");
//     }
//   };

//   const takePhoto = async () => {
//     try {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();

//       if (status !== "granted") {
//         Alert.alert("Permission Needed", "Please grant camera permission");
//         return;
//       }

//       const result = await ImagePicker.launchCameraAsync({
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.8,
//       });

//       if (!result.canceled && result.assets && result.assets[0]) {
//         const capturedImage = result.assets[0];
//         setFormData({
//           ...formData,
//           product_image: capturedImage,
//         });
//         setImagePreview(capturedImage.uri);
//       }
//     } catch (error) {
//       console.error("❌ Error taking photo:", error);
//       Alert.alert("Error", "Failed to take photo. Please try again.");
//     }
//   };

//   const showImageOptions = () => {
//     Alert.alert(
//       "Add Product Image",
//       "Choose an option",
//       [
//         { text: "Take Photo", onPress: takePhoto },
//         { text: "Choose from Gallery", onPress: pickImage },
//         { text: "Cancel", style: "cancel" },
//       ],
//       { cancelable: true },
//     );
//   };

//   const incrementQuantity = () => {
//     const currentQty = parseInt(formData.quantity) || 0;
//     setFormData({
//       ...formData,
//       quantity: (currentQty + 1).toString(),
//     });
//   };

//   const decrementQuantity = () => {
//     const currentQty = parseInt(formData.quantity) || 0;
//     if (currentQty > 1) {
//       setFormData({
//         ...formData,
//         quantity: (currentQty - 1).toString(),
//       });
//     }
//   };

//   const submitProduct = async () => {
//     if (!formData.product_category) {
//       Alert.alert("Error", "Please select a category");
//       return;
//     }

//     if (!formData.product_name.trim()) {
//       Alert.alert("Error", "Please enter product name");
//       return;
//     }

//     if (!formData.price || parseFloat(formData.price) <= 0) {
//       Alert.alert("Error", "Please enter valid price");
//       return;
//     }

//     if (!formData.product_image) {
//       Alert.alert("Error", "Please add product image");
//       return;
//     }

//     setLoading(true);

//     try {
//       const apiFormData = new FormData();

//       apiFormData.append("product_category", formData.product_category);
//       apiFormData.append("product_name", formData.product_name);
//       apiFormData.append("price", formData.price);
//       apiFormData.append("quantity", formData.quantity);
//       apiFormData.append("description", formData.description);

//       const imageUri = formData.product_image.uri;
//       const filename = imageUri.split("/").pop() || "product.jpg";
//       const match = /\.(\w+)$/.exec(filename);
//       const type = match ? `image/${match[1]}` : "image/jpeg";

//       apiFormData.append("product_image", {
//         uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
//         type: type,
//         name: filename,
//       });

//       console.log("📤 Uploading product...");

//       const response = await fetch(API_URL, {
//         method: "POST",
//         body: apiFormData,
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       const data = await response.json();
//       console.log("✅ Server Response:", data);

//       if (response.ok) {
//         setFormData({
//           product_category: "",
//           product_name: "",
//           price: "",
//           quantity: "1",
//           description: "",
//           product_image: null,
//         });

//         setImagePreview(null);
//         setLoading(false);
//         onClose();

//         // CRITICAL FIX: Call onProductAdded IMMEDIATELY without waiting for alert
//         if (onProductAdded) {
//           await onProductAdded(); // Wait for refresh to complete
//         }

//         Alert.alert("Success", "Product added successfully!");
//       } else {
//         setLoading(false);
//         Alert.alert("Error", data.error || "Failed to add product");
//       }
//     } catch (error) {
//       console.error("❌ Error submitting product:", error);
//       setLoading(false);
//       Alert.alert("Error", "Network error. Please check your connection");
//     }
//   };

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Sell Your Product</Text>
//             <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//               <AntDesign name="close" size={24} color="#333" />
//             </TouchableOpacity>
//           </View>

//           <ScrollView showsVerticalScrollIndicator={false}>
//             <Text style={styles.label}>Product Category *</Text>
//             <View style={styles.categoryContainer}>
//               {categories.map((cat) => (
//                 <TouchableOpacity
//                   key={cat}
//                   style={[
//                     styles.categoryButton,
//                     formData.product_category === cat &&
//                       styles.categoryButtonActive,
//                   ]}
//                   onPress={() =>
//                     setFormData({
//                       ...formData,
//                       product_category: cat,
//                     })
//                   }
//                 >
//                   <Text
//                     style={[
//                       styles.categoryText,
//                       formData.product_category === cat &&
//                         styles.categoryTextActive,
//                     ]}
//                   >
//                     {cat}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <Text style={styles.label}>Product Name *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter product name"
//               value={formData.product_name}
//               onChangeText={(text) =>
//                 setFormData({
//                   ...formData,
//                   product_name: text,
//                 })
//               }
//             />

//             <Text style={styles.label}>Price (in Rs) *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter price"
//               keyboardType="numeric"
//               value={formData.price}
//               onChangeText={(text) =>
//                 setFormData({
//                   ...formData,
//                   price: text,
//                 })
//               }
//             />

//             <Text style={styles.label}>Quantity *</Text>
//             <View style={styles.quantityContainer}>
//               <TouchableOpacity
//                 style={styles.quantityButton}
//                 onPress={decrementQuantity}
//               >
//                 <Feather name="minus" size={20} color="#e53935" />
//               </TouchableOpacity>
//               <Text style={styles.quantityText}>{formData.quantity}</Text>
//               <TouchableOpacity
//                 style={styles.quantityButton}
//                 onPress={incrementQuantity}
//               >
//                 <Feather name="plus" size={20} color="#e53935" />
//               </TouchableOpacity>
//             </View>

//             <Text style={styles.label}>Product Image *</Text>
//             <TouchableOpacity
//               style={styles.imageUploadButton}
//               onPress={showImageOptions}
//             >
//               <Feather name="camera" size={24} color="#e53935" />
//               <Text style={styles.imageUploadText}>
//                 {imagePreview ? "Change Image" : "Upload Product Image"}
//               </Text>
//             </TouchableOpacity>

//             {imagePreview && (
//               <View style={styles.imagePreviewContainer}>
//                 <Image
//                   source={{ uri: imagePreview }}
//                   style={styles.imagePreview}
//                 />
//                 <TouchableOpacity
//                   style={styles.removeImageButton}
//                   onPress={() => {
//                     setFormData({
//                       ...formData,
//                       product_image: null,
//                     });
//                     setImagePreview(null);
//                   }}
//                 >
//                   <Feather name="x" size={20} color="#fff" />
//                 </TouchableOpacity>
//               </View>
//             )}

//             <Text style={styles.label}>Description</Text>
//             <TextInput
//               style={[styles.input, styles.textArea]}
//               placeholder="Describe your product"
//               multiline
//               numberOfLines={4}
//               value={formData.description}
//               onChangeText={(text) =>
//                 setFormData({
//                   ...formData,
//                   description: text,
//                 })
//               }
//             />

//             <TouchableOpacity
//               style={styles.submitButton}
//               onPress={submitProduct}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <>
//                   <Feather name="shopping-bag" size={20} color="#fff" />
//                   <Text style={styles.submitButtonText}>Sell Product</Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           </ScrollView>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     width: "90%",
//     maxHeight: "85%",
//     padding: 20,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//     paddingBottom: 10,
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#e53935",
//   },
//   closeButton: {
//     padding: 5,
//   },
//   label: {
//     fontSize: 15,
//     fontWeight: "600",
//     marginBottom: 8,
//     marginTop: 15,
//     color: "#333",
//   },
//   categoryContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//   },
//   categoryButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: "#f5f5f5",
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   categoryButtonActive: {
//     backgroundColor: "#e53935",
//     borderColor: "#e53935",
//   },
//   categoryText: {
//     color: "#666",
//   },
//   categoryTextActive: {
//     color: "#fff",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 10,
//     padding: 12,
//     backgroundColor: "#fafafa",
//     fontSize: 16,
//   },
//   textArea: {
//     height: 100,
//     textAlignVertical: "top",
//   },
//   quantityContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 20,
//   },
//   quantityButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#ffebee",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   quantityText: {
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   imageUploadButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 10,
//     borderWidth: 2,
//     borderColor: "#e53935",
//     borderStyle: "dashed",
//     borderRadius: 10,
//     padding: 15,
//     backgroundColor: "#fff5f5",
//   },
//   imageUploadText: {
//     color: "#e53935",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   imagePreviewContainer: {
//     marginTop: 15,
//     alignItems: "center",
//     position: "relative",
//   },
//   imagePreview: {
//     width: 220,
//     height: 220,
//     borderRadius: 12,
//   },
//   removeImageButton: {
//     position: "absolute",
//     top: -8,
//     right: 40,
//     backgroundColor: "#e53935",
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   submitButton: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 10,
//     backgroundColor: "#e53935",
//     padding: 15,
//     borderRadius: 12,
//     marginTop: 25,
//     marginBottom: 20,
//   },
//   submitButtonText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
// });

// export default SellProductModal;

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

const BASE_URL = "http://192.168.1.4:5000";
const API_URL = `${BASE_URL}/api/products`;

const SellProductModal = ({ visible, onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    product_category: "",
    product_name: "",
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
    "Inner & Others",
  ];

  const pickImage = async () => {
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
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const takePhoto = async () => {
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
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      "Add Product Image",
      "Choose an option",
      [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Gallery", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    );
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
    if (!formData.product_category) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    if (!formData.product_name.trim()) {
      Alert.alert("Error", "Please enter product name");
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
      apiFormData.append("price", formData.price);
      apiFormData.append("quantity", formData.quantity);
      apiFormData.append("description", formData.description);

      const imageUri = formData.product_image.uri;
      const filename = imageUri.split("/").pop() || "product.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      apiFormData.append("product_image", {
        uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
        type: type,
        name: filename,
      });

      console.log("📤 Uploading product...");

      const response = await fetch(API_URL, {
        method: "POST",
        body: apiFormData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();
      console.log("✅ Server Response:", data);

      if (response.ok) {
        // RESET FORM
        setFormData({
          product_category: "",
          product_name: "",
          price: "",
          quantity: "1",
          description: "",
          product_image: null,
        });

        setImagePreview(null);
        setLoading(false);

        // Close modal FIRST
        onClose();

        // Show success alert and refresh ONLY when OK is clicked
        Alert.alert(
          "Success",
          "Product added successfully!",
          [
            {
              text: "OK",
              onPress: async () => {
                // Refresh ONLY when user clicks OK
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
      console.error("❌ Error submitting product:", error);
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
                    setFormData({
                      ...formData,
                      product_category: cat,
                    })
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

            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter product name"
              value={formData.product_name}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  product_name: text,
                })
              }
            />

            <Text style={styles.label}>Price (in Rs) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter price"
              keyboardType="numeric"
              value={formData.price}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  price: text,
                })
              }
            />

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
                    setFormData({
                      ...formData,
                      product_image: null,
                    });
                    setImagePreview(null);
                  }}
                >
                  <Feather name="x" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your product"
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  description: text,
                })
              }
            />

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
