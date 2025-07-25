'use client';

import { useState, useRef, useCallback } from 'react';
import { httpClient } from '@/lib/http-client';
import {
  Upload,
  File,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Server,
  Play,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Info,
  Terminal,
  HardDrive,
  Network,
  Users,
  Eye,
  EyeOff,
  Plus,
  Minus,
  RotateCcw
} from 'lucide-react';

interface FileUploadResult {
  success: boolean;
  message: string;
  filePath?: string;
  fileSize: number;
  fileName?: string;
  fileHash?: string;
  warnings: string[];
  errors: string[];
  metadata: Record<string, any>;
}

interface GamePatternAnalysis {
  executablePath: string;
  detectedEngines: DetectedGameEngine[];
  detectedPatterns: DetectedPattern[];
  configurationFiles: ConfigurationFile[];
  suggestedPorts: number[];
  suggestedServerName?: string;
  engineMetadata: Record<string, any>;
  confidenceScore: number;
}

interface DetectedGameEngine {
  name: string;
  version: string;
  confidence: number;
  indicatorFiles: string[];
  engineSpecificData: Record<string, any>;
}

interface DetectedPattern {
  patternType: string;
  description: string;
  value: string;
  confidence: number;
}

interface ConfigurationFile {
  filePath: string;
  fileType: string;
  parsedContent: Record<string, any>;
  suggestedOptions: ConfigurationOption[];
}

interface ConfigurationOption {
  key: string;
  name: string;
  description: string;
  type: string;
  defaultValue: any;
  currentValue: any;
  isRequired: boolean;
  validationRules: Record<string, any>;
}

interface ServerConfiguration {
  serverName: string;
  executablePath: string;
  workingDirectory: string;
  commandLineArguments: string;
  requiredPorts: number[];
  environmentVariables: Record<string, string>;
  configurationOptions: ConfigurationOption[];
  configurationFilePath?: string;
  logFilePath?: string;
  maxPlayers: number;
  gameEngine?: string;
}

const WIZARD_STEPS = [
  { id: 'upload', title: 'Upload Executable', description: 'Upload your game server executable' },
  { id: 'analysis', title: 'Game Analysis', description: 'Analyzing your game for patterns' },
  { id: 'configuration', title: 'Server Configuration', description: 'Configure server settings' },
  { id: 'advanced', title: 'Advanced Settings', description: 'Fine-tune expert options' },
  { id: 'review', title: 'Review & Deploy', description: 'Review and deploy your server' }
];

