import { render } from '@testing-library/react-native';
import { ThemedText } from '../themed-text';

jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

describe('ThemedText', () => {
  it('renders text content', () => {
    const { getByText } = render(<ThemedText>Hello World</ThemedText>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('applies title styles', () => {
    const { getByText } = render(<ThemedText type="title">Title</ThemedText>);
    const element = getByText('Title');
    expect(element.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fontSize: 32, fontWeight: 'bold' }),
      ])
    );
  });

  it('passes through props', () => {
    const { getByTestId } = render(
      <ThemedText testID="test-text" numberOfLines={2}>Test</ThemedText>
    );
    const element = getByTestId('test-text');
    expect(element.props.numberOfLines).toBe(2);
  });
});
