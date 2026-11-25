import { useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { router, type Href } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { registerPushToken } from "../../api/services";
import { useAuth } from "../../context/auth-context";
import { mapNotificationActionUrl } from "../../utils/notification-deeplink";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const platform = Platform.OS === "ios" ? "ios" : "android";

async function registerExpoPushToken() {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return;
  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  await registerPushToken({ expoPushToken: token.data, platform });
}

async function ensurePermissionAndToken() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Thông báo",
      importance: AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    finalStatus = (await Notifications.requestPermissionsAsync()).status;
  }
  if (finalStatus !== "granted") return;
  await registerExpoPushToken();
}

export function PushNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const enabled = user?.role === "Learner" && Platform.OS !== "web";

  useEffect(() => {
    if (!enabled) return;

    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (typeof url !== "string") return;
      const route = mapNotificationActionUrl(url);
      if (route) router.push(route as Href);
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void Notifications.clearLastNotificationResponseAsync();
    }

    void ensurePermissionAndToken().catch(() => undefined);
    void Notifications.getLastNotificationResponseAsync()
      .then((response) => { if (response) redirect(response.notification); })
      .catch(() => undefined);

    const tokenSubscription = Notifications.addPushTokenListener((token) => {
      if (token.type !== "expo") return;
      void registerPushToken({ expoPushToken: token.data, platform }).catch(() => undefined);
    });
    const receivedSubscription = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => redirect(response.notification));

    return () => {
      tokenSubscription.remove();
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [enabled, queryClient]);

  return null;
}
