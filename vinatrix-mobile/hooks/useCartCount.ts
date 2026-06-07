// hooks/useCartCount.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Network from "expo-network";
import { useEffect, useState } from "react";
import { eventEmitter, EVENTS } from "../utils/eventEmitter";

const BASE_URL = "https://api.vinatrix-api.workers.dev";

// Get or create user (same as in cart.tsx)
const getOrCreateUser = async (): Promise<string | null> => {
  try {
    const deviceName = Device.deviceName || "unknown";
    const ipAddress = await Network.getIpAddressAsync();
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
      await AsyncStorage.setItem("app_user_id", data.user.user_uuid);
      return data.user.user_uuid;
    }
  } catch (error) {
    console.error("Error getting/creating user:", error);
  }
  return null;
};

export const useCartCount = () => {
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    try {
      const userId = await getOrCreateUser();
      if (!userId) return;

      const response = await fetch(
        `${BASE_URL}/api/cart/count?cust_id=${userId}`,
      );
      const data = await response.json();
      if (data.success) {
        setCartCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  useEffect(() => {
    fetchCartCount();

    const handleCartCountUpdated = () => {
      console.log("🔄 Cart count updated event received");
      fetchCartCount();
    };

    eventEmitter.on(EVENTS.CART_COUNT_UPDATED, handleCartCountUpdated);

    return () => {
      eventEmitter.off(EVENTS.CART_COUNT_UPDATED, handleCartCountUpdated);
    };
  }, []);

  return { cartCount, fetchCartCount };
};
