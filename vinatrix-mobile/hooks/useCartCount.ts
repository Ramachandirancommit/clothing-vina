import { useCallback, useEffect, useState } from "react";
import { eventEmitter, EVENTS } from "../utils/eventEmitter";

const BASE_URL = "http://192.168.1.4:5000";

export function useCartCount() {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCartCount = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/cart/count`);
      const data = await response.json();
      if (data.success) {
        setCartCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    eventEmitter.on(EVENTS.CART_UPDATED, handleCartUpdate);
    eventEmitter.on(EVENTS.CART_COUNT_UPDATED, handleCartUpdate);

    return () => {
      eventEmitter.off(EVENTS.CART_UPDATED, handleCartUpdate);
      eventEmitter.off(EVENTS.CART_COUNT_UPDATED, handleCartUpdate);
    };
  }, [fetchCartCount]);

  return { cartCount, loading, refreshCartCount: fetchCartCount };
}
