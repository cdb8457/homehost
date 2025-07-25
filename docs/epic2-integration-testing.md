# Epic 2 Integration Testing Guide

## Overview

This guide covers comprehensive integration testing between the HomeHost Web Dashboard (frontend) and HomeHost Cloud API (backend) to validate Epic 2 Community features end-to-end.

**Testing Goal**: Verify that all Epic 2 Community features work correctly when frontend and backend are connected.

---

## Test Infrastructure

### Frontend Components
- **HomeHost API Client** (`lib/homehost-api.ts`) - API communication layer
- **Integration Tester** (`components/IntegrationTester.tsx`) - Automated test suite
- **Live Community Browser** (`components/CommunityBrowserLive.tsx`) - Real API integration

### Backend Components  
- **HomeHost Cloud API** - ASP.NET Core 8 API
- **SQL Server Database** - Community data storage
- **Docker Infrastructure** - Complete development stack

---

## Quick Start Integration Testing

### 1. Start the Backend API

```bash
# Terminal 1: Start Cloud API
cd apps/cloud-api
./setup-dev.sh

# Verify API is running
curl http://localhost:5000/health
# Expected: {"status":"Healthy","timestamp":"2025-07-14T..."}
```

### 2. Start the Frontend

```bash
# Terminal 2: Start Web Dashboard  
cd apps/web-dashboard
npm run dev

# Access at: http://localhost:3000
```

### 3. Configure API Connection

```bash
# Create environment config
cd apps/web-dashboard
cp .env.local.example .env.local

# Edit .env.local:
echo "NEXT_PUBLIC_HOMEHOST_API_URL=http://localhost:5000/api" > .env.local
```

### 4. Run Integration Tests

Navigate to: **http://localhost:3000/integration-test**

Click **"Run Integration Tests"** and verify:
- ✅ Backend Connection
- ✅ Health Check  
- ✅ Authentication
- ✅ Community CRUD operations
- ✅ Search and filtering
- ✅ Member management

---

## Test Scenarios

### Core Integration Tests

#### 1. **Backend Connection Test**
```typescript
// Test: Basic API connectivity
const connected = await homeHostAPI.testConnection();
// Expected: true (API responds to health endpoint)
```

#### 2. **Authentication Flow Test**
```typescript
// Test: JWT authentication workflow
const authResult = await homeHostAPI.login('alex@homehost.com', 'password123');
// Expected: { accessToken, refreshToken, user }
```

#### 3. **Community Discovery Test**
```typescript
// Test: Fetch all communities
const communities = await homeHostAPI.getCommunities();
// Expected: Array of Community objects with sample data
```

#### 4. **Community Search Test**  
```typescript
// Test: Search functionality
const results = await homeHostAPI.searchCommunities('Valheim');
// Expected: Filtered array containing Valheim communities
```

#### 5. **Community Creation Test**
```typescript
// Test: Create new community
const newCommunity = await homeHostAPI.createCommunity({
  name: 'Integration Test Community',
  description: 'Test community',
  brandColors: { primary: '#3b82f6', secondary: '#1d4ed8' },
  joinType: 'open',
  region: 'North America',
  games: ['Test Game'],
  tags: ['integration', 'test']
});
// Expected: Created community with generated ID
```

#### 6. **Community Joining Test**
```typescript
// Test: Join community workflow
await homeHostAPI.joinCommunity(communityId);
// Expected: Successful join, membership created
```

### Manual Integration Tests

#### 1. **Live Community Browser**
- Navigate to: **http://localhost:3000/communities-live**
- Verify communities load from API
- Test search and filtering
- Test authentication flow
- Test community joining

#### 2. **Error Handling**
- Stop the backend API
- Verify frontend shows connection errors
- Restart API and verify recovery

#### 3. **Data Persistence**
- Create a community via frontend
- Check database for new record
- Verify data matches frontend input

---

## Expected API Responses

### Sample Community Data
```json
{
  "id": "33333333-3333-3333-3333-333333333333",
  "name": "Viking Legends",
  "description": "Epic Viking adventures in Valheim...",
  "brandColors": {
    "primary": "#2563eb",
    "secondary": "#1d4ed8"
  },
  "memberCount": 1247,
  "membersOnline": 89,
  "totalServers": 8,
  "activeServers": 6,
  "joinType": "open",
  "region": "North America",
  "games": ["Valheim"],
  "rating": 4.8,
  "reviewCount": 156,
  "isVerified": true,
  "isFeatured": true,
  "createdAt": "2024-01-15T00:00:00Z",
  "lastActivity": "2024-12-01T00:00:00Z"
}
```

