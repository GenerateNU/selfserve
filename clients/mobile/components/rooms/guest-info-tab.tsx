import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { ChevronRight, Accessibility, FileText } from "lucide-react-native";
import { router } from "expo-router";
import { useGetGuestsStaysId } from "@shared";
import type { GuestWithStays } from "@shared";
import { formatDate, formatTime } from "@/utils/time";
import { Colors } from "@/constants/theme";

type Props = {
  guestIds: string[];
};

export function GuestInfoTab({ guestIds }: Props) {
  if (guestIds.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-text-secondary text-sm text-center">
          No active guests for this room
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingBottom: 24,
        paddingTop: 16,
        gap: 16,
      }}
    >
      {guestIds.map((guestId) => (
        <GuestInfoCard key={guestId} guestId={guestId} />
      ))}
    </ScrollView>
  );
}

function GuestInfoCard({ guestId }: { guestId: string }) {
  const { data, isLoading } = useGetGuestsStaysId(guestId);

  if (isLoading) {
    return (
      <View className="items-center justify-center py-12">
        <ActivityIndicator />
      </View>
    );
  }

  if (!data) return null;

  return (
    <View className="gap-4">
      <GuestProfileSection data={data} guestId={guestId} />
      <GuestOverviewSection data={data} />
    </View>
  );
}

function GuestProfileSection({
  data,
  guestId,
}: {
  data: GuestWithStays;
  guestId: string;
}) {
  const hasAccessibility = (data.assistance?.accessibility?.length ?? 0) > 0;
  const hasNotes = !!data.notes;

  return (
    <View className="border-b border-stroke-subtle pb-4 gap-3">
      <Text className="text-[15px] font-medium text-text-default tracking-tight">
        Guest Profile
      </Text>
      <View className="border border-stroke-subtle rounded p-3 gap-2">
        <View className="flex-row items-end gap-2">
          <Text className="text-base font-medium text-black">
            {data.first_name} {data.last_name}
          </Text>
          {data.pronouns && (
            <Text className="text-[11px] text-text-secondary leading-5">
              {data.pronouns}
            </Text>
          )}
        </View>

        {(hasAccessibility || hasNotes) && (
          <View className="flex-row gap-1 flex-wrap">
            {hasAccessibility && (
              <View className="flex-row items-center gap-2 bg-bg-container px-2 py-1 rounded h-6">
                <Accessibility size={12} color={Colors.light.iconMuted} />
                <Text className="text-[12px] text-text-default">
                  Accessibility Needs
                </Text>
              </View>
            )}
            {hasNotes && (
              <View className="flex-row items-center gap-2 bg-bg-container px-2 py-1 rounded h-6">
                <FileText size={12} color={Colors.light.iconMuted} />
                <Text className="text-[12px] text-text-default">Notes</Text>
              </View>
            )}
          </View>
        )}

        <Pressable
          className="flex-row items-center gap-2"
          onPress={() => router.push(`/guests/${guestId}`)}
        >
          <Text className="text-[11px] text-text-secondary">
            View full guest profile
          </Text>
          <ChevronRight size={12} color={Colors.light.iconMuted} />
        </Pressable>
      </View>
    </View>
  );
}

function GuestOverviewSection({ data }: { data: GuestWithStays }) {
  const currentStay = data.current_stays?.[0];

  const dnd =
    data.do_not_disturb_start && data.do_not_disturb_end
      ? `${formatTime(data.do_not_disturb_start)} - ${formatTime(data.do_not_disturb_end)}`
      : null;

  const capitalize = (s?: string | null) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : null;

  return (
    <View className="gap-3">
      <Text className="text-[15px] font-medium text-text-default tracking-tight">
        Guest Overview
      </Text>

      <View className="gap-5 pt-2">
        <OverviewField
          label="Government Name"
          value={`${data.first_name} ${data.last_name}`}
        />

        {data.pronouns && (
          <OverviewField label="Pronouns" value={data.pronouns} />
        )}

        {currentStay && (
          <View className="flex-row gap-6">
            <OverviewField
              label="Arrival"
              value={`${formatDate(currentStay.arrival_date)}, ${formatTime(currentStay.arrival_date)}`}
            />
            <OverviewField
              label="Departure"
              value={`${formatDate(currentStay.departure_date)}, ${formatTime(currentStay.departure_date)}`}
            />
          </View>
        )}

        {dnd && <OverviewField label="Do Not Disturb" value={dnd} />}

        {data.housekeeping_cadence && (
          <OverviewField
            label="Housekeeping Preferences"
            value={capitalize(data.housekeeping_cadence)!}
          />
        )}

        {(data.assistance?.accessibility?.length ?? 0) > 0 && (
          <TagField
            label="Accessibility"
            items={data.assistance!.accessibility!}
          />
        )}

        {(data.assistance?.dietary?.length ?? 0) > 0 && (
          <TagField
            label="Dietary Restrictions"
            items={data.assistance!.dietary!}
          />
        )}

        <View className="gap-2">
          <Text className="text-[12px] text-text-subtle">Medical Needs</Text>
          {(data.assistance?.medical?.length ?? 0) > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {data.assistance!.medical!.map((item, i) => (
                <Tag key={i} label={item} />
              ))}
            </View>
          ) : (
            <Text className="text-[15px] text-text-secondary">
              None recorded.
            </Text>
          )}
        </View>

        {data.notes && <OverviewField label="Notes" value={data.notes} />}
      </View>
    </View>
  );
}

function OverviewField({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-2 flex-1">
      <Text className="text-[12px] text-text-subtle">{label}</Text>
      <Text className="text-base text-black">{value}</Text>
    </View>
  );
}

function TagField({ label, items }: { label: string; items: string[] }) {
  return (
    <View className="gap-2">
      <Text className="text-[12px] text-text-subtle">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {items.map((item, i) => (
          <Tag key={i} label={item} />
        ))}
      </View>
    </View>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View className="bg-bg-container px-2 py-1 rounded">
      <Text className="text-sm text-text-default">{label}</Text>
    </View>
  );
}
