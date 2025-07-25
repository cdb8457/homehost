import React, { useState } from 'react';
import './ServerManager.css';
import ServerDetailsModal from './ServerDetailsModal';

const ServerManager = ({ servers, onServerAction, onRefresh }) => {
  const [selectedServer, setSelectedServer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServers = servers.filter(server => {
    const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         server.gameName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || server.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return '🟢';
      case 'stopped': return '⚪';
      case 'starting': return '🟡';
      case 'stopping': return '🟠';
      case 'error': return '🔴';
      default: return '⚫';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'running': return 'status-running';
      case 'stopped': return 'status-stopped';
      case 'starting': return 'status-starting';
      case 'stopping': return 'status-starting';
      case 'error': return 'status-error';
      default: return 'status-stopped';
    }
  };

  const handleServerAction = async (action, serverId) => {
    try {
      await onServerAction(action, serverId);
      onRefresh();
    } catch (error) {
      console.error(`Failed to ${action} server:`, error);
    }
  };

  const handleDeleteServer = (server) => {
    setSelectedServer(server);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedServer) {
      try {
        await onServerAction('delete', selectedServer.id);
        setShowDeleteModal(false);
        setSelectedServer(null);
        onRefresh();
      } catch (error) {
        console.error('Failed to delete server:', error);
      }
    }
  };

  const formatUptime = (lastStarted) => {
    if (!lastStarted) return 'Never started';
    
    const start = new Date(lastStarted);
    const now = new Date();
    const diffMs = now - start;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="server-manager">
      <header className="manager-header">
        <div className="header-content">
          <h1>Server Manager</h1>
          <p>Manage and monitor your game servers</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => window.location.hash = '#library'}
          >
            Deploy New Server
          </button>
          <button 
            className="btn btn-secondary"
            onClick={onRefresh}
          >
            Refresh
          </button>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="manager-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search servers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({servers.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'running' ? 'active' : ''}`}
            onClick={() => setFilterStatus('running')}
          >
            Running ({servers.filter(s => s.status === 'running').length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'stopped' ? 'active' : ''}`}
            onClick={() => setFilterStatus('stopped')}
          >
            Stopped ({servers.filter(s => s.status === 'stopped').length})
          </button>
        </div>
      </div>

      {/* Server Grid */}
      {filteredServers.length > 0 ? (
        <div className="servers-grid">
          {filteredServers.map(server => (
            <div key={server.id} className="server-card">
              <div className="server-header">
                <div className="server-info">
                  <h3 className="server-name">{server.name}</h3>
                  <div className="server-meta">
                    <span className="server-game">{server.gameName}</span>
                    <span className="server-port">:{server.port}</span>
                  </div>
                </div>
                
                <div className="server-status">
                  <span className={`status ${getStatusClass(server.status)}`}>
                    {getStatusIcon(server.status)} {server.status}
                  </span>
                </div>
              </div>

              <div className="server-stats">
                <div className="stat">
                  <span className="stat-label">Players</span>
                  <span className="stat-value">
                    {server.currentPlayers || 0}/{server.maxPlayers}
                  </span>
                </div>
                
                <div className="stat">
                  <span className="stat-label">Uptime</span>
                  <span className="stat-value">
                    {server.status === 'running' ? formatUptime(server.lastStarted) : 'Stopped'}
                  </span>
                </div>
                
                <div className="stat">
                  <span className="stat-label">Created</span>
                  <span className="stat-value">
                    {server.createdAt ? new Date(server.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="server-config">
                <div className="config-item">
                  <span className="config-label">Game Type:</span>
                  <span className="config-value">{server.gameType}</span>
                </div>
                
                {server.worldName && (
                  <div className="config-item">
                    <span className="config-label">World:</span>
                    <span className="config-value">{server.worldName}</span>
                  </div>
                )}
                
                {server.map && server.gameType === 'cs2' && (
                  <div className="config-item">
                    <span className="config-label">Map:</span>
                    <span className="config-value">{server.map}</span>
                  </div>
                )}
                
                <div className="config-item">
                  <span className="config-label">Install Path:</span>
                  <span className="config-value path">{server.installPath || 'Not set'}</span>
                </div>
              </div>

              <div className="server-actions">
                {server.status === 'running' ? (
                  <button 
                    className="btn btn-danger btn-small"
                    onClick={() => handleServerAction('stop', server.id)}
                  >
                    Stop Server
                  </button>
                ) : (
                  <button 
                    className="btn btn-success btn-small"
                    onClick={() => handleServerAction('start', server.id)}
                    disabled={server.status === 'starting'}
                  >
                    {server.status === 'starting' ? 'Starting...' : 'Start Server'}
                  </button>
                )}
                
                <button 
                  className="btn btn-secondary btn-small"
                  onClick={() => {
                    setSelectedServer(server);
                    setShowDetailsModal(true);
                  }}
                >
                  Manage
                </button>
                
                <button 
                  className="btn btn-danger btn-small"
                  onClick={() => handleDeleteServer(server)}
                  disabled={server.status === 'running'}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          {servers.length === 0 ? (
            <>
              <div className="empty-icon">🎮</div>
              <h2>No servers found</h2>
              <p>Deploy your first game server to get started</p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.hash = '#library'}
              >
                Deploy Server
              </button>
            </>
          ) : (
            <>
              <div className="empty-icon">🔍</div>
              <h2>No servers match your search</h2>
              <p>Try adjusting your search terms or filters</p>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
              >
                Clear Filters
              </button>
            </>
          )}
        </div>
      )}

      {/* Server Details Modal */}
      {showDetailsModal && selectedServer && (
        <ServerDetailsModal
          server={selectedServer}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedServer(null);
          }}
          onServerAction={handleServerAction}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedServer && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <header className="modal-header">
              <h2>Delete Server</h2>
            </header>
            
            <div className="modal-body">
              <p>Are you sure you want to delete "{selectedServer.name}"?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Delete Server
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerManager;