// lib/notification-service.ts
import { auth } from "./firebase";
import { apiService } from "./api";
import { getMessaging, getToken } from "firebase/messaging";

export const NotificationService = {
  async registerForPushNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) return null;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return null;

      const messaging = getMessaging();
      const token = await getToken(messaging, {
        vapidKey: "YOUR_PUBLIC_VAPID_KEY", // Get this from Firebase Console
      });

      if (token) {
        await apiService.post("/users/push-token", { token, platform: 'web' });
        return token;
      }
    } catch (error) {
      console.error("Web Push Error:", error);
    }
    return null;
  },
};