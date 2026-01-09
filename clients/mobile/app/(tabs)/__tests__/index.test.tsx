import { render } from '@testing-library/react-native';
import HomeScreen from '../index';

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: View,
  };
});

jest.mock('expo-router', () => {
  const { View } = require('react-native');
  const LinkComponent = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
  LinkComponent.Trigger = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
  LinkComponent.Preview = () => null;
  LinkComponent.Menu = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
  LinkComponent.MenuAction = () => null;
  return {
    Link: LinkComponent,
  };
});

jest.mock('@/components/parallax-scroll-view', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

jest.mock('@/components/hello-wave', () => ({
  HelloWave: () => '👋',
}));

jest.mock('@/components/themed-text', () => ({
  ThemedText: ({ children }: { children: React.ReactNode }) => {
    const { Text } = require('react-native');
    return <Text>{children}</Text>;
  },
}));

jest.mock('@/components/themed-view', () => ({
  ThemedView: ({ children }: { children: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

describe('HomeScreen', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Welcome!')).toBeTruthy();
  });

  it('displays step instructions', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Step 1: Try it')).toBeTruthy();
    expect(getByText('Step 2: Explore')).toBeTruthy();
    expect(getByText('Step 3: Get a fresh start')).toBeTruthy();
  });
});
