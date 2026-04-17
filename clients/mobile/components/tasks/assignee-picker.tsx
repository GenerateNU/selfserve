import { useState } from "react";
import { Text } from "react-native";
import { UserRound } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { useAPIClient } from "@shared/api/client";
import { getConfig } from "@shared/api/config";
import type { User } from "@shared";
import { SearchPicker } from "@/components/tasks/search-picker";

type SearchUsersResponse = {
  users: Array<User>;
  next_cursor: string;
};

type AssigneePickerProps = {
  value: User | undefined;
  onChange: (user: User | undefined) => void;
};

export function AssigneePicker({ value, onChange }: AssigneePickerProps) {
  const [search, setSearch] = useState("");
  const [queryEnabled, setQueryEnabled] = useState(false);

  const api = useAPIClient();
  const { hotelId } = getConfig();

  const { data, isLoading } = useQuery({
    queryKey: ["users", "search", hotelId, search],
    queryFn: () =>
      api.post<SearchUsersResponse>("/users/search", {
        hotel_id: hotelId,
        q: search || undefined,
      }),
    enabled: queryEnabled,
  });

  const users = data?.users ?? [];

  function getDisplayName(user: User) {
    return [user.first_name, user.last_name].filter(Boolean).join(" ");
  }

  return (
    <SearchPicker
      icon={UserRound}
      label="Assignee"
      value={value}
      onChange={onChange}
      getKey={(u) => u.id ?? ""}
      getTriggerLabel={getDisplayName}
      getChipLabel={getDisplayName}
      renderRow={(user) => (
        <>
          <Text className="text-xs text-text-default tracking-tight">
            {getDisplayName(user)}
          </Text>
          {user.role && (
            <Text className="text-xs text-text-subtle tracking-tight">
              {user.role}
            </Text>
          )}
        </>
      )}
      items={users}
      isLoading={isLoading}
      search={search}
      onSearch={setSearch}
      onExpandChange={setQueryEnabled}
      searchPlaceholder="Search by name..."
      emptyMessage="No staff found"
    />
  );
}
