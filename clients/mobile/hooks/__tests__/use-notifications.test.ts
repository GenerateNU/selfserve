import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const mockApiGet = jest.fn();
const mockApiPut = jest.fn();
const mockApiPost = jest.fn();

jest.mock("@shared/api/client", () => ({
  useAPIClient: () => ({
    get: mockApiGet,
    put: mockApiPut,
    post: mockApiPost,
  }),
}));

import {
  useGetNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  usePostDeviceToken,
} from "@shared/api/notifications";
import type { Notification } from "@shared/types/notifications";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

const mockNotification: Notification = {
  id: "notif-1",
  user_id: "user-1",
  type: "task_assigned",
  title: "New task assigned to you",
  body: "Deliver extra towels to room 204",
  created_at: "2026-04-04T12:00:00Z",
};

describe("useGetNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches notifications from /notifications", async () => {
    mockApiGet.mockResolvedValue([mockNotification]);

    const { result } = renderHook(() => useGetNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiGet).toHaveBeenCalledWith("/notifications");
    expect(result.current.data).toEqual([mockNotification]);
  });

  it("returns an empty array when there are no notifications", async () => {
    mockApiGet.mockResolvedValue([]);

    const { result } = renderHook(() => useGetNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useMarkNotificationRead", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls PUT /notifications/:id/read with the given id", async () => {
    mockApiPut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMarkNotificationRead(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("notif-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiPut).toHaveBeenCalledWith("/notifications/notif-1/read", {});
  });
});

describe("useMarkAllNotificationsRead", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls PUT /notifications/read-all", async () => {
    mockApiPut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMarkAllNotificationsRead(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiPut).toHaveBeenCalledWith("/notifications/read-all", {});
  });
});

describe("usePostDeviceToken", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("posts token and platform to /device-tokens", async () => {
    mockApiPost.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePostDeviceToken(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ token: "ExponentPushToken[abc]", platform: "ios" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiPost).toHaveBeenCalledWith("/device-tokens", {
      token: "ExponentPushToken[abc]",
      platform: "ios",
    });
  });
});
