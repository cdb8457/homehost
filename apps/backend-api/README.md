# HomeHost Backend API

A comprehensive gaming server management platform backend API built with Node.js, Express, TypeScript, and PostgreSQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Real-time Communication**: WebSocket support for live data
- **Server Management**: Complete CRUD operations for gaming servers
- **Community Features**: Social networking and community management
- **Plugin Marketplace**: Plugin distribution and installation system
- **Monitoring & Alerts**: Real-time server metrics and alerting
- **Configuration Management**: Flexible server configuration system
- **Comprehensive API**: RESTful endpoints for all platform features

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL 13 or higher
- Redis (optional, for caching)
- TypeScript knowledge

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd apps/backend-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/homehost
   
   # JWT
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   
   # Security
   BCRYPT_ROUNDS=12
   
   # Server
   PORT=3001
   NODE_ENV=development
   
   # CORS
   ALLOWED_ORIGINS=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed the database (optional)
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User**: User accounts and authentication
- **Server**: Gaming server instances
- **Community**: Server communities and social features
- **Plugin**: Plugin marketplace and distribution
- **Alert**: Monitoring and alerting system
- **Configuration**: Server configuration management

## 🔐 Authentication

The API uses JWT-based authentication with the following endpoints:

### Register
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123!"
}
```

### Access Protected Endpoints
```bash
GET /api/v1/users/profile
Authorization: Bearer your-jwt-token
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/change-password` - Change password

### Users
- `GET /api/v1/users/profile/:userId?` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/preferences` - Get user preferences
- `PUT /api/v1/users/preferences` - Update user preferences
- `GET /api/v1/users/notifications` - Get user notifications
- `GET /api/v1/users/search` - Search users

### Servers
- `GET /api/v1/servers` - Get user servers
- `POST /api/v1/servers` - Create new server
- `GET /api/v1/servers/:serverId` - Get server details
- `PUT /api/v1/servers/:serverId` - Update server
- `DELETE /api/v1/servers/:serverId` - Delete server
- `GET /api/v1/servers/:serverId/members` - Get server members
- `POST /api/v1/servers/:serverId/members` - Add server member
- `PATCH /api/v1/servers/:serverId/members/:userId` - Update member role
- `DELETE /api/v1/servers/:serverId/members/:userId` - Remove member

### Communities
- `GET /api/v1/communities` - Get public communities
- `POST /api/v1/communities` - Create community
- `GET /api/v1/communities/:communityId` - Get community details
- `PUT /api/v1/communities/:communityId` - Update community
- `POST /api/v1/communities/:communityId/join` - Join community
- `POST /api/v1/communities/:communityId/leave` - Leave community
- `GET /api/v1/communities/:communityId/posts` - Get community posts
- `POST /api/v1/communities/:communityId/posts` - Create post
- `GET /api/v1/communities/:communityId/events` - Get community events

### Plugins
- `GET /api/v1/plugins` - Get plugins marketplace
- `GET /api/v1/plugins/:pluginId` - Get plugin details
- `POST /api/v1/plugins` - Create/upload plugin
- `PUT /api/v1/plugins/:pluginId` - Update plugin
- `POST /api/v1/plugins/:pluginId/install` - Install plugin on server
- `GET /api/v1/plugins/server/:serverId` - Get server plugins
- `PATCH /api/v1/plugins/:pluginId/config` - Update plugin config
- `DELETE /api/v1/plugins/:pluginId/uninstall` - Uninstall plugin
- `POST /api/v1/plugins/:pluginId/reviews` - Create plugin review

### Monitoring
- `GET /api/v1/monitoring/servers/:serverId/metrics` - Get server metrics
- `GET /api/v1/monitoring/servers/:serverId/metrics/summary` - Get metrics summary
- `POST /api/v1/monitoring/servers/:serverId/metrics` - Create metric
- `GET /api/v1/monitoring/servers/:serverId/alerts` - Get server alerts
- `POST /api/v1/monitoring/servers/:serverId/alerts` - Create alert
- `PATCH /api/v1/monitoring/alerts/:alertId` - Update alert status
- `GET /api/v1/monitoring/servers/:serverId/alerts/stats` - Get alert statistics

### Configurations
- `GET /api/v1/configurations/servers/:serverId` - Get server configurations
- `POST /api/v1/configurations/servers/:serverId` - Create configuration
- `GET /api/v1/configurations/servers/:serverId/:configId` - Get configuration
- `PUT /api/v1/configurations/servers/:serverId/:configId` - Update configuration
- `DELETE /api/v1/configurations/servers/:serverId/:configId` - Delete configuration
- `GET /api/v1/configurations/templates` - Get configuration templates
- `POST /api/v1/configurations/servers/:serverId/apply-template` - Apply template
- `PATCH /api/v1/configurations/servers/:serverId/bulk-update` - Bulk update

### Alerts
- `GET /api/v1/alerts` - Get all alerts (admin only)
- `GET /api/v1/alerts/:alertId` - Get alert details
- `GET /api/v1/alerts/stats/overview` - Get alert statistics
- `PATCH /api/v1/alerts/bulk-update` - Bulk update alerts

## 🔄 WebSocket Events

The API supports real-time communication through WebSocket connections:

### Server Events
- `server-metrics` - Real-time server metrics
- `server-status` - Server online/offline status
- `server-alerts` - New server alerts

### Community Events
- `community-post` - New community posts
- `community-member` - Member join/leave events
- `community-event` - Community events

### Notification Events
- `notification` - User notifications
- `alert` - Critical alerts

### Usage
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// Authenticate
socket.emit('authenticate', { token: 'your-jwt-token' });

// Listen for server metrics
socket.on('server-metrics', (data) => {
  console.log('Server metrics:', data);
});

// Join server room
socket.emit('join-server', { serverId: 'server-id' });
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with test data

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: Configurable rate limits per endpoint
- **CORS Protection**: Configurable CORS origins
- **Security Headers**: Helmet.js for security headers
- **Input Validation**: express-validator for request validation
- **SQL Injection Protection**: Prisma ORM with parameterized queries

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   export NODE_ENV=production
   export DATABASE_URL=your-production-database-url
   export JWT_SECRET=your-production-secret
   ```

3. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

4. **Start the production server**
   ```bash
   npm start
   ```

## 📊 Monitoring & Logging

The API includes comprehensive logging with Winston:

- **Error Logging**: Automatic error tracking and logging
- **Security Logging**: Authentication and authorization events
- **User Activity Logging**: User actions and system events
- **Performance Monitoring**: Request timing and metrics

## 🔧 Configuration

Environment variables for configuration:

```env
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key

# Optional
PORT=3001
NODE_ENV=development
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
ALLOWED_ORIGINS=http://localhost:3000
ENABLE_REQUEST_LOGGING=true
ENABLE_RATE_LIMITING=true
WS_CORS_ORIGIN=http://localhost:3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test files for usage examples

## 🗂️ Project Structure

```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── routes/          # API route handlers
├── services/        # Business logic services
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
└── index.ts         # Application entry point

tests/
├── helpers/         # Test utilities
├── auth.test.ts     # Authentication tests
├── servers.test.ts  # Server tests
└── setup.ts         # Test setup

prisma/
├── schema.prisma    # Database schema
├── migrations/      # Database migrations
└── seed.ts          # Database seeding
```

This comprehensive backend API provides a solid foundation for building a gaming server management platform with all the essential features for user management, server administration, community features, and real-time monitoring.