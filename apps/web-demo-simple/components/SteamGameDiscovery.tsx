'use client';

import { useState, useCallback, useEffect } from 'react';
import { httpClient } from '@/lib/http-client';
import { 
  Search, 
  Steam, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Info,
  ExternalLink,
  Server,
  Settings,
  Loader2,
  ArrowRight
} from 'lucide-react';

interface SteamApp {
  appId: string;
  name: string;
  description: string;
  developer: string;
  publisher: string;
  headerImage: string;
  categories: string[];
  genres: string[];
  isFree: boolean;
  price: number;
  platformSupport: {
    windows: boolean;
    linux: boolean;
    mac: boolean;
  };
}

interface ServerInfo {
  appId: string;
  name: string;
  hasDedicatedServer: boolean;
  serverExecutable: string;
  defaultPorts: number[];
  supportedPlatforms: string[];
  installationNotes: string;
  configurationGuide: string;
}

interface CompatibilityCheck {
  appId: string;
  isCompatible: boolean;
  hasDedicatedServer: boolean;
  warnings: Array<{
    type: string;
    message: string;
    resolution: string;
    blocksDeployment: boolean;
  }>;
}

export default function SteamGameDiscovery() {
  const [steamIdInput, setSteamIdInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SteamApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<SteamApp | null>(null);
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [compatibility, setCompatibility] = useState<CompatibilityCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSteamIdValidation = async (steamId: string) => {
    if (!steamId.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // First validate the Steam ID format and existence
      const validationResponse = await httpClient.post('/api/steam/validate-steamid', {
        steamId: steamId.trim()
      });

      if (!validationResponse.data.isValid) {
        setError('Invalid Steam ID or user not found');
        return;
      }

      // Then try to get app info
      const appResponse = await httpClient.get(`/api/steam/apps/${steamId.trim()}`);
      const app = appResponse.data;

      setSelectedApp(app);
      
      // Check server compatibility
      await checkServerCompatibility(app.appId);

    } catch (err: any) {
      console.error('Steam ID validation failed:', err);
      setError(err.response?.data?.error || 'Failed to validate Steam ID');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setError(null);

      const response = await httpClient.get('/api/steam/apps/search', {
        params: { query: query.trim() }
      });

      setSearchResults(response.data);
    } catch (err: any) {
      console.error('Steam search failed:', err);
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const checkServerCompatibility = async (appId: string) => {
    try {
      // Get server info
      const serverResponse = await httpClient.get(`/api/steam/apps/${appId}/server-info`);
      setServerInfo(serverResponse.data);

      // Check compatibility
      const compatResponse = await httpClient.get(`/api/steam/apps/${appId}/compatibility`);
      setCompatibility(compatResponse.data);

    } catch (err: any) {
      console.error('Compatibility check failed:', err);
      setServerInfo(null);
      setCompatibility({
        appId,
        isCompatible: false,
        hasDedicatedServer: false,
        warnings: [{
          type: 'error',
          message: 'Unable to determine server compatibility',
          resolution: 'Please try again or contact support',
          blocksDeployment: true
        }]
      });
    }
  };

  const handleAppSelect = async (app: SteamApp) => {
    setSelectedApp(app);
    await checkServerCompatibility(app.appId);
  };

  const handleDownload = async () => {
    if (!selectedApp || !compatibility?.isCompatible) return;

    try {
      setDownloading(true);
      setError(null);

      const response = await httpClient.post(`/api/steam/apps/${selectedApp.appId}/download`, {
        installPath: `C:\\GameServers\\${selectedApp.name.replace(/[^a-zA-Z0-9]/g, '')}`
      });

      if (response.data.success) {
        // Success - could redirect to server management or show success message
        console.log('Download completed:', response.data);
      } else {
        setError(response.data.message || 'Download failed');
      }

    } catch (err: any) {
      console.error('Download failed:', err);
      setError(err.response?.data?.error || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => handleSearch(query), 500),
    []
  );

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, debouncedSearch]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Steam className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Steam Game Discovery</h1>
          </div>
          <p className="text-lg text-gray-600">
            Automatically discover and deploy Steam-based dedicated servers
          </p>
        </div>

        {/* Steam ID Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Option 1: Enter Steam App ID</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter Steam App ID (e.g., 730 for CS:GO, 440 for TF2)"
                value={steamIdInput}
                onChange={(e) => setSteamIdInput(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSteamIdValidation(steamIdInput)}
              />
            </div>
            <button
              onClick={() => handleSteamIdValidation(steamIdInput)}
              disabled={loading || !steamIdInput.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Validate'}
            </button>
          </div>
        </div>

        {/* Search Interface */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Option 2: Search Steam Games</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for games by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Search Results */}
          {searching && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Searching Steam...</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((app) => (
                <div
                  key={app.appId}
                  onClick={() => handleAppSelect(app)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={app.headerImage}
                      alt={app.name}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-game.png';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{app.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{app.developer}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {app.genres.slice(0, 2).map((genre) => (
                          <span
                            key={genre}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">Error</p>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Selected App Details */}
        {selectedApp && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-start gap-6">
              <img
                src={selectedApp.headerImage}
                alt={selectedApp.name}
                className="w-32 h-24 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-game.png';
                }}
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedApp.name}</h2>
                <p className="text-gray-600 mb-2">by {selectedApp.developer}</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Platforms:</span>
                    {selectedApp.platformSupport.windows && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Windows</span>
                    )}
                    {selectedApp.platformSupport.linux && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Linux</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Price:</span>
                    <span className="text-sm text-gray-600">
                      {selectedApp.isFree ? 'Free' : `$${selectedApp.price.toFixed(2)}`}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedApp.genres.map((genre) => (
                    <span
                      key={genre}
                      className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Server Compatibility */}
        {compatibility && selectedApp && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-6 h-6 text-gray-700" />
              <h3 className="text-xl font-semibold text-gray-900">Dedicated Server Compatibility</h3>
            </div>

            {/* Overall Status */}
            <div className={`p-4 rounded-lg mb-6 ${
              compatibility.isCompatible 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {compatibility.isCompatible ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <h4 className={`font-semibold ${
                    compatibility.isCompatible ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {compatibility.isCompatible ? 'Compatible' : 'Not Compatible'}
                  </h4>
                  <p className={`text-sm ${
                    compatibility.isCompatible ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {compatibility.hasDedicatedServer 
                      ? 'Dedicated server support detected' 
                      : 'No dedicated server support found'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Server Info */}
            {serverInfo && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Server Information</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Server Executable</label>
                    <p className="text-sm text-gray-600 mt-1">{serverInfo.serverExecutable}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Default Ports</label>
                    <p className="text-sm text-gray-600 mt-1">{serverInfo.defaultPorts.join(', ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Supported Platforms</label>
                    <p className="text-sm text-gray-600 mt-1">{serverInfo.supportedPlatforms.join(', ')}</p>
                  </div>
                </div>
                {serverInfo.installationNotes && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700">Installation Notes</label>
                    <p className="text-sm text-gray-600 mt-1">{serverInfo.installationNotes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Warnings */}
            {compatibility.warnings.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Compatibility Warnings</h4>
                <div className="space-y-3">
                  {compatibility.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        warning.type === 'error' 
                          ? 'bg-red-50 border-red-200' 
                          : warning.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {warning.type === 'error' ? (
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        ) : warning.type === 'warning' ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        ) : (
                          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={`font-medium ${
                            warning.type === 'error' 
                              ? 'text-red-800' 
                              : warning.type === 'warning'
                              ? 'text-yellow-800'
                              : 'text-blue-800'
                          }`}>
                            {warning.message}
                          </p>
                          {warning.resolution && (
                            <p className={`text-sm mt-1 ${
                              warning.type === 'error' 
                                ? 'text-red-700' 
                                : warning.type === 'warning'
                                ? 'text-yellow-700'
                                : 'text-blue-700'
                            }`}>
                              Resolution: {warning.resolution}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleDownload}
                disabled={!compatibility.isCompatible || downloading}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  compatibility.isCompatible && !downloading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {downloading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                {downloading ? 'Downloading...' : 'Download Server Files'}
              </button>

              {serverInfo?.configurationGuide && (
                <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <ExternalLink className="w-5 h-5" />
                  Configuration Guide
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}