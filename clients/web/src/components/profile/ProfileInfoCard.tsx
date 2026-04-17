import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCustomInstance } from "@shared/api/orval-mutator";
import { PhoneNumberInput, formatPhoneNumber } from "./PhoneNumberInput";
import type { User } from "@shared";
import { Skeleton } from "@/components/ui/skeleton";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="group grid grid-cols-[40%_1fr_auto] items-center py-3">
      <p className="text-sm font-medium text-text-default">{label}</p>
      <p className="text-sm text-text-subtle">{value}</p>
      <div className="w-8" />
    </div>
  );
}

function PhoneNumberDetailRow({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string;
  onSave: (value: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = () => {
    onSave(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="grid grid-cols-[40%_1fr_auto] items-center py-3 gap-2">
        <p className="text-sm font-medium text-text-default">{label}</p>
        <PhoneNumberInput
          value={draft}
          onChange={setDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center rounded-md p-1 hover:bg-bg-selected cursor-pointer"
          >
            <Check className="size-4 text-primary" />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center justify-center rounded-md p-1 hover:bg-bg-selected cursor-pointer"
          >
            <X className="size-4 text-text-subtle" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group grid grid-cols-[40%_1fr_auto] items-center py-3">
      <p className="text-sm font-medium text-text-default">{label}</p>
      <p className="text-sm text-text-subtle">{value}</p>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="flex items-center justify-center rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-bg-selected cursor-pointer"
      >
        <Pencil className="size-4 text-text-subtle" />
      </button>
    </div>
  );
}

type ProfileInfoCardProps = {
  userId: string;
  governmentName: string;
  email: string;
  phoneNumber: string;
  department: string;
};

export function ProfileInfoCard({
  userId,
  governmentName,
  email,
  phoneNumber,
  department,
}: ProfileInfoCardProps) {
  const queryClient = useQueryClient();
  const request = useCustomInstance<User>();

  const { mutate: updateUser } = useMutation({
    mutationFn: (phone_number: string) =>
      request({
        url: `/users/${userId}`,
        method: "PUT",
        data: { phone_number },
      }),
    onMutate: async (phone_number) => {
      await queryClient.cancelQueries({ queryKey: ["user", userId] });
      const previous = queryClient.getQueryData<User>(["user", userId]);
      queryClient.setQueryData<User>(["user", userId], (old) => ({
        ...old,
        phone_number,
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["user", userId], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });

  return (
    <section className="rounded-lg border border-stroke-subtle bg-white p-6">
      <div className="divide-y divide-stroke-subtle">
        <DetailRow label="Government Name" value={governmentName} />
        <DetailRow label="Email" value={email} />
        <PhoneNumberDetailRow
          label="Phone Number"
          value={formatPhoneNumber(phoneNumber)}
          onSave={(val) => updateUser(val)}
        />
        <DetailRow label="Department" value={department} />
      </div>
    </section>
  );
}

export function ProfileInfoCardSkeleton() {
  return (
    <section className="h-56 rounded-lg border border-stroke-subtle bg-white p-6">
      <div className="divide-y divide-stroke-subtle">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="grid grid-cols-[40%_1fr] items-center py-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>
    </section>
  );
}
