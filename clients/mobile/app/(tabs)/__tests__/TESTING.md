## Setup

### Dependencies

- `jest` - Testing framework
- `jest-expo` - Expo-specific Jest preset
- `@testing-library/react-native` - Testing utilities for React Native
- `@types/jest` - TypeScript types for Jest
- `react-test-renderer`

## Running Tests

```bash
npm test  # all tests

npm run test:watch  # watch mode

npm run test:coverage  # coverage report

npm test -- test.test.tsx  # specific test file
# ^ can also use path with quotes "app/(tabs)/__tests__/..." but Jest pattern match is easier
```

## Writing Tests

### Simple Component Tests

For simple components, just mock what you need. Ex:

```typescript
import { render } from "@testing-library/react-native";
import { MyComponent } from "../my-component";

// Mock external deps
jest.mock("@/hooks/use-theme-color", () => ({
  useThemeColor: () => "#000000",
}));

describe("MyComponent", () => {
  it("renders correctly", () => {
    const { getByText } = render(<MyComponent>Hello</MyComponent>);
    expect(getByText("Hello")).toBeTruthy();
  });
});
```

### Hook Tests

```typescript
import { renderHook } from "@testing-library/react-native";
import { useMyHook } from "../use-my-hook";

describe("useMyHook", () => {
  it("returns expected value", () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current).toBe("expected");
  });
});
```

### Screen Tests

For screens with a lot of dependencies, mock the complex components:

```typescript
jest.mock("expo-router", () => {
  const { View } = require("react-native");
  return {
    Link: ({ children }: any) => <View>{children}</View>,
  };
});

jest.mock("@/components/complex-component", () => ({
  ComplexComponent: ({ children }: any) => {
    const { View } = require("react-native");
    return <View>{children}</View>;
  },
}));
```

## Best Practices

1. **Keep tests simple** - Test component behavior, not implementation
2. **Mock external dependencies** - Expo modules, navigation, images
3. **Use lazy requires in mocks** - `require('react-native')` inside mock factories
4. **Focus on user-visible behavior** - What users see and interact with
5. **Avoid over-mocking** - Only mock what's necessary for the test to run

## Common Issues

### Module Not Found in Mocks

Use `require()` inside mock factories instead of imports to avoid hoisting issues:

```typescript
// do this
jest.mock("my-module", () => ({
  Component: () => {
    const { View } = require("react-native");
    return <View />;
  },
}));

// don't do this
import { View } from "react-native";
jest.mock("my-module", () => ({
  Component: () => <View />,
}));
```
