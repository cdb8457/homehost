# 🚀 HomeHost Platform Testing Guide

This guide will help you test the complete HomeHost gaming platform with real frontend-backend integration.

## 📋 Prerequisites

Make sure you have installed:
- **Node.js** (version 18 or higher)
- **npm** or **yarn**
- A web browser

## 🎯 Quick Start (5 minutes)

### Step 1: Start the Mock Backend API

Open your first terminal and run:

```bash
cd "/mnt/host/c/NewProject Fresh"

# Install dependencies for mock server
npm init -y
npm install express cors jsonwebtoken

# Start the mock backend
node mock-server.js
```

You should see:
```
🚀 Mock HomeHost API Server running on http://localhost:3001

📋 Test Credentials:
   Email: test@example.com
   Password: password
```

### Step 2: Start the Frontend Dashboard

Open your second terminal and run:

```bash
cd "/mnt/host/c/NewProject Fresh/apps/web-dashboard"

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start at: **http://localhost:3000**

### Step 3: Test the Platform

1. **Open your browser** to `http://localhost:3000`
2. **Sign up** or **Login** with:
   - Email: `test@example.com`
   - Password: `password`
3. **Explore the features**:
   - ✅ Dashboard with real server stats
   - ✅ Server management (start/stop servers)
   - ✅ Community browser with real data
   - ✅ User authentication and profiles

## 🧪 Testing Scenarios

### 1. **Authentication Testing**
- ✅ **Register** a new account
- ✅ **Login** with existing credentials
- ✅ **Logout** and session management
- ✅ **Protected routes** (try accessing `/app` without login)

### 2. **Server Management Testing**
- ✅ **View your servers** in the dashboard
- ✅ **Start/Stop servers** (click the play/stop buttons)
- ✅ **Real-time stats** (active servers, player counts)
- ✅ **Server details** and monitoring

### 3. **Community Features Testing**
- ✅ **Browse communities** (`/app/communities`)
- ✅ **Search and filter** communities
- ✅ **Join communities** (various join types)
- ✅ **View community details**

### 4. **Dashboard Integration Testing**
- ✅ **Live data updates** from API
- ✅ **Role-based features** (USER vs ADMIN views)
- ✅ **Real statistics** instead of mock data
- ✅ **Error handling** and loading states

## 🔍 API Testing

You can also test the API directly:

### Health Check
```bash
curl http://localhost:3001/health
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Get Servers (requires auth token)
```bash
# First get your token from login response, then:
curl http://localhost:3001/api/servers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🐛 Troubleshooting

### Frontend Issues
- **Port 3000 already in use?** 
  - Change port: `npm run dev -- -p 3001`
- **Dependencies not installing?**
  - Delete `node_modules` and run `npm install` again
- **Build errors?**
  - Check if TypeScript files are valid

### Backend Issues
- **Port 3001 already in use?**
  - Change PORT in `mock-server.js` (line 5)
  - Update API URL in frontend to match
- **CORS errors?**
  - Make sure both servers are running
  - Check browser console for specific errors

### Authentication Issues
- **Login not working?**
  - Use exactly: `test@example.com` / `password`
  - Check browser network tab for API calls
- **Token errors?**
  - Clear browser localStorage and try again

## 🔧 Advanced Testing

### Environment Variables
Create `.env.local` in the web-dashboard folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Database Testing (Optional)
If you want to test with a real database:

1. Set up PostgreSQL
2. Update database connection in backend
3. Run migrations: `npm run db:migrate`
4. Seed data: `npm run db:seed`

## 📊 What You're Testing

### Frontend Features
- ✅ **React + Next.js** dashboard
- ✅ **TypeScript** type safety
- ✅ **Tailwind CSS** styling
- ✅ **Real-time updates** (WebSocket ready)
- ✅ **Authentication flow**
- ✅ **API integration**

### Backend Features
- ✅ **RESTful API** endpoints
- ✅ **JWT authentication**
- ✅ **CORS configuration**
- ✅ **Error handling**
- ✅ **Data validation**

### Integration Testing
- ✅ **Frontend ↔ Backend** communication
- ✅ **Authentication** token flow
- ✅ **Real-time data** updates
- ✅ **Error handling** across stack
- ✅ **Loading states** and UX

## 🎉 Success Criteria

You've successfully tested the platform when you can:

1. ✅ **Login** and see the dashboard
2. ✅ **View real server data** (not static mock data)
3. ✅ **Start/stop servers** and see status changes
4. ✅ **Browse and join communities**
5. ✅ **Navigate** between different sections
6. ✅ **Logout** and login again

## 🚀 Next Steps

After testing, you can:

1. **Deploy** to production (Vercel, Netlify, etc.)
2. **Add real database** (PostgreSQL, MongoDB)
3. **Implement WebSocket** for real-time updates
4. **Add more features** (plugins, monitoring, etc.)
5. **Set up CI/CD** pipeline

## 📞 Support

If you encounter issues:

1. Check the **browser console** for errors
2. Check **terminal logs** for both frontend and backend
3. Verify **network requests** in browser dev tools
4. Ensure **both servers** are running on correct ports

---

**Happy Testing! 🎮**

The HomeHost platform is now fully functional with real frontend-backend integration!