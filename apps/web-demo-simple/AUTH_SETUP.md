# 🔐 HomeHost Authentication System

This document explains the comprehensive authentication system we've built for HomeHost, supporting Epic 2: Community Infrastructure.

## 🎯 What We've Built

### **Complete Authentication System**
- **Multi-provider Auth**: Email/password, Google OAuth, Discord OAuth
- **User Personas**: Alex (casual) vs Sam (community builder) with different UX
- **Profile Management**: Gaming preferences, role-based customization
- **Social Features**: Friend connections, community memberships
- **Real-time State**: React Context with automatic updates

### **Database Schema**
- **User Profiles**: Extended profiles with gaming preferences
- **Communities**: Full community system with social features
- **Social Features**: Friendships, activities, recommendations
- **Cross-server Tracking**: Unified player management across servers
- **Security**: Row-level security (RLS) policies

## 🏗️ Architecture

### **Frontend Components**
```
/components/auth/
├── LoginForm.tsx           # Email/password + social login
├── SignupForm.tsx          # Multi-step signup with persona selection
└── AuthModal.tsx           # Modal wrapper for auth flows

/contexts/
└── AuthContext.tsx         # React context for auth state

/lib/
└── auth.ts                 # Auth manager with all auth operations
```

### **Backend Setup**
```
/database/
├── schema.sql              # Complete database schema
└── seed.sql               # Sample data for testing
```

## 🚀 Setup Instructions

### **1. Supabase Configuration**

Create a new Supabase project and run the schema:

```sql
-- Run this in your Supabase SQL editor
-- Copy and paste the contents of /database/schema.sql
```

### **2. Environment Variables**

Create/update your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### **3. OAuth Provider Setup**

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Add to Supabase Dashboard > Authentication > Providers

**Discord OAuth:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Add to Supabase Dashboard > Authentication > Providers

### **4. Root Layout Integration**

Update your root layout to include the AuthProvider:

```tsx
// app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### **5. Protected Routes**

Use the auth hooks in your components:

```tsx
import { useAuth, useRequireAuth } from '@/contexts/AuthContext';

export default function ProtectedComponent() {
  const { user, loading } = useRequireAuth(); // Auto-redirects if not logged in
  
  if (loading) return <div>Loading...</div>;
  
  return <div>Welcome {user.name}!</div>;
}
```

## 🎮 User Experience

### **Alex Experience (Casual Host)**
- **Simple Signup**: Gaming preferences, casual focus
- **Easy Onboarding**: Guided setup for first server
- **Social Discovery**: Find communities through friends
- **One-click Everything**: Minimal technical complexity

### **Sam Experience (Community Builder)**
- **Advanced Signup**: Community management preferences
- **Analytics Focus**: Growth metrics and member insights
- **Admin Tools**: Community management dashboard
- **Revenue Features**: Monetization and analytics

## 🔧 API Usage Examples

### **Basic Authentication**
```tsx
import { useAuth } from '@/contexts/AuthContext';

const { signIn, signUp, signOut, user } = useAuth();

// Sign in
const handleLogin = async () => {
  const result = await signIn('email@example.com', 'password');
  if (result.error) {
    console.error('Login failed:', result.error);
  }
};

// Sign up with persona
const handleSignup = async () => {
  const result = await signUp('email@example.com', 'password', {
    name: 'John Doe',
    role: 'alex',
    gaming_preferences: {
      favorite_games: ['Valheim', 'Rust'],
      playtime_preference: 'casual',
      community_size_preference: 'small',
      hosting_experience: 'none'
    }
  });
};
```

### **Community Integration**
```tsx
// Get user's communities
const { communities } = await authManager.getUserCommunities(user.id);

// Get user's friends
const { friends } = await authManager.getUserFriends(user.id);

// Get user's servers
const { servers } = await authManager.getUserServers(user.id);
```

## 🔒 Security Features

### **Row-Level Security (RLS)**
- Users can only access their own data
- Community members can only see community data
- Friends can see each other's activities
- Public data is accessible to everyone

### **Data Validation**
- Client-side form validation
- Server-side constraints
- Type safety with TypeScript
- Proper error handling

## 🎨 UI/UX Features

### **Responsive Design**
- Mobile-first approach
- Beautiful login/signup flows
- Social provider integration
- Loading states and error handling

### **Accessibility**
- Proper ARIA labels
- Keyboard navigation
- Screen reader friendly
- Color contrast compliance

## 🧪 Testing

### **Sample Data**
Run the seed script to populate with test data:
```sql
-- Run this in your Supabase SQL editor
-- Copy and paste the contents of /database/seed.sql
```

### **Test Accounts**
Create test accounts with different personas:
- Alex: casual@homehost.com (casual host)
- Sam: community@homehost.com (community builder)

## 🚀 Next Steps

1. **Deploy to Production**: Set up production Supabase instance
2. **Add Email Templates**: Custom email templates for auth flows
3. **Implement 2FA**: Two-factor authentication for security
4. **Add Analytics**: Track user engagement and conversion
5. **Social Features**: Implement friend system and social activities

## 💡 Key Innovations

### **Persona-Driven UX**
- Different signup flows for Alex vs Sam
- Personalized onboarding experiences
- Role-based feature access
- Adaptive UI based on user type

### **Social-First Architecture**
- Friend-based community discovery
- Social activity feeds
- Community-driven recommendations
- Network effects built into core features

### **Epic 2 Foundation**
- Complete user profile system
- Community membership infrastructure
- Cross-server player tracking
- Social proof and recommendations

---

## 🎉 What's Working Now

✅ **Authentication**: Complete multi-provider auth system
✅ **User Profiles**: Rich profiles with gaming preferences
✅ **Database Schema**: Full Epic 2 schema with RLS
✅ **React Integration**: Context-based state management
✅ **UI Components**: Beautiful login/signup flows
✅ **Social Foundation**: Friend system and community infrastructure

**The authentication system is now ready to power Epic 2: Community Infrastructure!**

Start the dev server and visit `/login` to see the magic! 🚀