# AI-LEY Visual Flow Editor

A powerful Node-RED-style visual workflow editor built with React, TypeScript, and React Flow. Create, validate, and execute complex data processing workflows through an intuitive drag-and-drop interface.

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Running the Application

#### Option 1: Using Launch Scripts (Recommended)

**On macOS/Linux:**
```bash
./launch.sh
```

**On Windows:**
```cmd
launch.bat
```

#### Option 2: Manual Commands

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## 📖 Features

### Core Functionality
- **Visual Workflow Editor**: Drag-and-drop interface for creating complex workflows
- **Real-time Execution**: Execute workflows with live monitoring and debugging
- **Data Validation**: Comprehensive validation system with custom rules
- **Workflow Persistence**: Save and load workflows with serialization support

### Advanced UI Features
- **Command Palette**: VS Code-style command palette (⌘⇧P)
- **Quick Actions**: Contextual action toolbar with keyboard shortcuts
- **Status Bar**: Real-time status display with workflow statistics
- **Keyboard Shortcuts**: Full keyboard navigation support

### Node Types
- **Input Nodes**: Data sources and user input prompts
- **Transform Nodes**: Data transformation with JavaScript expressions
- **Filter Nodes**: Conditional data filtering
- **Join Nodes**: Merge multiple data streams
- **Output Nodes**: Export data in various formats (JSON, CSV, XML)

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘⇧P` | Open Command Palette |
| `⌘⇧V` | Toggle Validation Panel |
| `⌘⇧E` | Toggle Execution Panel |
| `⌘S` | Save Workflow |
| `⌘K` | Validate Workflow |
| `⌘↵` | Execute Workflow |

## 🏗️ Project Structure

```
src/
├── features/
│   ├── canvas/          # Visual canvas and node system
│   ├── execution/       # Workflow execution engine
│   ├── validation/      # Data validation system
│   ├── workflow/        # Workflow management and persistence
│   ├── ui-advanced/     # Advanced UI components
│   └── ui-common/       # Common UI components
├── shared/              # Shared components and utilities
└── types/              # TypeScript type definitions
```

## 🛠️ Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run typecheck
```

## 🎯 Usage Guide

### Creating a Workflow
1. Drag nodes from the palette on the left
2. Connect nodes by dragging from output handles to input handles
3. Configure node properties in the inspector panel (right sidebar)
4. Validate your workflow using the validation panel
5. Execute the workflow to see results

### Node Configuration
- **Input Nodes**: Set data type, default values, and variable names
- **Transform Nodes**: Write JavaScript expressions for data transformation
- **Filter Nodes**: Define conditions for data filtering
- **Join Nodes**: Configure join types and keys for data merging
- **Output Nodes**: Choose output format and naming

### Execution Monitoring
- Open the execution panel to monitor workflow runs
- View real-time logs and node states
- Debug failed executions with detailed error information
- Export execution results in various formats

## 🔧 Configuration

The application uses Vite for development and building. Configuration files:
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `eslint.config.js` - ESLint configuration

## 📚 Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Flow** - Visual node editor
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Vitest** - Testing framework
- **ESLint + Prettier** - Code quality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is part of the AI-LEY system and follows the project's licensing terms.

---

**Happy workflow building! 🎉**
