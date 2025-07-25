import React, { useState, useEffect } from 'react';
import './RemoteAccess.css';

const RemoteAccess = () => {
  const [signalRStatus, setSignalRStatus] = useState(null);
  const [connectedClients, setConnectedClients] = useState([]);
  const [activePairings, setActivePairings] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newPairingCode, setNewPairingCode] = useState(null);
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [pairingDevice, setPairingDevice] = useState({ name: '', type: 'web' });

  useEffect(() => {
    loadRemoteAccessData();
    
    // Set up auto-refresh
    const interval = setInterval(loadRemoteAccessData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadRemoteAccessData = async () => {
    try {
      const [status, clients, pairings, device] = await Promise.all([
        window.electronAPI.getSignalRStatus(),
        window.electronAPI.getConnectedClients(),
        window.electronAPI.getActivePairings(),
        window.electronAPI.getDeviceInfo()
      ]);

      setSignalRStatus(status);
      setConnectedClients(clients);
      setActivePairings(pairings);
      setDeviceInfo(device);
    } catch (error) {
      console.error('Failed to load remote access data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPairing = async () => {
    try {
      const pairing = await window.electronAPI.createDevicePairing({
        deviceName: pairingDevice.name || 'Web Client',
        deviceType: pairingDevice.type
      });

      setNewPairingCode(pairing);
      await loadRemoteAccessData();
    } catch (error) {
      console.error('Failed to create pairing:', error);
    }
  };

  const revokePairing = async (pairingId) => {
    try {
      await window.electronAPI.revokeDevicePairing(pairingId);
      await loadRemoteAccessData();
    } catch (error) {
      console.error('Failed to revoke pairing:', error);
    }
  };

  const disconnectClient = async (clientId) => {
    try {
      await window.electronAPI.disconnectClient(clientId);
      await loadRemoteAccessData();
    } catch (error) {
      console.error('Failed to disconnect client:', error);
    }
  };

  const updateDeviceName = async (newName) => {
    try {
      await window.electronAPI.setDeviceName(newName);
      await loadRemoteAccessData();
    } catch (error) {
      console.error('Failed to update device name:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="remote-access loading">
        <div className="loading-spinner">Loading remote access...</div>
      </div>
    );
  }

  return (
    <div className="remote-access">
      <div className="remote-access-header">
        <h1>Remote Access</h1>
        <p>Manage remote connections to your HomeHost server</p>
      </div>

      {/* Status Overview */}
      <div className="status-grid">
        <div className="status-card server-status">
          <div className="status-icon">🌐</div>
          <div className="status-content">
            <div className="status-title">Server Status</div>
            <div className={`status-value ${signalRStatus?.isRunning ? 'running' : 'stopped'}`}>
              {signalRStatus?.isRunning ? 'Running' : 'Stopped'}
            </div>
            {signalRStatus?.isRunning && (
              <div className="status-detail">Port: {signalRStatus.port}</div>
            )}
          </div>
        </div>

        <div className="status-card clients-status">
          <div className="status-icon">📱</div>
          <div className="status-content">
            <div className="status-title">Connected Clients</div>
            <div className="status-value">{connectedClients.length}</div>
            <div className="status-detail">Active connections</div>
          </div>
        </div>

        <div className="status-card uptime-status">
          <div className="status-icon">⏰</div>
          <div className="status-content">
            <div className="status-title">Uptime</div>
            <div className="status-value">{formatUptime(signalRStatus?.uptime || 0)}</div>
            <div className="status-detail">Server running time</div>
          </div>
        </div>

        <div className="status-card device-status">
          <div className="status-icon">💻</div>
          <div className="status-content">
            <div className="status-title">This Device</div>
            <div className="status-value">{deviceInfo?.deviceName}</div>
            <div className="status-detail">{deviceInfo?.platform}</div>
          </div>
        </div>
      </div>

      {/* Device Configuration */}
      <div className="config-section">
        <h3>Device Configuration</h3>
        <div className="device-config">
          <div className="config-item">
            <label>Device Name:</label>
            <input
              type="text"
              value={deviceInfo?.deviceName || ''}
              onChange={(e) => setDeviceInfo(prev => ({ ...prev, deviceName: e.target.value }))}
              onBlur={(e) => updateDeviceName(e.target.value)}
              placeholder="Enter device name"
            />
          </div>
          <div className="config-item">
            <label>Device ID:</label>
            <div className="device-id">
              <span>{deviceInfo?.deviceId}</span>
              <button
                className="btn btn-small btn-secondary"
                onClick={() => copyToClipboard(deviceInfo?.deviceId)}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Clients */}
      <div className="clients-section">
        <div className="section-header">
          <h3>Connected Clients ({connectedClients.length})</h3>
        </div>

        {connectedClients.length > 0 ? (
          <div className="clients-list">
            {connectedClients.map(client => (
              <div key={client.id} className="client-item">
                <div className="client-info">
                  <div className="client-name">{client.deviceName}</div>
                  <div className="client-meta">
                    <span className="client-type">{client.deviceType}</span>
                    <span className="client-id">{client.id}</span>
                  </div>
                  <div className="client-times">
                    <span>Connected: {formatTimestamp(client.connectedAt)}</span>
                    <span>Last Activity: {formatTimestamp(client.lastActivity)}</span>
                  </div>
                </div>
                <div className="client-actions">
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => disconnectClient(client.id)}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📱</div>
            <div className="empty-text">No clients connected</div>
            <div className="empty-subtext">Create a pairing code to allow devices to connect</div>
          </div>
        )}
      </div>

      {/* Device Pairing */}
      <div className="pairing-section">
        <div className="section-header">
          <h3>Device Pairing</h3>
          <button
            className="btn btn-primary"
            onClick={() => setShowPairingModal(true)}
          >
            Create Pairing Code
          </button>
        </div>

        {activePairings.length > 0 && (
          <div className="pairings-list">
            {activePairings.map(pairing => (
              <div key={pairing.id} className="pairing-item">
                <div className="pairing-info">
                  <div className="pairing-code">{pairing.pairingCode}</div>
                  <div className="pairing-details">
                    <span>Device: {pairing.deviceName}</span>
                    <span>Type: {pairing.deviceType}</span>
                    <span>Expires: {formatTimestamp(pairing.expires)}</span>
                  </div>
                </div>
                <div className="pairing-actions">
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => copyToClipboard(pairing.pairingCode)}
                  >
                    Copy Code
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => revokePairing(pairing.id)}
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Pairing Code Modal */}
      {newPairingCode && (
        <div className="modal-overlay" onClick={() => setNewPairingCode(null)}>
          <div className="pairing-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Pairing Code Created</h3>
              <button
                className="close-btn"
                onClick={() => setNewPairingCode(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="pairing-code-display">
                <div className="code-label">Pairing Code:</div>
                <div className="code-value">{newPairingCode.pairingCode}</div>
                <button
                  className="btn btn-secondary"
                  onClick={() => copyToClipboard(newPairingCode.pairingCode)}
                >
                  Copy to Clipboard
                </button>
              </div>
              <div className="pairing-instructions">
                <p>Share this code with the device you want to connect.</p>
                <p>The code expires in 5 minutes.</p>
                <p>Once used, the code cannot be reused.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Pairing Modal */}
      {showPairingModal && (
        <div className="modal-overlay" onClick={() => setShowPairingModal(false)}>
          <div className="pairing-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Device Pairing</h3>
              <button
                className="close-btn"
                onClick={() => setShowPairingModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Device Name:</label>
                <input
                  type="text"
                  value={pairingDevice.name}
                  onChange={(e) => setPairingDevice(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., My Phone, Work Laptop"
                />
              </div>
              <div className="form-group">
                <label>Device Type:</label>
                <select
                  value={pairingDevice.type}
                  onChange={(e) => setPairingDevice(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="web">Web Browser</option>
                  <option value="mobile">Mobile App</option>
                  <option value="desktop">Desktop App</option>
                  <option value="api">API Client</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowPairingModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    createPairing();
                    setShowPairingModal(false);
                  }}
                >
                  Create Pairing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemoteAccess;