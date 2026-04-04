import { useState } from "react";
import { ArrowUp, Loader, Sparkles } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useGetUsersIdHook } from "@shared/api/generated/endpoints/users/users.ts";
import { usePostRequestGenerateHook } from "@shared/api/generated/endpoints/requests/requests.ts";
import type { Request } from "@shared";

type GlobalTaskInputProps = {
  onRequestGenerated: (request: Request) => void;
};

const fallbackHotelId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function GlobalTaskInput({ onRequestGenerated }: GlobalTaskInputProps) {
  const [value, setValue] = useState("");

  const { user: clerkUser } = useUser();
  const getUsersId = useGetUsersIdHook();
  const postRequestGenerate = usePostRequestGenerateHook();

  const { data: backendUser } = useQuery({
    queryKey: ["user", clerkUser?.id],
    queryFn: () => getUsersId(clerkUser!.id),
    enabled: !!clerkUser?.id,
  });
  const hotelId = backendUser?.hotel_id?.trim() || fallbackHotelId;
  const hasValidHotelId = uuidPattern.test(hotelId);

  const { mutate: generateRequest, isPending } = useMutation({
    mutationFn: (rawText: string) => {
      if (!hasValidHotelId) {
        throw new Error("No valid hotel is associated with your user.");
      }

      return postRequestGenerate({
        hotel_id: hotelId,
        raw_text: rawText,
      });
    },
    onSuccess: (result) => {
      onRequestGenerated(result.request);
      if (result.warning) {
        window.alert(result.warning.message);
      }
      setValue("");
    },
    onError: (error) => {
      console.error("[GlobalTaskInput] onError", error);
      if (error instanceof Error) {
        window.alert(error.message);
      }
    },
  });

  const handleSubmit = () => {
    if (!value.trim() || isPending) return;
    if (!hasValidHotelId) {
      window.alert("Your user is missing a valid hotel ID.");
      return;
    }
    generateRequest(value.trim());
  };

  if (isPending) {
    return (
      <div className="fixed bottom-6 left-[calc(50%+8rem)] -translate-x-1/2 z-50 w-[684px] h-[58px] flex items-center gap-3 rounded-2xl bg-white shadow-lg border border-stroke-subtle px-4">
        <Loader className="size-6 shrink-0 text-text-subtle animate-spin [animation-duration:2s]" />
        <span className="text-sm text-text-subtle">Creating tasks...</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-[calc(50%+8rem)] -translate-x-1/2 z-50 w-[684px] h-[58px] flex items-center gap-3 rounded-2xl bg-white shadow-lg border border-stroke-subtle px-4">
      <Sparkles className="size-6 shrink-0 text-primary" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Start typing to create new task..."
        className="flex-1 bg-transparent text-sm text-text-default placeholder:text-text-subtle outline-none"
      />
      <button
        type="button"
        onClick={handleSubmit}
        className={`flex size-8 shrink-0 items-center justify-center rounded-full cursor-pointer transition-colors ${
          value.trim() && hasValidHotelId ? "bg-primary" : "bg-bg-selected"
        }`}
      >
        <ArrowUp
          className={`size-4 ${value.trim() && hasValidHotelId ? "text-white" : "text-primary"}`}
        />
      </button>
    </div>
  );
}
