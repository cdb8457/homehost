import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="logo-container">
          <span className="loading-logo">🏡</span>
          <h1 className="loading-title">HomeHost</h1>
          <p className="loading-subtitle">Desktop Gaming Server Manager</p>
        </div>
        
        <div className="loading-animation">
          <div className="spinner-container">
            <div className="spinner"></div>
            <div className="spinner-inner"></div>
          </div>
          <p className="loading-text">Initializing services...</p>
        </div>

        <div className="loading-stats">
          <div className="stat-item">
            <span className="stat-icon">🖥️</span>
            <span className="stat-label">System Monitor</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🎮</span>
            <span className="stat-label">Game Manager</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">☁️</span>
            <span className="stat-label">Cloud Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;