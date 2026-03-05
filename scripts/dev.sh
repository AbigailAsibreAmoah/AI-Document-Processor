#!/bin/bash

echo "🚀 Starting AI Document Processor development environment..."

# Start database services
echo "🐘 Starting database services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "Please update .env file with your configuration"
fi

# Generate Prisma client if needed
if [ ! -d "node_modules/.prisma" ]; then
    echo "🔧 Generating Prisma client..."
    npx prisma generate
fi

# Start development server
echo "🌐 Starting Next.js development server..."
npm run dev