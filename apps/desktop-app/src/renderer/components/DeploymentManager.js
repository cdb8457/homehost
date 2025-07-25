import React, { useState, useEffect, useRef } from 'react';
import './DeploymentManager.css';

/**
 * DeploymentManager Component - Comprehensive deployment management interface
 * 
 * Provides environment management, deployment pipeline controls, rollback capabilities,
 * and deployment monitoring for production-ready applications.
 */
const DeploymentManager = ({ isVisible = true, onClose }) => {
  const [deploymentConfig, setDeploymentConfig] = useState(null);
  const [environments, setEnvironments] = useState({});
  const [deploymentHistory, setDeploymentHistory] = useState([]);
  const [activeDeployments, setActiveDeployments] = useState([]);
  const [deploymentStats, setDeploymentStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('environments');
  const [selectedEnvironment, setSelectedEnvironment] = useState('development');
  const [deploymentInProgress, setDeploymentInProgress] = useState({});
  const [rollbackInProgress, setRollbackInProgress] = useState({});
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      loadDeploymentData();
      startRealTimeUpdates();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible]);

  const loadDeploymentData = async () => {
    try {
      setIsLoading(true);

      // Load deployment configuration
      const config = await window.electronAPI.invoke('deployment:get-configuration');
      setDeploymentConfig(config);

      // Load environment statuses
      const envs = {};
      for (const envName of Object.keys(config.environments)) {
        const status = await window.electronAPI.invoke('deployment:get-environment-status', { environment: envName });
        envs[envName] = status;
      }
      setEnvironments(envs);

      // Load deployment history
      const history = await window.electronAPI.invoke('deployment:get-deployment-history', { limit: 20 });
      setDeploymentHistory(history);

      // Load active deployments
      const active = await window.electronAPI.invoke('deployment:get-active-deployments');
      setActiveDeployments(active);

      // Load deployment statistics
      const stats = await window.electronAPI.invoke('deployment:get-statistics');
      setDeploymentStats(stats);

    } catch (error) {
      console.error('Failed to load deployment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRealTimeUpdates = () => {
    intervalRef.current = setInterval(async () => {
      try {
        // Update active deployments
        const active = await window.electronAPI.invoke('deployment:get-active-deployments');
        setActiveDeployments(active);

        // Update environment statuses
        if (deploymentConfig) {
          const envs = {};
          for (const envName of Object.keys(deploymentConfig.environments)) {
            const status = await window.electronAPI.invoke('deployment:get-environment-status', { environment: envName });
            envs[envName] = status;
          }
          setEnvironments(envs);
        }

      } catch (error) {
        console.error('Failed to update deployment data:', error);
      }
    }, 5000); // Update every 5 seconds
  };

  const deployToEnvironment = async (environment, options = {}) => {
    try {
      setDeploymentInProgress(prev => ({ ...prev, [environment]: true }));

      const deploymentResult = await window.electronAPI.invoke('deployment:deploy', {
        environment,
        options: {
          skipTests: options.skipTests || false,
          forceRedeploy: options.forceRedeploy || false,
          ...options
        }
      });

      console.log(`Deployment to ${environment} initiated:`, deploymentResult);

      // Refresh data
      await loadDeploymentData();

    } catch (error) {
      console.error(`Deployment to ${environment} failed:`, error);
    } finally {
      setDeploymentInProgress(prev => ({ ...prev, [environment]: false }));
    }
  };

  const rollbackEnvironment = async (environment, targetVersion = null) => {
    try {
      setRollbackInProgress(prev => ({ ...prev, [environment]: true }));

      const rollbackResult = await window.electronAPI.invoke('deployment:rollback', {
        environment,
        targetVersion
      });

      console.log(`Rollback of ${environment} initiated:`, rollbackResult);

      // Refresh data
      await loadDeploymentData();

    } catch (error) {
      console.error(`Rollback of ${environment} failed:`, error);
    } finally {
      setRollbackInProgress(prev => ({ ...prev, [environment]: false }));
    }
  };

  const cancelDeployment = async (deploymentId) => {
    try {
      await window.electronAPI.invoke('deployment:cancel', { deploymentId });
      console.log(`Deployment ${deploymentId} cancelled`);

      // Refresh data
      await loadDeploymentData();

    } catch (error) {
      console.error(`Failed to cancel deployment ${deploymentId}:`, error);
    }
  };

  const exportDeploymentData = async () => {
    try {
      const exportData = await window.electronAPI.invoke('deployment:export-data');
      
      // Create download link
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `deployment-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export deployment data:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'deployed':
      case 'success':
        return '#22c55e';
      case 'deploying':
      case 'building':
      case 'in_progress':
        return '#3b82f6';
      case 'warning':
      case 'degraded':
        return '#f59e0b';
      case 'failed':
      case 'error':
      case 'unhealthy':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getEnvironmentPriority = (envName) => {
    const priorities = { production: 3, staging: 2, development: 1 };
    return priorities[envName] || 0;
  };

  const renderEnvironmentsTab = () => (
    <div className="deployment-environments">
      <div className="environments-header">
        <h3>Environment Management</h3>
        <div className="environment-controls">
          <select 
            value={selectedEnvironment} 
            onChange={(e) => setSelectedEnvironment(e.target.value)}
            className="environment-selector"
          >
            {deploymentConfig && Object.keys(deploymentConfig.environments)
              .sort((a, b) => getEnvironmentPriority(b) - getEnvironmentPriority(a))
              .map(envName => (
                <option key={envName} value={envName}>
                  {envName.charAt(0).toUpperCase() + envName.slice(1)}
                </option>
              ))}
          </select>
          <button 
            className="export-button"
            onClick={exportDeploymentData}
          >
            Export Data
          </button>
        </div>
      </div>

      <div className="environments-grid">
        {deploymentConfig && Object.entries(deploymentConfig.environments)
          .sort(([a], [b]) => getEnvironmentPriority(b) - getEnvironmentPriority(a))
          .map(([envName, envConfig]) => {
            const envStatus = environments[envName];
            const isDeploying = deploymentInProgress[envName] || activeDeployments.some(d => d.environment === envName);
            const isRollingBack = rollbackInProgress[envName];

            return (
              <div key={envName} className={`environment-card ${envName}`}>
                <div className="environment-header">
                  <div className="environment-info">
                    <h4>{envName.charAt(0).toUpperCase() + envName.slice(1)}</h4>
                    <div 
                      className={`environment-status ${envStatus?.status || 'unknown'}`}
                      style={{ color: getStatusColor(envStatus?.status) }}
                    >
                      {envStatus?.status || 'Unknown'}
                    </div>
                  </div>
                  <div className="environment-actions">
                    <button 
                      className={`deploy-button ${isDeploying ? 'deploying' : ''}`}
                      onClick={() => deployToEnvironment(envName)}
                      disabled={isDeploying || isRollingBack}
                    >
                      {isDeploying ? 'Deploying...' : 'Deploy'}
                    </button>
                    {envStatus?.lastDeployment && (
                      <button 
                        className={`rollback-button ${isRollingBack ? 'rolling-back' : ''}`}
                        onClick={() => rollbackEnvironment(envName)}
                        disabled={isDeploying || isRollingBack}
                      >
                        {isRollingBack ? 'Rolling Back...' : 'Rollback'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="environment-details">
                  {envStatus?.lastDeployment && (
                    <div className="deployment-info">
                      <div className="info-item">
                        <span className="info-label">Version:</span>
                        <span className="info-value">{envStatus.lastDeployment.version}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Deployed:</span>
                        <span className="info-value">{formatTimestamp(envStatus.lastDeployment.timestamp)}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Duration:</span>
                        <span className="info-value">
                          {envStatus.lastDeployment.duration ? formatDuration(envStatus.lastDeployment.duration) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="environment-config">
                    <div className="config-item">
                      <span className="config-label">Build Script:</span>
                      <span className="config-value">{envConfig.buildScript}</span>
                    </div>
                    <div className="config-item">
                      <span className="config-label">Output Dir:</span>
                      <span className="config-value">{envConfig.outputDir}</span>
                    </div>
                    <div className="config-item">
                      <span className="config-label">Health Check:</span>
                      <span className="config-value">{envConfig.healthCheckUrl}</span>
                    </div>
                    <div className="config-item">
                      <span className="config-label">Backup:</span>
                      <span className="config-value">{envConfig.backupEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>

                {envStatus?.isDeploying && (
                  <div className="deployment-progress">
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                    <span className="progress-text">
                      {envStatus.deploymentStep || 'Deploying...'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );

  const renderDeploymentsTab = () => (
    <div className="deployment-history">
      <div className="deployments-header">
        <h3>Deployment History</h3>
        <div className="deployment-summary">
          {deploymentStats && (
            <>
              <span className="summary-item">
                <span className="summary-value">{deploymentStats.totalDeployments}</span>
                <span className="summary-label">Total</span>
              </span>
              <span className="summary-item">
                <span className="summary-value success">{deploymentStats.successfulDeployments}</span>
                <span className="summary-label">Successful</span>
              </span>
              <span className="summary-item">
                <span className="summary-value failed">{deploymentStats.failedDeployments}</span>
                <span className="summary-label">Failed</span>
              </span>
              <span className="summary-item">
                <span className="summary-value rollback">{deploymentStats.rollbacks}</span>
                <span className="summary-label">Rollbacks</span>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="deployments-list">
        {deploymentHistory.map((deployment) => (
          <div key={deployment.id} className={`deployment-item ${deployment.status}`}>
            <div className="deployment-main">
              <div className="deployment-header">
                <div className="deployment-env">
                  <span className={`env-badge ${deployment.environment}`}>
                    {deployment.environment.toUpperCase()}
                  </span>
                </div>
                <div className="deployment-version">
                  <span className="version-text">v{deployment.version}</span>
                </div>
                <div className="deployment-time">
                  {formatTimestamp(deployment.timestamp)}
                </div>
                <div 
                  className={`deployment-status ${deployment.status}`}
                  style={{ color: getStatusColor(deployment.status) }}
                >
                  {deployment.status.toUpperCase()}
                </div>
              </div>

              <div className="deployment-details">
                <div className="detail-item">
                  <span className="detail-label">Build:</span>
                  <span className="detail-value">#{deployment.buildNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">
                    {deployment.duration ? formatDuration(deployment.duration) : 'N/A'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Triggered by:</span>
                  <span className="detail-value">{deployment.triggeredBy || 'Unknown'}</span>
                </div>
              </div>

              {deployment.commit && (
                <div className="deployment-commit">
                  <span className="commit-hash">{deployment.commit.hash.substring(0, 7)}</span>
                  <span className="commit-message">{deployment.commit.message}</span>
                </div>
              )}

              {deployment.error && (
                <div className="deployment-error">
                  <span className="error-label">Error:</span>
                  <span className="error-message">{deployment.error}</span>
                </div>
              )}
            </div>

            <div className="deployment-actions">
              {deployment.status === 'success' && deployment.environment !== 'production' && (
                <button 
                  className="rollback-to-button"
                  onClick={() => rollbackEnvironment(deployment.environment, deployment.version)}
                  disabled={rollbackInProgress[deployment.environment]}
                >
                  Rollback to This
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActiveTab = () => (
    <div className="active-deployments">
      <div className="active-header">
        <h3>Active Deployments</h3>
        <div className="active-count">
          {activeDeployments.length} {activeDeployments.length === 1 ? 'deployment' : 'deployments'} in progress
        </div>
      </div>

      {activeDeployments.length === 0 ? (
        <div className="no-active-deployments">
          <div className="empty-state">
            <span className="empty-icon">🚀</span>
            <span className="empty-text">No active deployments</span>
            <span className="empty-subtext">Start a deployment to see it here</span>
          </div>
        </div>
      ) : (
        <div className="active-deployments-list">
          {activeDeployments.map((deployment) => (
            <div key={deployment.id} className="active-deployment-item">
              <div className="active-deployment-header">
                <div className="active-deployment-env">
                  <span className={`env-badge ${deployment.environment}`}>
                    {deployment.environment.toUpperCase()}
                  </span>
                </div>
                <div className="active-deployment-progress">
                  <span className="progress-step">{deployment.currentStep}</span>
                  <span className="progress-percentage">{deployment.progress}%</span>
                </div>
                <div className="active-deployment-actions">
                  <button 
                    className="cancel-button"
                    onClick={() => cancelDeployment(deployment.id)}
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div className="active-deployment-details">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${deployment.progress}%` }}
                  ></div>
                </div>
                <div className="deployment-steps">
                  {deployment.steps && deployment.steps.map((step, index) => (
                    <div 
                      key={index} 
                      className={`step-item ${
                        index < deployment.currentStepIndex ? 'completed' : 
                        index === deployment.currentStepIndex ? 'active' : 'pending'
                      }`}
                    >
                      <span className="step-name">{step.name}</span>
                      {step.duration && (
                        <span className="step-duration">{formatDuration(step.duration)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="active-deployment-info">
                <div className="info-item">
                  <span className="info-label">Started:</span>
                  <span className="info-value">{formatTimestamp(deployment.startedAt)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Elapsed:</span>
                  <span className="info-value">
                    {formatDuration(Date.now() - deployment.startedAt)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Version:</span>
                  <span className="info-value">v{deployment.version}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="deployment-manager">
      <div className="deployment-manager-header">
        <h2>Deployment Manager</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="deployment-manager-tabs">
        <button 
          className={`tab-button ${activeTab === 'environments' ? 'active' : ''}`}
          onClick={() => setActiveTab('environments')}
        >
          Environments
        </button>
        <button 
          className={`tab-button ${activeTab === 'deployments' ? 'active' : ''}`}
          onClick={() => setActiveTab('deployments')}
        >
          History
        </button>
        <button 
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active ({activeDeployments.length})
        </button>
      </div>

      <div className="deployment-manager-content">
        {isLoading ? (
          <div className="loading">Loading deployment data...</div>
        ) : (
          <>
            {activeTab === 'environments' && renderEnvironmentsTab()}
            {activeTab === 'deployments' && renderDeploymentsTab()}
            {activeTab === 'active' && renderActiveTab()}
          </>
        )}
      </div>
    </div>
  );
};

export default DeploymentManager;