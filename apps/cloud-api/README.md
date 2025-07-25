# HomeHost Cloud API

## Overview

The HomeHost Cloud API is the backend service for the HomeHost gaming server management platform. It provides RESTful APIs for community management, server orchestration, user authentication, and cross-server player management.

## Architecture

- **Framework**: ASP.NET Core 8.0
- **Database**: SQL Server 2022
- **Caching**: Redis
- **Authentication**: JWT with refresh tokens
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Docker & Docker Compose
- .NET 8 SDK (for local development)
- SQL Server Management Studio (optional)

### 1. Clone and Setup

```bash
cd apps/cloud-api
chmod +x setup-dev.sh
./setup-dev.sh
```

This will:
- Create environment configuration
- Start all services with Docker Compose
- Run database migrations
- Verify service health

### 2. Access Services

- **API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/swagger
- **Health Check**: http://localhost:5000/health
- **Database**: localhost:1433 (sa/HomeHost123!)
- **Redis**: localhost:6379

## Development

### Local Development (without Docker)

1. **Install .NET 8 SDK**
```bash
# Windows
winget install Microsoft.DotNet.SDK.8

# macOS
brew install dotnet

# Linux (Ubuntu)
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update && sudo apt-get install -y dotnet-sdk-8.0
```

2. **Setup Database**
```bash
# Start only the database
docker-compose up -d homehost-db
```

3. **Configure Connection**
```bash
# Update appsettings.Development.json with local connection string
"DefaultConnection": "Server=localhost,1433;Database=HomeHostDev;User Id=sa;Password=HomeHost123!;TrustServerCertificate=true;"
```

4. **Run API**
```bash
dotnet restore
dotnet run
```

### Project Structure

```
cloud-api/
├── Controllers/           # API Controllers
│   ├── CommunityController.cs
│   ├── AuthController.cs
│   └── ...
├── Services/             # Business Logic
│   ├── CommunityService.cs
│   ├── ICommunityService.cs
│   └── ...
├── Models/               # Data Models
├── Data/                 # Entity Framework Context
├── Migrations/           # Database Migrations
├── Configuration/        # Startup Configuration
├── Middleware/           # Custom Middleware
└── Hubs/                # SignalR Hubs
```

## API Endpoints

### Community Management

```http
GET    /api/community                    # Get all communities
GET    /api/community/{id}               # Get community by ID
POST   /api/community                    # Create community
PUT    /api/community/{id}               # Update community
DELETE /api/community/{id}               # Delete community

GET    /api/community/trending           # Get trending communities
GET    /api/community/recommended        # Get recommended communities
GET    /api/community/search             # Search communities

POST   /api/community/{id}/join          # Join community
POST   /api/community/{id}/leave         # Leave community
GET    /api/community/{id}/members       # Get community members
```

### Server Management

```http
GET    /api/servers                      # Get user's servers
GET    /api/servers/{id}                 # Get server details
POST   /api/servers                      # Create server
PUT    /api/servers/{id}                 # Update server
DELETE /api/servers/{id}                 # Delete server

POST   /api/servers/{id}/start           # Start server
POST   /api/servers/{id}/stop            # Stop server
POST   /api/servers/{id}/restart         # Restart server
GET    /api/servers/{id}/status          # Get server status
```

### Authentication

```http
POST   /api/auth/login                   # User login
POST   /api/auth/refresh                 # Refresh token
POST   /api/auth/logout                  # User logout
GET    /api/auth/profile                 # Get user profile
PUT    /api/auth/profile                 # Update user profile
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
CONNECTION_STRING=Server=localhost,1433;Database=HomeHostDev;User Id=sa;Password=HomeHost123!;TrustServerCertificate=true;

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-signing-key-32-chars
JWT_ISSUER=homehost-api
JWT_AUDIENCE=homehost-client

# External Services
STEAM_API_KEY=your-steam-api-key
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# Redis
REDIS_CONNECTION_STRING=localhost:6379
```

### Application Settings

Configuration is managed through `appsettings.json` and `appsettings.Development.json`:

- **Database**: Entity Framework Core with SQL Server
- **Authentication**: JWT with automatic refresh
- **CORS**: Configured for local development
- **Swagger**: Enabled in development
- **Logging**: Structured logging with Serilog

## Database Schema

### Core Tables

- **Users**: User accounts and authentication
- **Communities**: Gaming communities
- **GameServers**: Game server instances
- **CommunityMembers**: Community membership
- **CommunityPlayerReputation**: Cross-server player tracking
- **PlayerActions**: Audit log for player actions
- **CrossServerBans**: Community-wide bans

### Epic 2 Features

The database schema includes full support for Epic 2 Community features:

- **Community Management**: Full CRUD operations
- **Cross-Server Player Management**: Reputation system
- **Social Discovery**: Analytics and recommendations
- **Member Roles**: Hierarchical permission system
- **Invitation System**: Email and Steam ID invitations

## Testing

### Unit Tests

```bash
dotnet test
```

### Integration Tests

```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
dotnet test --filter "Category=Integration"
```

### API Testing

Use the included Swagger UI or tools like Postman:

1. **Get Auth Token**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "alex@homehost.com",
  "password": "password123"
}
```

2. **Use Token**:
```http
GET /api/community
Authorization: Bearer {your-jwt-token}
```

## Deployment

### Docker Production

```bash
# Build production image
docker build -t homehost-api:latest .

# Run with production compose
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

```bash
# Build for production
dotnet publish -c Release -o ./publish

# Copy to server and run
dotnet HomeHost.CloudApi.dll
```

## Monitoring

### Health Checks

- **Endpoint**: `/health`
- **Database**: Connection and query test
- **Redis**: Connection test
- **External APIs**: Steam API connectivity

### Logging

- **Console**: Structured JSON logging
- **File**: Rotating log files in `./logs/`
- **Application Insights**: (Production only)

### Metrics

- **Endpoint**: `/metrics` (Prometheus format)
- **Custom Metrics**: Request counts, response times
- **Business Metrics**: Active communities, server count

## Development Guidelines

### Code Standards

- Follow C# coding conventions
- Use dependency injection
- Implement proper error handling
- Write unit tests for business logic
- Document public APIs

### Database Changes

1. Create Entity Framework migration:
```bash
dotnet ef migrations add MigrationName
```

2. Update database:
```bash
dotnet ef database update
```

3. Create SQL script for production:
```bash
dotnet ef migrations script
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify SQL Server is running
   - Check connection string
   - Ensure firewall allows connection

2. **JWT Authentication Failed**
   - Check JWT secret configuration
   - Verify token expiration
   - Ensure consistent issuer/audience

3. **Redis Connection Failed**
   - Verify Redis is running
   - Check Redis connection string
   - Test Redis connectivity

### Debugging

```bash
# View logs
docker-compose logs -f homehost-api

# Connect to database
docker-compose exec homehost-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P HomeHost123!

# Access Redis CLI
docker-compose exec homehost-redis redis-cli
```

## Contributing

1. Follow the established code style
2. Write tests for new features
3. Update documentation
4. Submit pull requests with clear descriptions

## License

Copyright © 2025 HomeHost. All rights reserved.