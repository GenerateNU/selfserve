import { render } from '@testing-library/react-native';
import HomeScreen from '../index';

/* eslint-disable @typescript-eslint/no-require-imports, react/display-name */
jest.mock('expo-image', () => {
  const { View: MockView } = require('react-native');
  return {
    Image: MockView,
  };
});

jest.mock('expo-router', () => {
  const { View: MockView } = require('react-native');
  const LinkComponent: any = ({ children }: { children: React.ReactNode }) => <MockView>{children}</MockView>;
  LinkComponent.Trigger = ({ children }: { children: React.ReactNode }) => <MockView>{children}</MockView>;
  LinkComponent.Preview = () => null;
  LinkComponent.Menu = ({ children }: { children: React.ReactNode }) => <MockView>{children}</MockView>;
  LinkComponent.MenuAction = () => null;
  return {
    Link: LinkComponent,
  };
});

jest.mock('@/components/parallax-scroll-view', () => {
  const { View: MockView } = require('react-native');
  const MockParallaxScrollView = ({ children }: { children: React.ReactNode }) => {
    return <MockView>{children}</MockView>;
  };
  return {
    __esModule: true,
    default: MockParallaxScrollView,
  };
});

jest.mock('@/components/hello-wave', () => ({
  HelloWave: () => '👋',
}));

jest.mock('@/components/themed-text', () => {
  const { Text: MockText } = require('react-native');
  const MockThemedText = ({ children }: { children: React.ReactNode }) => {
    return <MockText>{children}</MockText>;
  };
  return {
    ThemedText: MockThemedText,
  };
});

jest.mock('@/components/themed-view', () => {
  const { View: MockView } = require('react-native');
  const MockThemedView = ({ children }: { children: React.ReactNode }) => {
    return <MockView>{children}</MockView>;
  };
  return {
    ThemedView: MockThemedView,
  };
});

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
