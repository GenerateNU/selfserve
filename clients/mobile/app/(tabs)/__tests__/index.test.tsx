import { render } from "@testing-library/react-native";
import HomeScreen from "../index";

jest.mock("expo-image", () => {
  const { View } = require("react-native");
  return {
    Image: MockView,
  };
});

jest.mock("expo-router", () => {
  const { View } = require("react-native");
  const LinkComponent = ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  );
  LinkComponent.displayName = "Link";
  LinkComponent.Trigger = ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  );
  LinkComponent.Trigger.displayName = "Link.Trigger";
  LinkComponent.Preview = () => null;
  LinkComponent.Preview.displayName = "Link.Preview";
  LinkComponent.Menu = ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  );
  LinkComponent.Menu.displayName = "Link.Menu";
  LinkComponent.MenuAction = () => null;
  LinkComponent.MenuAction.displayName = "Link.MenuAction";
  return {
    Link: LinkComponent,
  };
});

jest.mock("@/components/parallax-scroll-view", () => {
  const { View } = require("react-native");
  const ParallaxScrollView = ({ children }: { children: React.ReactNode }) => {
    return <View>{children}</View>;
  };
  ParallaxScrollView.displayName = "ParallaxScrollView";
  return {
    __esModule: true,
    default: ParallaxScrollView,
  };
});

jest.mock("@/components/hello-wave", () => {
  const HelloWave = () => "👋";
  HelloWave.displayName = "HelloWave";
  return {
    HelloWave,
  };
});

jest.mock("@/components/themed-text", () => {
  const { Text } = require("react-native");
  const ThemedText = ({ children }: { children: React.ReactNode }) => {
    return <Text>{children}</Text>;
  };
  ThemedText.displayName = "ThemedText";
  return {
    ThemedText,
  };
});

jest.mock("@/components/themed-view", () => {
  const { View } = require("react-native");
  const ThemedView = ({ children }: { children: React.ReactNode }) => {
    return <View>{children}</View>;
  };
  ThemedView.displayName = "ThemedView";
  return {
    ThemedView,
  };
});

describe("HomeScreen", () => {
  it("renders without crashing", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Welcome!")).toBeTruthy();
  });

  it("displays step instructions", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Step 1: Try it")).toBeTruthy();
    expect(getByText("Step 2: Explore")).toBeTruthy();
    expect(getByText("Step 3: Get a fresh start")).toBeTruthy();
  });
});
