# Epic 2 Authentication Integration Guide

## Current Status
✅ Your backend authentication is working (Epic 2 complete)
✅ Your frontend auth components are built
❌ Need to update API client to match backend response format

## Backend Authentication Format (from AuthController.cs)

Your backend returns:
```json
{
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here", 
  "expiresAt": "2024-07-23T10:00:00Z",
  "user": {
    "id": "user_guid",
    "email": "user@example.com",
    "displayName": "User Name",
    "avatarUrl": "avatar_url",
    "personaType": "Alex", 
    "steamId": "steam_id"
  }
}
```

## Frontend Expected Format (from api-client.ts)

Your frontend expects:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": "..."
    }
  }
}
```

## Required Changes

### 1. Update API Client Login Method

In `/apps/web-dashboard/lib/api-client.ts`, update the login method:

```typescript
// Authentication methods
async login(credentials: LoginRequest): Promise<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>> {
  const response = await this.request<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  
  // Transform Epic 2 backend response to frontend format
  if (response.success !== false && response.token) {
    const transformedResponse = {
      success: true,
      data: {
        user: {
          id: response.user.id,
          email: response.user.email,
          username: response.user.displayName,
          firstName: response.user.displayName.split(' ')[0],
          lastName: response.user.displayName.split(' ')[1] || '',
          role: 'USER' as const,
          avatarUrl: response.user.avatarUrl,
          emailVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          profile: {
            steam: response.user.steamId
          }
        },
        tokens: {
          accessToken: response.token,
          refreshToken: response.refreshToken,
          expiresIn: response.expiresAt
        }
      }
    };
    
    if (transformedResponse.data) {
      TokenManager.setTokens(transformedResponse.data.tokens, transformedResponse.data.user);
    }
    
    return transformedResponse;
  }
  
  return {
    success: false,
    error: {
      code: 'AUTH_FAILED',
      message: response.error || 'Authentication failed'
    }
  };
}
```

### 2. Test Authentication Flow

Once updated, test the login flow:

1. Start your Epic 2 backend:
   ```bash
   cd apps/cloud-api
   ./setup-dev.sh
   ```

2. Start your frontend:
   ```bash
   cd apps/web-dashboard  
   npm run dev
   ```

3. Navigate to `/login` and test with backend credentials

### 3. Update CommunityBrowser

After authentication works, update `CommunityBrowser.tsx`:

```typescript
// Line 113, change from:
const response = await communitiesApi.getPublicCommunities();

// To:
const response = await communitiesApi.getCommunities();
```

### 4. Test Community Integration

Once auth works, test community features:
- Browse communities
- Join a community  
- View community details

## Next Steps

1. **Update the API client login method** (code above)
2. **Test authentication** with Epic 2 backend
3. **Test community features** with authenticated user
4. **Add error handling** for auth failures
5. **Implement user registration** (similar transformation needed)

## Common Issues

- **CORS errors**: Make sure backend allows requests from http://localhost:3000
- **Auth required**: All community endpoints require authentication
- **Token format**: Backend uses different token structure than frontend expects

## Success Criteria

✅ User can login successfully
✅ JWT token is stored and used for API calls
✅ Community browser loads data from Epic 2 backend
✅ User can join communities through frontend
✅ Authentication persists across page refreshes