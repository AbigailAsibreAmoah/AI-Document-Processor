#!/bin/bash

echo "🗄️  Running database migrations..."

# Check if Prisma is available
if ! command -v npx prisma &> /dev/null; then
    echo "❌ Prisma CLI not found. Please install dependencies first."
    exit 1
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Apply migrations
echo "📊 Applying database migrations..."
npx prisma db push

# Optional: Seed database
if [ -f "prisma/seed.ts" ]; then
    echo "🌱 Seeding database..."
    npx prisma db seed
fi

echo "✅ Database migrations complete!"