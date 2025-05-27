#!/bin/bash

# PayProof Setup Script

echo "🚀 Setting up PayProof..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env.local ]; then
    echo "🔧 Creating environment configuration..."
    cp .env.example .env.local
    echo "✅ Environment file created at .env.local"
    echo "📝 Please review and update the configuration if needed."
else
    echo "⚠️  .env.local already exists, skipping..."
fi

# Build and type check
echo "🔍 Running type checks..."
npm run type-check

if [ $? -eq 0 ]; then
    echo "✅ Type checks passed"
else
    echo "❌ Type checks failed. Please fix the errors before proceeding."
    exit 1
fi

echo ""
echo "🎉 PayProof setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "🌐 The application will be available at:"
echo "   http://localhost:3000"
echo ""
echo "📚 For more information, check out:"
echo "   - README.md"
echo "   - docs/README.md"
echo "   - CONTRIBUTING.md"
echo ""