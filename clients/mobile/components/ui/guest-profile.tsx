import { View, Text, Pressable } from "react-native";
import { Box } from "./box";
import { ChevronLeft } from "lucide-react-native";
import { Collapsible } from "./collapsible";
import { router } from "expo-router";
import type { Stay } from "@shared/api/generated/models";

interface GuestProfileProps {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  notes?: string;
  preferences?: string;
  currentStays: Stay[];
  previousStays: Stay[];
}

export default function GuestProfile(props: GuestProfileProps) {
  return (
    <Box>
      <HeaderWithBackArrow />
      <Box>
        <GuestDescription {...props} />
        <GuestInfoCollapsibles {...props} />
      </Box>
    </Box>
  );
}

function HeaderWithBackArrow() {
  return (
    <Box className="flex-row items-center px-[4vw] py-[3vh] border-b border-stroke-subtle">
      <Pressable onPress={() => router.back()}>
        <ChevronLeft className="w-[6vw] h-[6vw]" color={"#000"} />
      </Pressable>
      <Text className="flex-1 text-center text-[5vw] font-semibold text-black">
        Guest Profile
      </Text>
      <View className="w-[6vw]" />
    </Box>
  );
}

function GuestDescription(props: GuestProfileProps) {
  return (
    <Box className="p-[4vw] border-b border-stroke-subtle">
      <View className="flex-row items-center mb-[3vh]">
        <View className="w-[15vw] h-[15vw] rounded-full border-2 border-shadow-strong items-center justify-center mr-[3vw]" />
        <View>
          <Text className="text-[5vw] font-semibold text-black">
            {props.firstName + " " + props.lastName}
          </Text>
        </View>
      </View>

      <View className="gap-[2vh]">
        {GUEST_PROFILE_CONFIG.infoFields.map((field, index) => (
          <InfoRow
            key={index}
            label={field.label}
            value={field.format(props)}
            fieldKey={field.key}
          />
        ))}
      </View>
    </Box>
  );
}

function InfoRow({
  label,
  value,
  fieldKey,
}: {
  label: string;
  value: unknown;
  fieldKey: string;
}) {
  const isPrimaryValue = fieldKey === "phone" || fieldKey === "email";

  return (
    <View className="flex-row">
      <Text className="text-[3.5vw] text-black w-[35vw]">{label}</Text>
      <Text
        className={`text-[3.5vw] flex-1 ${
          isPrimaryValue ? "text-primary-hover" : "text-black"
        }`}
      >
        {String(value)}
      </Text>
    </View>
  );
}

function StaysCollapsible({
  title,
  stays,
  emptyMessage,
}: {
  title: string;
  stays: Stay[];
  emptyMessage: string;
}) {
  return (
    <Collapsible title={title}>
      {stays.length === 0 ? (
        <EmptyStaysMessage message={emptyMessage} />
      ) : (
        <StayList stays={stays} />
      )}
    </Collapsible>
  );
}

function EmptyStaysMessage({ message }: { message: string }) {
  return <Text className="text-[3.5vw] text-black">{message}</Text>;
}

function StayList({ stays }: { stays: Stay[] }) {
  const displayDate = (arr: string, dep: string) =>
    new Date(arr).toLocaleDateString() +
    " - " +
    new Date(dep).toLocaleDateString();
  return (
    <View className="gap-[1vh]">
      {stays.map((stay, index) => (
        <View key={index} className="border-b border-stroke-subtle pb-[1vh]">
          <Text className="text-[3.5vw] text-black">{stay.room_number}</Text>
          <Text className="text-[3vw] text-black">
            {displayDate(stay.arrival_date, stay.departure_date)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function GuestInfoCollapsibles(props: GuestProfileProps) {
  return (
    <Box className="p-[4vw] gap-[2vh]">
      {GUEST_PROFILE_CONFIG.collapsibles.map((item, index) => (
        <Collapsible key={index} title={item.title}>
          <Text className="text-[3.5vw] text-black">{item.format(props)}</Text>
        </Collapsible>
      ))}
      <StaysCollapsible
        title="Current Stays"
        stays={props.currentStays}
        emptyMessage="No current stays"
      />
      <StaysCollapsible
        title="Previous Stays"
        stays={props.previousStays}
        emptyMessage="No previous stays"
      />
    </Box>
  );
}

const GUEST_PROFILE_CONFIG = {
  infoFields: [
    {
      key: "governmentName",
      label: "Government Name",
      format: (props: GuestProfileProps) =>
        props.firstName + " " + props.lastName,
    },
    {
      key: "phone",
      label: "Phone",
      format: (props: GuestProfileProps) => props.phone,
    },
    {
      key: "email",
      label: "Email",
      format: (props: GuestProfileProps) => props.email,
    },
  ],
  collapsibles: [
    {
      key: "notes",
      title: "Notes",
      format: (props: GuestProfileProps) => props.notes,
    },
    {
      key: "preferences",
      title: "Housekeeping Preferences",
      format: (props: GuestProfileProps) => props.preferences,
    },
  ],
};
