// Simple demo server to showcase HomeHost Desktop UI
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

// Simple static file server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route handling
  if (req.url === '/' || req.url === '/index.html') {
    serveFile('./public/index.html', 'text/html', res);
  } else if (req.url === '/manifest.json') {
    serveFile('./public/manifest.json', 'application/json', res);
  } else if (req.url === '/favicon.ico') {
    serveFile('./public/favicon.ico', 'image/x-icon', res);
  } else if (req.url.startsWith('/images/')) {
    serveFile('./public' + req.url, 'image/svg+xml', res);
  } else if (req.url === '/static/js/bundle.js') {
    // Serve a simple demo React bundle
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(getDemoBundle());
  } else if (req.url === '/static/css/main.css') {
    // Serve demo styles
    res.writeHead(200, { 'Content-Type': 'text/css' });
    res.end(getDemoStyles());
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

function serveFile(filePath, contentType, res) {
  const fullPath = path.join(__dirname, filePath);
  
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function getDemoBundle() {
  return `
// HomeHost Desktop Demo Bundle
console.log('🏡 HomeHost Desktop Demo Loading...');

// Mock React and ReactDOM
window.React = {
  createElement: function(type, props, ...children) {
    const element = document.createElement(type);
    if (props) {
      Object.keys(props).forEach(key => {
        if (key === 'className') {
          element.className = props[key];
        } else if (key === 'onClick') {
          element.onclick = props[key];
        } else if (key.startsWith('on')) {
          element.addEventListener(key.substring(2).toLowerCase(), props[key]);
        } else {
          element.setAttribute(key, props[key]);
        }
      });
    }
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child) {
        element.appendChild(child);
      }
    });
    return element;
  },
  useState: function(initial) {
    return [initial, function() {}];
  },
  useEffect: function() {}
};

window.ReactDOM = {
  createRoot: function(container) {
    return {
      render: function(element) {
        container.innerHTML = '';
        container.appendChild(element);
      }
    };
  }
};

// Mock Electron API
window.electronAPI = {
  getSystemInfo: async () => ({
    static: {
      os: { hostname: 'DEMO-PC', platform: 'win32', arch: 'x64' },
      cpu: { brand: 'Intel i7-12700K', cores: 16, speed: 3.6 },
      memory: { total: 32 * 1024 * 1024 * 1024 }
    },
    current: {
      cpu: { usage: 15.7 },
      memory: { usagePercent: 45.2, available: 17 * 1024 * 1024 * 1024 }
    }
  }),
  getServers: async () => [
    {
      id: 'demo-1',
      name: 'My Valheim Server',
      gameType: 'valheim',
      gameName: 'Valheim',
      status: 'running',
      port: 2456,
      currentPlayers: 3,
      maxPlayers: 10,
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-2', 
      name: 'Rust PvP Server',
      gameType: 'rust',
      gameName: 'Rust',
      status: 'stopped',
      port: 28015,
      currentPlayers: 0,
      maxPlayers: 100,
      createdAt: new Date().toISOString()
    }
  ],
  getSteamGames: async () => [
    { id: 'valheim', name: 'Valheim', isInstalled: true },
    { id: 'rust', name: 'Rust', isInstalled: false },
    { id: 'cs2', name: 'Counter-Strike 2', isInstalled: true }
  ]
};

window.appInfo = {
  version: '1.0.0',
  platform: 'win32',
  arch: 'x64'
};

// Create demo application
function createDemoApp() {
  const app = React.createElement('div', { className: 'app' },
    // Sidebar
    React.createElement('aside', { className: 'sidebar' },
      React.createElement('div', { className: 'sidebar-header' },
        React.createElement('div', { className: 'logo' },
          React.createElement('span', { className: 'logo-icon' }, '🏡'),
          React.createElement('span', { className: 'logo-text' }, 'HomeHost')
        ),
        React.createElement('div', { className: 'version' }, 'Desktop v1.0.0')
      ),
      React.createElement('nav', { className: 'sidebar-nav' },
        React.createElement('button', { className: 'nav-item active' },
          React.createElement('span', { className: 'nav-icon' }, '🏠'),
          React.createElement('span', { className: 'nav-label' }, 'Dashboard'),
          React.createElement('span', { className: 'nav-badge' }, '2')
        ),
        React.createElement('button', { className: 'nav-item' },
          React.createElement('span', { className: 'nav-icon' }, '🎮'),
          React.createElement('span', { className: 'nav-label' }, 'Game Library')
        ),
        React.createElement('button', { className: 'nav-item' },
          React.createElement('span', { className: 'nav-icon' }, '🖥️'),
          React.createElement('span', { className: 'nav-label' }, 'Server Manager'),
          React.createElement('span', { className: 'nav-badge' }, '2')
        ),
        React.createElement('button', { className: 'nav-item' },
          React.createElement('span', { className: 'nav-icon' }, '⚙️'),
          React.createElement('span', { className: 'nav-label' }, 'Settings')
        )
      )
    ),
    
    // Main content
    React.createElement('main', { className: 'main-content' },
      React.createElement('header', { className: 'dashboard-header' },
        React.createElement('h1', {}, 'Dashboard'),
        React.createElement('p', {}, 'Monitor your game servers and system performance')
      ),
      
      // Stats grid
      React.createElement('div', { className: 'stats-grid' },
        React.createElement('div', { className: 'stat-card servers' },
          React.createElement('div', { className: 'stat-icon' }, '🖥️'),
          React.createElement('div', { className: 'stat-content' },
            React.createElement('div', { className: 'stat-number' }, '1'),
            React.createElement('div', { className: 'stat-label' }, 'Running Servers'),
            React.createElement('div', { className: 'stat-detail' }, '2 total')
          )
        ),
        React.createElement('div', { className: 'stat-card players' },
          React.createElement('div', { className: 'stat-icon' }, '👥'),
          React.createElement('div', { className: 'stat-content' },
            React.createElement('div', { className: 'stat-number' }, '3'),
            React.createElement('div', { className: 'stat-label' }, 'Active Players'),
            React.createElement('div', { className: 'stat-detail' }, 'Across all servers')
          )
        ),
        React.createElement('div', { className: 'stat-card cpu' },
          React.createElement('div', { className: 'stat-icon' }, '⚡'),
          React.createElement('div', { className: 'stat-content' },
            React.createElement('div', { className: 'stat-number' }, '15.7%'),
            React.createElement('div', { className: 'stat-label' }, 'CPU Usage'),
            React.createElement('div', { className: 'stat-detail' }, '16 cores')
          )
        ),
        React.createElement('div', { className: 'stat-card memory' },
          React.createElement('div', { className: 'stat-icon' }, '💾'),
          React.createElement('div', { className: 'stat-content' },
            React.createElement('div', { className: 'stat-number' }, '45.2%'),
            React.createElement('div', { className: 'stat-label' }, 'RAM Usage'),
            React.createElement('div', { className: 'stat-detail' }, '32 GB')
          )
        )
      ),
      
      // Demo message
      React.createElement('div', { className: 'card', style: 'margin-top: 40px; text-align: center; padding: 40px;' },
        React.createElement('h2', { style: 'color: #667eea; margin-bottom: 20px;' }, '🎉 HomeHost Desktop Demo'),
        React.createElement('p', { style: 'font-size: 1.1rem; margin-bottom: 15px;' }, 'This is a live preview of the HomeHost Desktop application!'),
        React.createElement('p', { style: 'color: rgba(255,255,255,0.8);' }, 'The full application includes Steam integration, real-time monitoring, server management, and much more.'),
        React.createElement('div', { style: 'margin-top: 30px;' },
          React.createElement('button', { 
            className: 'btn btn-primary',
            onClick: () => alert('🚀 Ready for full installation! Run: npm install && npm start')
          }, 'Install Full Version')
        )
      )
    )
  );
  
  // Render the app
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(app);
  
  console.log('✨ HomeHost Desktop Demo Loaded Successfully!');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createDemoApp);
} else {
  createDemoApp();
}
`;
}

function getDemoStyles() {
  return `
/* HomeHost Desktop Demo Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  overflow: hidden;
}

.app {
  display: flex;
  height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.sidebar-header {
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-icon {
  font-size: 2rem;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.version {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 44px;
}

.sidebar-nav {
  flex: 1;
  padding: 0 10px;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 5px;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  transform: translateX(5px);
}

.nav-item.active {
  background: linear-gradient(45deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
  color: #ffffff;
  border: 1px solid rgba(102, 126, 234, 0.5);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
}

.nav-icon {
  font-size: 1.2rem;
  min-width: 20px;
  text-align: center;
}

.nav-label {
  font-weight: 500;
  flex: 1;
  text-align: left;
}

.nav-badge {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px 0 0 20px;
  margin: 10px 0 10px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dashboard-header {
  margin-bottom: 30px;
  text-align: center;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-header p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

.stat-card.servers { border-left: 4px solid #667eea; }
.stat-card.players { border-left: 4px solid #56ab2f; }
.stat-card.cpu { border-left: 4px solid #ff6b6b; }
.stat-card.memory { border-left: 4px solid #ffd93d; }

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3px;
}

.stat-detail {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
}

/* Card */
.card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

/* Button */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}
`;
}

server.listen(PORT, () => {
  console.log(`🚀 HomeHost Desktop Demo Server running at http://localhost:${PORT}`);
  console.log('📱 Open this URL in your browser to see the live demo!');
  console.log('✨ This showcases the actual UI that will run in Electron');
});