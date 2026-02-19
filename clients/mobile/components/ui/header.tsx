import { Box } from "@/components/ui/box";
import { Text } from "react-native";

interface HeaderProps {
  title: string;
  className?: string;
}

export function Header({ title, className }: HeaderProps) {
  return (
    <Box className={`px-[4vw] py-[5vh] border-b border-gray-200 ${className || ''}`}>
      <Text className="text-[5vw] font-semibold text-center">
        {title}
      </Text>
    </Box>
  );
}
