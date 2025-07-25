#!/bin/bash

# HomeHost Cloud API - Development Environment Setup Script

set -e

echo "🚀 Setting up HomeHost Cloud API development environment..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose >/dev/null 2>&1; then
    echo "❌ docker-compose not found. Please install Docker Compose."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
fi

# Create logs directory
mkdir -p logs

echo "🐳 Starting services with Docker Compose..."

# Pull the latest images
docker-compose pull

# Build and start services
docker-compose up -d --build

echo "⏳ Waiting for SQL Server to be ready..."

# Wait for SQL Server to be ready
until docker-compose exec -T homehost-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P HomeHost123! -Q "SELECT 1" >/dev/null 2>&1; do
    echo "⏳ Waiting for SQL Server..."
    sleep 5
done

echo "✅ SQL Server is ready!"

echo "📊 Running database migrations..."

# Run the database migration
docker-compose exec -T homehost-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P HomeHost123! -i /scripts/001_InitialCreate_SqlServer.sql

echo "✅ Database migrations completed!"

echo "🔍 Checking service health..."

# Wait for API to be healthy
echo "⏳ Waiting for API to be ready..."
for i in {1..30}; do
    if curl -f -s http://localhost:5000/health >/dev/null 2>&1; then
        echo "✅ API is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ API failed to start. Check logs with: docker-compose logs homehost-api"
        exit 1
    fi
    sleep 2
done

echo ""
echo "🎉 HomeHost Cloud API development environment is ready!"
echo ""
echo "📱 Services running:"
echo "  • API:        http://localhost:5000"
echo "  • API (HTTPS): https://localhost:5001"
echo "  • Database:   localhost:1433"
echo "  • Redis:      localhost:6379"
echo ""
echo "🔧 Useful commands:"
echo "  • View logs:     docker-compose logs -f"
echo "  • Stop services: docker-compose down"
echo "  • Restart API:   docker-compose restart homehost-api"
echo "  • Database CLI:  docker-compose exec homehost-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P HomeHost123!"
echo ""
echo "📚 API Documentation: http://localhost:5000/swagger"
echo "🔍 Health Check:      http://localhost:5000/health"
echo ""
echo "Happy coding! 🚀"