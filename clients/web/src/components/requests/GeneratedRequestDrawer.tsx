import type { Request } from "@shared";
import { DrawerShell } from "@/components/ui/DrawerShell";

type GeneratedRequestDrawerProps = {
  request: Request | null;
  onClose: () => void;
};

function Field({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-zinc-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-zinc-900">{value ?? "—"}</span>
    </div>
  );
}

export function GeneratedRequestDrawer({
  request,
  onClose,
}: GeneratedRequestDrawerProps) {
  if (!request) return null;

  return (
    <DrawerShell title={request.name ?? "Generated Request"} onClose={onClose}>
      <Field label="Status" value={request.status} />
      <Field label="Priority" value={request.priority} />
      <Field label="Type" value={request.request_type} />
      <Field label="Category" value={request.request_category} />
      <Field label="Department" value={request.department} />
      <Field label="Description" value={request.description} />
      <Field label="Notes" value={request.notes} />
      <Field
        label="Estimated Completion"
        value={
          request.estimated_completion_time
            ? `${request.estimated_completion_time} min`
            : undefined
        }
      />
    </DrawerShell>
  );
}
