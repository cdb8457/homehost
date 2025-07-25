const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-test-secret-key';

app.use(cors());
app.use(express.json());

// Mock data
const mockUsers = [
  {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'USER',
    createdAt: new Date().toISOString()
  }
];

const mockServers = [
  {
    id: '1',
    name: 'Test Valheim Server',
    game: 'Valheim',
    status: 'RUNNING',
    playerCount: 3,
    maxPlayers: 10,
    region: 'US-East',
    uptime: '99.5%',
    createdAt: new Date().toISOString(),
    serverType: 'Standard',
    cpuUsage: 45
  },
  {
    id: '2',
    name: 'Minecraft Server',
    game: 'Minecraft',
    status: 'STOPPED',
    playerCount: 0,
    maxPlayers: 20,
    region: 'US-West',
    uptime: '98.2%',
    createdAt: new Date().toISOString(),
    serverType: 'Premium',
    cpuUsage: 0
  }
];

const mockCommunities = [
  {
    id: '1',
    name: 'Viking Legends',
    description: 'A friendly Valheim community for casual and hardcore players alike',
    game: 'Valheim',
    memberCount: 156,
    onlineMembers: 23,
    joinType: 'open',
    featured: true,
    verified: true,
    region: 'Global',
    tags: ['Casual', 'Friendly', 'PvE'],
    rating: 4.8,
    reviewCount: 42,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Tactical Strike Force',
    description: 'Competitive CS2 community with daily scrimmages and tournaments',
    game: 'Counter-Strike 2',
    memberCount: 89,
    onlineMembers: 15,
    joinType: 'application',
    featured: false,
    verified: true,
    region: 'North America',
    tags: ['Competitive', 'Tournament', 'Skilled'],
    rating: 4.6,
    reviewCount: 28,
    createdAt: new Date().toISOString()
  }
];

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple auth check (in real app, you'd hash passwords)
  if (email === 'test@example.com' && password === 'password') {
    const user = mockUsers[0];
    const token = generateToken(user);
    
    res.json({
      success: true,
      data: {
        user,
        tokens: {
          accessToken: token,
          refreshToken: token + '_refresh'
        }
      }
    });
  } else {
    res.status(401).json({ 
      success: false, 
      error: { message: 'Invalid email or password' } 
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, username, password, firstName, lastName } = req.body;
  
  const newUser = {
    id: String(mockUsers.length + 1),
    username,
    email,
    firstName,
    lastName,
    role: 'USER',
    createdAt: new Date().toISOString()
  };
  
  mockUsers.push(newUser);
  const token = generateToken(newUser);
  
  res.json({
    success: true,
    data: {
      user: newUser,
      tokens: {
        accessToken: token,
        refreshToken: token + '_refresh'
      }
    }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = mockUsers.find(u => u.id === req.user.userId);
  res.json({
    success: true,
    data: { user }
  });
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ success: true });
});

// Servers endpoints
app.get('/api/servers', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      ownedServers: mockServers,
      memberServers: []
    }
  });
});

app.post('/api/servers/:id/start', authenticateToken, (req, res) => {
  const server = mockServers.find(s => s.id === req.params.id);
  if (server) {
    server.status = 'RUNNING';
    res.json({ success: true, data: { server } });
  } else {
    res.status(404).json({ success: false, error: { message: 'Server not found' } });
  }
});

app.post('/api/servers/:id/stop', authenticateToken, (req, res) => {
  const server = mockServers.find(s => s.id === req.params.id);
  if (server) {
    server.status = 'STOPPED';
    server.playerCount = 0;
    res.json({ success: true, data: { server } });
  } else {
    res.status(404).json({ success: false, error: { message: 'Server not found' } });
  }
});

// Communities endpoints
app.get('/api/communities/public', (req, res) => {
  res.json({
    success: true,
    data: {
      communities: mockCommunities
    }
  });
});

app.get('/api/communities/user', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      ownedCommunities: [mockCommunities[0]],
      memberCommunities: [mockCommunities[1]]
    }
  });
});

app.post('/api/communities/:id/join', authenticateToken, (req, res) => {
  const community = mockCommunities.find(c => c.id === req.params.id);
  if (community) {
    res.json({ 
      success: true, 
      data: { message: `Successfully joined ${community.name}` } 
    });
  } else {
    res.status(404).json({ 
      success: false, 
      error: { message: 'Community not found' } 
    });
  }
});

// Monitoring endpoints
app.get('/api/monitoring/overview', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      activeServers: mockServers.filter(s => s.status === 'RUNNING').length,
      totalPlayers: mockServers.reduce((sum, s) => sum + s.playerCount, 0),
      uptime: '99.2%',
      revenue: 1250.00
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock HomeHost API Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('📋 Test Credentials:');
  console.log('   Email: test@example.com');
  console.log('   Password: password');
  console.log('');
  console.log('🔗 Endpoints:');
  console.log('   Health: http://localhost:3001/health');
  console.log('   Login: POST http://localhost:3001/api/auth/login');
  console.log('   Servers: GET http://localhost:3001/api/servers');
  console.log('   Communities: GET http://localhost:3001/api/communities/public');
});