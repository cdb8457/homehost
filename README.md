# HomeHost - Revolutionary Gaming Hosting Platform

HomeHost transforms complex server management into Netflix-like experiences, serving both casual hosts and professional community builders through a hybrid local-cloud architecture.

## 🏗️ Project Architecture

```
homehost/
├── apps/
│   ├── web-dashboard/          # Next.js React web application
│   └── cloud-api/              # ASP.NET Core Web API
├── packages/
│   ├── shared-types/           # Common TypeScript interfaces
│   ├── plugin-sdk/             # Plugin development SDK (future)
│   └── config/                 # Shared configuration (future)
├── infrastructure/             # Infrastructure as Code (future)
├── docs/                       # Comprehensive documentation
└── tests/                      # Integration and E2E tests (future)
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or later
- **.NET 8** SDK
- **PostgreSQL** 15.x (for cloud database)
- **Redis** 7.x (for caching and real-time features)

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd homehost
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Build shared packages:**
   ```bash
   npm run shared-types:build
   ```

4. **Start development servers:**
   ```bash
   # Start all services in parallel
   npm run dev

   # Or start individually:
   npm run web-dashboard:dev    # Frontend at http://localhost:3000
   npm run cloud-api:dev        # API at https://localhost:7001
   ```

## 📋 Story 1.1: Core Platform Setup - COMPLETED ✅

### ✅ Acceptance Criteria Status

1. **✅ Monorepo structure** - Nx workspace with clear app/package separation
2. **✅ Development environment** - Automated build, test, and lint processes
3. **✅ CI/CD pipeline** - GitHub Actions workflow for automated testing and deployment
4. **✅ Database architecture** - PostgreSQL schema with migrations and EF Core context
5. **✅ Basic authentication** - JWT + Steam OAuth implementation with session management
6. **✅ Health check endpoints** - `/health`, `/health/ready`, `/health/live` endpoints
7. **✅ Documentation structure** - Comprehensive docs with sharded PRD and architecture

### 🎯 Key Accomplishments

**Monorepo Infrastructure:**
- ✅ Nx workspace configuration with proper project dependencies
- ✅ Web dashboard (Next.js + React + TypeScript)
- ✅ Cloud API (ASP.NET Core + Entity Framework + SignalR)
- ✅ Shared types package for consistent data models
- ✅ Environment configuration templates

**Development Tooling:**
- ✅ GitHub Actions CI/CD pipeline with security scanning
- ✅ Health check endpoints for monitoring
- ✅ Structured logging with Serilog
- ✅ CORS configuration for web dashboard
- ✅ Development scripts for all applications

**Database & API Foundation:**
- ✅ PostgreSQL database schema with complete migration script
- ✅ Entity Framework context with all domain models
- ✅ JWT authentication with Steam OAuth integration
- ✅ Session management with refresh tokens
- ✅ Authentication controllers and API endpoints
- ✅ Redis caching configuration
- ✅ SignalR real-time communication setup
- ✅ API response and request type definitions

## 🎮 Current Features

### Web Dashboard
- **Game Library**: Netflix-style browsing with 5 supported games
- **Community Browser**: Social-driven server discovery
- **Plugin Marketplace**: App store-style plugin interface
- **Server Management**: Real-time server monitoring console
- **Dual UX**: Progressive disclosure for Alex (casual) vs Sam (pro) users

### Cloud API (Complete Foundation)
- **Authentication**: Complete JWT + Steam OAuth with session management
- **Database**: PostgreSQL with full schema and Entity Framework migrations
- **Health Checks**: Comprehensive service monitoring endpoints
- **Real-time Sync**: SignalR hub for Windows app synchronization
- **Caching**: Redis integration for performance
- **Security**: Token validation, refresh, and revocation
- **API Endpoints**: Auth controllers with proper error handling

## 🗂️ Documentation

- **[Project Brief](./docs/project-brief.md)** - Strategic vision and market analysis
- **[PRD Sections](./docs/prd/)** - Product requirements broken down by epic
- **[Architecture](./docs/architecture/)** - Technical specifications and patterns
- **[Frontend Spec](./docs/front-end-spec.md)** - UI/UX design specifications

## 🔧 Available Scripts

```bash
# Development
npm run dev                     # Start all services in parallel
npm run web-dashboard:dev       # Frontend only
npm run cloud-api:dev          # Backend only

