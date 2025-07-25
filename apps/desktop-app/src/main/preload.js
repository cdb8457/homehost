const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // System information
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Server management
  getServers: () => ipcRenderer.invoke('get-servers'),
  deployServer: (gameConfig) => ipcRenderer.invoke('deploy-server', gameConfig),
  stopServer: (serverId) => ipcRenderer.invoke('stop-server', serverId),
  startServer: (serverId) => ipcRenderer.invoke('start-server', serverId),
  
  // Steam integration
  getSteamGames: () => ipcRenderer.invoke('get-steam-games'),
  installSteamGame: (appId, installPath) => ipcRenderer.invoke('install-steam-game', appId, installPath),
  uninstallSteamGame: (gameId) => ipcRenderer.invoke('uninstall-steam-game', gameId),
  updateSteamGame: (gameId) => ipcRenderer.invoke('update-steam-game', gameId),
  configureSteam: (steamPath) => ipcRenderer.invoke('configure-steam', steamPath),
  getSteamDownloads: () => ipcRenderer.invoke('get-steam-downloads'),
  cancelSteamDownload: (gameId) => ipcRenderer.invoke('cancel-steam-download', gameId),
  checkGameUpdates: () => ipcRenderer.invoke('check-game-updates'),
  
  // SteamCMD specific functions
  getSteamCMDHealth: () => ipcRenderer.invoke('get-steamcmd-health'),
  getActiveInstalls: () => ipcRenderer.invoke('get-active-installs'),
  getInstallProgress: (appId) => ipcRenderer.invoke('get-install-progress', appId),
  cancelInstallation: (appId) => ipcRenderer.invoke('cancel-installation', appId),
  downloadSteamGameList: () => ipcRenderer.invoke('download-steam-game-list'),
  
  // Cloud synchronization
  syncWithCloud: (data) => ipcRenderer.invoke('sync-with-cloud', data),
  
  // File system operations
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  selectFile: (filters) => ipcRenderer.invoke('select-file', filters),
  
  // Notifications
  showNotification: (notification) => ipcRenderer.invoke('show-notification', notification),
  
  // System Optimization
  getSystemSpecs: () => ipcRenderer.invoke('get-system-specs'),
  getOptimizationRecommendations: (gameId, targetPlayerCount) => ipcRenderer.invoke('get-optimization-recommendations', gameId, targetPlayerCount),
  applyOptimizations: (serverConfig, recommendations) => ipcRenderer.invoke('apply-optimizations', serverConfig, recommendations),
  getSystemLoad: () => ipcRenderer.invoke('get-system-load'),
  
  // Server Management
  getServerLogs: (serverId, limit) => ipcRenderer.invoke('get-server-logs', serverId, limit),
  clearServerLogs: (serverId) => ipcRenderer.invoke('clear-server-logs', serverId),
  getLogFiles: (serverId) => ipcRenderer.invoke('get-log-files', serverId),
  sendServerCommand: (serverId, command) => ipcRenderer.invoke('send-server-command', serverId, command),
  getServerConfig: (serverId) => ipcRenderer.invoke('get-server-config', serverId),
  readConfigFile: (serverId, filePath) => ipcRenderer.invoke('read-config-file', serverId, filePath),
  writeConfigFile: (serverId, filePath, content) => ipcRenderer.invoke('write-config-file', serverId, filePath, content),
  createServerBackup: (serverId, name) => ipcRenderer.invoke('create-server-backup', serverId, name),
  getServerBackups: (serverId) => ipcRenderer.invoke('get-server-backups', serverId),
  
  // Server Monitoring
  getServerMetrics: (serverId) => ipcRenderer.invoke('get-server-metrics', serverId),
  getAllServerMetrics: () => ipcRenderer.invoke('get-all-server-metrics'),
  getAlertHistory: (serverId, limit) => ipcRenderer.invoke('get-alert-history', serverId, limit),
  updateAlertThresholds: (thresholds) => ipcRenderer.invoke('update-alert-thresholds', thresholds),
  getMonitoringStatus: () => ipcRenderer.invoke('get-monitoring-status'),
  
  // SignalR/Remote Access
  getSignalRStatus: () => ipcRenderer.invoke('get-signalr-status'),
  getConnectedClients: () => ipcRenderer.invoke('get-connected-clients'),
  getActivePairings: () => ipcRenderer.invoke('get-active-pairings'),
  createDevicePairing: (deviceInfo) => ipcRenderer.invoke('create-device-pairing', deviceInfo),
  revokeDevicePairing: (pairingId) => ipcRenderer.invoke('revoke-device-pairing', pairingId),
  disconnectClient: (clientId) => ipcRenderer.invoke('disconnect-client', clientId),
  getDeviceInfo: () => ipcRenderer.invoke('get-device-info'),
  setDeviceName: (name) => ipcRenderer.invoke('set-device-name', name),
  
  // Authentication APIs
  authGetStatus: () => ipcRenderer.invoke('auth:getStatus'),
  authAuthenticateWithBrowser: () => ipcRenderer.invoke('auth:authenticateWithBrowser'),
  authAuthenticateWithDeviceCode: () => ipcRenderer.invoke('auth:authenticateWithDeviceCode'),
  authHandleCallback: (callbackUrl) => ipcRenderer.invoke('auth:handleCallback', callbackUrl),
  authLogout: () => ipcRenderer.invoke('auth:logout'),
  authRefreshToken: () => ipcRenderer.invoke('auth:refreshToken'),

  // Cloud Sync APIs
  cloudGetConnectionStatus: () => ipcRenderer.invoke('cloud:getConnectionStatus'),
  cloudTestConnection: () => ipcRenderer.invoke('cloud:testConnection'),
  cloudSyncData: (data) => ipcRenderer.invoke('cloud:syncData', data),
  cloudDownloadUserData: () => ipcRenderer.invoke('cloud:downloadUserData'),
  cloudUploadUserProfile: (profileData) => ipcRenderer.invoke('cloud:uploadUserProfile', profileData),
  cloudGetCloudPlugins: () => ipcRenderer.invoke('cloud:getCloudPlugins'),
  cloudDownloadPlugin: (pluginId) => ipcRenderer.invoke('cloud:downloadPlugin', pluginId),
  cloudSyncCommunityData: (communityData) => ipcRenderer.invoke('cloud:syncCommunityData', communityData),
  cloudGetServerMetrics: (serverId) => ipcRenderer.invoke('cloud:getServerMetrics', serverId),
  cloudReportServerStatus: (serverId, status) => ipcRenderer.invoke('cloud:reportServerStatus', serverId, status),

  // Web3 Integration APIs
  getWalletProviders: () => ipcRenderer.invoke('getWalletProviders'),
  getConnectedWallets: () => ipcRenderer.invoke('getConnectedWallets'),
  getSupportedNetworks: () => ipcRenderer.invoke('getSupportedNetworks'),
  getTokenStandards: () => ipcRenderer.invoke('getTokenStandards'),
  getNFTCollections: () => ipcRenderer.invoke('getNFTCollections'),
  getSmartContractTemplates: () => ipcRenderer.invoke('getSmartContractTemplates'),
  getPartnershipPlatforms: () => ipcRenderer.invoke('getPartnershipPlatforms'),
  connectWallet: (providerId, method) => ipcRenderer.invoke('connectWallet', providerId, method),
  disconnectWallet: (walletId) => ipcRenderer.invoke('disconnectWallet', walletId),
  deploySmartContract: (templateId, params) => ipcRenderer.invoke('deploySmartContract', templateId, params),
  mintNFT: (collectionId, metadata) => ipcRenderer.invoke('mintNFT', collectionId, metadata),
  runTokenSimulation: (scenario) => ipcRenderer.invoke('runTokenSimulation', scenario),

  // Real-time monitoring events
  onServerMetricsUpdated: (callback) => ipcRenderer.on('server-metrics-updated', callback),
  onPerformanceAlert: (callback) => ipcRenderer.on('performance-alert', callback),
  onServerHealthUpdated: (callback) => ipcRenderer.on('server-health-updated', callback),
  onServerHealthCritical: (callback) => ipcRenderer.on('server-health-critical', callback),
  onAutoRestartTriggered: (callback) => ipcRenderer.on('auto-restart-triggered', callback),

  // Authentication events
  onAuthSuccess: (callback) => ipcRenderer.on('auth-success', callback),
  onAuthRestored: (callback) => ipcRenderer.on('auth-restored', callback),
  onAuthLogout: (callback) => ipcRenderer.on('auth-logout', callback),
  onAuthExpired: (callback) => ipcRenderer.on('auth-expired', callback),
  onAuthError: (callback) => ipcRenderer.on('auth-error', callback),
  onAuthBrowserOpened: (callback) => ipcRenderer.on('auth-browser-opened', callback),
  onDeviceCodeRequired: (callback) => ipcRenderer.on('device-code-required', callback),
  onDeviceCodeExpired: (callback) => ipcRenderer.on('device-code-expired', callback),
  onTokenRefreshed: (callback) => ipcRenderer.on('token-refreshed', callback),

  // Cloud sync events
  onSyncConnected: (callback) => ipcRenderer.on('sync-connected', callback),
  onSyncDisconnected: (callback) => ipcRenderer.on('sync-disconnected', callback),
  onSyncComplete: (callback) => ipcRenderer.on('sync-complete', callback),
  onSyncError: (callback) => ipcRenderer.on('sync-error', callback),
  onSyncAuthError: (callback) => ipcRenderer.on('sync-auth-error', callback),
  onSyncConnectionFailed: (callback) => ipcRenderer.on('sync-connection-failed', callback),
  
  // Event listeners
  onMenuAction: (callback) => ipcRenderer.on('open-settings', callback),
  onDeployServer: (callback) => ipcRenderer.on('deploy-server', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Expose version info
contextBridge.exposeInMainWorld('appInfo', {
  version: process.env.npm_package_version || '1.0.0',
  platform: process.platform,
  arch: process.arch
});

console.log('Preload script loaded successfully');