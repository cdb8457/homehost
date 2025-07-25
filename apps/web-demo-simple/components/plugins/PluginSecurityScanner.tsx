'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Scan,
  Download,
  FileText,
  Lock,
  Unlock,
  Bug,
  Search,
  Filter,
  RefreshCw,
  Info,
  AlertCircle,
  Settings,
  Database,
  Network,
  Code,
  Key,
  Globe,
  Zap,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  Award,
  X,
  Calendar,
  User,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface SecurityScanResult {
  id: string;
  pluginId: string;
  pluginName: string;
  pluginVersion: string;
  scanType: 'full' | 'quick' | 'targeted';
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  scanDuration: number;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  vulnerabilities: Vulnerability[];
  codeIssues: CodeIssue[];
  permissionAnalysis: PermissionAnalysis;
  networkAnalysis: NetworkAnalysis;
  fileSystemAnalysis: FileSystemAnalysis;
  summary: ScanSummary;
}

interface Vulnerability {
  id: string;
  type: 'security' | 'privacy' | 'malware' | 'outdated_dependency' | 'insecure_config';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  recommendation: string;
  cveId?: string;
  score: number;
  fixAvailable: boolean;
  references?: string[];
}

interface CodeIssue {
  id: string;
  type: 'syntax' | 'logic' | 'performance' | 'security' | 'style';
  severity: 'info' | 'warning' | 'error';
  title: string;
  description: string;
  file: string;
  line: number;
  column: number;
  code: string;
  fix?: string;
}

interface PermissionAnalysis {
  score: number;
  riskyPermissions: Array<{
    permission: string;
    risk: 'low' | 'medium' | 'high';
    description: string;
    usage: string;
  }>;
  unusedPermissions: string[];
  recommendedPermissions: string[];
}

interface NetworkAnalysis {
  score: number;
  externalConnections: Array<{
    host: string;
    port: number;
    protocol: string;
    encrypted: boolean;
    risk: 'low' | 'medium' | 'high';
    purpose: string;
  }>;
  dataTransmission: {
    sensitiveData: boolean;
    encryption: boolean;
    compression: boolean;
  };
}

interface FileSystemAnalysis {
  score: number;
  fileAccess: Array<{
    path: string;
    access: 'read' | 'write' | 'execute';
    risk: 'low' | 'medium' | 'high';
    purpose: string;
  }>;
  suspiciousFiles: Array<{
    path: string;
    reason: string;
    risk: 'low' | 'medium' | 'high';
  }>;
}

interface ScanSummary {
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  fixableIssues: number;
  filesScanned: number;
  linesScanned: number;
}

interface PluginSecurityScannerProps {
  pluginId?: string;
  serverId?: string;
  compact?: boolean;
}

