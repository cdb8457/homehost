#!/bin/bash

# HomeHost Cloud API - Setup Validation Script

set -e

echo "🔍 Validating HomeHost Cloud API setup..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check for required files
echo ""
echo "📁 Checking project structure..."

files_to_check=(
    "cloud-api.csproj"
    "Program.cs"
    "Dockerfile"
    "docker-compose.yml"
    "appsettings.Development.json"
    ".env.example"
    "Controllers/CommunityController.cs"
    "Services/ICommunityService.cs"
    "Services/CommunityService.cs"
    "Migrations/001_InitialCreate_SqlServer.sql"
    "Tests/CommunityControllerTests.cs"
    "README.md"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "Found $file"
    else
        print_status 1 "Missing $file"
    fi
done

echo ""
echo "🔧 Checking configuration files..."

# Check .env file
if [ -f ".env" ]; then
    print_status 0 ".env file exists"
else
    print_warning ".env file not found - copy from .env.example"
fi

# Check appsettings
if [ -f "appsettings.Development.json" ]; then
    print_status 0 "Development settings configured"
else
    print_status 1 "Missing development settings"
fi

echo ""
echo "🔌 Checking external dependencies..."

# Check Docker
if command -v docker >/dev/null 2>&1; then
    if docker info >/dev/null 2>&1; then
        print_status 0 "Docker is running"
        DOCKER_VERSION=$(docker --version)
        print_info "Docker version: $DOCKER_VERSION"
    else
        print_status 1 "Docker is installed but not running"
    fi
else
    print_status 1 "Docker not found"
fi

# Check Docker Compose
if command -v docker-compose >/dev/null 2>&1; then
    print_status 0 "Docker Compose available"
    COMPOSE_VERSION=$(docker-compose --version)
    print_info "Compose version: $COMPOSE_VERSION"
else
    print_status 1 "Docker Compose not found"
fi

# Check .NET SDK
if command -v dotnet >/dev/null 2>&1; then
    print_status 0 ".NET SDK available"
    DOTNET_VERSION=$(dotnet --version)
    print_info ".NET version: $DOTNET_VERSION"
    
    # Check if it's .NET 8
    if [[ $DOTNET_VERSION == 8.* ]]; then
        print_status 0 ".NET 8 SDK detected"
    else
        print_warning ".NET 8 SDK recommended (found $DOTNET_VERSION)"
    fi
else
    print_status 1 ".NET SDK not found"
fi

echo ""
echo "📊 Validating database schema..."

# Check migration file syntax
if [ -f "Migrations/001_InitialCreate_SqlServer.sql" ]; then
    # Basic SQL syntax check
    if grep -q "CREATE TABLE" "Migrations/001_InitialCreate_SqlServer.sql"; then
        print_status 0 "Database migration syntax appears valid"
    else
        print_status 1 "Database migration file seems invalid"
    fi
    
    # Check for Epic 2 tables
    epic2_tables=("Communities" "CommunityMembers" "CommunityPlayerReputation" "PlayerActions" "CrossServerBans")
    for table in "${epic2_tables[@]}"; do
        if grep -q "CREATE TABLE.*$table" "Migrations/001_InitialCreate_SqlServer.sql"; then
            print_status 0 "Epic 2 table '$table' defined"
        else
            print_status 1 "Epic 2 table '$table' missing"
        fi
    done
else
    print_status 1 "Database migration file not found"
fi

echo ""
echo "🏗️  Validating API structure..."

# Check controllers
controllers=("CommunityController" "AuthController" "ServersController")
for controller in "${controllers[@]}"; do
    if [ -f "Controllers/${controller}.cs" ]; then
        print_status 0 "Controller '$controller' exists"
    else
        print_status 1 "Controller '$controller' missing"
    fi
done

# Check services
services=("CommunityService" "AuthService" "GameLibraryService")
for service in "${services[@]}"; do
    if [ -f "Services/${service}.cs" ]; then
        print_status 0 "Service '$service' exists"
    else
        print_status 1 "Service '$service' missing"
    fi
done

echo ""
echo "🧪 Checking test configuration..."

if [ -f "Tests/HomeHost.CloudApi.Tests.csproj" ]; then
    print_status 0 "Test project configured"
else
    print_status 1 "Test project missing"
fi

if [ -f "Tests/CommunityControllerTests.cs" ]; then
    print_status 0 "Community controller tests exist"
    
    # Check test count
    test_count=$(grep -c "\[Fact\]" "Tests/CommunityControllerTests.cs" || echo "0")
    if [ $test_count -gt 0 ]; then
        print_info "Found $test_count test methods"
    fi
else
    print_status 1 "Community controller tests missing"
fi

echo ""
echo "🚀 Checking deployment readiness..."

# Check Dockerfile
if [ -f "Dockerfile" ]; then
    if grep -q "FROM mcr.microsoft.com/dotnet" "Dockerfile"; then
        print_status 0 "Dockerfile uses official .NET images"
    else
        print_status 1 "Dockerfile base image issue"
    fi
    
    if grep -q "HEALTHCHECK" "Dockerfile"; then
        print_status 0 "Dockerfile includes health check"
    else
        print_warning "Dockerfile missing health check"
    fi
else
    print_status 1 "Dockerfile not found"
fi

# Check Docker Compose
if [ -f "docker-compose.yml" ]; then
    if grep -q "homehost-api:" "docker-compose.yml"; then
        print_status 0 "Docker Compose API service configured"
    else
        print_status 1 "Docker Compose API service missing"
    fi
    
    if grep -q "homehost-db:" "docker-compose.yml"; then
        print_status 0 "Docker Compose database service configured"
    else
        print_status 1 "Docker Compose database service missing"
    fi
    
    if grep -q "homehost-redis:" "docker-compose.yml"; then
        print_status 0 "Docker Compose Redis service configured"
    else
        print_warning "Docker Compose Redis service missing"
    fi
else
    print_status 1 "docker-compose.yml not found"
fi

echo ""
echo "📋 Summary and Recommendations..."

# Count issues
total_checks=0
passed_checks=0

# This would need actual tracking in a real implementation
# For now, provide general guidance

echo ""
print_info "=== SETUP STATUS ==="
echo ""

if [ -f "docker-compose.yml" ] && [ -f "Dockerfile" ]; then
    print_status 0 "Container setup: Ready for deployment"
else
    print_status 1 "Container setup: Issues found"
fi

if [ -f "Migrations/001_InitialCreate_SqlServer.sql" ]; then
    print_status 0 "Database setup: Migration ready"
else
    print_status 1 "Database setup: Migration missing"
fi

if [ -f "Controllers/CommunityController.cs" ] && [ -f "Services/CommunityService.cs" ]; then
    print_status 0 "Epic 2 features: API layer ready"
else
    print_status 1 "Epic 2 features: API layer incomplete"
fi

if [ -f "Tests/CommunityControllerTests.cs" ]; then
    print_status 0 "Testing: Basic test suite ready"
else
    print_status 1 "Testing: Test suite missing"
fi

echo ""
print_info "=== NEXT STEPS ==="
echo ""

if ! command -v docker >/dev/null 2>&1; then
    echo "1. Install Docker Desktop"
fi

if [ ! -f ".env" ]; then
    echo "2. Copy .env.example to .env and configure"
fi

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    echo "3. Run: ./setup-dev.sh"
    echo "4. Test API: curl http://localhost:5000/health"
    echo "5. View docs: http://localhost:5000/swagger"
else
    echo "3. Start Docker Desktop"
    echo "4. Run setup-dev.sh when Docker is ready"
fi

echo ""
print_info "=== TESTING COMMANDS ==="
echo ""
echo "• Run all tests:        dotnet test"
echo "• API integration:      dotnet test --filter Category=Integration"
echo "• Database connection:  docker-compose exec homehost-db sqlcmd -S localhost -U sa"
echo "• View API logs:        docker-compose logs -f homehost-api"
echo "• Health check:         curl http://localhost:5000/health"

echo ""
echo "🎉 Validation complete! Check items marked with ❌ before proceeding."