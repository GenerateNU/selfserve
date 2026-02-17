import { render } from "@testing-library/react-native";
import { ThemedText } from "../themed-text";

describe("ThemedText", () => {
  it("renders text content", () => {
    const { getByText } = render(<ThemedText>Hello World</ThemedText>);
    expect(getByText("Hello World")).toBeTruthy();
  });

  it("applies title className", () => {
    const { getByText } = render(<ThemedText type="title">Title</ThemedText>);
    const element = getByText("Title");
    expect(element.props.className).toContain("text-[32px]");
    expect(element.props.className).toContain("font-bold");
  });

  it("applies custom className", () => {
    const { getByText } = render(
      <ThemedText className="text-red-500">Custom</ThemedText>,
    );
    const element = getByText("Custom");
    expect(element.props.className).toContain("text-red-500");
  });

  it("passes through props", () => {
    const { getByTestId } = render(
      <ThemedText testID="test-text" numberOfLines={2}>
        Test
      </ThemedText>,
    );
    const element = getByTestId("test-text");
    expect(element.props.numberOfLines).toBe(2);
  });
});
