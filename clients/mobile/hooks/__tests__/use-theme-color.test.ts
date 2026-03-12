import { renderHook } from "@testing-library/react-native";
import { useThemeColor } from "../use-theme-color";
import { Colors } from "@/constants/theme";

jest.mock("@/hooks/use-color-scheme", () => ({
  useColorScheme: jest.fn(),
}));

const { useColorScheme } = require("@/hooks/use-color-scheme");

describe("useThemeColor", () => {
  it("returns light theme color by default", () => {
    useColorScheme.mockReturnValue("light");
    const { result } = renderHook(() => useThemeColor({}, "text"));
    expect(result.current).toBe(Colors.light.text);
  });

  it("returns dark theme color in dark mode", () => {
    useColorScheme.mockReturnValue("dark");
    const { result } = renderHook(() => useThemeColor({}, "text"));
    expect(result.current).toBe(Colors.dark.text);
  });

  it("uses custom color when provided", () => {
    useColorScheme.mockReturnValue("light");
    const customColor = "#ff0000";
    const { result } = renderHook(() =>
      useThemeColor({ light: customColor }, "text"),
    );
    expect(result.current).toBe(customColor);
  });
});
