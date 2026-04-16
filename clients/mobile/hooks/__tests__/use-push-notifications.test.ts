import { renderHook, act } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  AndroidImportance: { MAX: 5 },
  PermissionStatus: {
    GRANTED: "granted",
    UNDETERMINED: "undetermined",
    DENIED: "denied",
  },
}));

const mockRouterPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

const mockRegisterToken = jest.fn();
jest.mock("@shared/api/notifications", () => ({
  usePostDeviceToken: () => ({ mutate: mockRegisterToken }),
}));

import {
  usePushNotifications,
  registerForPushNotificationsAsync,
} from "../use-push-notifications";

const Notifications = require("expo-notifications");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return Wrapper;
};

describe("registerForPushNotificationsAsync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requests permissions and registers an iOS token", async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: "granted" });
    Notifications.getExpoPushTokenAsync.mockResolvedValue({
      data: "ExponentPushToken[xxx]",
    });

    await registerForPushNotificationsAsync(mockRegisterToken, {
      isDevice: true,
      platformOS: "ios",
      projectId: "test-project-id",
    });

    expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
      projectId: "test-project-id",
    });
    expect(mockRegisterToken).toHaveBeenCalledWith({
      token: "ExponentPushToken[xxx]",
      platform: "ios",
    });
  });

  it("calls requestPermissionsAsync when status is undetermined and grants", async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({
      status: "undetermined",
    });
    Notifications.requestPermissionsAsync.mockResolvedValue({
      status: "granted",
    });
    Notifications.getExpoPushTokenAsync.mockResolvedValue({
      data: "ExponentPushToken[yyy]",
    });

    await registerForPushNotificationsAsync(mockRegisterToken, {
      isDevice: true,
      platformOS: "ios",
      projectId: "test-project-id",
    });

    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    expect(mockRegisterToken).toHaveBeenCalledWith({
      token: "ExponentPushToken[yyy]",
      platform: "ios",
    });
  });

  it("does not register token when permissions are denied", async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({
      status: "undetermined",
    });
    Notifications.requestPermissionsAsync.mockResolvedValue({
      status: "denied",
    });

    await registerForPushNotificationsAsync(mockRegisterToken, {
      isDevice: true,
      platformOS: "ios",
      projectId: "test-project-id",
    });

    expect(mockRegisterToken).not.toHaveBeenCalled();
  });

  it("does not request permissions on a non-physical device (simulator)", async () => {
    await registerForPushNotificationsAsync(mockRegisterToken, {
      isDevice: false,
      platformOS: "ios",
      projectId: "test-project-id",
    });

    expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
    expect(mockRegisterToken).not.toHaveBeenCalled();
  });

  it("creates an Android notification channel before requesting permissions", async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: "granted" });
    Notifications.getExpoPushTokenAsync.mockResolvedValue({
      data: "ExponentPushToken[android]",
    });

    await registerForPushNotificationsAsync(mockRegisterToken, {
      isDevice: true,
      platformOS: "android",
      projectId: "test-project-id",
    });

    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
      "default",
      expect.objectContaining({ importance: 5 }),
    );
    expect(mockRegisterToken).toHaveBeenCalledWith({
      token: "ExponentPushToken[android]",
      platform: "android",
    });
  });

  it("does not register token when projectId is missing", async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: "granted" });

    await registerForPushNotificationsAsync(mockRegisterToken, {
      isDevice: true,
      platformOS: "ios",
      projectId: undefined,
    });

    expect(mockRegisterToken).not.toHaveBeenCalled();
  });

  it("silently handles errors from getExpoPushTokenAsync", async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: "granted" });
    Notifications.getExpoPushTokenAsync.mockRejectedValue(
      new Error("token fetch failed"),
    );

    await expect(
      registerForPushNotificationsAsync(mockRegisterToken, {
        isDevice: true,
        platformOS: "ios",
        projectId: "test-project-id",
      }),
    ).resolves.toBeUndefined();

    expect(mockRegisterToken).not.toHaveBeenCalled();
  });
});

describe("usePushNotifications (notification response listener)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Notifications.addNotificationResponseReceivedListener.mockReturnValue({
      remove: jest.fn(),
    });
  });

  it("navigates to tasks tab when a task_assigned notification is tapped", () => {
    let capturedListener: ((response: unknown) => void) | null = null;
    Notifications.addNotificationResponseReceivedListener.mockImplementation(
      (fn: (response: unknown) => void) => {
        capturedListener = fn;
        return { remove: jest.fn() };
      },
    );

    renderHook(() => usePushNotifications(), { wrapper: createWrapper() });

    act(() => {
      capturedListener?.({
        notification: {
          request: { content: { data: { type: "task_assigned" } } },
        },
      });
    });

    expect(mockRouterPush).toHaveBeenCalledWith("/(tabs)/tasks");
  });

  it("navigates to tasks tab for high_priority_task notifications", () => {
    let capturedListener: ((response: unknown) => void) | null = null;
    Notifications.addNotificationResponseReceivedListener.mockImplementation(
      (fn: (response: unknown) => void) => {
        capturedListener = fn;
        return { remove: jest.fn() };
      },
    );

    renderHook(() => usePushNotifications(), { wrapper: createWrapper() });

    act(() => {
      capturedListener?.({
        notification: {
          request: { content: { data: { type: "high_priority_task" } } },
        },
      });
    });

    expect(mockRouterPush).toHaveBeenCalledWith("/(tabs)/tasks");
  });

  it("does not navigate for unknown notification types", () => {
    let capturedListener: ((response: unknown) => void) | null = null;
    Notifications.addNotificationResponseReceivedListener.mockImplementation(
      (fn: (response: unknown) => void) => {
        capturedListener = fn;
        return { remove: jest.fn() };
      },
    );

    renderHook(() => usePushNotifications(), { wrapper: createWrapper() });

    act(() => {
      capturedListener?.({
        notification: {
          request: { content: { data: { type: "some_other_event" } } },
        },
      });
    });

    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("removes the response listener on unmount", () => {
    const mockRemove = jest.fn();
    Notifications.addNotificationResponseReceivedListener.mockReturnValue({
      remove: mockRemove,
    });

    const { unmount } = renderHook(() => usePushNotifications(), {
      wrapper: createWrapper(),
    });
    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });
});
