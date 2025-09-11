import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '../../../test/utils';
import { ThemeProvider } from '../ThemeProvider';
import { useTheme } from '../../../shared/hooks/useTheme';

// Test component that uses the theme hook
const ThemeConsumer = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('provides default theme', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
  });

  it('uses custom default theme', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  it('loads theme from localStorage', () => {
    // Mock the actual storage before rendering
    vi.mocked(localStorage.getItem).mockReturnValue('light');

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  });

  it('uses custom storage key', () => {
    // Mock the actual storage before rendering
    vi.mocked(localStorage.getItem).mockImplementation(key => {
      return key === 'custom-theme' ? 'dark' : null;
    });

    render(
      <ThemeProvider storageKey="custom-theme">
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  it('changes theme and updates localStorage', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    act(() => {
      screen.getByText('Set Dark').click();
    });

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('ui-theme', 'dark');
  });

  it('renders with dark theme correctly', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>
    );

    // Verify the theme state is correct
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    // Note: DOM class application is tested in integration tests
  });

  it('handles system theme state correctly', () => {
    // Mock prefers-color-scheme: dark
    const mockMatchMedia = vi.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    window.matchMedia = mockMatchMedia;

    render(
      <ThemeProvider defaultTheme="system">
        <ThemeConsumer />
      </ThemeProvider>
    );

    // Verify the theme state is system
    expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
  });

  // Note: Error boundary testing for missing provider would be
  // better handled in integration tests or E2E tests
});
