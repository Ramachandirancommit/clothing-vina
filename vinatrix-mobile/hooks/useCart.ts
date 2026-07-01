// hooks/useCart.ts

import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { api } from "../services/api";
import { eventEmitter, EVENTS } from "../utils/eventEmitter";
import { useDeviceInfo } from "./useDeviceInfo";

export const useCart = () => {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const { getUserId, getDeviceInfo } = useDeviceInfo();

  const fetchCart = useCallback(async () => {
    try {
      const custId = await getUserId();
      const response = await api.getCart(custId);
      if (response.success) {
        const totalItems = response.items.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0,
        );
        setCartCount(totalItems);
        setCartItems(response.items);
        eventEmitter.emit(EVENTS.CART_COUNT_UPDATED, totalItems);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  }, [getUserId]);

  const addToCart = useCallback(
    async (product: any) => {
      try {
        const custId = await getUserId();
        const deviceInfo = await getDeviceInfo();
        const { ipAddress, deviceName } = deviceInfo;

        const response = await api.addToCart({
          cust_id: custId,
          ip_address: ipAddress,
          cust_deviceid: deviceName,
          productId: parseInt(product.id),
          productName: product.product_name,
          productCategory: product.product_category,
          size: product.size,
          price: parseFloat(product.price),
          productImage: product.image,
        });

        if (response.success) {
          setCartCount((prev) => prev + 1);
          eventEmitter.emit(EVENTS.CART_UPDATED);
          eventEmitter.emit(EVENTS.CART_COUNT_UPDATED);
          Alert.alert("Success", `${product.product_name} added to cart!`);
          await fetchCart();
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        Alert.alert("Error", "Failed to add to cart");
      }
    },
    [getUserId, getDeviceInfo, fetchCart],
  );

  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };
    eventEmitter.on(EVENTS.CART_UPDATED, handleCartUpdate);
    return () => {
      eventEmitter.off(EVENTS.CART_UPDATED, handleCartUpdate);
    };
  }, [fetchCart]);

  return { cartCount, cartItems, fetchCart, addToCart };
};
