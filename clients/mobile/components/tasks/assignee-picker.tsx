import { useRef, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { UserRound, ChevronRight, Search, X } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { useAPIClient } from "@shared/api/client";
import { getConfig } from "@shared/api/config";
import type { User } from "@shared";
import { Colors } from "@/constants/theme";

const ICON_COLOR = Colors.light.textSubtle;

type SearchUsersResponse = {
  users: Array<User>;
  next_cursor: string;
};

type AssigneePickerProps = {
  value: User | undefined;
  onChange: (user: User | undefined) => void;
};

export function AssigneePicker({ value, onChange }: AssigneePickerProps) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<TextInput>(null);

  const api = useAPIClient();
  const { hotelId } = getConfig();

  const { data, isLoading } = useQuery({
    queryKey: ["users", "search", hotelId, search],
    queryFn: () =>
      api.post<SearchUsersResponse>("/users/search", {
        hotel_id: hotelId,
        q: search || undefined,
      }),
    enabled: expanded,
  });

  const users = data?.users ?? [];

  function handleToggle() {
    const next = !expanded;
    setExpanded(next);
    setSearch("");
    if (next) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleSelect(user: User) {
    onChange(value?.id === user.id ? undefined : user);
    setExpanded(false);
    setSearch("");
  }

  const displayName = value
    ? [value.first_name, value.last_name].filter(Boolean).join(" ")
    : undefined;

  return (
    <View className="gap-2">
      <Pressable
        onPress={handleToggle}
        className="flex-row items-center justify-between h-6"
      >
        <View className="flex-row items-center gap-1">
          <UserRound size={16} color={ICON_COLOR} />
          <Text className="text-[15px] text-text-subtle tracking-tight">
            Assignee
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text
            className={`text-[15px] tracking-tight ${displayName ? "text-text-default" : "text-text-subtle"}`}
          >
            {displayName ?? "Select..."}
          </Text>
          <ChevronRight
            size={14}
            color={ICON_COLOR}
            style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}
          />
        </View>
      </Pressable>

      {expanded && (
        <View className="rounded border border-input-border">
          <View className="flex-row items-center gap-2.5 px-2 py-2 border-b border-input-border-light">
            <Search size={17} color={ICON_COLOR} />
            <View className="flex-row items-center flex-1 gap-1">
              {value && (
                <View className="flex-row items-center gap-1 bg-bg-selected rounded px-1.5 py-0.5">
                  <Text className="text-[12px] text-text-default tracking-tight">
                    {displayName}
                  </Text>
                  <Pressable onPress={() => onChange(undefined)} hitSlop={4}>
                    <X size={10} color={ICON_COLOR} />
                  </Pressable>
                </View>
              )}
              <TextInput
                ref={inputRef}
                className="flex-1 text-[12px] text-text-default tracking-tight"
                placeholder="Search by name..."
                placeholderTextColor={ICON_COLOR}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
            </View>
          </View>

          {isLoading ? (
            <View className="px-4 py-3">
              <Text className="text-[12px] text-text-subtle tracking-tight">
                Loading...
              </Text>
            </View>
          ) : users.length === 0 ? (
            <View className="px-4 py-3">
              <Text className="text-[12px] text-text-subtle tracking-tight">
                No staff found
              </Text>
            </View>
          ) : (
            users.map((user) => (
              <Pressable
                key={user.id}
                onPress={() => handleSelect(user)}
                className={`px-4 py-2 ${value?.id === user.id ? "bg-bg-selected" : ""}`}
              >
                <Text className="text-[12px] text-text-default tracking-tight">
                  {[user.first_name, user.last_name].filter(Boolean).join(" ")}
                </Text>
                {user.role && (
                  <Text className="text-[11px] text-text-subtle tracking-tight">
                    {user.role}
                  </Text>
                )}
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}
