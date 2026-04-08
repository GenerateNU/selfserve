import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { Colors } from "@/constants/theme";

interface GuestProfileTabProps {
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  preferences?: string | null;
  specificAssistance?: string[];
}

export function GuestProfileTab(props: GuestProfileTabProps) {
  return (
    <View>
      <InfoSection {...props} />
      <SpecificAssistanceSection items={props.specificAssistance ?? []} />
      <NotesSection notes={props.notes} />
    </View>
  );
}

function InfoSection({
  firstName,
  lastName,
  phone,
  email,
  preferences,
}: GuestProfileTabProps) {
  const fields = [
    { label: "Government Name", value: `${firstName} ${lastName}` },
    { label: "Phone", value: phone },
    { label: "Email", value: email },
    { label: "Preferences", value: preferences },
  ].filter((f) => f.value);

  return (
    <View className="px-[4vw] py-[3vh] border-b border-stroke-subtle gap-[2vh]">
      {fields.map((field) => (
        <View key={field.label} className="flex-row">
          <Text className="text-[3.5vw] text-black font-medium w-[40vw]">
            {field.label}
          </Text>
          <Text className="text-[3.5vw] text-black flex-1">
            {String(field.value)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SpecificAssistanceSection({ items }: { items: string[] }) {
  return (
    <View className="px-[4vw] py-[3vh] border-b border-stroke-subtle">
      <Text className="text-[4vw] font-semibold text-black mb-[2vh]">
        Specific Assistance
      </Text>
      <View className="border border-stroke-subtle rounded-xl p-[3vw] gap-[1.5vh]">
        {items.length === 0 ? (
          <Text className="text-[3.5vw] text-shadow-strong">
            None on record
          </Text>
        ) : (
          items.map((item, i) => (
            <View key={i}>
              <View className="flex-row flex-wrap gap-[2vw]">
                <View className="bg-card border border-primary rounded-md px-[3vw] py-[0.5vh]">
                  <Text className="text-primary text-[3vw]">{item}</Text>
                </View>
              </View>
              {i < items.length - 1 && (
                <View className="border-b border-stroke-subtle mt-[1.5vh]" />
              )}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function NotesSection({ notes }: { notes?: string | null }) {
  const [value, setValue] = useState(notes ?? "");

  return (
    <View className="px-[4vw] py-[3vh] border-b border-stroke-subtle">
      <Text className="text-[4vw] font-semibold text-black mb-[2vh]">
        Notes
      </Text>
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
