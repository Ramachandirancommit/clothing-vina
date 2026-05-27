// import { Feather } from "@expo/vector-icons";
// import React, { useCallback, useEffect, useState } from "react";
// import {
//     ActivityIndicator,
//     Alert,
//     Image,
//     RefreshControl,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from "react-native";
// import { ThemedText } from "../../components/themed-text";
// // ========== ADD THIS IMPORT ==========
// import { eventEmitter, EVENTS } from "../../utils/eventEmitter";

// interface CartItem {
//   id: number;
//   cart_id: number;
//   product_id: number;
//   product_name: string;
//   product_category: string;
//   price: number;
//   quantity: number;
//   product_image: string;
// }

// export default function CartScreen() {
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [total, setTotal] = useState(0);

//   const BASE_URL = "http://192.168.1.4:5000";
//   const CART_URL = `${BASE_URL}/api/cart`;

//   // Fetch cart from API
//   const fetchCart = useCallback(async () => {
//     try {
//       const response = await fetch(CART_URL);
//       const data = await response.json();

//       if (data.success) {
//         setCartItems(data.items);
//         setTotal(data.total);
//       }
//     } catch (error) {
//       console.error("Error fetching cart:", error);
//       Alert.alert("Error", "Failed to load cart");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   // ========== ADD THIS useEffect for event listener ==========
//   // Listen for cart updated events
//   useEffect(() => {
//     const handleCartUpdated = () => {
//       console.log("🔄 Event received: Cart updated - refreshing cart");
//       fetchCart();
//     };

//     eventEmitter.on(EVENTS.CART_UPDATED, handleCartUpdated);

//     return () => {
//       eventEmitter.off(EVENTS.CART_UPDATED, handleCartUpdated);
//     };
//   }, [fetchCart]);

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchCart();
//   }, [fetchCart]);

//   // Update quantity
//   const updateQuantity = async (productId: number, newQuantity: number) => {
//     if (newQuantity < 1) {
//       removeItem(productId);
//       return;
//     }

//     try {
//       const response = await fetch(`${CART_URL}/update`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ productId, quantity: newQuantity }),
//       });

//       const data = await response.json();
//       if (data.success) {
//         fetchCart();
//         // Emit cart count update
//         eventEmitter.emit(EVENTS.CART_UPDATED);
//         eventEmitter.emit(EVENTS.CART_COUNT_UPDATED);
//       }
//     } catch (error) {
//       console.error("Error updating quantity:", error);
//       Alert.alert("Error", "Failed to update quantity");
//     }
//   };

//   // Remove item
//   const removeItem = (productId: number) => {
//     Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Remove",
//         onPress: async () => {
//           try {
//             const response = await fetch(`${CART_URL}/remove`, {
//               method: "DELETE",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({ productId }),
//             });

//             const data = await response.json();
//             if (data.success) {
//               fetchCart();
//               eventEmitter.emit(EVENTS.CART_UPDATED);
//               eventEmitter.emit(EVENTS.CART_COUNT_UPDATED);
//               Alert.alert("Success", "Item removed from cart");
//             }
//           } catch (error) {
//             console.error("Error removing item:", error);
//             Alert.alert("Error", "Failed to remove item");
//           }
//         },
//         style: "destructive",
//       },
//     ]);
//   };

//   // Clear cart
//   const clearCart = () => {
//     Alert.alert(
//       "Clear Cart",
//       "Are you sure you want to clear your entire cart?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Clear",
//           onPress: async () => {
//             try {
//               const response = await fetch(`${CART_URL}/clear`, {
//                 method: "DELETE",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({}),
//               });