# Building
npm run build                   # Build all applications
npm run web-dashboard:build     # Frontend only
npm run cloud-api:build        # Backend only
npm run shared-types:build      # Shared types package

# Testing & Quality
npm run test                    # Run all tests
npm run lint                    # Run all linting
```

## 🌐 Deployment

### Development
- **Frontend**: http://localhost:3000
- **API**: https://localhost:7001
- **Health Check**: https://localhost:7001/health

### Production (Planned)
- **Frontend**: https://dashboard.homehost.io
- **API**: https://api.homehost.io
- **Azure Infrastructure**: Auto-scaling with global CDN

## 📋 Story 1.2: Game Library Infrastructure - COMPLETED ✅

### ✅ Acceptance Criteria Status

1. **✅ Netflix-Style Game Grid** - Rich metadata display with community stats and difficulty ratings
2. **✅ Rich Game Metadata** - Comprehensive game information with real-time community data  
3. **✅ One-Click Deployment** - Full deployment API with progress tracking and status monitoring
4. **✅ Comprehensive Game Information** - System requirements, features, and compatibility details
5. **✅ Search and Filtering** - Advanced search with genre, difficulty, and player count filters
6. **✅ Mobile Responsive** - Responsive design with mobile-optimized layouts

### 🎯 Key Accomplishments

**Game Library APIs:**
- ✅ Complete Games Controller with CRUD operations
- ✅ Advanced search and filtering with pagination
- ✅ Real-time community server counting
- ✅ Game popularity and trending calculations
- ✅ Rich metadata including system requirements and features

**One-Click Deployment System:**
- ✅ Full deployment API with progress tracking
- ✅ Server management endpoints (start/stop/delete)
- ✅ Real-time status monitoring
- ✅ Connection information generation
- ✅ User-specific server ownership validation

**Frontend Integration:**
- ✅ Connected Game Library to real backend APIs
- ✅ Real-time deployment progress tracking
- ✅ Enhanced HTTP client with query parameter support
- ✅ Loading states and error handling
- ✅ Netflix-style responsive grid layout

**Database Foundation:**
- ✅ Complete game database schema with 5 supported games
- ✅ Seed data for Valheim, MotorTown, CS:GO 2, Rust, 7 Days to Die
- ✅ Rich metadata including difficulty ratings and community stats
- ✅ System requirements and configuration options

## 📋 Story 1.3: Steam Integration System - COMPLETED ✅

### ✅ Acceptance Criteria Status

1. **✅ Steam ID input field validates and fetches game metadata** - Complete Steam Web API integration
2. **✅ SteamCMD integration automatically downloads and configures dedicated server files** - Full automation 
3. **✅ System detects supported dedicated server games** - Compatibility warnings and validation
4. **✅ Automatic updates keep server files synchronized** - Update checking and management
5. **✅ Steam Workshop integration enables mod browsing** - Full Workshop API integration
6. **✅ Authentication with Steam credentials** - Steam OAuth and ticket validation

### 🎯 Key Accomplishments

**Steam Web API Integration:**
- ✅ Complete Steam app information retrieval and validation
- ✅ User profile fetching and Steam ID validation
- ✅ Game search and discovery functionality
- ✅ Dedicated server detection and compatibility checking
- ✅ Platform support validation (Windows/Linux)

**SteamCMD Automation:**
- ✅ Automated game server file downloads via SteamCMD
- ✅ Update management and file synchronization
- ✅ Progress tracking and error handling
- ✅ Configurable installation paths
- ✅ Workshop item downloading capabilities

**Steam Authentication System:**
- ✅ Steam ticket validation with proper security
- ✅ User profile integration and avatar support
- ✅ Session management with Steam credentials
- ✅ Server ownership verification

**Steam Workshop Integration:**
- ✅ Workshop item browsing and search
- ✅ Mod metadata and popularity tracking
- ✅ Automatic mod downloads via SteamCMD
- ✅ Tag-based filtering and categorization

**Frontend Steam Discovery:**
- ✅ Steam Game Discovery component with real-time validation
- ✅ App search with autocomplete and metadata display
- ✅ Compatibility warnings and deployment guidance
- ✅ One-click server file downloads
- ✅ Responsive design with loading states

**Database Integration:**
- ✅ Steam user data integration in existing auth system
- ✅ Game metadata storage with Steam app IDs
- ✅ Server configuration with Steam-specific settings

## 📋 Story 1.4: Custom Game Support - COMPLETED ✅

### ✅ Acceptance Criteria Status

1. **✅ File Upload Interface** - Secure .exe file upload with validation for executable formats
2. **✅ Configuration Wizard** - Interactive wizard guiding users through port settings and launch parameters
3. **✅ Template System** - Save and share custom game configurations with community
4. **✅ Community-Contributed Profiles** - Easy setup for unsupported games through community sharing
5. **✅ Automatic Detection** - Intelligent pattern recognition for common server architectures
6. **✅ Manual Override Options** - Full expert control for advanced users and custom configurations

### 🎯 Key Accomplishments

**File Upload & Validation System:**
- ✅ Secure multi-format executable upload (.exe, .jar, .sh, .py)
- ✅ Advanced file validation with signature checking
- ✅ Malicious file detection and security validation
- ✅ File size limits and format restrictions
- ✅ Hash generation for file integrity

**Advanced Pattern Detection:**
- ✅ Game engine detection (Unity, Unreal, Minecraft, Custom)
- ✅ Configuration file parsing (JSON, INI, Properties, XML)
- ✅ Port usage pattern recognition
- ✅ Command line argument analysis
- ✅ Confidence scoring for detection reliability

**Configuration Wizard System:**
- ✅ Interactive 5-step wizard with progress tracking
- ✅ Real-time game analysis with visual feedback
- ✅ Drag-and-drop file upload interface
- ✅ Dynamic configuration options based on detected patterns
- ✅ Expert mode with advanced overrides
- ✅ Environment variable management

**Template & Community System:**
- ✅ Template creation and sharing infrastructure
- ✅ Community profile contribution system
- ✅ Rating and voting system for community profiles
- ✅ Search and filtering for game templates
- ✅ Usage tracking and popularity metrics

**Expert Controls:**
- ✅ Manual override for all detected settings
- ✅ Advanced file system configuration
- ✅ Environment variable management
- ✅ Custom command line arguments
- ✅ Working directory and log file customization

**Backend Infrastructure:**
- ✅ Complete ICustomGameService with pattern detection
- ✅ CustomGamesController with comprehensive API endpoints
- ✅ File upload handling with security validation
- ✅ Game analysis engine with confidence scoring
- ✅ Configuration management and persistence

**Universal Game Intelligence:**
- ✅ Support for ANY game with dedicated server capability
- ✅ Automatic detection of 20+ common game patterns
- ✅ Engine-specific configuration templates
- ✅ Community-driven game profile database
- ✅ Expert fallback for unsupported games

## 🚦 Next Steps (Story 1.5)

Story 1.4 complete! Epic 1 nearing completion with:

1. **Auto-Optimization Engine** - Hardware-based automatic server optimization
2. **Real-time Communication** - SignalR integration for live deployment updates  
3. **Advanced Server Monitoring** - Performance metrics and health monitoring
4. **Plugin System Foundation** - Basic plugin installation and management
5. **Epic 2 Preparation** - Community Infrastructure foundation

## 🤝 Contributing

This project follows the team-fullstack methodology with comprehensive documentation and AI-friendly architecture patterns. See the docs/ directory for detailed specifications.

## 📄 License

[License details to be added]

---

**HomeHost**: Transforming gaming server management from complex technical tasks into magical, community-driven experiences. 🎮✨