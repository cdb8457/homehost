import React, { useState, useEffect } from 'react';
import './Web3Integration.css';

const Web3Integration = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [walletData, setWalletData] = useState({
    providers: [],
    connected: [],
    balances: {},
    networks: [],
    transactions: []
  });
  const [tokenData, setTokenData] = useState({
    standards: [],
    collections: [],
    portfolios: [],
    simulations: []
  });
  const [nftData, setNftData] = useState({
    categories: [],
    assets: [],
    metadata: {},
    marketplace: {}
  });
  const [contractData, setContractData] = useState({
    templates: [],
    deployed: [],
    interactions: []
  });
  const [identityData, setIdentityData] = useState({
    profiles: [],
    credentials: [],
    verification: {},
    reputation: {}
  });
  const [partnershipData, setPartnershipData] = useState({
    platforms: [],
    integrations: [],
    apis: {},
    status: {}
  });

  useEffect(() => {
    initializeWeb3();
  }, []);

  const initializeWeb3 = async () => {
    try {
      setLoading(true);
      
      // Load wallet providers and status
      const providers = await window.electronAPI.getWalletProviders();
      const connected = await window.electronAPI.getConnectedWallets();
      const networks = await window.electronAPI.getSupportedNetworks();
      
      setWalletData(prev => ({
        ...prev,
        providers,
        connected,
        networks
      }));

      // Load token standards and collections
      const standards = await window.electronAPI.getTokenStandards();
      const collections = await window.electronAPI.getNFTCollections();
      
      setTokenData(prev => ({
        ...prev,
        standards,
        collections
      }));

      // Load smart contract templates
      const templates = await window.electronAPI.getSmartContractTemplates();
      
      setContractData(prev => ({
        ...prev,
        templates
      }));

      // Load partnership platforms
      const platforms = await window.electronAPI.getPartnershipPlatforms();
      
      setPartnershipData(prev => ({
        ...prev,
        platforms
      }));

      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize Web3 integration:', error);
      setLoading(false);
    }
  };

  const handleWalletConnect = async (providerId, method) => {
    try {
      const result = await window.electronAPI.connectWallet(providerId, method);
      if (result.success) {
        await initializeWeb3(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleWalletDisconnect = async (walletId) => {
    try {
      await window.electronAPI.disconnectWallet(walletId);
      await initializeWeb3(); // Refresh data
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const handleContractDeploy = async (templateId, params) => {
    try {
      const result = await window.electronAPI.deploySmartContract(templateId, params);
      if (result.success) {
        await initializeWeb3(); // Refresh data
      }
      return result;
    } catch (error) {
      console.error('Failed to deploy contract:', error);
      return { success: false, error: error.message };
    }
  };

  const handleNFTMint = async (collectionId, metadata) => {
    try {
      const result = await window.electronAPI.mintNFT(collectionId, metadata);
      return result;
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      return { success: false, error: error.message };
    }
  };

  const handleTokenSimulation = async (scenario) => {
    try {
      const result = await window.electronAPI.runTokenSimulation(scenario);
      return result;
    } catch (error) {
      console.error('Failed to run simulation:', error);
      return { success: false, error: error.message };
    }
  };

  const renderOverview = () => (
    <div className="tab-content">
      <div className="overview-grid">
        <div className="overview-card">
          <div className="card-header">
            <h3>🦊 Wallet Integration</h3>
            <span className="status-badge connected">{walletData.connected.length} Connected</span>
          </div>
          <div className="card-content">
            <p>Support for major cryptocurrency wallets including MetaMask, WalletConnect, Coinbase, Phantom, and Trust Wallet.</p>
            <div className="quick-stats">
              <div className="stat">
                <span className="stat-value">{walletData.providers.length}</span>
                <span className="stat-label">Supported Wallets</span>
              </div>
              <div className="stat">
                <span className="stat-value">{walletData.networks.length}</span>
                <span className="stat-label">Blockchain Networks</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-header">
            <h3>🎨 NFT Ecosystem</h3>
            <span className="status-badge ready">Ready</span>
          </div>
          <div className="card-content">
            <p>Framework for gaming NFTs including character skins, weapons, achievements, and collectibles.</p>
            <div className="quick-stats">
              <div className="stat">
                <span className="stat-value">{nftData.categories.length}</span>
                <span className="stat-label">Asset Categories</span>
              </div>
              <div className="stat">
                <span className="stat-value">{tokenData.collections.length}</span>
                <span className="stat-label">Collections</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-header">
            <h3>📜 Smart Contracts</h3>
            <span className="status-badge prepared">Templates Ready</span>
          </div>
          <div className="card-content">
            <p>Pre-built smart contract templates for governance tokens, NFT collections, marketplace, and staking.</p>
            <div className="quick-stats">
              <div className="stat">
                <span className="stat-value">{contractData.templates.length}</span>
                <span className="stat-label">Templates</span>
              </div>
              <div className="stat">
                <span className="stat-value">{contractData.deployed.length}</span>
                <span className="stat-label">Deployed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-header">
            <h3>🤝 Platform Partnerships</h3>
            <span className="status-badge integrated">API Ready</span>
          </div>
          <div className="card-content">
            <p>Integration with leading Web3 gaming platforms and service providers for enhanced functionality.</p>
            <div className="quick-stats">
              <div className="stat">
                <span className="stat-value">{partnershipData.platforms.length}</span>
                <span className="stat-label">Partners</span>
              </div>
              <div className="stat">
                <span className="stat-value">{partnershipData.integrations.length}</span>
                <span className="stat-label">Integrations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="integration-roadmap">
        <h3>🗺️ Web3 Integration Roadmap</h3>
        <div className="roadmap-phases">
          <div className="phase completed">
            <div className="phase-number">1</div>
            <div className="phase-content">
              <h4>Foundation Infrastructure</h4>
              <p>Wallet integration, blockchain network support, smart contract templates</p>
            </div>
          </div>
          <div className="phase upcoming">
            <div className="phase-number">2</div>
            <div className="phase-content">
              <h4>Token Economy Launch</h4>
              <p>Community tokens, NFT marketplace, staking mechanisms</p>
            </div>
          </div>
          <div className="phase future">
            <div className="phase-number">3</div>
            <div className="phase-content">
              <h4>Advanced Features</h4>
              <p>Cross-chain compatibility, DAO governance, DeFi integrations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWallets = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Supported Wallet Providers</h3>
        <p>Connect your preferred cryptocurrency wallet to access Web3 features</p>
      </div>

      <div className="wallet-grid">
        {walletData.providers.map(provider => {
          const isConnected = walletData.connected.some(w => w.providerId === provider.id);
          
          return (
            <div key={provider.id} className={`wallet-card ${isConnected ? 'connected' : ''}`}>
              <div className="wallet-icon">{provider.icon}</div>
              <div className="wallet-info">
                <h4>{provider.name}</h4>
                <p>{provider.description}</p>
                <div className="wallet-features">
                  {provider.features.map(feature => (
                    <span key={feature} className="feature-tag">{feature}</span>
                  ))}
                </div>
                <div className="supported-networks">
                  <strong>Networks:</strong> {provider.supportedNetworks.join(', ')}
                </div>
              </div>
              <div className="wallet-actions">
                {isConnected ? (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleWalletDisconnect(provider.id)}
                  >
                    Disconnect
                  </button>
                ) : (
                  <div className="connection-methods">
                    {provider.connectionMethods.map(method => (
                      <button
                        key={method}
                        className="btn btn-primary"
                        onClick={() => handleWalletConnect(provider.id, method)}
                      >
                        Connect via {method}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {walletData.connected.length > 0 && (
        <div className="connected-wallets">
          <h3>Connected Wallets</h3>
          <div className="connected-list">
            {walletData.connected.map(wallet => (
              <div key={wallet.id} className="connected-wallet">
                <div className="wallet-details">
                  <span className="wallet-name">{wallet.name}</span>
                  <span className="wallet-address">{wallet.address}</span>
                  <span className="wallet-network">{wallet.network}</span>
                </div>
                <div className="wallet-balance">
                  {wallet.balance} {wallet.symbol}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTokens = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Token Standards & Economy</h3>
        <p>Manage token standards, collections, and economy simulations</p>
      </div>

      <div className="token-standards">
        <h4>Supported Token Standards</h4>
        <div className="standards-grid">
          {tokenData.standards.map(standard => (
            <div key={standard.id} className="standard-card">
              <div className="standard-header">
                <h5>{standard.name}</h5>
                <span className="standard-type">{standard.type}</span>
              </div>
              <p>{standard.description}</p>
              <div className="standard-features">
                {standard.features.map(feature => (
                  <span key={feature} className="feature-tag">{feature}</span>
                ))}
              </div>
              <div className="supported-networks">
                <strong>Networks:</strong> {standard.networks.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="token-collections">
        <h4>NFT Collections</h4>
        <div className="collections-grid">
          {tokenData.collections.map(collection => (
            <div key={collection.id} className="collection-card">
              <div className="collection-header">
                <h5>{collection.name}</h5>
                <span className="collection-category">{collection.category}</span>
              </div>
              <p>{collection.description}</p>
              <div className="collection-stats">
                <div className="stat">
                  <span className="stat-value">{collection.totalSupply}</span>
                  <span className="stat-label">Total Supply</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{collection.minted}</span>
                  <span className="stat-label">Minted</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{collection.floorPrice} ETH</span>
                  <span className="stat-label">Floor Price</span>
                </div>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => handleNFTMint(collection.id, {})}
              >
                Mint NFT
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="token-simulation">
        <h4>Token Economy Simulator</h4>
        <div className="simulation-controls">
          <select className="form-select">
            <option value="">Select Simulation Scenario</option>
            <option value="community_token_launch">Community Token Launch</option>
            <option value="nft_collection_drop">NFT Collection Drop</option>
            <option value="staking_rewards">Staking Rewards Program</option>
            <option value="marketplace_activity">Marketplace Activity</option>
          </select>
          <button 
            className="btn btn-primary"
            onClick={() => handleTokenSimulation('community_token_launch')}
          >
            Run Simulation
          </button>
        </div>
      </div>
    </div>
  );

  const renderContracts = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Smart Contract Templates</h3>
        <p>Deploy and manage smart contracts for your gaming community</p>
      </div>

      <div className="contract-templates">
        <div className="templates-grid">
          {contractData.templates.map(template => (
            <div key={template.id} className="template-card">
              <div className="template-header">
                <h4>{template.name}</h4>
                <span className="template-type">{template.type}</span>
              </div>
              <p>{template.description}</p>
              <div className="template-features">
                {template.features.map(feature => (
                  <span key={feature} className="feature-tag">{feature}</span>
                ))}
              </div>
              <div className="template-params">
                <strong>Parameters:</strong>
                <ul>
                  {template.parameters.map(param => (
                    <li key={param}>{param}</li>
                  ))}
                </ul>
              </div>
              <div className="template-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleContractDeploy(template.id, {})}
                >
                  Deploy Contract
                </button>
                <button className="btn btn-secondary">
                  Preview Code
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {contractData.deployed.length > 0 && (
        <div className="deployed-contracts">
          <h4>Deployed Contracts</h4>
          <div className="contracts-list">
            {contractData.deployed.map(contract => (
              <div key={contract.id} className="contract-item">
                <div className="contract-info">
                  <h5>{contract.name}</h5>
                  <span className="contract-address">{contract.address}</span>
                  <span className="contract-network">{contract.network}</span>
                </div>
                <div className="contract-status">
                  <span className={`status-badge ${contract.status}`}>{contract.status}</span>
                </div>
                <div className="contract-actions">
                  <button className="btn btn-secondary">View Explorer</button>
                  <button className="btn btn-primary">Interact</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderIdentity = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Decentralized Identity</h3>
        <p>Manage cross-platform reputation and verifiable credentials</p>
      </div>

      <div className="identity-features">
        <div className="feature-card">
          <div className="feature-icon">🆔</div>
          <div className="feature-content">
            <h4>DID (Decentralized Identifiers)</h4>
            <p>Create and manage decentralized identities for cross-platform reputation and interoperability.</p>
            <button className="btn btn-primary">Create DID</button>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📜</div>
          <div className="feature-content">
            <h4>Verifiable Credentials</h4>
            <p>Issue and verify achievements, certifications, and community standings using blockchain technology.</p>
            <button className="btn btn-primary">Issue Credential</button>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🌐</div>
          <div className="feature-content">
            <h4>ENS Integration</h4>
            <p>Integrate with Ethereum Name Service for human-readable blockchain addresses and profiles.</p>
            <button className="btn btn-primary">Register ENS</button>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⭐</div>
          <div className="feature-content">
            <h4>Reputation System</h4>
            <p>Cross-platform reputation tracking with cryptographic proof and community validation.</p>
            <button className="btn btn-primary">View Reputation</button>
          </div>
        </div>
      </div>

      <div className="identity-profiles">
        <h4>Identity Profiles</h4>
        <div className="profiles-grid">
          {identityData.profiles.map(profile => (
            <div key={profile.id} className="profile-card">
              <div className="profile-avatar">
                <img src={profile.avatar} alt={profile.name} />
              </div>
              <div className="profile-info">
                <h5>{profile.name}</h5>
                <p>{profile.description}</p>
                <div className="profile-stats">
                  <div className="stat">
                    <span className="stat-value">{profile.reputation}</span>
                    <span className="stat-label">Reputation</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{profile.credentials}</span>
                    <span className="stat-label">Credentials</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPartnerships = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Platform Partnerships</h3>
        <p>Integrations with leading Web3 gaming platforms and service providers</p>
      </div>

      <div className="partnership-grid">
        {partnershipData.platforms.map(platform => (
          <div key={platform.id} className="partnership-card">
            <div className="platform-header">
              <div className="platform-logo">
                <img src={platform.logo} alt={platform.name} />
              </div>
              <div className="platform-info">
                <h4>{platform.name}</h4>
                <p>{platform.description}</p>
              </div>
              <div className="integration-status">
                <span className={`status-badge ${platform.status}`}>{platform.status}</span>
              </div>
            </div>
            <div className="platform-features">
              <h5>Available Features:</h5>
              <ul>
                {platform.features.map(feature => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
            <div className="platform-apis">
              <h5>API Endpoints:</h5>
              <div className="api-list">
                {platform.apis.map(api => (
                  <span key={api} className="api-tag">{api}</span>
                ))}
              </div>
            </div>
            <div className="platform-actions">
              <button className="btn btn-primary">Configure Integration</button>
              <button className="btn btn-secondary">View Documentation</button>
            </div>
          </div>
        ))}
      </div>

      <div className="integration-status">
        <h4>Integration Health</h4>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Immutable X</span>
            <span className="status-indicator online"></span>
            <span className="status-text">Connected</span>
          </div>
          <div className="status-item">
            <span className="status-label">OpenSea API</span>
            <span className="status-indicator online"></span>
            <span className="status-text">Active</span>
          </div>
          <div className="status-item">
            <span className="status-label">Chainlink Oracles</span>
            <span className="status-indicator online"></span>
            <span className="status-text">Synced</span>
          </div>
          <div className="status-item">
            <span className="status-label">Alchemy Infrastructure</span>
            <span className="status-indicator online"></span>
            <span className="status-text">Operational</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="web3-integration">
        <div className="integration-loading">
          <div className="loading-spinner"></div>
          <p>Initializing Web3 Integration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="web3-integration">
      <div className="integration-header">
        <div className="header-title">
          <h1>🌐 Web3 Integration Foundation</h1>
          <p>Infrastructure for future Web3 monetization and gaming features</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <div className="stat-number">{walletData.connected.length}</div>
            <div className="stat-label">Wallets Connected</div>
          </div>
          <div className="stat">
            <div className="stat-number">{contractData.templates.length}</div>
            <div className="stat-label">Contract Templates</div>
          </div>
          <div className="stat">
            <div className="stat-number">{partnershipData.platforms.length}</div>
            <div className="stat-label">Platform Partners</div>
          </div>
        </div>
      </div>

      <div className="integration-tabs">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'wallets', label: 'Wallet Integration', icon: '🦊' },
          { id: 'tokens', label: 'Tokens & NFTs', icon: '🎨' },
          { id: 'contracts', label: 'Smart Contracts', icon: '📜' },
          { id: 'identity', label: 'Decentralized Identity', icon: '🆔' },
          { id: 'partnerships', label: 'Platform Partnerships', icon: '🤝' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="integration-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'wallets' && renderWallets()}
        {activeTab === 'tokens' && renderTokens()}
        {activeTab === 'contracts' && renderContracts()}
        {activeTab === 'identity' && renderIdentity()}
        {activeTab === 'partnerships' && renderPartnerships()}
      </div>
    </div>
  );
};

export default Web3Integration;