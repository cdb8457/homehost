import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import GameLibrary from './components/GameLibrary';
import ServerManager from './components/ServerManager';
import SteamManager from './components/SteamManager';
import RemoteAccess from './components/RemoteAccess';
import Settings from './components/Settings';
import CommunityManager from './components/CommunityManager';
import PluginMarketplace from './components/PluginMarketplace';
import RevenueDashboard from './components/RevenueDashboard';
import PlayerEngagement from './components/PlayerEngagement';
import PluginMarketplaceRevenue from './components/PluginMarketplaceRevenue';
import CommunityGrowthAnalytics from './components/CommunityGrowthAnalytics';
import Web3Integration from './components/Web3Integration';
import Sidebar from './components/Sidebar';
import LoadingScreen from './components/LoadingScreen';
import SecurityMonitor from './components/SecurityMonitor';
import PerformanceDashboard from './components/PerformanceDashboard';
import DeploymentManager from './components/DeploymentManager';
import HealthMonitor from './components/HealthMonitor';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [systemInfo, setSystemInfo] = useState(null);
  const [servers, setServers] = useState([]);
  const [activeMonitor, setActiveMonitor] = useState(null);

  useEffect(() => {
    initializeApp();
    
    // Listen for menu actions
    window.electronAPI.onMenuAction(() => {
      setCurrentView('settings');
    });

    window.electronAPI.onDeployServer(() => {
      setCurrentView('library');
    });

    return () => {
      window.electronAPI.removeAllListeners('open-settings');
      window.electronAPI.removeAllListeners('deploy-server');
    };
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Load system information
      const sysInfo = await window.electronAPI.getSystemInfo();
      setSystemInfo(sysInfo);
      
      // Load existing servers
      const existingServers = await window.electronAPI.getServers();
      setServers(existingServers);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setIsLoading(false);
    }
  };

  const refreshServers = async () => {
    try {
      const updatedServers = await window.electronAPI.getServers();
      setServers(updatedServers);
    } catch (error) {
      console.error('Failed to refresh servers:', error);
    }
  };

  const handleServerAction = async (action, serverId, config) => {
    try {
      switch (action) {
        case 'deploy':
          await window.electronAPI.deployServer(config);
          break;
        case 'start':
          await window.electronAPI.startServer(serverId);
          break;
        case 'stop':
          await window.electronAPI.stopServer(serverId);
          break;
        default:
          console.warn('Unknown server action:', action);
      }
      
      // Refresh servers after any action
      await refreshServers();
    } catch (error) {
      console.error(`Failed to ${action} server:`, error);
      // You could show a toast notification here
    }
  };

  const openMonitor = (monitor) => {
    setActiveMonitor(monitor);
  };

  const closeMonitor = () => {
    setActiveMonitor(null);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        servers={servers}
      />
      
      <main className="main-content">
        {currentView === 'dashboard' && (
          <Dashboard 
            systemInfo={systemInfo}
            servers={servers}
            onServerAction={handleServerAction}
          />
        )}
        
        {currentView === 'library' && (
          <GameLibrary 
            onServerDeploy={(config) => handleServerAction('deploy', null, config)}
            onViewChange={setCurrentView}
          />
        )}
        
        {currentView === 'servers' && (
          <ServerManager 
            servers={servers}
            onServerAction={handleServerAction}
            onRefresh={refreshServers}
          />
        )}
        
        {currentView === 'steam' && (
          <SteamManager />
        )}
        
        {currentView === 'remote' && (
          <RemoteAccess />
        )}
        
        {currentView === 'community' && (
          <CommunityManager />
        )}
        
        {currentView === 'plugins' && (
          <PluginMarketplace />
        )}
        
        {currentView === 'revenue' && (
          <RevenueDashboard />
        )}
        
        {currentView === 'engagement' && (
          <PlayerEngagement />
        )}
        
        {currentView === 'marketplace' && (
          <PluginMarketplaceRevenue />
        )}
        
        {currentView === 'analytics' && (
          <CommunityGrowthAnalytics />
        )}
        
        {currentView === 'web3' && (
          <Web3Integration />
        )}
        
        {currentView === 'settings' && (
          <Settings 
            systemInfo={systemInfo}
            onSystemInfoUpdate={setSystemInfo}
            onOpenMonitor={openMonitor}
          />
        )}
      </main>

      {/* Production Monitoring Dashboards */}
      <SecurityMonitor 
        isVisible={activeMonitor === 'security'} 
        onClose={closeMonitor} 
      />
      <PerformanceDashboard 
        isVisible={activeMonitor === 'performance'} 
        onClose={closeMonitor} 
      />
      <DeploymentManager 
        isVisible={activeMonitor === 'deployment'} 
        onClose={closeMonitor} 
      />
      <HealthMonitor 
        isVisible={activeMonitor === 'health'} 
        onClose={closeMonitor} 
      />
    </div>
  );
}

export default App;