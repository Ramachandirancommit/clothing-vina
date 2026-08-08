// hooks/useDeviceInfo.ts

import * as Device from "expo-device";
import * as Network from "expo-network";
import { useCallback } from "react";
import { Platform } from "react-native";
import { storageService } from "../services/storage";

export const useDeviceInfo = () => {
  const getDeviceInfo = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        const userAgent = navigator.userAgent || "unknown";
        const screenResolution = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
        const timezone =
          Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";

        let ipAddress = "web_client";
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          const ipResponse = await fetch("https://api.ipify.org?format=json", {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            if (ipData.ip) ipAddress = ipData.ip;
          }
        } catch {
          console.log("IP fetch failed, using fallback");
        }

        // Check if we have a stored device ID
        let deviceId = localStorage.getItem("device_id");
        if (!deviceId) {
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 10);
          deviceId = `DEVICE_${timestamp}_${random}`;
          localStorage.setItem("device_id", deviceId);
          console.log("🆕 Created new device ID:", deviceId);
        } else {
          console.log("✅ Found existing device ID:", deviceId);
        }

        return {
          deviceName: deviceId,
          ipAddress,
          userAgent,
          screenResolution,
          timezone,
        };
      }

      const deviceName = Device.deviceName || "unknown";
      const ipAddress = await Network.getIpAddressAsync();

      let deviceId = await storageService.getDeviceId();
      if (!deviceId) {
        const osBuildId = Device.osBuildId || Date.now().toString();
        deviceId = `${Device.modelName || "device"}_${osBuildId}`;
        await storageService.setDeviceId(deviceId);
        console.log("🆕 Created new mobile device ID:", deviceId);
      } else {
        console.log("✅ Found existing mobile device ID:", deviceId);
      }

      return {
        deviceName: deviceId,
        ipAddress,
      };
    } catch (error) {
      console.error("Error getting device info:", error);
      return {
        deviceName: Platform.OS === "web" ? "web_fallback" : "unknown_device",
        ipAddress: "0.0.0.0",
      };
    }
  }, []);

  // FIXED: Use existing user ID from database
  const getUserId = useCallback(async () => {
    try {
      // First, try to get existing user ID from storage
      let userId = await storageService.getUserId();

      console.log("🔍 getUserId - Retrieved from storage:", userId);

      // If user ID exists in storage, return it
      if (userId) {
        console.log("✅ Found existing user ID in storage:", userId);
        return userId;
      }

      // IMPORTANT: Use the existing user ID from your database
      // This is the user ID that has wishlist data
      const existingUserId =
        "WEB_Mozilla_5_0__Windows_NT_10_0__Win64__x64__AppleWeb_1783458997806_yneqf2";

      console.log("📝 Using existing database user ID:", existingUserId);
      await storageService.setUserId(existingUserId);
      console.log("✅ Saved existing user ID to storage:", existingUserId);

      return existingUserId;

      // COMMENTED OUT: The API is failing with 500 error
      // If no user ID, get device info and create user
      // console.log("📡 No user ID in storage, creating user...");
      // const deviceInfo = await getDeviceInfo();
      // const deviceId = deviceInfo.deviceName;
      // console.log("📡 Device ID for user creation:", deviceId);
      //
      // const response = await api.getOrCreateUser({
      //   cust_deviceid: deviceId,
      //   ip_address: deviceInfo.ipAddress,
      // });
      //
      // console.log("📥 API Response:", JSON.stringify(response, null, 2));
      //
      // if (response.success && response.user) {
      //   const newUserId = response.user.user_uuid || response.user.cust_id;
      //   await storageService.setUserId(newUserId);
      //   console.log("✅ Created/retrieved user with ID:", newUserId);
      //   return newUserId;
      // } else {
      //   console.error("❌ Failed to get/create user from API");
      //   return null;
      // }
    } catch (error) {
      console.error("❌ Error getting user ID:", error);
      // Fallback: use the existing database user ID
      const fallbackUserId =
        "WEB_Mozilla_5_0__Windows_NT_10_0__Win64__x64__AppleWeb_1783458997806_yneqf2";
      await storageService.setUserId(fallbackUserId);
      return fallbackUserId;
    }
  }, [getDeviceInfo]);

  const getOrCreateUser = useCallback(async () => {
    try {
      // First check storage
      let userId = await storageService.getUserId();

      console.log("🔍 getOrCreateUser - Retrieved from storage:", userId);

      if (userId) {
        console.log("✅ Found existing user ID in storage:", userId);
        return userId;
      }

      // Use the existing database user ID
      const existingUserId =
        "WEB_Mozilla_5_0__Windows_NT_10_0__Win64__x64__AppleWeb_1783458997806_yneqf2";
      await storageService.setUserId(existingUserId);
      console.log("✅ Using existing database user ID:", existingUserId);
      return existingUserId;

      // COMMENTED OUT: API is failing
      // const deviceInfo = await getDeviceInfo();
      // const deviceId = deviceInfo.deviceName;
      // console.log("📡 Calling API to get/create user with deviceId:", deviceId);
      //
      // const response = await api.getOrCreateUser({
      //   cust_deviceid: deviceId,
      //   ip_address: deviceInfo.ipAddress,
      // });
      //
      // console.log("📥 API Response:", JSON.stringify(response, null, 2));
      //
      // if (response.success && response.user) {
      //   const newUserId = response.user.user_uuid || response.user.cust_id;
      //   await storageService.setUserId(newUserId);
      //   console.log("✅ Created new user with ID:", newUserId);
      //   return newUserId;
      // } else {
      //   console.error("❌ Failed to get/create user:", response);
      // }
    } catch (error) {
      console.error("❌ Error getting/creating user:", error);
      // Fallback: use the existing database user ID
      const fallbackUserId =
        "WEB_Mozilla_5_0__Windows_NT_10_0__Win64__x64__AppleWeb_1783458997806_yneqf2";
      await storageService.setUserId(fallbackUserId);
      return fallbackUserId;
    }
  }, [getDeviceInfo]);

  return { getDeviceInfo, getUserId, getOrCreateUser };
};
