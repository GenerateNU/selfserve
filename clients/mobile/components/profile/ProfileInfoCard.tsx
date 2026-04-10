import { View, Text } from "react-native";
import { formatPhoneNumber } from "@/utils";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center py-4 border-b border-stroke-subtle">
      <Text className="w-2/5 text-sm font-medium text-text-default">
        {label}
      </Text>
      <Text className="flex-1 text-sm text-text-subtle">{value}</Text>
    </View>
  );
}

type ProfileInfoCardProps = {
  governmentName: string;
  email: string;
  phoneNumber: string;
  department: string;
};

export function ProfileInfoCard({
  governmentName,
  email,
  phoneNumber,
  department,
}: ProfileInfoCardProps) {
  return (
    <View className="rounded-xl border border-stroke-subtle bg-white mx-4 px-4">
      <DetailRow label="Government Name" value={governmentName} />
      <DetailRow label="Email" value={email} />
      <DetailRow label="Phone Number" value={formatPhoneNumber(phoneNumber)} />
      <View className="flex-row items-center py-4">
        <Text className="w-2/5 text-sm font-medium text-text-default">
          Department
        </Text>
        <Text className="flex-1 text-sm text-text-subtle">{department}</Text>
      </View>
    </View>
  );
}
