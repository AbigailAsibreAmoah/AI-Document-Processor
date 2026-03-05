#!/bin/bash

echo "🐳 Starting AI Document Processor with Docker..."

# Build and start all services
echo "🏗️  Building and starting containers..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 15

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec app npx prisma db push

echo "✅ Application is running!"
echo "🌐 Visit http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  docker-compose logs app     # View application logs"
echo "  docker-compose logs db      # View database logs"
echo "  docker-compose down         # Stop all services"