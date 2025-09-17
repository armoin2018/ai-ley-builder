import { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@shared/components';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="test-theme">
      {children}
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Custom matchers for testing
export const expectToHaveClasses = (element: Element, ...classes: string[]) => {
  classes.forEach(className => {
    expect(element).toHaveClass(className);
  });
};

export const expectNotToHaveClasses = (
  element: Element,
  ...classes: string[]
) => {
  classes.forEach(className => {
    expect(element).not.toHaveClass(className);
  });
};
