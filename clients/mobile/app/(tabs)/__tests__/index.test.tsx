import { render } from "@testing-library/react-native";
import HomeScreen from "../index";

// Mock the shared hook
jest.mock("@shared/hooks/use-hello", () => ({
  useGetHelloName: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

// Mock expo-image
jest.mock("expo-image", () => ({
  Image: "Image",
}));

// Mock parallax scroll view - just render children
jest.mock("@/components/parallax-scroll-view", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe("HomeScreen", () => {
  it("renders without crashing", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Welcome!")).toBeTruthy();
  });

  it("displays the API Test section", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("API Test")).toBeTruthy();
  });
});