export default function CustomGameUpload() {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadResult, setUploadResult] = useState<FileUploadResult | null>(null);
  const [analysis, setAnalysis] = useState<GamePatternAnalysis | null>(null);
  const [configuration, setConfiguration] = useState<ServerConfiguration | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('tempPath', '/tmp/homehost-custom-games');

      const response = await httpClient.post('/api/custom-games/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result: FileUploadResult = response.data;
      setUploadResult(result);

      if (result.success) {
        setCurrentStep(1);
        await analyzeUploadedGame(result.filePath!);
      } else {
        setError(result.errors.join(', ') || result.message);
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const analyzeUploadedGame = async (filePath: string) => {
    try {
      setLoading(true);
      
      const response = await httpClient.post('/api/custom-games/analyze', {
        executablePath: filePath
      });

      const analysisResult: GamePatternAnalysis = response.data;
      setAnalysis(analysisResult);

      // Generate suggested configuration
      const configResponse = await httpClient.post('/api/custom-games/suggest-configuration', {
        analysis: analysisResult
      });

      setConfiguration(configResponse.data);
      setCurrentStep(2);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(err.response?.data?.error || 'Game analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const updateConfigurationOption = (key: string, value: any) => {
    if (!configuration) return;

    const updatedOptions = configuration.configurationOptions.map(option =>
      option.key === key ? { ...option, currentValue: value } : option
    );

    setConfiguration({
      ...configuration,
      configurationOptions: updatedOptions
    });
  };

  const addPort = () => {
    if (!configuration) return;
    setConfiguration({
      ...configuration,
      requiredPorts: [...configuration.requiredPorts, 7777]
    });
  };

  const removePort = (index: number) => {
    if (!configuration) return;
    setConfiguration({
      ...configuration,
      requiredPorts: configuration.requiredPorts.filter((_, i) => i !== index)
    });
  };

  const updatePort = (index: number, port: number) => {
    if (!configuration) return;
    const updatedPorts = [...configuration.requiredPorts];
    updatedPorts[index] = port;
    setConfiguration({
      ...configuration,
      requiredPorts: updatedPorts
    });
  };

  const resetWizard = () => {
    setCurrentStep(0);
    setUploadResult(null);
    setAnalysis(null);
    setConfiguration(null);
    setError(null);
    setShowAdvancedMode(false);
  };

  const renderUploadStep = () => (
    <div className="text-center">
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-indigo-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Upload Your Game Server Executable
        </h3>
        <p className="text-gray-600 mb-4">
          Drag and drop your server executable (.exe, .jar, .sh, .py) or click to browse
        </p>
        <div className="text-sm text-gray-500">
          <p>Supported formats: Windows EXE, Java JAR, Shell Scripts, Python Scripts</p>
          <p>Maximum file size: 500MB</p>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".exe,.jar,.sh,.py"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />
    </div>
  );

  const renderAnalysisStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Game</h3>
        <p className="text-gray-600">
          Detecting game engine, configuration patterns, and server requirements...
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Analyzing game patterns...</p>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Confidence Score */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">Analysis Confidence</span>
              <span className={`font-bold ${
                analysis.confidenceScore > 0.7 ? 'text-green-600' : 
                analysis.confidenceScore > 0.4 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round(analysis.confidenceScore * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  analysis.confidenceScore > 0.7 ? 'bg-green-500' : 
                  analysis.confidenceScore > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${analysis.confidenceScore * 100}%` }}
              />
            </div>
          </div>

          {/* Detected Engines */}
          {analysis.detectedEngines.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Detected Game Engines</h4>
              <div className="grid gap-3">
                {analysis.detectedEngines.map((engine, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          engine.confidence > 0.7 ? 'bg-green-500' : 
                          engine.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="font-medium">{engine.name}</span>
                        <span className="text-sm text-gray-600">v{engine.version}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {Math.round(engine.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Found {engine.indicatorFiles.length} indicator files
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detected Patterns */}
          {analysis.detectedPatterns.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Detected Patterns</h4>
              <div className="grid gap-2">
                {analysis.detectedPatterns.map((pattern, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Info className="w-4 h-4 text-blue-600" />
                    <div className="flex-1">
                      <span className="font-medium text-blue-900">{pattern.description}</span>
                      <span className="text-blue-700 ml-2">({pattern.value})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configuration Files */}
          {analysis.configurationFiles.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Found Configuration Files</h4>
              <div className="grid gap-2">
                {analysis.configurationFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <File className="w-4 h-4 text-green-600" />
                    <div className="flex-1">
                      <span className="font-medium text-green-900">
                        {file.filePath.split('/').pop()}
                      </span>
                      <span className="text-green-700 ml-2">({file.fileType})</span>
                    </div>
                    <span className="text-sm text-green-600">
                      {file.suggestedOptions.length} options
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );

  const renderConfigurationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Configure Your Server</h3>
        <p className="text-gray-600">
          Review and customize the detected server configuration
        </p>
      </div>

      {configuration && (
        <div className="space-y-6">
          {/* Basic Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Server className="w-5 h-5" />
              Basic Server Settings
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Server Name
                </label>
                <input
                  type="text"
                  value={configuration.serverName}
                  onChange={(e) => setConfiguration({
                    ...configuration,
                    serverName: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Players
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={configuration.maxPlayers}
                  onChange={(e) => setConfiguration({
                    ...configuration,
                    maxPlayers: parseInt(e.target.value) || 10
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Command Line Arguments
              </label>
              <input
                type="text"
                value={configuration.commandLineArguments}
                onChange={(e) => setConfiguration({
                  ...configuration,
                  commandLineArguments: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Additional command line arguments..."
              />
            </div>
          </div>

          {/* Network Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Network className="w-5 h-5" />
              Network Configuration
            </h4>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Required Ports
                </label>
                <button
                  onClick={addPort}
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Port
                </button>
              </div>
              
              <div className="space-y-2">
                {configuration.requiredPorts.map((port, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="65535"
                      value={port}
                      onChange={(e) => updatePort(index, parseInt(e.target.value) || 7777)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {configuration.requiredPorts.length > 1 && (
                      <button
                        onClick={() => removePort(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration Options */}
          {configuration.configurationOptions.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Game Configuration
              </h4>
              
              <div className="grid gap-4">
                {configuration.configurationOptions.map((option, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {option.name}
                      {option.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <p className="text-xs text-gray-600 mb-2">{option.description}</p>
                    
                    {option.type === 'boolean' ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!!option.currentValue}
                          onChange={(e) => updateConfigurationOption(option.key, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {option.currentValue ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    ) : option.type === 'integer' || option.type === 'float' ? (
                      <input
                        type="number"
                        step={option.type === 'float' ? '0.1' : '1'}
                        value={option.currentValue || ''}
                        onChange={(e) => updateConfigurationOption(
                          option.key, 
                          option.type === 'integer' ? parseInt(e.target.value) : parseFloat(e.target.value)
                        )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={option.currentValue || ''}
                        onChange={(e) => updateConfigurationOption(option.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderAdvancedStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Configuration</h3>
        <p className="text-gray-600">
          Expert settings for power users and custom deployments
        </p>
      </div>

      {configuration && (
        <div className="space-y-6">
          {/* Expert Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-900">Expert Mode</span>
            </div>
            <button
              onClick={() => setShowAdvancedMode(!showAdvancedMode)}
              className="flex items-center gap-2 text-yellow-700 hover:text-yellow-800"
            >
              {showAdvancedMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showAdvancedMode ? 'Hide' : 'Show'} Advanced Options
            </button>
          </div>

          {showAdvancedMode && (
            <>
              {/* Working Directory */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  File System Configuration
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Working Directory
                    </label>
                    <input
                      type="text"
                      value={configuration.workingDirectory}
                      onChange={(e) => setConfiguration({
                        ...configuration,
                        workingDirectory: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Configuration File Path (Optional)
                    </label>
                    <input
                      type="text"
                      value={configuration.configurationFilePath || ''}
                      onChange={(e) => setConfiguration({
                        ...configuration,
                        configurationFilePath: e.target.value || undefined
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Path to server configuration file..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Log File Path (Optional)
                    </label>
                    <input
                      type="text"
                      value={configuration.logFilePath || ''}
                      onChange={(e) => setConfiguration({
                        ...configuration,
                        logFilePath: e.target.value || undefined
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Path to server log file..."
                    />
                  </div>
                </div>
              </div>

              {/* Environment Variables */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Environment Variables
                </h4>
                
                <div className="space-y-3">
                  {Object.entries(configuration.environmentVariables).map(([key, value], index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => {
                          const newEnvVars = { ...configuration.environmentVariables };
                          delete newEnvVars[key];
                          newEnvVars[e.target.value] = value;
                          setConfiguration({
                            ...configuration,
                            environmentVariables: newEnvVars
                          });
                        }}
                        placeholder="Variable name..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setConfiguration({
                          ...configuration,
                          environmentVariables: {
                            ...configuration.environmentVariables,
                            [key]: e.target.value
                          }
                        })}
                        placeholder="Value..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button
                        onClick={() => {
                          const newEnvVars = { ...configuration.environmentVariables };
                          delete newEnvVars[key];
                          setConfiguration({
                            ...configuration,
                            environmentVariables: newEnvVars
                          });
                        }}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => setConfiguration({
                      ...configuration,
                      environmentVariables: {
                        ...configuration.environmentVariables,
                        [`ENV_VAR_${Object.keys(configuration.environmentVariables).length + 1}`]: ''
                      }
                    })}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Environment Variable
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Your Configuration</h3>
        <p className="text-gray-600">
          Review all settings before deploying your custom game server
        </p>
      </div>

      {configuration && uploadResult && (
        <div className="space-y-6">
          {/* Configuration Summary */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h4 className="font-semibold text-indigo-900 mb-4">Configuration Summary</h4>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-indigo-900">Server Name:</span>
                <span className="text-indigo-700 ml-2">{configuration.serverName}</span>
              </div>
              <div>
                <span className="font-medium text-indigo-900">Max Players:</span>
                <span className="text-indigo-700 ml-2">{configuration.maxPlayers}</span>
              </div>
              <div>
                <span className="font-medium text-indigo-900">Ports:</span>
                <span className="text-indigo-700 ml-2">{configuration.requiredPorts.join(', ')}</span>
              </div>
              <div>
                <span className="font-medium text-indigo-900">Game Engine:</span>
                <span className="text-indigo-700 ml-2">{configuration.gameEngine || 'Custom'}</span>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-semibold text-green-900 mb-4">Analysis Results</h4>
              
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-medium text-green-900">Detection Confidence:</span>
                  <span className="text-green-700 ml-2">{Math.round(analysis.confidenceScore * 100)}%</span>
                </div>
                <div>
                  <span className="font-medium text-green-900">Detected Engines:</span>
                  <span className="text-green-700 ml-2">
                    {analysis.detectedEngines.map(e => e.name).join(', ') || 'None'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-green-900">Configuration Files:</span>
                  <span className="text-green-700 ml-2">{analysis.configurationFiles.length} found</span>
                </div>
              </div>
            </div>
          )}

          {/* Deploy Button */}
          <div className="text-center">
            <button
              onClick={() => {/* TODO: Implement deploy */}}
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              Deploy Custom Server
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const currentStepData = WIZARD_STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Custom Game Upload</h1>
          <p className="text-lg text-gray-600">
            Add any game with dedicated server support to HomeHost
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < WIZARD_STEPS.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    index < currentStep ? 'bg-green-500 text-white' :
                    index === currentStep ? 'bg-indigo-600 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-xs ${
                      index <= currentStep ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < WIZARD_STEPS.length - 1 && (
                  <div className={`hidden sm:block flex-1 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">Error</p>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={resetWizard}
              className="mt-2 flex items-center gap-1 text-red-700 hover:text-red-800 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Start Over
            </button>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {currentStep === 0 && renderUploadStep()}
          {currentStep === 1 && renderAnalysisStep()}
          {currentStep === 2 && renderConfigurationStep()}
          {currentStep === 3 && renderAdvancedStep()}
          {currentStep === 4 && renderReviewStep()}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0 || loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {WIZARD_STEPS.length}
          </div>

          <button
            onClick={() => setCurrentStep(Math.min(WIZARD_STEPS.length - 1, currentStep + 1))}
            disabled={currentStep === WIZARD_STEPS.length - 1 || loading || !uploadResult}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}