import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { usePostDeviceToken } from "@shared/api/notifications";
import type { RegisterDeviceTokenInput } from "@shared/types/notifications";
import { NotificationType, DevicePlatform } from "@shared/types/notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const usePushNotifications = () => {
  const router = useRouter();
  const { mutate: registerToken } = usePostDeviceToken();
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync(registerToken);

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        const type = data?.type as NotificationType | undefined;
        if (
          type === NotificationType.TaskAssigned ||
          type === NotificationType.HighPriorityTask
        ) {
          router.push("/(tabs)/tasks");
        }
      });

    return () => {
      responseListener.current?.remove();
    };
  }, [registerToken, router]);
};

/**
 * Requests push notification permissions, retrieves the Expo push token,
 * and registers it with the backend. Exported for unit testing.
 */
export async function registerForPushNotificationsAsync(
  registerToken: (input: RegisterDeviceTokenInput) => void,
  deps = {
    isDevice: Device.isDevice,
    platformOS: Platform.OS,
    // Constants.expoConfig.extra is typed as Record<string, unknown> by Expo,
    // so a cast is unavoidable here — the shape is defined in app.json.
    projectId: Constants.expoConfig?.extra?.eas?.projectId as
      | string
      | undefined,
  },
): Promise<void> {
  if (!deps.isDevice) {
    return;
  }

  if (deps.platformOS === DevicePlatform.Android) {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== Notifications.PermissionStatus.GRANTED) {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== Notifications.PermissionStatus.GRANTED) {
    return;
  }

  if (!deps.projectId) {
    return;
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: deps.projectId,
    });
    const platform = deps.platformOS as DevicePlatform;
    registerToken({ token, platform });
  } catch {
    // Push notifications are non-critical; silently skip on failure.
  }
}