export default function PluginSecurityScanner({
  pluginId,
  serverId,
  compact = false
}: PluginSecurityScannerProps) {
  const [scanResults, setScanResults] = useState<SecurityScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeScan, setActiveScan] = useState<SecurityScanResult | null>(null);
  const [selectedResult, setSelectedResult] = useState<SecurityScanResult | null>(null);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const apiClient = new ApiClient();

  useEffect(() => {
    loadScanResults();
  }, [pluginId, serverId]);

  const loadScanResults = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock scan results
      const mockResults = generateMockScanResults();
      setScanResults(mockResults);
    } catch (err) {
      setError('Failed to load security scan results');
    } finally {
      setLoading(false);
    }
  };

  const generateMockScanResults = (): SecurityScanResult[] => [
    {
      id: '1',
      pluginId: pluginId || '1',
      pluginName: 'AutoBackup Pro',
      pluginVersion: '2.1.0',
      scanType: 'full',
      status: 'completed',
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      scanDuration: 1800, // 30 minutes
      overallScore: 85,
      riskLevel: 'medium',
      vulnerabilities: [
        {
          id: '1',
          type: 'security',
          severity: 'medium',
          title: 'Potential SQL Injection',
          description: 'User input is not properly sanitized before database queries',
          location: 'src/database/queries.js:45',
          recommendation: 'Use parameterized queries or prepared statements',
          score: 6.5,
          fixAvailable: true,
          references: ['https://owasp.org/www-community/attacks/SQL_Injection']
        },
        {
          id: '2',
          type: 'outdated_dependency',
          severity: 'high',
          title: 'Outdated Dependency with Known Vulnerabilities',
          description: 'Library "axios" version 0.21.0 has known security vulnerabilities',
          location: 'package.json',
          recommendation: 'Update to axios version 1.6.0 or later',
          cveId: 'CVE-2023-45857',
          score: 7.8,
          fixAvailable: true,
          references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-45857']
        }
      ],
      codeIssues: [
        {
          id: '1',
          type: 'security',
          severity: 'warning',
          title: 'Hardcoded API Key',
          description: 'API key found in source code',
          file: 'src/config/api.js',
          line: 12,
          column: 20,
          code: 'const API_KEY = "sk-1234567890abcdef"',
          fix: 'Move API key to environment variables'
        },
        {
          id: '2',
          type: 'performance',
          severity: 'info',
          title: 'Inefficient Database Query',
          description: 'Query could be optimized with indexing',
          file: 'src/database/queries.js',
          line: 28,
          column: 5,
          code: 'SELECT * FROM backups WHERE created_at > ?',
          fix: 'Add index on created_at column'
        }
      ],
      permissionAnalysis: {
        score: 75,
        riskyPermissions: [
          {
            permission: 'file_system_write',
            risk: 'medium',
            description: 'Can write to any file system location',
            usage: 'Used for creating backup files'
          },
          {
            permission: 'network_access',
            risk: 'low',
            description: 'Can make network requests',
            usage: 'Used for cloud storage uploads'
          }
        ],
        unusedPermissions: ['console_command_execution'],
        recommendedPermissions: ['file_system_read', 'file_system_write', 'network_access']
      },
      networkAnalysis: {
        score: 90,
        externalConnections: [
          {
            host: 'api.aws.com',
            port: 443,
            protocol: 'HTTPS',
            encrypted: true,
            risk: 'low',
            purpose: 'Cloud storage backup'
          },
          {
            host: 'backup-service.example.com',
            port: 80,
            protocol: 'HTTP',
            encrypted: false,
            risk: 'medium',
            purpose: 'Backup verification'
          }
        ],
        dataTransmission: {
          sensitiveData: true,
          encryption: true,
          compression: true
        }
      },
      fileSystemAnalysis: {
        score: 95,
        fileAccess: [
          {
            path: '/server/world',
            access: 'read',
            risk: 'low',
            purpose: 'Reading world files for backup'
          },
          {
            path: '/server/config',
            access: 'read',
            risk: 'low',
            purpose: 'Reading configuration files'
          }
        ],
        suspiciousFiles: []
      },
      summary: {
        totalIssues: 4,
        criticalIssues: 0,
        highIssues: 1,
        mediumIssues: 2,
        lowIssues: 1,
        fixableIssues: 3,
        filesScanned: 45,
        linesScanned: 8920
      }
    },
    {
      id: '2',
      pluginId: '5',
      pluginName: 'Performance Monitor',
      pluginVersion: '2.0.2',
      scanType: 'quick',
      status: 'completed',
      startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      scanDuration: 300, // 5 minutes
      overallScore: 95,
      riskLevel: 'low',
      vulnerabilities: [],
      codeIssues: [
        {
          id: '1',
          type: 'style',
          severity: 'info',
          title: 'Inconsistent Code Style',
          description: 'Code formatting is inconsistent',
          file: 'src/monitor.js',
          line: 156,
          column: 1,
          code: 'function getMetrics(){',
          fix: 'Add space before opening brace'
        }
      ],
      permissionAnalysis: {
        score: 95,
        riskyPermissions: [
          {
            permission: 'system_metrics',
            risk: 'low',
            description: 'Can read system performance metrics',
            usage: 'Used for monitoring server performance'
          }
        ],
        unusedPermissions: [],
        recommendedPermissions: ['system_metrics', 'network_access']
      },
      networkAnalysis: {
        score: 100,
        externalConnections: [],
        dataTransmission: {
          sensitiveData: false,
          encryption: false,
          compression: false
        }
      },
      fileSystemAnalysis: {
        score: 100,
        fileAccess: [
          {
            path: '/proc/stat',
            access: 'read',
            risk: 'low',
            purpose: 'Reading system statistics'
          }
        ],
        suspiciousFiles: []
      },
      summary: {
        totalIssues: 1,
        criticalIssues: 0,
        highIssues: 0,
        mediumIssues: 0,
        lowIssues: 1,
        fixableIssues: 1,
        filesScanned: 12,
        linesScanned: 2450
      }
    }
  ];

  const handleStartScan = async (pluginId: string, scanType: 'full' | 'quick' | 'targeted') => {
    try {
      setError(null);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const plugin = scanResults.find(r => r.pluginId === pluginId);
      const newScan: SecurityScanResult = {
        id: Date.now().toString(),
        pluginId,
        pluginName: plugin?.pluginName || 'Unknown Plugin',
        pluginVersion: plugin?.pluginVersion || '1.0.0',
        scanType,
        status: 'scanning',
        startedAt: new Date().toISOString(),
        scanDuration: 0,
        overallScore: 0,
        riskLevel: 'low',
        vulnerabilities: [],
        codeIssues: [],
        permissionAnalysis: {
          score: 0,
          riskyPermissions: [],
          unusedPermissions: [],
          recommendedPermissions: []
        },
        networkAnalysis: {
          score: 0,
          externalConnections: [],
          dataTransmission: {
            sensitiveData: false,
            encryption: false,
            compression: false
          }
        },
        fileSystemAnalysis: {
          score: 0,
          fileAccess: [],
          suspiciousFiles: []
        },
        summary: {
          totalIssues: 0,
          criticalIssues: 0,
          highIssues: 0,
          mediumIssues: 0,
          lowIssues: 0,
          fixableIssues: 0,
          filesScanned: 0,
          linesScanned: 0
        }
      };
      
      setActiveScan(newScan);
      setScanModalOpen(false);
      
      // Simulate scan completion
      const scanDuration = scanType === 'full' ? 30000 : scanType === 'quick' ? 10000 : 20000;
      setTimeout(() => {
        const completedScan = {
          ...newScan,
          status: 'completed' as const,
          completedAt: new Date().toISOString(),
          scanDuration: scanDuration / 1000,
          overallScore: Math.floor(Math.random() * 40) + 60, // 60-100
          riskLevel: (['low', 'medium', 'high'] as const)[Math.floor(Math.random() * 3)],
          summary: {
            totalIssues: Math.floor(Math.random() * 5) + 1,
            criticalIssues: Math.floor(Math.random() * 2),
            highIssues: Math.floor(Math.random() * 3),
            mediumIssues: Math.floor(Math.random() * 3),
            lowIssues: Math.floor(Math.random() * 2),
            fixableIssues: Math.floor(Math.random() * 4),
            filesScanned: Math.floor(Math.random() * 50) + 10,
            linesScanned: Math.floor(Math.random() * 10000) + 1000
          }
        };
        
        setScanResults(prev => [completedScan, ...prev.slice(1)]);
        setActiveScan(null);
      }, scanDuration);
      
    } catch (err) {
      setError('Failed to start security scan');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500 bg-green-900';
      case 'medium': return 'text-yellow-500 bg-yellow-900';
      case 'high': return 'text-orange-500 bg-orange-900';
      case 'critical': return 'text-red-500 bg-red-900';
      default: return 'text-gray-500 bg-gray-900';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Info className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const filteredResults = scanResults.filter(result => {
    const matchesSearch = !searchTerm || 
      result.pluginName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.pluginVersion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || result.riskLevel === filterSeverity;
    const matchesType = filterType === 'all' || result.scanType === filterType;
    
    return matchesSearch && matchesSeverity && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading security scans..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Plugin Security Scanner</h2>
          <p className="text-gray-400">Scan plugins for security vulnerabilities and code issues</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScanModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Scan className="w-4 h-4" />
            New Scan
          </button>
          
          <button
            onClick={loadScanResults}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Active Scan */}
      {activeScan && (
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="animate-spin">
                <Scan className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Scanning {activeScan.pluginName}</h3>
                <p className="text-sm text-blue-200">
                  {activeScan.scanType} scan in progress...
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200">Status</div>
              <div className="text-blue-100 font-medium">{activeScan.status}</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search plugins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Risk Levels</option>
          <option value="low">Low Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="high">High Risk</option>
          <option value="critical">Critical Risk</option>
        </select>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Scan Types</option>
          <option value="full">Full Scan</option>
          <option value="quick">Quick Scan</option>
          <option value="targeted">Targeted Scan</option>
        </select>
      </div>

      {/* Scan Results */}
      <div className="space-y-4">
        {filteredResults.map((result) => (
          <div key={result.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">{result.pluginName}</h3>
                    <span className="text-sm text-gray-400">v{result.pluginVersion}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(result.riskLevel)}`}>
                      {result.riskLevel} risk
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(result.startedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Scan className="w-4 h-4" />
                      <span>{result.scanType} scan</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>{result.summary.filesScanned} files</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Security Score</div>
                  <div className={`text-xl font-bold ${getScoreColor(result.overallScore)}`}>
                    {result.overallScore}/100
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedResult(result);
                    setDetailsModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
            
            {/* Issue Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              <div className="text-center">
                <div className="text-red-400 font-semibold text-lg">{result.summary.criticalIssues}</div>
                <div className="text-xs text-gray-400">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-orange-400 font-semibold text-lg">{result.summary.highIssues}</div>
                <div className="text-xs text-gray-400">High</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-semibold text-lg">{result.summary.mediumIssues}</div>
                <div className="text-xs text-gray-400">Medium</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-semibold text-lg">{result.summary.lowIssues}</div>
                <div className="text-xs text-gray-400">Low</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-semibold text-lg">{result.summary.fixableIssues}</div>
                <div className="text-xs text-gray-400">Fixable</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResults.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No security scans found</h3>
          <p className="text-gray-500">
            {scanResults.length === 0 
              ? 'No security scans have been run yet. Start your first scan to check for vulnerabilities.'
              : 'No scans match your current filters.'
            }
          </p>
        </div>
      )}

      {/* Start Scan Modal */}
      <StartScanModal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        onStartScan={handleStartScan}
        pluginId={pluginId}
      />

      {/* Scan Details Modal */}
      <ScanDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedResult(null);
        }}
        scanResult={selectedResult}
      />
    </div>
  );
}

// Start Scan Modal Component
function StartScanModal({ 
  isOpen, 
  onClose, 
  onStartScan, 
  pluginId 
}: {
  isOpen: boolean;
  onClose: () => void;
  onStartScan: (pluginId: string, scanType: 'full' | 'quick' | 'targeted') => void;
  pluginId?: string;
}) {
  const [selectedPlugin, setSelectedPlugin] = useState(pluginId || '');
  const [scanType, setScanType] = useState<'full' | 'quick' | 'targeted'>('quick');
  const [scanning, setScanning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlugin) {
      alert('Please select a plugin to scan');
      return;
    }
    
    setScanning(true);
    
    try {
      await onStartScan(selectedPlugin, scanType);
    } finally {
      setScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-md px-6 py-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 border border-gray-700 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Start Security Scan</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Plugin to Scan
              </label>
              <select
                value={selectedPlugin}
                onChange={(e) => setSelectedPlugin(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select a plugin...</option>
                <option value="1">AutoBackup Pro</option>
                <option value="2">AdvancedEconomy</option>
                <option value="3">PvP Arena Manager</option>
                <option value="4">Chat Moderator AI</option>
                <option value="5">Performance Monitor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scan Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="quick"
                    checked={scanType === 'quick'}
                    onChange={(e) => setScanType(e.target.value as any)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div>
                    <span className="text-sm text-gray-300">Quick Scan</span>
                    <p className="text-xs text-gray-500">Basic security checks (~5 minutes)</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="full"
                    checked={scanType === 'full'}
                    onChange={(e) => setScanType(e.target.value as any)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div>
                    <span className="text-sm text-gray-300">Full Scan</span>
                    <p className="text-xs text-gray-500">Comprehensive security analysis (~30 minutes)</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="targeted"
                    checked={scanType === 'targeted'}
                    onChange={(e) => setScanType(e.target.value as any)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div>
                    <span className="text-sm text-gray-300">Targeted Scan</span>
                    <p className="text-xs text-gray-500">Focus on specific vulnerabilities (~15 minutes)</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={scanning}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scanning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Scan className="w-4 h-4" />
                )}
                Start Scan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Scan Details Modal Component
function ScanDetailsModal({ 
  isOpen, 
  onClose, 
  scanResult 
}: {
  isOpen: boolean;
  onClose: () => void;
  scanResult: SecurityScanResult | null;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'vulnerabilities' | 'code' | 'permissions' | 'network' | 'files'>('overview');

  if (!isOpen || !scanResult) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl px-6 py-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 border border-gray-700 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">{scanResult.pluginName} Security Report</h3>
              <p className="text-gray-400">
                {scanResult.scanType} scan completed on {new Date(scanResult.startedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-4 mb-6 border-b border-gray-700">
            {[
              { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
              { id: 'vulnerabilities', label: 'Vulnerabilities', icon: <AlertTriangle className="w-4 h-4" /> },
              { id: 'code', label: 'Code Issues', icon: <Code className="w-4 h-4" /> },
              { id: 'permissions', label: 'Permissions', icon: <Lock className="w-4 h-4" /> },
              { id: 'network', label: 'Network', icon: <Globe className="w-4 h-4" /> },
              { id: 'files', label: 'File System', icon: <Database className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Overall Score</h4>
                    <div className="text-2xl font-bold text-green-400">{scanResult.overallScore}/100</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Risk Level</h4>
                    <div className={`px-2 py-1 rounded text-sm font-medium ${getRiskColor(scanResult.riskLevel)}`}>
                      {scanResult.riskLevel}
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Issues Found</h4>
                    <div className="text-2xl font-bold text-white">{scanResult.summary.totalIssues}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-red-400 font-semibold text-xl">{scanResult.summary.criticalIssues}</div>
                    <div className="text-sm text-gray-400">Critical</div>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-400 font-semibold text-xl">{scanResult.summary.highIssues}</div>
                    <div className="text-sm text-gray-400">High</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400 font-semibold text-xl">{scanResult.summary.mediumIssues}</div>
                    <div className="text-sm text-gray-400">Medium</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-semibold text-xl">{scanResult.summary.lowIssues}</div>
                    <div className="text-sm text-gray-400">Low</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vulnerabilities' && (
              <div className="space-y-4">
                {scanResult.vulnerabilities.map((vuln) => (
                  <div key={vuln.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(vuln.severity)}
                        <h4 className="font-medium text-white">{vuln.title}</h4>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(vuln.severity)}`}>
                        {vuln.severity}
                      </div>
                    </div>
                    <p className="text-gray-300 mb-2">{vuln.description}</p>
                    <div className="text-sm text-gray-400 mb-2">
                      Location: {vuln.location}
                    </div>
                    <div className="text-sm text-blue-300">
                      Recommendation: {vuln.recommendation}
                    </div>
                    {vuln.cveId && (
                      <div className="text-sm text-gray-400 mt-2">
                        CVE ID: {vuln.cveId}
                      </div>
                    )}
                  </div>
                ))}
                
                {scanResult.vulnerabilities.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-gray-400">No vulnerabilities found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'code' && (
              <div className="space-y-4">
                {scanResult.codeIssues.map((issue) => (
                  <div key={issue.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(issue.severity)}
                        <h4 className="font-medium text-white">{issue.title}</h4>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(issue.severity)}`}>
                        {issue.severity}
                      </div>
                    </div>
                    <p className="text-gray-300 mb-2">{issue.description}</p>
                    <div className="text-sm text-gray-400 mb-2">
                      {issue.file}:{issue.line}:{issue.column}
                    </div>
                    <div className="bg-gray-800 rounded p-2 text-sm font-mono text-gray-300">
                      {issue.code}
                    </div>
                    {issue.fix && (
                      <div className="text-sm text-blue-300 mt-2">
                        Fix: {issue.fix}
                      </div>
                    )}
                  </div>
                ))}
                
                {scanResult.codeIssues.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-gray-400">No code issues found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Permission Score</h4>
                  <div className="text-2xl font-bold text-green-400">{scanResult.permissionAnalysis.score}/100</div>
                </div>
                
                {scanResult.permissionAnalysis.riskyPermissions.length > 0 && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3">Risky Permissions</h4>
                    <div className="space-y-2">
                      {scanResult.permissionAnalysis.riskyPermissions.map((perm, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                          <div>
                            <div className="font-medium text-white">{perm.permission}</div>
                            <div className="text-sm text-gray-400">{perm.description}</div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(perm.risk)}`}>
                            {perm.risk}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'network' && (
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Network Score</h4>
                  <div className="text-2xl font-bold text-green-400">{scanResult.networkAnalysis.score}/100</div>
                </div>
                
                {scanResult.networkAnalysis.externalConnections.length > 0 && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3">External Connections</h4>
                    <div className="space-y-2">
                      {scanResult.networkAnalysis.externalConnections.map((conn, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                          <div>
                            <div className="font-medium text-white">{conn.host}:{conn.port}</div>
                            <div className="text-sm text-gray-400">{conn.protocol} - {conn.purpose}</div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(conn.risk)}`}>
                            {conn.risk}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'files' && (
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">File System Score</h4>
                  <div className="text-2xl font-bold text-green-400">{scanResult.fileSystemAnalysis.score}/100</div>
                </div>
                
                {scanResult.fileSystemAnalysis.fileAccess.length > 0 && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3">File Access</h4>
                    <div className="space-y-2">
                      {scanResult.fileSystemAnalysis.fileAccess.map((access, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                          <div>
                            <div className="font-medium text-white">{access.path}</div>
                            <div className="text-sm text-gray-400">{access.access} - {access.purpose}</div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(access.risk)}`}>
                            {access.risk}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get risk color (defined outside component to avoid re-declaration)
function getRiskColor(risk: string) {
  switch (risk) {
    case 'low': return 'text-green-500 bg-green-900';
    case 'medium': return 'text-yellow-500 bg-yellow-900';
    case 'high': return 'text-orange-500 bg-orange-900';
    case 'critical': return 'text-red-500 bg-red-900';
    default: return 'text-gray-500 bg-gray-900';
  }
}