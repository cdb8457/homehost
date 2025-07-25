import React, { useState, useEffect } from 'react';
import './SystemOptimizer.css';

const SystemOptimizer = ({ gameType, onRecommendationsReceived }) => {
  const [systemSpecs, setSystemSpecs] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [systemLoad, setSystemLoad] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [targetPlayerCount, setTargetPlayerCount] = useState(10);

  useEffect(() => {
    loadSystemSpecs();
    
    // Start monitoring system load every 5 seconds
    const loadInterval = setInterval(loadSystemLoad, 5000);
    
    return () => clearInterval(loadInterval);
  }, []);

  useEffect(() => {
    if (gameType && systemSpecs) {
      generateRecommendations();
    }
  }, [gameType, targetPlayerCount, systemSpecs]);

  const loadSystemSpecs = async () => {
    try {
      setLoading(true);
      const specs = await window.electronAPI.getSystemSpecs();
      setSystemSpecs(specs);
    } catch (err) {
      setError(`Failed to load system specs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemLoad = async () => {
    try {
      const load = await window.electronAPI.getSystemLoad();
      setSystemLoad(load);
    } catch (err) {
      console.warn('Failed to load system load:', err);
    }
  };

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      const recs = await window.electronAPI.getOptimizationRecommendations(gameType, targetPlayerCount);
      setRecommendations(recs);
      
      if (onRecommendationsReceived) {
        onRecommendationsReceived(recs);
      }
    } catch (err) {
      setError(`Failed to generate recommendations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendations = async (serverConfig) => {
    try {
      if (!recommendations) return;
      
      const optimizedConfig = await window.electronAPI.applyOptimizations(serverConfig, recommendations);
      
      await window.electronAPI.showNotification({
        title: 'Optimization Applied',
        body: 'Server configuration has been optimized based on your hardware.'
      });
      
      return optimizedConfig;
    } catch (err) {
      setError(`Failed to apply optimizations: ${err.message}`);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#4CAF50';
    if (confidence >= 60) return '#FF9800';
    return '#F44336';
  };

  const getConfigLevelColor = (level) => {
    switch (level) {
      case 'optimal': return '#4CAF50';
      case 'recommended': return '#2196F3';
      case 'minimum': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  if (loading && !systemSpecs) {
    return (
      <div className="system-optimizer loading">
        <div className="loading-spinner"></div>
        <p>Analyzing your system...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="system-optimizer error">
        <h3>❌ Error</h3>
        <p>{error}</p>
        <button onClick={loadSystemSpecs}>Retry</button>
      </div>
    );
  }

  return (
    <div className="system-optimizer">
      <div className="optimizer-header">
        <h2>🔧 System Optimizer</h2>
        <div className="system-status">
          {systemLoad && (
            <div className="system-load">
              <span className="load-indicator">
                CPU: {systemLoad.cpu}% | RAM: {systemLoad.memory}%
              </span>
            </div>
          )}
        </div>
      </div>

      {systemSpecs && (
        <div className="system-specs">
          <h3>🖥️ System Specifications</h3>
          <div className="specs-grid">
            <div className="spec-item">
              <span className="spec-label">CPU</span>
              <span className="spec-value">
                {systemSpecs.cpu.model} ({systemSpecs.cpu.cores} cores @ {systemSpecs.cpu.frequency}GHz)
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Memory</span>
              <span className="spec-value">
                {systemSpecs.memory.available}GB / {systemSpecs.memory.total}GB available
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Network</span>
              <span className="spec-value">
                {systemSpecs.network.downloadSpeed}Mbps down / {systemSpecs.network.uploadSpeed}Mbps up
              </span>
            </div>
          </div>
        </div>
      )}

      {gameType && (
        <div className="optimization-controls">
          <h3>🎯 Optimization Settings</h3>
          <div className="controls-row">
            <div className="control-group">
              <label htmlFor="playerCount">Target Player Count:</label>
              <input
                id="playerCount"
                type="number"
                min="1"
                max="200"
                value={targetPlayerCount}
                onChange={(e) => setTargetPlayerCount(parseInt(e.target.value))}
              />
            </div>
            <button onClick={generateRecommendations} disabled={loading}>
              {loading ? 'Analyzing...' : 'Generate Recommendations'}
            </button>
          </div>
        </div>
      )}

      {recommendations && (
        <div className="recommendations">
          <h3>📊 Optimization Recommendations</h3>
          
          <div className="recommendation-summary">
            <div className="summary-card">
              <div className="card-header">
                <span className="card-title">Configuration Level</span>
                <span 
                  className="level-badge" 
                  style={{ backgroundColor: getConfigLevelColor(recommendations.configurationLevel) }}
                >
                  {recommendations.configurationLevel.toUpperCase()}
                </span>
              </div>
              <div className="card-body">
                <div className="confidence-meter">
                  <div className="confidence-label">Confidence</div>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ 
                        width: `${recommendations.confidence}%`,
                        backgroundColor: getConfidenceColor(recommendations.confidence)
                      }}
                    ></div>
                  </div>
                  <div className="confidence-text">{recommendations.confidence}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="performance-estimates">
            <h4>📈 Expected Performance</h4>
            <div className="performance-grid">
              <div className="performance-item">
                <span className="performance-label">Max Players</span>
                <span className="performance-value">{recommendations.estimatedPerformance.maxPlayers}</span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Tick Rate</span>
                <span className="performance-value">{recommendations.estimatedPerformance.expectedTPS} TPS</span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Latency</span>
                <span className="performance-value">{recommendations.estimatedPerformance.expectedLatency}ms</span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Stability</span>
                <span className="performance-value">{recommendations.estimatedPerformance.stability}%</span>
              </div>
            </div>
          </div>

          <div className="server-config">
            <h4>⚙️ Recommended Server Configuration</h4>
            <div className="config-grid">
              <div className="config-item">
                <span className="config-label">Max Players</span>
                <span className="config-value">{recommendations.serverConfig.maxPlayers}</span>
              </div>
              <div className="config-item">
                <span className="config-label">Tick Rate</span>
                <span className="config-value">{recommendations.serverConfig.tickRate}</span>
              </div>
              <div className="config-item">
                <span className="config-label">Memory Allocation</span>
                <span className="config-value">{Math.round(recommendations.serverConfig.memoryAllocation / 1024)}MB</span>
              </div>
              <div className="config-item">
                <span className="config-label">Thread Count</span>
                <span className="config-value">{recommendations.serverConfig.threadCount}</span>
              </div>
            </div>
          </div>

          {recommendations.warnings && recommendations.warnings.length > 0 && (
            <div className="warnings">
              <h4>⚠️ Warnings</h4>
              <ul>
                {recommendations.warnings.map((warning, index) => (
                  <li key={index} className={`warning-item ${warning.severity}`}>
                    <strong>{warning.message}</strong>
                    <p>{warning.suggestion}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendations.suggestions && recommendations.suggestions.length > 0 && (
            <div className="suggestions">
              <h4>💡 Suggestions</h4>
              <ul>
                {recommendations.suggestions.map((suggestion, index) => (
                  <li key={index} className="suggestion-item">
                    <strong>{suggestion.message}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SystemOptimizer;