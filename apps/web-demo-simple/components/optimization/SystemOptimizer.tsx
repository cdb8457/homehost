'use client';

import { useState, useEffect } from 'react';
import { 
  Cpu, 
  HardDrive, 
  Wifi, 
  Zap, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Monitor,
  Loader2,
  RefreshCw,
  BarChart3,
  Gauge
} from 'lucide-react';
import { SystemSpecs, OptimizationRecommendation, HardwareCompatibility } from '@/types/optimization';
import { SystemDetector } from '@/lib/system-detection';
import { OptimizationEngine } from '@/lib/optimization-engine';

interface SystemOptimizerProps {
  gameId?: string;
  onRecommendationUpdate?: (recommendation: OptimizationRecommendation) => void;
}

export default function SystemOptimizer({ gameId, onRecommendationUpdate }: SystemOptimizerProps) {
  const [systemSpecs, setSystemSpecs] = useState<SystemSpecs | null>(null);
  const [recommendation, setRecommendation] = useState<OptimizationRecommendation | null>(null);
  const [compatibility, setCompatibility] = useState<HardwareCompatibility | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedGame, setSelectedGame] = useState(gameId || 'valheim');
  const [currentLoad, setCurrentLoad] = useState<any>(null);
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);

  const detector = new SystemDetector();
  const engine = new OptimizationEngine();

  useEffect(() => {
    if (gameId) {
      setSelectedGame(gameId);
    }
  }, [gameId]);

  const handleDetectSystem = async () => {
    setIsDetecting(true);
    try {
      const specs = await detector.detectSystemSpecs();
      const load = await detector.getCurrentSystemLoad();
      const enhancedSpecs = await engine.analyzeSystem(specs);
      
      setSystemSpecs(enhancedSpecs);
      setCurrentLoad(load);
      
      // Auto-analyze for selected game
      if (selectedGame) {
        await handleAnalyzeGame(selectedGame, enhancedSpecs);
      }
    } catch (error) {
      console.error('Failed to detect system:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleAnalyzeGame = async (gameId: string, specs?: SystemSpecs) => {
    if (!specs && !systemSpecs) return;
    
    setIsAnalyzing(true);
    try {
      const targetSpecs = specs || systemSpecs!;
      await engine.analyzeSystem(targetSpecs);
      
      const gameRecommendation = engine.generateRecommendations(gameId);
      const gameCompatibility = engine.assessHardwareCompatibility(gameId);
      
      setRecommendation(gameRecommendation);
      setCompatibility(gameCompatibility);
      
      if (onRecommendationUpdate) {
        onRecommendationUpdate(gameRecommendation);
      }
    } catch (error) {
      console.error('Failed to analyze game:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSpeedTest = async () => {
    if (!systemSpecs) return;
    
    setIsTestingSpeed(true);
    try {
      const speedResults = await detector.testNetworkSpeed();
      
      // Update system specs with real speed test results
      const updatedSpecs = {
        ...systemSpecs,
        network: {
          ...systemSpecs.network,
          downloadSpeed: speedResults.download,
          uploadSpeed: speedResults.upload,
          latency: speedResults.latency
        }
      };
      
      setSystemSpecs(updatedSpecs);
      
      // Re-analyze current game with updated network info
      if (selectedGame) {
        await handleAnalyzeGame(selectedGame, updatedSpecs);
      }
    } catch (error) {
      console.error('Failed to test network speed:', error);
    } finally {
      setIsTestingSpeed(false);
    }
  };

  const getCompatibilityColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'fair': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-orange-600 bg-orange-50';
      case 'incompatible': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getWarningColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Auto-Optimization Engine</h1>
        <p className="text-gray-600">Analyze your system and optimize server configurations automatically</p>
      </div>

      {/* System Detection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Monitor className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">System Analysis</h2>
          </div>
          <button
            onClick={handleDetectSystem}
            disabled={isDetecting}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Detect System
              </>
            )}
          </button>
        </div>

        {systemSpecs && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CPU */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">CPU</h3>
              </div>
              <p className="text-sm text-gray-600 mb-1">{systemSpecs.cpu.model}</p>
              <p className="text-sm text-gray-600">{systemSpecs.cpu.cores} cores @ {systemSpecs.cpu.frequency}GHz</p>
              {currentLoad && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Current Load</span>
                    <span>{currentLoad.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${currentLoad.cpu}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Memory */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-900">Memory</h3>
              </div>
              <p className="text-sm text-gray-600 mb-1">{systemSpecs.memory.available}GB Available</p>
              <p className="text-sm text-gray-600">{systemSpecs.memory.type} @ {systemSpecs.memory.speed}MHz</p>
              {currentLoad && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Current Usage</span>
                    <span>{currentLoad.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${currentLoad.memory}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Storage */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium text-gray-900">Storage</h3>
              </div>
              <p className="text-sm text-gray-600 mb-1">{systemSpecs.storage.type} - {systemSpecs.storage.available}GB Free</p>
              <p className="text-sm text-gray-600">{systemSpecs.storage.readSpeed} MB/s Read</p>
              {currentLoad && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Current Activity</span>
                    <span>{currentLoad.storage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${currentLoad.storage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Network */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="w-5 h-5 text-orange-600" />
                <h3 className="font-medium text-gray-900">Network</h3>
              </div>
              <p className="text-sm text-gray-600 mb-1">{systemSpecs.network.uploadSpeed} Mbps Up</p>
              <p className="text-sm text-gray-600 mb-2">{systemSpecs.network.downloadSpeed} Mbps Down</p>
              
              <button
                onClick={handleSpeedTest}
                disabled={isTestingSpeed}
                className="w-full text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 disabled:opacity-50 mb-2"
              >
                {isTestingSpeed ? 'Testing...' : 'Test Speed'}
              </button>
              
              {currentLoad && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Current Usage</span>
                    <span>{currentLoad.network}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${currentLoad.network}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Game Selection & Analysis */}
      {systemSpecs && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Game Optimization</h2>
            </div>
            <button
              onClick={() => handleAnalyzeGame(selectedGame)}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4" />
                  Analyze Game
                </>
              )}
            </button>
          </div>

          {/* Game Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Game</label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="valheim">Valheim</option>
              <option value="rust">Rust</option>
              <option value="cs2">Counter-Strike 2</option>
              <option value="7d2d">7 Days to Die</option>
              <option value="motortown">MotorTown</option>
            </select>
          </div>

          {/* Hardware Compatibility */}
          {compatibility && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hardware Compatibility</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(compatibility.compatibility).map(([component, level]) => (
                  <div key={component} className="text-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityColor(level)}`}>
                      {level}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 capitalize">{component}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Estimate */}
          {recommendation && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Estimate</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{recommendation.estimatedPerformance.maxPlayers}</div>
                  <div className="text-sm text-gray-600">Max Players</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{recommendation.estimatedPerformance.expectedTPS}</div>
                  <div className="text-sm text-gray-600">Expected TPS</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{recommendation.estimatedPerformance.expectedLatency}ms</div>
                  <div className="text-sm text-gray-600">Expected Latency</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{recommendation.estimatedPerformance.stability}%</div>
                  <div className="text-sm text-gray-600">Stability</div>
                </div>
              </div>
            </div>
          )}

          {/* Server Configuration */}
          {recommendation && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Server Configuration</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Max Players:</span>
                    <span className="ml-2 text-sm text-gray-900">{recommendation.serverConfig.maxPlayers}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Tick Rate:</span>
                    <span className="ml-2 text-sm text-gray-900">{recommendation.serverConfig.tickRate} Hz</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Memory:</span>
                    <span className="ml-2 text-sm text-gray-900">{Math.round(recommendation.serverConfig.memoryAllocation / 1024)} GB</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Threads:</span>
                    <span className="ml-2 text-sm text-gray-900">{recommendation.serverConfig.threadCount}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Config Level:</span>
                    <span className="ml-2 text-sm text-gray-900 capitalize">{recommendation.configurationLevel}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Confidence:</span>
                    <span className="ml-2 text-sm text-gray-900">{recommendation.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Warnings */}
      {recommendation && recommendation.warnings.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Warnings</h2>
          </div>
          <div className="space-y-3">
            {recommendation.warnings.map((warning, index) => (
              <div key={index} className={`border-l-4 p-4 rounded-r-lg ${getWarningColor(warning.severity)}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{warning.message}</h4>
                    <p className="text-sm text-gray-600 mt-1">{warning.impact}</p>
                    {warning.solution && (
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>Solution:</strong> {warning.solution}
                      </p>
                    )}
                  </div>
                  <span className="text-xs bg-white px-2 py-1 rounded-full font-medium capitalize">
                    {warning.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {recommendation && recommendation.suggestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Optimization Suggestions</h2>
          </div>
          <div className="space-y-3">
            {recommendation.suggestions.map((suggestion, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-green-600 font-medium">
                        {suggestion.expectedImprovement}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {suggestion.implementation}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                    suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {suggestion.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}