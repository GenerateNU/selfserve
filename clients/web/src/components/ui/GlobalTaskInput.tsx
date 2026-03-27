import { useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useGetUsersIdHook } from "@shared/api/generated/endpoints/users/users.ts";
import { usePostRequestGenerateHook } from "@shared/api/generated/endpoints/requests/requests.ts";

export function GlobalTaskInput() {
  const [value, setValue] = useState("");

  const { user: clerkUser } = useUser();
  const getUsersId = useGetUsersIdHook();
  const postRequestGenerate = usePostRequestGenerateHook();

  const { data: backendUser } = useQuery({
    queryKey: ["user", clerkUser?.id],
    queryFn: () => getUsersId(clerkUser!.id),
    enabled: !!clerkUser?.id,
  });

  const { mutate: generateRequest, isPending } = useMutation({
    mutationFn: (rawText: string) =>
      postRequestGenerate({
        hotel_id: backendUser?.hotel_id ?? "",
        raw_text: rawText,
      }),
    onSuccess: () => {
      setValue("");
    },
  });

  const handleSubmit = () => {
    if (!value.trim() || isPending) return;
    generateRequest(value.trim());
  };

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
        disabled={isPending}
        className={`flex size-8 shrink-0 items-center justify-center rounded-full cursor-pointer transition-colors ${
          value.trim() ? "bg-primary" : "bg-bg-selected"
        }`}
      >
        <ArrowUp
          className={`size-4 ${value.trim() ? "text-white" : "text-primary"}`}
        />
      </button>
    </div>
  );
}
