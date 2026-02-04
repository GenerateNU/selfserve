import { render } from "@testing-library/react-native";
import HomeScreen from "../index";

jest.mock("@clerk/clerk-expo", () => {
  const actual = jest.requireActual("@clerk/clerk-expo");
  return {
    ...actual,
    useAuth: () => ({
      getToken: async () => null,
      isLoaded: true,
      isSignedIn: false,
      userId: null,
      sessionId: null,
    }),
  };
});

jest.mock("../../../hooks/hello", () => ({
  useGetHello: () => ({
    data: "hello",
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
  useGetHelloName: () => ({
    data: "hello-name",
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
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
