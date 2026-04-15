import { useRef, useState } from "react";
import { ArrowUp, Loader, Sparkles } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGetUsersIdHook } from "@shared/api/generated/endpoints/users/users.ts";
import { usePostRequestGenerateHook } from "@shared/api/generated/endpoints/requests/requests.ts";
import type { Request } from "@shared";

type GlobalTaskInputProps = {
  onRequestGenerated: (request: Request) => void;
};

const fallbackHotelId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const hotelIdPattern =
  /^([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|org_.+)$/i;

// Persist input text across route navigations (SPA module state)
let persistedValue = "";

export function GlobalTaskInput({ onRequestGenerated }: GlobalTaskInputProps) {
  const [value, setValue] = useState(persistedValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (next: string) => {
    persistedValue = next;
    setValue(next);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const { user: clerkUser } = useUser();
  const getUsersId = useGetUsersIdHook();
  const postRequestGenerate = usePostRequestGenerateHook();
  const queryClient = useQueryClient();

  const { data: backendUser } = useQuery({
    queryKey: ["user", clerkUser?.id],
    queryFn: () => getUsersId(clerkUser!.id),
    enabled: !!clerkUser?.id,
  });
  const hotelId = backendUser?.hotel_id?.trim() || fallbackHotelId;
  const hasValidHotelId = hotelIdPattern.test(hotelId);

  const { mutate: generateRequest, isPending } = useMutation({
    mutationFn: (rawText: string) => {
      if (!hasValidHotelId) {
        throw new Error("Unable to create request right now.");
      }

      return postRequestGenerate({
        hotel_id: hotelId,
        raw_text: rawText,
      });
    },
    onSuccess: (result) => {
      if (!result.request) return;
      onRequestGenerated(result.request);
      handleChange("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      queryClient.invalidateQueries({ queryKey: ["requests", "kanban"] });
    },
    onError: (error) => {
      console.error("[GlobalTaskInput] onError", error);
    },
  });

  const handleSubmit = () => {
    if (!value.trim() || isPending) return;
    if (!hasValidHotelId) return;
    generateRequest(value.trim());
  };

  const containerStyle = {
    boxShadow:
      "-10px -5px 30px 0px rgba(168,205,185,0.25), 10px 5px 30px 0px rgba(168,205,185,0.25)",
  };

  if (isPending) {
    return (
      <div
        className="fixed bottom-6 left-[calc(50%+8rem)] -translate-x-1/2 z-50 w-[684px] min-h-[58px] flex items-center gap-[13px] rounded-lg bg-white border border-stroke-subtle px-6 py-3"
        style={containerStyle}
      >
        <Loader className="size-6 shrink-0 text-text-subtle animate-spin [animation-duration:2s]" />
        <span className="text-sm text-text-subtle">Creating tasks...</span>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-6 left-[calc(50%+8rem)] -translate-x-1/2 z-50 w-[684px] min-h-[58px] flex items-center gap-[13px] rounded-lg bg-white border border-stroke-subtle px-6 py-3"
      style={containerStyle}
    >
      <Sparkles className="size-6 shrink-0 text-primary" />
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Start typing to create new task..."
        rows={1}
        className="flex-1 bg-transparent text-sm text-text-default placeholder:text-text-subtle outline-none resize-none overflow-hidden"
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
