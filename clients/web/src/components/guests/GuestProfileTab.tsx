import type { GuestWithStays } from "@shared";

export function GuestProfileTab(_props: {
  guest: GuestWithStays;
  onSaveNotes: (notes: string) => Promise<void>;
  isSavingNotes: boolean;
}) {
  return <div>profile stub</div>;
}
