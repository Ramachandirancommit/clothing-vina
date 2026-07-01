// hooks/useDeviceInfo.ts

import * as Device from "expo-device";
import * as Network from "expo-network";
import { useCallback } from "react";
import { Platform } from "react-native";

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

        const deviceFingerprint = `WEB_${userAgent.substring(0, 30).replace(/[^a-zA-Z0-9]/g, "_")}_${screenResolution}_${timezone}`;

        return {
          deviceName: deviceFingerprint.substring(0, 50),
          ipAddress,
          userAgent,
          screenResolution,
          timezone,
        };
      }

      const deviceName = Device.deviceName || "unknown";
      const ipAddress = await Network.getIpAddressAsync();
      return { deviceName, ipAddress };
    } catch (error) {
      console.error("Error getting device info:", error);
      return {
        deviceName: Platform.OS === "web" ? "web_fallback" : "unknown_device",
        ipAddress: "0.0.0.0",
      };
    }
  }, []);

  const getUserId = useCallback(async () => {
    try {
      let userId = await storageService.getUserId();
      if (!userId) {
        const deviceInfo = await getDeviceInfo();
        if (Platform.OS === "web") {
          const browserInfo = navigator.userAgent.substring(0, 50);
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 8);
          userId = `WEB_${browserInfo.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}_${randomId}`;
        } else {
          const deviceName = Device.deviceName || "unknown";
          const ipAddress = await Network.getIpAddressAsync();
          const timestamp = Date.now();
          userId = `USER_${deviceName.substring(0, 5)}_${ipAddress.split(".").pop()}_${timestamp}`;
        }
        await storageService.setUserId(userId);
      }
      return userId;
    } catch (error) {
      console.error("Error getting user ID:", error);
      return `GUEST_${Date.now()}`;
    }
  }, [getDeviceInfo]);

  const getOrCreateUser = useCallback(async () => {
    try {
      let userId = await storageService.getUserId();
      if (userId) {
        console.log("✅ Found existing user ID:", userId);
        return userId;
      }

      const deviceInfo = await getDeviceInfo();
      const deviceId =
        Platform.OS === "web"
          ? deviceInfo.deviceName
          : `${deviceInfo.deviceName}_${Device.osBuildId || Date.now()}`;

      const response = await api.getOrCreateUser({
        cust_deviceid: deviceId,
        ip_address: deviceInfo.ipAddress,
      });

      if (response.success && response.user) {
        const userId = response.user.user_uuid || response.user.cust_id;
        await storageService.setUserId(userId);
        console.log("✅ Created new user with ID:", userId);
        return userId;
      }
    } catch (error) {
      console.error("❌ Error getting/creating user:", error);
    }
    return null;
  }, [getDeviceInfo]);

  return { getDeviceInfo, getUserId, getOrCreateUser };
};
