import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center py-4 border-b border-stroke-subtle">
      <Text className="w-2/5 text-sm font-medium text-text-default">{label}</Text>
      <Text className="flex-1 text-sm text-text-subtle">{value}</Text>
    </View>
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
      <View className="flex-row items-center py-3 border-b border-stroke-subtle gap-2">
        <Text className="w-2/5 text-sm font-medium text-text-default">{label}</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          keyboardType="phone-pad"
          autoFocus
          className="flex-1 text-sm text-text-subtle border border-stroke-subtle rounded-lg px-2 py-1.5"
        />
        <View className="flex-row gap-2">
          <Pressable
            onPress={handleSave}
            className="px-2 py-1 rounded-md active:opacity-60"
          >
            <Text className="text-sm font-semibold text-primary">Save</Text>
          </Pressable>
          <Pressable
            onPress={handleCancel}
            className="px-2 py-1 rounded-md active:opacity-60"
          >
            <Text className="text-sm font-semibold text-text-subtle">Cancel</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-center py-4 border-b border-stroke-subtle">
      <Text className="w-2/5 text-sm font-medium text-text-default">{label}</Text>
      <Text className="flex-1 text-sm text-text-subtle">{value}</Text>
      <Pressable
        onPress={() => setIsEditing(true)}
        className="px-2 py-1 rounded-md active:opacity-60"
      >
        <Text className="text-sm font-semibold text-primary">Edit</Text>
      </Pressable>
    </View>
  );
}

type ProfileInfoCardProps = {
  governmentName: string;
  email: string;
  phoneNumber: string;
  department: string;
  onSavePhone: (value: string) => void;
};

export function ProfileInfoCard({
  governmentName,
  email,
  phoneNumber,
  department,
  onSavePhone,
}: ProfileInfoCardProps) {
  return (
    <View className="rounded-xl border border-stroke-subtle bg-white mx-4 px-4">
      <DetailRow label="Government Name" value={governmentName} />
      <DetailRow label="Email" value={email} />
      <PhoneNumberDetailRow
        label="Phone Number"
        value={phoneNumber}
        onSave={onSavePhone}
      />
      <View className="flex-row items-center py-4">
        <Text className="w-2/5 text-sm font-medium text-text-default">Department</Text>
        <Text className="flex-1 text-sm text-text-subtle">{department}</Text>
      </View>
    </View>
  );
}
