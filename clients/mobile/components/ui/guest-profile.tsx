import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Calendar, Clock, Users } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Colors } from "@/constants/theme";
import { usePutGuestsId, getGetGuestsStaysIdQueryKey } from "@shared";
import type { Stay, Assistance } from "@shared";
import { formatDate, formatTime } from "@/utils/time";

interface GuestProfileTabProps {
  guestId: string;
  firstName: string;
  lastName: string;
  pronouns?: string | null;
  doNotDisturbStart?: string | null;
  doNotDisturbEnd?: string | null;
  housekeepingCadence?: string | null;
  notes?: string | null;
  assistance?: Assistance;
  currentStays: Stay[];
  onViewAllBookings: () => void;
}

export function GuestProfileTab(props: GuestProfileTabProps) {
  return (
    <View>
      <InfoSection {...props} />
      <ActiveBookingsSection
        currentStays={props.currentStays}
        onViewAll={props.onViewAllBookings}
      />
      <SpecificAssistanceSection assistance={props.assistance} />
      <NotesSection guestId={props.guestId} notes={props.notes} />
    </View>
  );
}

function InfoSection({
  firstName,
  lastName,
  pronouns,
  doNotDisturbStart,
  doNotDisturbEnd,
  housekeepingCadence,
}: GuestProfileTabProps) {
  const dnd =
    doNotDisturbStart && doNotDisturbEnd
      ? `${formatTime(doNotDisturbStart)} - ${formatTime(doNotDisturbEnd)}`
      : null;

  const capitalize = (s?: string | null) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : null;

  const fields = [
    { label: "Government Name", value: `${firstName} ${lastName}` },
    { label: "Pronouns", value: pronouns },
    { label: "Do Not Disturb", value: dnd },
    { label: "Housekeeping", value: capitalize(housekeepingCadence) },
  ].filter((f) => f.value);

  return (
    <View className="px-[4vw] py-[3vh] border-b border-stroke-subtle gap-[2vh]">
      {fields.map((field) => (
        <View key={field.label} className="flex-row">
          <Text className="text-[3.5vw] text-text-subtle w-[40vw]">
            {field.label}
          </Text>
          <Text className="text-[3.5vw] font-semibold text-black flex-1">
            {String(field.value)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ActiveBookingsSection({
  currentStays,
  onViewAll,
}: {
  currentStays: Stay[];
  onViewAll: () => void;
}) {
  return (
    <View className="px-[4vw] py-[3vh] border-b border-stroke-subtle gap-[2vh]">
      <Text className="text-[4vw] font-semibold text-black">
        Active Bookings ({currentStays.length})
      </Text>

      {currentStays.map((stay, i) => (
        <View
          key={i}
          className="bg-success-accent border border-success-stroke rounded-xl p-[4vw] gap-[1.5vh]"
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-[5.5vw] font-bold text-primary">
              Suite {stay.room_number}
            </Text>
            <View className="flex-row items-center gap-[1.5vw]">
              <Users size={16} color={Colors.light.tabBarActive} />
              <Text className="text-[4vw] text-primary font-medium">
                {stay.group_size ?? 1}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-[2vw]">
            <Text className="text-[3.5vw] text-primary w-[22vw]">Arrival:</Text>
            <Calendar size={13} color={Colors.light.tabBarActive} />
            <Text className="text-[3.5vw] text-primary">
              {formatDate(stay.arrival_date)}
            </Text>
            <Clock size={13} color={Colors.light.tabBarActive} />
            <Text className="text-[3.5vw] text-primary">
              {formatTime(stay.arrival_date)}
            </Text>
          </View>

          <View className="flex-row items-center gap-[2vw]">
            <Text className="text-[3.5vw] text-primary w-[22vw]">
              Departure:
            </Text>
            <Calendar size={13} color={Colors.light.tabBarActive} />
            <Text className="text-[3.5vw] text-primary">
              {formatDate(stay.departure_date)}
            </Text>
            <Clock size={13} color={Colors.light.tabBarActive} />
            <Text className="text-[3.5vw] text-primary">
              {formatTime(stay.departure_date)}
            </Text>
          </View>
        </View>
      ))}

      <Pressable
        onPress={onViewAll}
        className="bg-primary rounded-xl py-[1.8vh] items-center"
      >
        <Text className="text-white text-[3.5vw] font-medium">
          View All Bookings
        </Text>
      </Pressable>
    </View>
  );
}

function SpecificAssistanceSection({
  assistance,
}: {
  assistance?: Assistance;
}) {
  const categories = [
    { label: "Accessibility", items: assistance?.accessibility ?? [] },
    { label: "Dietary Restrictions", items: assistance?.dietary ?? [] },
    { label: "Medical Needs", items: assistance?.medical ?? [] },
  ];

  return (
    <View className="px-[4vw] py-[3vh] border-b border-stroke-subtle">
      <Text className="text-[4vw] font-semibold text-black mb-[2vh]">
        Specific Assistance
      </Text>
      <View className="border border-stroke-subtle rounded-xl p-[3vw] gap-[2vh]">
        {categories.map((cat, i) => (
          <View key={cat.label}>
            <Text className="text-[3.5vw] font-medium text-black mb-[1vh]">
              {cat.label}
            </Text>
            {cat.items.length === 0 ? (
              <Text className="text-[3.5vw] text-text-subtle">None</Text>
            ) : (
              <View className="flex-row flex-wrap gap-[2vw]">
                {cat.items.map((item, j) => (
                  <View
                    key={j}
                    className="bg-danger-accent border border-danger rounded-md px-[3vw] py-[0.5vh]"
                  >
                    <Text className="text-[3vw] text-danger">{item}</Text>
                  </View>
                ))}
              </View>
            )}
            {i < categories.length - 1 && (
              <View className="border-b border-stroke-subtle mt-[1.5vh]" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function NotesSection({
  guestId,
  notes,
}: {
  guestId: string;
  notes?: string | null;
}) {
  const [value, setValue] = useState(notes ?? "");
  const queryClient = useQueryClient();

  useEffect(() => {
    setValue(notes ?? "");
  }, [notes]);

  const isDirty = value !== (notes ?? "");
  const { mutate: updateGuest, isPending } = usePutGuestsId();

  const save = () => {
    updateGuest(
      { id: guestId, data: { notes: value } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getGetGuestsStaysIdQueryKey(guestId),
          });
        },
      },
    );
  };

  return (
    <View className="px-[4vw] py-[3vh]">
      <View className="flex-row items-center justify-between mb-[2vh]">
        <Text className="text-[4vw] font-semibold text-black">Notes</Text>
        {isDirty && (
          <Pressable
            onPress={save}
            disabled={isPending}
            className="bg-primary rounded-lg px-[3vw] py-[0.6vh]"
          >
            <Text className="text-white text-[3vw] font-medium">
              {isPending ? "Saving..." : "Save"}
            </Text>
          </Pressable>
        )}
      </View>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="Add a note..."
        placeholderTextColor={Colors.light.icon}
        multiline
        className="border border-stroke-subtle rounded-xl p-[3vw] min-h-[15vh] text-[3.5vw] text-black"
        textAlignVertical="top"
      />
    </View>
  );
}
