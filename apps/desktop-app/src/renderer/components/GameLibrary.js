import React, { useState, useEffect } from 'react';
import './GameLibrary.css';
import SystemOptimizer from './SystemOptimizer';

const GameLibrary = ({ onServerDeploy, onViewChange }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [steamGames, setSteamGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);

  // Supported games with rich metadata
  const supportedGames = [
    {
      id: 'valheim',
      name: 'Valheim',
      tagline: 'A brutal exploration and survival game',
      description: 'Valheim is a game about exploring a huge fantasy world inspired by norse mythology and viking culture.',
      image: '/images/placeholder.svg',
      category: 'Survival',
      players: '1-10 players',
      difficulty: 'Medium',
      requirements: {
        ram: '4GB',
        cpu: '2 cores',
        disk: '2GB'
      },
      features: [
        'Dedicated server support',
        'Cross-platform play',
        'World persistence',
        'Mod support'
      ],
      defaultPort: 2456,
      steamAppId: '896660'
    },
    {
      id: 'rust',
      name: 'Rust',
      tagline: 'The only aim in Rust is to survive',
      description: 'Rust is a multiplayer-only survival video game where players must survive in a hostile environment.',
      image: '/images/placeholder.svg',
      category: 'Survival',
      players: '1-200 players',
      difficulty: 'Hard',
      requirements: {
        ram: '8GB',
        cpu: '4 cores',
        disk: '20GB'
      },
      features: [
        'Large-scale multiplayer',
        'Base building',
        'Resource gathering',
        'PvP combat'
      ],
      defaultPort: 28015,
      steamAppId: '258550'
    },
    {
      id: 'cs2',
      name: 'Counter-Strike 2',
      tagline: 'The legendary FPS returns',
      description: 'Counter-Strike 2 is a free-to-play tactical first-person shooter and the fourth game in the Counter-Strike series.',
      image: '/images/placeholder.svg',
      category: 'FPS',
      players: '2-32 players',
      difficulty: 'Easy',
      requirements: {
        ram: '2GB',
        cpu: '2 cores',
        disk: '15GB'
      },
      features: [
        'Competitive matchmaking',
        'Custom maps',
        'Workshop integration',
        'Anti-cheat'
      ],
      defaultPort: 27015,
      steamAppId: '730'
    },
    {
      id: 'seven_days',
      name: '7 Days to Die',
      tagline: 'Survive the zombie apocalypse',
      description: '7 Days to Die is an open-world game that is a unique combination of first person shooter, survival horror, tower defense, and role-playing games.',
      image: '/images/placeholder.svg',
      category: 'Survival Horror',
      players: '1-16 players',
      difficulty: 'Medium',
      requirements: {
        ram: '6GB',
        cpu: '3 cores',
        disk: '12GB'
      },
      features: [
        'Zombie hordes',
        'Base fortification',
        'Crafting system',
        'Day/night cycle'
      ],
      defaultPort: 26900,
      steamAppId: '294420'
    },
    {
      id: 'motor_town',
      name: 'MotorTown: Behind Closed Doors',
      tagline: 'Psychological horror adventure',
      description: 'MotorTown: Behind Closed Doors is a psychological horror ghost story about Luke, whose daughter disappeared.',
      image: '/images/placeholder.svg',
      category: 'Horror',
      players: '1-8 players',
      difficulty: 'Easy',
      requirements: {
        ram: '3GB',
        cpu: '2 cores',
        disk: '8GB'
      },
      features: [
        'Co-op story mode',
        'Psychological horror',
        'Investigation gameplay',
        'Multiplayer support'
      ],
      defaultPort: 27016,
      steamAppId: '1090000'
    }
  ];

  useEffect(() => {
    loadSteamGames();
  }, []);

  const loadSteamGames = async () => {
    try {
      setIsLoading(true);
      const games = await window.electronAPI.getSteamGames();
      setSteamGames(games);
    } catch (error) {
      console.error('Failed to load Steam games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameSelect = (game) => {
    setSelectedGame(game);
  };

  const handleDeployServer = (game) => {
    setSelectedGame(game);
    setShowDeployModal(true);
  };

  const handleInstallGame = async (game) => {
    try {
      setIsLoading(true);
      await window.electronAPI.installSteamGame(game.steamAppId);
      await loadSteamGames(); // Refresh the list
    } catch (error) {
      console.error('Failed to install game:', error);
      // Show error notification
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="game-library">
      <header className="library-header">
        <h1>Game Library</h1>
        <p>Choose a game to deploy your server</p>
      </header>

      {/* Featured Game Banner */}
      {selectedGame ? (
        <div className="featured-game">
          <div className="featured-background">
            <img src={selectedGame.image} alt={selectedGame.name} />
            <div className="featured-overlay"></div>
          </div>
          <div className="featured-content">
            <div className="featured-info">
              <h2 className="featured-title">{selectedGame.name}</h2>
              <p className="featured-tagline">{selectedGame.tagline}</p>
              <p className="featured-description">{selectedGame.description}</p>
              
              <div className="featured-meta">
                <span className="meta-badge">{selectedGame.category}</span>
                <span className="meta-badge">{selectedGame.players}</span>
                <span className="meta-badge difficulty-{selectedGame.difficulty.toLowerCase()}">{selectedGame.difficulty}</span>
              </div>

              <div className="featured-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleDeployServer(selectedGame)}
                >
                  Deploy Server
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleInstallGame(selectedGame)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Installing...' : 'Install Game'}
                </button>
              </div>
            </div>

            <div className="featured-requirements">
              <h4>Requirements</h4>
              <div className="requirement-list">
                <div className="requirement">
                  <span className="req-icon">💾</span>
                  <span>RAM: {selectedGame.requirements.ram}</span>
                </div>
                <div className="requirement">
                  <span className="req-icon">⚡</span>
                  <span>CPU: {selectedGame.requirements.cpu}</span>
                </div>
                <div className="requirement">
                  <span className="req-icon">💿</span>
                  <span>Disk: {selectedGame.requirements.disk}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="featured-placeholder">
          <h2>🎮 Select a game to see details</h2>
          <p>Browse our supported games below and click to learn more</p>
        </div>
      )}

      {/* Game Grid */}
      <section className="games-section">
        <h3>Supported Games</h3>
        <div className="games-grid">
          {supportedGames.map(game => (
            <div 
              key={game.id} 
              className={`game-card ${selectedGame?.id === game.id ? 'selected' : ''}`}
              onClick={() => handleGameSelect(game)}
            >
              <div className="game-image">
                <img src={game.image} alt={game.name} />
                <div className="game-overlay">
                  <button 
                    className="deploy-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeployServer(game);
                    }}
                  >
                    Deploy
                  </button>
                </div>
              </div>
              <div className="game-info">
                <h4 className="game-title">{game.name}</h4>
                <p className="game-category">{game.category}</p>
                <div className="game-features">
                  {game.features.slice(0, 2).map((feature, index) => (
                    <span key={index} className="feature-tag">{feature}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deploy Modal */}
      {showDeployModal && selectedGame && (
        <DeployServerModal
          game={selectedGame}
          onClose={() => setShowDeployModal(false)}
          onDeploy={onServerDeploy}
          onViewChange={onViewChange}
        />
      )}
    </div>
  );
};

// Deploy Server Modal Component
const DeployServerModal = ({ game, onClose, onDeploy, onViewChange }) => {
  const [config, setConfig] = useState({
    name: `${game.name} Server`,
    gameType: game.id,
    port: game.defaultPort,
    maxPlayers: 10,
    password: '',
    worldName: 'Dedicated',
    map: 'de_dust2',
    installPath: ''
  });

  const [isDeploying, setIsDeploying] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [optimizationRecommendations, setOptimizationRecommendations] = useState(null);

  const handleDeploy = async () => {
    try {
      setIsDeploying(true);
      
      // Apply optimizations if available
      let finalConfig = config;
      if (optimizationRecommendations) {
        finalConfig = await window.electronAPI.applyOptimizations(config, optimizationRecommendations);
      }
      
      await onDeploy(finalConfig);
      onClose();
      onViewChange('servers'); // Navigate to servers view
    } catch (error) {
      console.error('Failed to deploy server:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleOptimizationRecommendations = (recommendations) => {
    setOptimizationRecommendations(recommendations);
    
    // Auto-apply some recommendations to the config
    if (recommendations.serverConfig) {
      setConfig(prev => ({
        ...prev,
        maxPlayers: recommendations.serverConfig.maxPlayers,
        // Add other recommended settings
      }));
    }
  };

  const selectInstallPath = async () => {
    try {
      const path = await window.electronAPI.selectDirectory();
      if (path) {
        setConfig(prev => ({ ...prev, installPath: path }));
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="deploy-modal">
        <header className="modal-header">
          <h2>Deploy {game.name} Server</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </header>

        <div className="modal-body">
          <div className="modal-tabs">
            <button 
              className={`tab-btn ${!showOptimizer ? 'active' : ''}`}
              onClick={() => setShowOptimizer(false)}
            >
              Server Configuration
            </button>
            <button 
              className={`tab-btn ${showOptimizer ? 'active' : ''}`}
              onClick={() => setShowOptimizer(true)}
            >
              System Optimization
            </button>
          </div>

          {!showOptimizer ? (
            <div className="config-form">
              <div className="form-group">
                <label className="form-label">Server Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={config.name}
                  onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Port</label>
              <input
                type="number"
                className="form-input"
                value={config.port}
                onChange={(e) => setConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Players</label>
              <input
                type="number"
                className="form-input"
                value={config.maxPlayers}
                onChange={(e) => setConfig(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Server Password (Optional)</label>
            <input
              type="password"
              className="form-input"
              value={config.password}
              onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Leave empty for public server"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Installation Path</label>
            <div className="path-selector">
              <input
                type="text"
                className="form-input"
                value={config.installPath}
                placeholder="Select game installation directory"
                readOnly
              />
              <button className="btn btn-secondary" onClick={selectInstallPath}>
                Browse
              </button>
            </div>
          </div>

          {game.id === 'valheim' && (
            <div className="form-group">
              <label className="form-label">World Name</label>
              <input
                type="text"
                className="form-input"
                value={config.worldName}
                onChange={(e) => setConfig(prev => ({ ...prev, worldName: e.target.value }))}
              />
            </div>
          )}

          {game.id === 'cs2' && (
            <div className="form-group">
              <label className="form-label">Starting Map</label>
              <select
                className="form-select"
                value={config.map}
                onChange={(e) => setConfig(prev => ({ ...prev, map: e.target.value }))}
              >
                <option value="de_dust2">Dust II</option>
                <option value="de_mirage">Mirage</option>
                <option value="de_inferno">Inferno</option>
                <option value="de_nuke">Nuke</option>
                <option value="de_cache">Cache</option>
              </select>
            </div>
          )}
            </div>
          ) : (
            <div className="optimizer-form">
              <SystemOptimizer 
                gameType={game.id} 
                onRecommendationsReceived={handleOptimizationRecommendations}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleDeploy}
            disabled={isDeploying || !config.installPath}
          >
            {isDeploying ? 'Deploying...' : 'Deploy Server'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameLibrary;