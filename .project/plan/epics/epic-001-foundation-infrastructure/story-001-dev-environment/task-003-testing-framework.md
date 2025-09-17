# Task 003: Setup Testing Framework

## Overview

**Task ID**: TASK-003  
**Story**: Development Environment Setup (STORY-001)  
**Priority**: High  
**Status**: Completed  
**Estimated Hours**: 3 hours  
**Actual Hours**: 2.5 hours  
**Assignee**: Technical Lead  
**Started**: September 11, 2025  
**Completed**: September 11, 2025

## Description

Configure comprehensive testing infrastructure including Vitest for fast unit testing and Playwright for end-to-end testing. Establish testing standards, patterns, and integration with the existing quality pipeline to ensure robust test coverage and continuous validation.

## Acceptance Criteria

- [x] Vitest configured for unit and integration testing
- [x] Playwright setup for end-to-end testing  
- [x] Test utilities and custom matchers configured
- [x] Coverage reporting configured with thresholds
- [x] Testing integrated with pre-commit hooks
- [x] Sample tests created to validate configuration
- [x] TypeScript support for all testing frameworks
- [x] CI/CD ready test execution scripts

## Technical Context

**Files to Create/Modify**:

- `vitest.config.ts` - Vitest configuration with TypeScript support
- `playwright.config.ts` - Playwright configuration for e2e testing  
- `src/test/setup.ts` - Test environment setup and utilities
- `src/test/utils.tsx` - React testing utilities and custom renders
- `tests/e2e/` - End-to-end test directory structure
- `src/components/__tests__/` - Unit test examples
- `package.json` - Test scripts and dependencies

**Technologies**:

- Vitest 2+ for fast unit testing with native TypeScript support
- Playwright 1.40+ for reliable cross-browser e2e testing
- @testing-library/react for component testing utilities
- jsdom for browser environment simulation
- @testing-library/user-event for realistic user interactions

**Patterns**:

- Component-driven test organization
- Page Object Model for e2e tests
- Custom render utilities with providers
- Shared test utilities and fixtures
- Coverage-driven development validation

## Implementation Steps

### Step 1: Install and Configure Vitest (60 minutes)

```bash
# Install Vitest and testing utilities
npm install --save-dev vitest @vitest/ui @vitest/coverage-v8
npm install --save-dev jsdom @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
```

```typescript
// vitest.config.ts - Comprehensive Vitest configuration
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: true,
      coverage: {
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/coverage/**',
        ],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
          },
        },
      },
    },
  })
);
```

```typescript
// src/test/setup.ts - Test environment setup
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### Step 2: Configure Playwright for E2E Testing (45 minutes)

```bash
# Install Playwright
npm install --save-dev @playwright/test
npx playwright install
```

```typescript
// playwright.config.ts - Playwright configuration
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Step 3: Create Test Utilities and Examples (60 minutes)

```typescript
// src/test/utils.tsx - React testing utilities
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

```typescript
// src/components/__tests__/App.test.tsx - Sample component test
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import App from '@/App';

describe('App', () => {
  it('renders the AI-Ley Builder message', () => {
    render(<App />);
    
    expect(screen.getByText('Hello AI-Ley Builder')).toBeInTheDocument();
    expect(
      screen.getByText('Development environment successfully initialized.')
    ).toBeInTheDocument();
  });

  it('has the correct main structure', () => {
    render(<App />);
    
    const main = screen.getByRole('main');
    expect(main).toHaveClass('container', 'mx-auto', 'p-4');
  });
});
```

```typescript
// tests/e2e/app.spec.ts - Sample e2e test
import { test, expect } from '@playwright/test';

test.describe('Application', () => {
  test('loads successfully and displays welcome message', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText('Hello AI-Ley Builder')).toBeVisible();
    await expect(
      page.getByText('Development environment successfully initialized.')
    ).toBeVisible();
  });

  test('has responsive layout', async ({ page }) => {
    await page.goto('/');
    
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
    await expect(main).toHaveClass(/container/);
  });
});
```

### Step 4: Integrate Testing with Quality Pipeline (15 minutes)

```json
// package.json - Add testing scripts
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:run && npm run test:e2e"
  }
}
```

Update lint-staged configuration:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run --passWithNoTests"
    ],
    "*.{js,jsx}": [
      "eslint --fix", 
      "prettier --write"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  }
}
```

## Quality Gates

**Vitest Configuration**:

- [ ] Unit tests run successfully with TypeScript support
- [ ] Coverage reporting functional with configured thresholds
- [ ] Test environment properly mocked and configured
- [ ] Custom utilities and matchers working correctly

**Playwright Configuration**:

- [ ] E2E tests execute across multiple browsers
- [ ] Development server integration working
- [ ] Screenshot and trace capture functional
- [ ] Test parallelization configured appropriately

**Integration Testing**:

- [ ] Tests integrated with pre-commit hooks
- [ ] Coverage thresholds enforced
- [ ] All sample tests passing
- [ ] CI/CD compatible test execution

**Developer Experience**:

- [ ] Test UI interfaces functional (Vitest UI, Playwright UI)
- [ ] TypeScript IntelliSense working in test files
- [ ] Fast test execution and watch mode
- [ ] Clear error reporting and debugging support

## Dependencies

**Prerequisite Tasks**: TASK-002 (Code Quality Tools)  
**Resource Dependencies**:

- React application with TypeScript configuration
- ESLint and Prettier setup for test file linting
- Git repository for pre-commit hook integration
- Modern browser support for Playwright execution

**Knowledge Dependencies**:

- Vitest configuration and testing patterns
- Playwright browser automation and page object patterns
- React Testing Library component testing approaches
- Coverage reporting and threshold configuration

## Validation Steps

1. **Install Dependencies**: Execute npm install commands for all testing frameworks
2. **Configuration Validation**: Verify Vitest and Playwright configurations
3. **Unit Test Execution**: Run sample component tests and validate results
4. **E2E Test Execution**: Execute browser tests across multiple environments
5. **Coverage Analysis**: Generate and review coverage reports
6. **Hook Integration**: Test pre-commit testing integration
7. **Performance Validation**: Verify test execution speed and efficiency

## Troubleshooting Guide

**Common Issues**:

- **Vitest/Vite Config Conflicts**: Use mergeConfig to properly combine configurations
- **jsdom Environment Issues**: Ensure proper polyfills for browser APIs
- **Playwright Browser Installation**: Run `npx playwright install` for browser binaries
- **TypeScript Resolution**: Configure proper test file path resolution

**Success Indicators**:

- All unit tests pass with good performance (< 1s for simple tests)
- E2E tests execute successfully across configured browsers
- Coverage reports generate with accurate metrics
- Pre-commit hooks include test validation without significant delay
- Test UI interfaces provide effective debugging capabilities

---

**Task Owner**: Technical Lead  
**Estimated Start**: After TASK-002 completion  
**Estimated Completion**: Same day as TASK-002  
**Validation**: All tests pass and testing pipeline integrated with quality gates