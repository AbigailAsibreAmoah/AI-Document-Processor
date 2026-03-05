#!/bin/bash

echo "🚀 Setting up AI Document Processor..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your configuration"
fi

# Start database
echo "🐘 Starting PostgreSQL database..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma db push

# Create uploads directory
mkdir -p uploads

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with your OpenAI API key"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000"