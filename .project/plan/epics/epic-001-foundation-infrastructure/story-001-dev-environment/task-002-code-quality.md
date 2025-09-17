# Task 002: Configure Code Quality Tools

## Overview

**Task ID**: TASK-002  
**Story**: Development Environment Setup (STORY-001)  
**Priority**: High  
**Status**: Completed  
**Estimated Hours**: 2 hours  
**Actual Hours**: 1.8 hours  
**Assignee**: Technical Lead  
**Completed**: September 11, 2025

## Description

Configure comprehensive code quality tools including ESLint, Prettier, and Husky pre-commit hooks to enforce consistent code standards, formatting, and quality gates across the development team.

## Acceptance Criteria

- [x] ESLint configured with React, TypeScript, and recommended rules
- [x] Prettier integrated with consistent formatting standards
- [x] Husky pre-commit hooks prevent commits that fail linting or formatting
- [x] VS Code settings configured for optimal developer experience
- [x] All existing code passes linting and formatting checks
- [x] Integration with TypeScript strict mode validation

## Technical Context

**Files to Create/Modify**:

- `.eslintrc.js` - ESLint configuration with React/TypeScript rules
- `.prettierrc` - Prettier formatting configuration
- `.husky/pre-commit` - Pre-commit hook for quality gates
- `.vscode/settings.json` - VS Code workspace settings
- `package.json` - Scripts for linting, formatting, and pre-commit

**Technologies**:

- ESLint 9+ with TypeScript and React plugins
- Prettier 3+ for consistent code formatting
- Husky 8+ for Git hooks integration
- lint-staged for efficient pre-commit checking

**Patterns**:

- Airbnb React/TypeScript style guide as foundation
- Prettier overrides for formatting preferences
- Incremental linting with lint-staged
- Auto-fix where possible, strict enforcement otherwise

## Implementation Steps

### Step 1: Install and Configure ESLint (45 minutes)

```bash
# Install ESLint and plugins
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev eslint-plugin-react eslint-plugin-react-hooks
npm install --save-dev eslint-plugin-jsx-a11y eslint-plugin-import
```

```javascript
// .eslintrc.js - Comprehensive ESLint configuration
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
  ],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    
    // React specific rules
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // Using TypeScript for prop validation
    
    // General code quality rules
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};
```

### Step 2: Install and Configure Prettier (30 minutes)

```bash
# Install Prettier and ESLint integration
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```

```json
// .prettierrc - Prettier configuration
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "jsxSingleQuote": true
}
```

### Step 3: Configure Husky Pre-commit Hooks (30 minutes)

```bash
# Install Husky and lint-staged
npm install --save-dev husky lint-staged

# Initialize Husky
npx husky init
```

```bash
#!/usr/bin/env sh
# .husky/pre-commit - Pre-commit quality gates
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

```json
// package.json - Add lint-staged configuration
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
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

### Step 4: VS Code Integration (15 minutes)

```json
// .vscode/settings.json - Optimal VS Code configuration
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "files.associations": {
    "*.tsx": "typescriptreact",
    "*.ts": "typescript"
  }
}
```

## Quality Gates

**ESLint Configuration**:

- [ ] ESLint runs without errors on all source files
- [ ] TypeScript integration working with strict mode
- [ ] React and accessibility rules properly configured
- [ ] Import resolution working correctly

**Prettier Integration**:

- [ ] All source files formatted consistently
- [ ] Integration with ESLint (no conflicts)
- [ ] VS Code auto-formatting functional
- [ ] Configuration matches project standards

**Pre-commit Hooks**:

- [ ] Husky hooks prevent commits with linting errors
- [ ] lint-staged runs only on changed files
- [ ] Performance acceptable for typical commit size
- [ ] Hook installation successful on team machines

**VS Code Integration**:

- [ ] Auto-formatting on save functional
- [ ] ESLint errors highlighted in editor
- [ ] TypeScript IntelliSense working correctly
- [ ] Import suggestions and auto-imports functional

## Dependencies

**Prerequisite Tasks**: TASK-001 (React TypeScript App)  
**Resource Dependencies**:

- VS Code or compatible editor with ESLint/Prettier extensions
- Git repository with commit access for hook testing
- Node.js and npm for package installation

**Knowledge Dependencies**:

- ESLint rule configuration and customization
- Prettier formatting options and integration
- Git hooks and Husky setup procedures
- TypeScript compiler integration with linting

## Validation Steps

1. **Install Dependencies**: Execute npm install commands for all quality tools
2. **Configuration Setup**: Create and validate all configuration files
3. **Linting Validation**: Run ESLint on existing codebase and fix any issues
4. **Formatting Check**: Apply Prettier to all files and verify consistency
5. **Pre-commit Testing**: Make test commits to validate hook functionality
6. **VS Code Integration**: Test auto-formatting and error highlighting

## Troubleshooting Guide

**Common Issues**:

- **ESLint/Prettier Conflicts**: Use eslint-config-prettier to disable conflicting rules
- **TypeScript Path Resolution**: Configure eslint-import-resolver-typescript
- **Husky Hooks Not Running**: Check Git hooks permissions and Husky initialization
- **VS Code Extension Conflicts**: Verify extension compatibility and settings

**Success Indicators**:

- All source files pass ESLint validation without warnings
- Prettier formats code consistently across the project
- Pre-commit hooks successfully block commits with quality issues
- VS Code provides real-time linting feedback and auto-formatting

---

**Task Owner**: Technical Lead  
**Estimated Start**: After TASK-001 completion  
**Estimated Completion**: Same day as TASK-001  
**Validation**: All quality gates pass and pre-commit hooks functional