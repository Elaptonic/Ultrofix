import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { getApiBaseUrl, AUTH_TOKEN_KEY } from "@/context/auth";
import * as SecureStore from "expo-secure-store";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications(userId: string | undefined) {
  const tokenRegisteredRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function registerForPushNotifications() {
      if (Platform.OS === "web") return;

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

      let token: Notifications.ExpoPushToken;
      try {
        token = await Notifications.getExpoPushTokenAsync();
      } catch (err) {
        console.log("[push] Could not get push token:", err);
        return;
      }

      if (tokenRegisteredRef.current === token.data) return;
      tokenRegisteredRef.current = token.data;

      try {
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
      } catch (err) {
        console.log("[push] Failed to register token:", err);
      }
    }

    registerForPushNotifications();
  }, [userId]);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("[push] Notification received:", notification.request.content.title);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown>;
      console.log("[push] Notification tapped, data:", data);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);
}
