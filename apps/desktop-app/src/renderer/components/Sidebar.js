import React from 'react';
import './Sidebar.css';

const Sidebar = ({ currentView, onViewChange, servers }) => {
  const runningServers = servers.filter(server => server.status === 'running').length;
  
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      badge: runningServers > 0 ? runningServers : null
    },
    {
      id: 'library',
      label: 'Game Library',
      icon: '🎮',
      badge: null
    },
    {
      id: 'servers',
      label: 'Server Manager',
      icon: '🖥️',
      badge: servers.length > 0 ? servers.length : null
    },
    {
      id: 'steam',
      label: 'Steam Manager',
      icon: '🚂',
      badge: null
    },
    {
      id: 'remote',
      label: 'Remote Access',
      icon: '📱',
      badge: null
    },
    {
      id: 'community',
      label: 'Community',
      icon: '🏘️',
      badge: null
    },
    {
      id: 'plugins',
      label: 'Plugin Store',
      icon: '🔌',
      badge: null
    },
    {
      id: 'revenue',
      label: 'Revenue',
      icon: '💰',
      badge: null
    },
    {
      id: 'engagement',
      label: 'Player Engagement',
      icon: '🎮',
      badge: null
    },
    {
      id: 'marketplace',
      label: 'Plugin Marketplace',
      icon: '🛒',
      badge: null
    },
    {
      id: 'analytics',
      label: 'Growth Analytics',
      icon: '📈',
      badge: null
    },
    {
      id: 'web3',
      label: 'Web3 Integration',
      icon: '🌐',
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      badge: null
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🏡</span>
          <span className="logo-text">HomeHost</span>
        </div>
        <div className="version">Desktop v1.0.0</div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="quick-stats">
          <div className="stat">
            <span className="stat-label">Running</span>
            <span className="stat-value">{runningServers}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total</span>
            <span className="stat-value">{servers.length}</span>
          </div>
        </div>
        
        <div className="system-status">
          <div className="status-indicator online"></div>
          <span className="status-text">System Online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;