//               const data = await response.json();
//               if (data.success) {
//                 fetchCart();
//                 eventEmitter.emit(EVENTS.CART_UPDATED);
//                 eventEmitter.emit(EVENTS.CART_COUNT_UPDATED);
//                 Alert.alert("Success", "Cart cleared");
//               }
//             } catch (error) {
//               console.error("Error clearing cart:", error);
//               Alert.alert("Error", "Failed to clear cart");
//             }
//           },
//           style: "destructive",
//         },
//       ],
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#e53935" />
//         <Text style={styles.loadingText}>Loading cart...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         <View style={styles.header}>
//           <ThemedText style={styles.title}>Your Cart 🛒</ThemedText>
//           <Text style={styles.subtitle}>{cartItems.length} items</Text>
//           {cartItems.length > 0 && (
//             <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
//               <Text style={styles.clearButtonText}>Clear All</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         {cartItems.length === 0 ? (
//           <View style={styles.emptyCart}>
//             <Feather name="shopping-cart" size={80} color="#ccc" />
//             <Text style={styles.emptyText}>Your cart is empty</Text>
//             <Text style={styles.emptySubText}>
//               Add items from the home screen
//             </Text>
//           </View>
//         ) : (
//           <>
//             {cartItems.map((item) => (
//               <View key={item.id} style={styles.cartItem}>
//                 <View style={styles.itemImageContainer}>
//                   {item.product_image ? (
//                     <Image
//                       source={{ uri: `${BASE_URL}${item.product_image}` }}
//                       style={styles.itemImage}
//                       resizeMode="cover"
//                     />
//                   ) : (
//                     <View style={styles.placeholderImage}>
//                       <Feather name="shopping-bag" size={30} color="#ccc" />
//                     </View>
//                   )}
//                 </View>

//                 <View style={styles.itemInfo}>
//                   <Text style={styles.itemName}>{item.product_name}</Text>
//                   <Text style={styles.itemCategory}>
//                     {item.product_category}
//                   </Text>
//                   <Text style={styles.itemPrice}>
//                     ₹{(item.price * item.quantity).toFixed(2)}
//                   </Text>

//                   <View style={styles.quantityContainer}>
//                     <TouchableOpacity
//                       style={styles.qtyButton}
//                       onPress={() =>
//                         updateQuantity(item.product_id, item.quantity - 1)
//                       }
//                     >
//                       <Feather name="minus" size={16} color="#e53935" />
//                     </TouchableOpacity>
//                     <Text style={styles.qtyText}>{item.quantity}</Text>
//                     <TouchableOpacity
//                       style={styles.qtyButton}
//                       onPress={() =>
//                         updateQuantity(item.product_id, item.quantity + 1)
//                       }
//                     >
//                       <Feather name="plus" size={16} color="#e53935" />
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 <TouchableOpacity
//                   style={styles.removeButton}
//                   onPress={() => removeItem(item.product_id)}
//                 >
//                   <Feather name="trash-2" size={20} color="#e53935" />
//                 </TouchableOpacity>
//               </View>
//             ))}

//             <View style={styles.totalContainer}>
//               <Text style={styles.totalLabel}>Total Amount</Text>
//               <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
//             </View>

//             <TouchableOpacity style={styles.checkoutButton}>
//               <Text style={styles.checkoutText}>Proceed to Checkout</Text>
//               <Feather name="arrow-right" size={18} color="#fff" />
//             </TouchableOpacity>
//           </>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f9fafb" },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
//   header: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
//   title: { fontSize: 24, fontWeight: "bold", color: "#333" },
//   subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
//   clearButton: { position: "absolute", right: 20, top: 20 },
//   clearButtonText: { color: "#e53935", fontSize: 14, fontWeight: "500" },
//   emptyCart: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingTop: 100,
//   },
//   emptyText: { fontSize: 18, fontWeight: "600", color: "#999", marginTop: 16 },
//   emptySubText: { fontSize: 14, color: "#ccc", marginTop: 8 },
//   cartItem: {
//     flexDirection: "row",
//     padding: 16,
//     backgroundColor: "#fff",
//     marginHorizontal: 16,
//     marginBottom: 12,
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   itemImageContainer: {
//     width: 80,
//     height: 80,
//     borderRadius: 10,
//     overflow: "hidden",
//     backgroundColor: "#f5f5f5",
//   },
//   itemImage: { width: "100%", height: "100%" },
//   placeholderImage: {
//     width: "100%",
//     height: "100%",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#f5f5f5",
//   },
//   itemInfo: { flex: 1, marginLeft: 12 },
//   itemName: { fontSize: 16, fontWeight: "600", color: "#333" },
//   itemCategory: { fontSize: 12, color: "#999", marginTop: 2 },
//   itemPrice: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#e53935",
//     marginTop: 4,
//   },
//   quantityContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 8,
//     gap: 12,
//   },
//   qtyButton: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: "#ffebee",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   qtyText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//     minWidth: 30,
//     textAlign: "center",
//   },
//   removeButton: { justifyContent: "center", paddingHorizontal: 8 },
//   totalContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#fff",
//     marginTop: 16,
//     marginHorizontal: 16,
//     borderRadius: 12,
//     marginBottom: 16,
//   },
//   totalLabel: { fontSize: 18, fontWeight: "600", color: "#333" },
//   totalAmount: { fontSize: 24, fontWeight: "bold", color: "#e53935" },
//   checkoutButton: {
//     flexDirection: "row",
//     backgroundColor: "#e53935",
//     margin: 16,
//     marginBottom: 90,
//     padding: 16,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 10,
//   },
//   checkoutText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
// });

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ThemedText } from "../../components/themed-text";
import { eventEmitter, EVENTS } from "../../utils/eventEmitter";

interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  product_name: string;
  product_category: string;
  price: number;
  quantity: number;
  product_image: string;
}

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);

  const BASE_URL = "http://192.168.1.4:5000";
  const CART_URL = `${BASE_URL}/api/cart`;

  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch(CART_URL);
      const data = await response.json();

      if (data.success) {
        setCartItems(data.items);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      Alert.alert("Error", "Failed to load cart");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const handleCartUpdated = () => {
      console.log("🔄 Event received: Cart updated - refreshing cart");
      fetchCart();
    };

    eventEmitter.on(EVENTS.CART_UPDATED, handleCartUpdated);

    return () => {
      eventEmitter.off(EVENTS.CART_UPDATED, handleCartUpdated);
    };
  }, [fetchCart]);

  useEffect(() => {
    fetchCart();
  }, []);

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
      const response = await fetch(`${CART_URL}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: newQuantity }),
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
            const response = await fetch(`${CART_URL}/remove`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId }),
            });

            const data = await response.json();
            if (data.success) {
              fetchCart();
              eventEmitter.emit(EVENTS.CART_UPDATED);
              eventEmitter.emit(EVENTS.CART_COUNT_UPDATED);
              Alert.alert("Success", "Item removed from cart");
            }
          } catch (error) {
            console.error("Error removing item:", error);
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
              const response = await fetch(`${CART_URL}/clear`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
              });

              const data = await response.json();
              if (data.success) {
                fetchCart();
                eventEmitter.emit(EVENTS.CART_UPDATED);
                eventEmitter.emit(EVENTS.CART_COUNT_UPDATED);
                Alert.alert("Success", "Cart cleared");
              }
            } catch (error) {
              console.error("Error clearing cart:", error);
              Alert.alert("Error", "Failed to clear cart");
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Please add items to your cart before checkout.",
      );
      return;
    }
    // Navigate to payment page with cart data
    router.push({
      pathname: "/payment",
      params: {
        total: total.toString(),
        itemCount: cartItems.length.toString(),
        items: JSON.stringify(cartItems),
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e53935" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>Your Cart 🛒</ThemedText>
          <Text style={styles.subtitle}>{cartItems.length} items</Text>
          {cartItems.length > 0 && (
            <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Feather name="shopping-cart" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubText}>
              Add items from the home screen
            </Text>
          </View>
        ) : (
          <>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemImageContainer}>
                  {item.product_image ? (
                    <Image
                      source={{ uri: `${BASE_URL}${item.product_image}` }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Feather name="shopping-bag" size={30} color="#ccc" />
                    </View>
                  )}
                </View>

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product_name}</Text>
                  <Text style={styles.itemCategory}>
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
                    <Text style={styles.qtyText}>{item.quantity}</Text>
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
            ))}

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>

            <View style={styles.bottomPadding} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
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
  clearButton: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  clearButtonText: {
    color: "#e53935",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyCart: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 8,
  },
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
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  itemCategory: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
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
  removeButton: {
    justifyContent: "center",
    paddingHorizontal: 8,
  },
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
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#e53935",
  },
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
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomPadding: {
    height: 80,
  },
});
