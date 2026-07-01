// hooks/useWishlist.ts

import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { api } from "../services/api";
import { storageService } from "../services/storage";
import { eventEmitter, EVENTS } from "../utils/eventEmitter";
import { useDeviceInfo } from "./useDeviceInfo";

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { getUserId, getDeviceInfo } = useDeviceInfo();

  const saveWishlistToStorage = useCallback(async (items: string[]) => {
    await storageService.setWishlist(items);
    await storageService.setWishlistCount(items.length);
    await storageService.setWishlistLastFetch();
  }, []);

  const loadWishlistFromStorage = useCallback(async (): Promise<
    string[] | null
  > => {
    return storageService.getWishlist();
  }, []);

  const fetchWishlist = useCallback(
    async (forceRefresh: boolean = false) => {
      try {
        const custId = await getUserId();
        if (!custId) return;

        if (!forceRefresh) {
          const cachedItems = await loadWishlistFromStorage();
          if (cachedItems && cachedItems.length > 0) {
            setWishlist(cachedItems);
            setWishlistCount(cachedItems.length);
            setLoading(false);
            setRefreshing(false);
            // Fetch in background
            fetchWishlist(true);
            return;
          }
        }

        console.log("📡 Fetching wishlist for user:", custId);
        const response = await api.getWishlist(custId);

        if (response.success && response.items) {
          const wishlistIds = response.items.map((item: any) =>
            String(item.product_id || item.id || item.productId),
          );
          setWishlist(wishlistIds);
          setWishlistCount(wishlistIds.length);
          await saveWishlistToStorage(wishlistIds);
          eventEmitter.emit(EVENTS.WISHLIST_COUNT_UPDATED, wishlistIds.length);
        }
      } catch (error) {
        console.error("❌ Error fetching wishlist:", error);
        const cachedItems = await loadWishlistFromStorage();
        if (cachedItems && cachedItems.length > 0) {
          setWishlist(cachedItems);
          setWishlistCount(cachedItems.length);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getUserId, loadWishlistFromStorage, saveWishlistToStorage],
  );

  const toggleWishlist = useCallback(
    async (product: any) => {
      const productId = product.id;
      const isInWishlist = wishlist.includes(productId);
      const newWishlist = isInWishlist
        ? wishlist.filter((id) => id !== productId)
        : [...wishlist, productId];

      setWishlist(newWishlist);
      setWishlistCount(newWishlist.length);

      try {
        const custId = await getUserId();
        const deviceInfo = await getDeviceInfo();
        const { ipAddress, deviceName } = deviceInfo;

        let response;
        if (isInWishlist) {
          response = await api.removeFromWishlist(custId, parseInt(productId));
        } else {
          response = await api.addToWishlist({
            cust_id: custId,
            ip_address: ipAddress,
            cust_deviceid: deviceName,
            product_id: parseInt(productId),
            product_name: product.product_name,
            product_category: product.product_category,
            size: product.size,
            price: parseFloat(product.price),
            product_image: product.image,
          });
        }

        if (response.success) {
          await saveWishlistToStorage(newWishlist);
          eventEmitter.emit(EVENTS.WISHLIST_UPDATED);
          eventEmitter.emit(EVENTS.WISHLIST_COUNT_UPDATED, newWishlist.length);
        } else {
          setWishlist(
            isInWishlist
              ? [...wishlist, productId]
              : wishlist.filter((id) => id !== productId),
          );
          setWishlistCount(
            isInWishlist ? wishlist.length + 1 : wishlist.length - 1,
          );
          Alert.alert("Error", response.message || "Failed to update wishlist");
        }
      } catch (error) {
        console.error("❌ Error toggling wishlist:", error);
        setWishlist(
          isInWishlist
            ? [...wishlist, productId]
            : wishlist.filter((id) => id !== productId),
        );
        setWishlistCount(
          isInWishlist ? wishlist.length + 1 : wishlist.length - 1,
        );
        Alert.alert("Error", "Network error. Please check your connection.");
      }
    },
    [wishlist, getUserId, getDeviceInfo, saveWishlistToStorage],
  );

  const clearWishlist = useCallback(async () => {
    try {
      const custId = await getUserId();
      const response = await api.clearWishlist(custId);
      if (response.success) {
        setWishlist([]);
        setWishlistCount(0);
        await saveWishlistToStorage([]);
        eventEmitter.emit(EVENTS.WISHLIST_UPDATED);
        eventEmitter.emit(EVENTS.WISHLIST_COUNT_UPDATED, 0);
        Alert.alert("Success", "Wishlist cleared");
      }
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      Alert.alert("Error", "Failed to clear wishlist");
    }
  }, [getUserId, saveWishlistToStorage]);

  useEffect(() => {
    const handleWishlistUpdate = () => {
      fetchWishlist(true);
    };
    eventEmitter.on(EVENTS.WISHLIST_UPDATED, handleWishlistUpdate);
    return () => {
      eventEmitter.off(EVENTS.WISHLIST_UPDATED, handleWishlistUpdate);
    };
  }, [fetchWishlist]);

  return {
    wishlist,
    wishlistCount,
    loading,
    refreshing,
    setRefreshing,
    fetchWishlist,
    toggleWishlist,
    clearWishlist,
  };
};
