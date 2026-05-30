import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { getApiBaseUrl, AUTH_TOKEN_KEY } from "@/context/auth";
import * as SecureStore from "expo-secure-store";

export function usePushNotifications(userId: string | undefined) {
  const tokenRegisteredRef = useRef<string | null>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (!userId || Platform.OS === "web") return;
    let isMounted = true;

    async function setup() {
      try {
        // Lazy require: expo-notifications crashes at import time on
        // Expo Go Android SDK 53+ because remote push is removed there.
        const Notifications = require("expo-notifications");

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          console.log("[push] Notification permission not granted");
          return;
        }

        let token;
        try {
          token = await Notifications.getExpoPushTokenAsync();
        } catch (err) {
          console.log("[push] Could not get push token:", err);
          return;
        }
        if (!isMounted) return;
        if (tokenRegisteredRef.current === token.data) return;
        tokenRegisteredRef.current = token.data;

        const authToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        const apiBase = getApiBaseUrl();
        await fetch(`${apiBase}/api/notifications/push-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({ pushToken: token.data }),
        });
        console.log("[push] Token registered:", token.data);

        notificationListener.current = Notifications.addNotificationReceivedListener(
          (n: any) => {
            console.log("[push] Notification received:", n.request.content.title);
          },
        );
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
          (r: any) => {
            console.log("[push] Notification tapped, data:", r.notification.request.content.data);
          },
        );
      } catch (err) {
        console.log("[push] Setup failed:", err);
      }
    }

    setup();
    return () => {
      isMounted = false;
      notificationListener.current?.remove?.();
      responseListener.current?.remove?.();
    };
  }, [userId]);
}
