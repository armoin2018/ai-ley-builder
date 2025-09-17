#!/bin/bash

# AI-LEY Visual Flow Editor Launch Script
# This script launches the visual flow editor in development mode

echo "🚀 Starting AI-LEY Visual Flow Editor..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the visual-editor directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to install dependencies."
        exit 1
    fi
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js version 18 or higher is recommended. Current version: $(node --version)"
fi

echo "✅ Environment check passed"
echo "🔧 Starting development server..."
echo ""
echo "🌐 The visual editor will open in your browser at: http://localhost:5173"
echo "📝 Press Ctrl+C to stop the development server"
echo ""

# Start the development server
npm run dev

echo ""
echo "👋 Thanks for using AI-LEY Visual Flow Editor!"