import { useEffect, useRef, useState } from "react";

type UseDropdownOptions<T> = {
  selected: Array<T>;
  onChangeSelectedItems?: (items: Array<T>) => void;
};

type UseDropdownReturn<T> = {
  open: boolean;
  search: string;
  pending: Array<T>;
  triggerProps: { onClick: () => void };
  searchProps: {
    ref: React.RefObject<{ focus: () => void } | null>;
    value: string;
    onChange: (value: string) => void;
  };
  toggle: (item: T) => void;
  cancelProps: { onClick: () => void };
  selectProps: { onClick: () => void };
};

export function useDropdown<T>({
  selected,
  onChangeSelectedItems,
}: UseDropdownOptions<T>): UseDropdownReturn<T> {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<Array<T> | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const activePending = pending ?? selected;

  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
    }
  }, [open]);

  const toggle = (item: T) => {
    setPending((prev) => {
      const current = prev ?? selected;
      return current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
    });
  };

  const handleOpen = () => {
    setPending(selected);
    setSearch("");
    setOpen(true);
  };

  const close = () => {
    setPending(null);
    setSearch("");
    setOpen(false);
  };

  const handleCancel = () => close();

  const handleSelect = () => {
    onChangeSelectedItems?.(activePending);
    close();
  };

  return {
    open,
    search,
    pending: activePending,
    triggerProps: { onClick: open ? close : handleOpen },
    searchProps: {
      ref: searchRef,
      value: search,
      onChange: setSearch,
    },
    toggle,
    cancelProps: { onClick: handleCancel },
    selectProps: { onClick: handleSelect },
  };
}