### Sample Authentication Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "def502004a1b2c3d4e5f6789...",
  "expiresAt": "2025-07-14T15:30:00Z",
  "user": {
    "id": "11111111-1111-1111-1111-111111111111",
    "email": "alex@homehost.com",
    "displayName": "Alex Johnson (Casual Host)",
    "personaType": 0
  }
}
```

---

## Test Validation Checklist

### ✅ **Connection & Authentication**
- [ ] Backend API responds to health check
- [ ] Frontend can connect to API
- [ ] Authentication workflow completes
- [ ] JWT tokens are stored and used correctly
- [ ] Token refresh works automatically

### ✅ **Community Management**
- [ ] Communities load from database
- [ ] Search returns filtered results
- [ ] Trending communities endpoint works
- [ ] Recommended communities (authenticated users)
- [ ] Community creation saves to database
- [ ] Community updates persist correctly

### ✅ **User Interactions**
- [ ] Join community workflow
- [ ] Leave community functionality  
- [ ] Member list displays correctly
- [ ] Role-based permissions work
- [ ] Cross-server player tracking

### ✅ **Data Integrity**
- [ ] Frontend data matches API responses
- [ ] Database records match frontend input
- [ ] Relationships (community-members) work
- [ ] Analytics data calculates correctly

### ✅ **Error Handling**
- [ ] API errors display user-friendly messages
- [ ] Network failures handled gracefully
- [ ] Authentication errors trigger re-login
- [ ] Invalid data rejected with clear feedback

---

## Common Issues & Solutions

### Issue: "Cannot connect to API"
**Symptoms**: Integration tests fail on Backend Connection
**Solutions**:
1. Verify backend is running: `curl http://localhost:5000/health`
2. Check Docker services: `docker-compose ps`
3. Verify database is ready: `docker-compose logs homehost-db`
4. Check CORS settings in backend

### Issue: "Authentication Failed"  
**Symptoms**: JWT login returns 401 error
**Solutions**:
1. Check sample users exist in database
2. Verify JWT secret configuration matches
3. Check database connection string
4. Run database migrations: `./setup-dev.sh`

### Issue: "No Communities Found"
**Symptoms**: API returns empty array
**Solutions**:
1. Check database has sample data
2. Run seed script in database migration
3. Verify Entity Framework models
4. Check SQL Server connection

### Issue: "CORS Error"
**Symptoms**: Browser blocks API requests  
**Solutions**:
1. Add frontend URL to API CORS settings
2. Update `appsettings.Development.json`:
   ```json
   "CorsAllowedOrigins": [
     "http://localhost:3000",
     "https://localhost:3001"
   ]
   ```
3. Restart API after CORS changes

---

## Performance Testing

### Load Testing Scenarios

#### 1. **Community Discovery Performance**
```bash
# Test concurrent community fetches
for i in {1..10}; do
  curl -s http://localhost:5000/api/community &
done
wait

# Expected: All requests complete under 1 second
```

#### 2. **Search Performance**  
```bash
# Test search with various queries
curl "http://localhost:5000/api/community/search?query=Valheim"
curl "http://localhost:5000/api/community/search?query=competitive"
curl "http://localhost:5000/api/community/search?query=casual"

# Expected: Results under 500ms each
```

#### 3. **Authentication Performance**
```bash
# Test login performance
time curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@homehost.com","password":"password123"}'

# Expected: Authentication under 200ms
```

---

## Database Integration

### Verify Database Schema
```sql
-- Connect to SQL Server
docker-compose exec homehost-db sqlcmd -S localhost -U sa -P HomeHost123!

-- Check tables exist
SELECT name FROM sys.tables WHERE name LIKE '%Communit%';
-- Expected: Communities, CommunityMembers, CommunityAnalytics, etc.

-- Check sample data
SELECT Id, Name, MemberCount FROM Communities;
-- Expected: Viking Legends, Tactical Strike Force, etc.
```

### Monitor Database Activity
```sql
-- Monitor active connections
SELECT 
    session_id,
    login_name,
    host_name,
    program_name
FROM sys.dm_exec_sessions 
WHERE is_user_process = 1;
```

---

## Continuous Integration

### Automated Testing Pipeline

#### 1. **Backend API Tests**
```bash
cd apps/cloud-api
dotnet test --filter Category=Integration
```

#### 2. **Frontend Component Tests**
```bash  
cd apps/web-dashboard
npm test -- --testNamePattern="Integration"
```

#### 3. **End-to-End Tests**
```bash
# Using Playwright (future enhancement)
npx playwright test tests/e2e/community-integration.spec.ts
```

---

## Success Criteria

### **Integration Testing Complete** ✅
- [ ] All 10 integration tests pass (100% success rate)
- [ ] Frontend connects to backend successfully
- [ ] Authentication workflow operational
- [ ] Community CRUD operations functional
- [ ] Search and filtering work with real data
- [ ] Error handling graceful and user-friendly

### **Performance Acceptable** ✅  
- [ ] Community loading under 1 second
- [ ] Search results under 500ms
- [ ] Authentication under 200ms
- [ ] Database queries optimized

### **Production Ready** ✅
- [ ] No hardcoded test data in production code
- [ ] Environment configuration flexible
- [ ] Error logging comprehensive
- [ ] Security headers and CORS properly configured

---

## Next Steps After Integration Testing

### 1. **Deploy to Staging**
- Set up staging environment
- Deploy both frontend and backend
- Run integration tests against staging
- Performance testing with realistic data

### 2. **User Acceptance Testing**
- Test real user workflows
- Validate UI/UX with Epic 2 features
- Gather feedback on community discovery
- Test mobile responsiveness

### 3. **Production Deployment**
- Configure production environment variables
- Set up monitoring and alerting
- Deploy with zero-downtime strategy
- Monitor real user interactions

---

**Integration Testing Status: Ready for Execution** 🚀

This comprehensive integration testing framework validates that Epic 2 Community features work correctly across the full stack, ensuring a robust and reliable user experience.