import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCustomInstance } from "@shared";
import type { RoomWithOptionalGuestBooking } from "@shared";

const useGetRoomByIdHook = () => {
  const getRoomById = useCustomInstance<RoomWithOptionalGuestBooking>();
  return useCallback(
    (id: string, signal?: AbortSignal) =>
      getRoomById({ url: `/rooms/${id}`, method: "GET", signal }),
    [getRoomById],
  );
};

export function useRoomById(roomId: string | undefined) {
  const getRoomById = useGetRoomByIdHook();
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: ({ signal }) => getRoomById(roomId!, signal),
    enabled: !!roomId,
  });
}
