'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Lock,
  Unlock,
  Key,
  Users,
  Server,
  Database,
  Network,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Wifi,
  Bell,
  BellOff,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  Play,
  Pause,
  Square,
  RotateCcw,
  FileText,
  Folder,
  File,
  Code,
  Terminal,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Brain,
  Star,
  Award,
  Crown,
  Fire,
  Sparkles,
  Lightbulb,
  Heart,
  ThumbsUp,
  MessageCircle,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Link,
  Mail,
  Phone,
  Share2,
  Send,
  Plus,
  Minus,
  X,
  Edit,
  Save,
  Copy,
  Trash2,
  ExternalLink,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Maximize,
  Minimize,
  Grid3X3,
  List,
  Layers,
  Info,
  AlertCircle,
  DollarSign,
  User,
  Gamepad2
} from 'lucide-react';

interface SecurityMetric {
  id: string;
  name: string;
  category: 'threats' | 'access' | 'compliance' | 'incidents' | 'vulnerabilities' | 'performance';
  value: number;
  previousValue: number;
  threshold: SecurityThreshold;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: number;
  description: string;
  unit: 'count' | 'percentage' | 'bytes' | 'milliseconds' | 'score';
}

interface SecurityThreshold {
  warning: number;
  critical: number;
  target?: number;
}

interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'intrusion' | 'malware' | 'data_breach' | 'access_violation' | 'policy_violation' | 'system_anomaly';
  source: string;
  timestamp: number;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  affectedAssets: string[];
  riskScore: number;
  details: AlertDetails;
  timeline: AlertEvent[];
  recommendations: string[];
}

interface AlertDetails {
  sourceIP?: string;
  targetIP?: string;
  protocol?: string;
  port?: number;
  userAgent?: string;
  location?: string;
  payload?: string;
  signatures: string[];
  indicators: ThreatIndicator[];
}

interface ThreatIndicator {
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email' | 'file';
  value: string;
  confidence: number;
  source: string;
  firstSeen: number;
  lastSeen: number;
}

interface AlertEvent {
  timestamp: number;
  action: string;
  user: string;
  description: string;
  status: 'success' | 'failure' | 'pending';
}

interface SecurityAsset {
  id: string;
  name: string;
  type: 'server' | 'database' | 'application' | 'network' | 'endpoint' | 'service';
  category: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  status: 'online' | 'offline' | 'maintenance' | 'compromised';
  riskLevel: number;
  vulnerabilities: Vulnerability[];
  lastScanned: number;
  compliance: ComplianceStatus;
  monitoring: MonitoringConfig;
}

interface Vulnerability {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cvssScore: number;
  cveId?: string;
  description: string;
  solution: string;
  discoveredDate: number;
  status: 'open' | 'in_progress' | 'fixed' | 'accepted_risk';
  affectedVersions: string[];
  patchAvailable: boolean;
}

interface ComplianceStatus {
  frameworks: ComplianceFramework[];
  overallScore: number;
  lastAssessment: number;
  nextAssessment: number;
  findings: ComplianceFinding[];
}

interface ComplianceFramework {
  name: string;
  version: string;
  score: number;
  requiredControls: number;
  implementedControls: number;
  status: 'compliant' | 'partial' | 'non_compliant';
}

interface ComplianceFinding {
  id: string;
  control: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'remediated' | 'risk_accepted';
  description: string;
  remediation: string;
  dueDate: number;
}

interface MonitoringConfig {
  enabled: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  alerting: boolean;
  logging: boolean;
  metrics: string[];
}

interface SecurityDashboardConfig {
  refreshInterval: number;
  alertThresholds: { [key: string]: SecurityThreshold };
  monitoring: {
    enableRealtime: boolean;
    retentionPeriod: number;
    alertChannels: string[];
  };
  compliance: {
    frameworks: string[];
    assessmentFrequency: 'monthly' | 'quarterly' | 'annually';
    autoRemediation: boolean;
  };
}

interface ThreatIntelligence {
  id: string;
  type: 'ioc' | 'ttp' | 'campaign' | 'actor';
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  sources: string[];
  indicators: ThreatIndicator[];
  firstSeen: number;
  lastSeen: number;
  relatedThreats: string[];
  mitigations: string[];
}

const SecurityDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'assets' | 'threats' | 'compliance' | 'monitoring'>('overview');
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [assets, setAssets] = useState<SecurityAsset[]>([]);
  const [threats, setThreats] = useState<ThreatIntelligence[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<SecurityAsset | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [alertFilter, setAlertFilter] = useState<string>('all');
  const [assetFilter, setAssetFilter] = useState<string>('all');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(30);
  const [dashboardConfig, setDashboardConfig] = useState<SecurityDashboardConfig | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateMockMetrics = useCallback((): SecurityMetric[] => {
    return [
      {
        id: 'threat_detections',
        name: 'Threat Detections',
        category: 'threats',
        value: Math.floor(Math.random() * 50) + 10,
        previousValue: Math.floor(Math.random() * 45) + 8,
        threshold: { warning: 25, critical: 50 },
        status: 'warning',
        trend: 'up',
        lastUpdated: Date.now(),
        description: 'Number of security threats detected in the last 24 hours',
        unit: 'count'
      },
      {
        id: 'failed_logins',
        name: 'Failed Login Attempts',
        category: 'access',
        value: Math.floor(Math.random() * 200) + 50,
        previousValue: Math.floor(Math.random() * 180) + 40,
        threshold: { warning: 100, critical: 250 },
        status: 'healthy',
        trend: 'stable',
        lastUpdated: Date.now(),
        description: 'Failed authentication attempts across all systems',
        unit: 'count'
      },
      {
        id: 'compliance_score',
        name: 'Compliance Score',
        category: 'compliance',
        value: 85 + Math.random() * 10,
        previousValue: 82 + Math.random() * 8,
        threshold: { warning: 80, critical: 70, target: 95 },
        status: 'healthy',
        trend: 'up',
        lastUpdated: Date.now(),
        description: 'Overall compliance score across all frameworks',
        unit: 'percentage'
      },
      {
        id: 'open_incidents',
        name: 'Open Security Incidents',
        category: 'incidents',
        value: Math.floor(Math.random() * 15) + 2,
        previousValue: Math.floor(Math.random() * 12) + 1,
        threshold: { warning: 10, critical: 20 },
        status: 'healthy',
        trend: 'down',
        lastUpdated: Date.now(),
        description: 'Number of unresolved security incidents',
        unit: 'count'
      },
      {
        id: 'critical_vulnerabilities',
        name: 'Critical Vulnerabilities',
        category: 'vulnerabilities',
        value: Math.floor(Math.random() * 8) + 1,
        previousValue: Math.floor(Math.random() * 10) + 2,
        threshold: { warning: 5, critical: 15 },
        status: 'warning',
        trend: 'down',
        lastUpdated: Date.now(),
        description: 'Number of critical vulnerabilities requiring immediate attention',
        unit: 'count'
      },
      {
        id: 'security_events',
        name: 'Security Events/Hour',
        category: 'performance',
        value: Math.floor(Math.random() * 1000) + 500,
        previousValue: Math.floor(Math.random() * 900) + 450,
        threshold: { warning: 1200, critical: 2000 },
        status: 'healthy',
        trend: 'stable',
        lastUpdated: Date.now(),
        description: 'Average security events processed per hour',
        unit: 'count'
      }
    ];
  }, []);

  const generateMockAlerts = useCallback((): SecurityAlert[] => {
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    const categories = ['intrusion', 'malware', 'data_breach', 'access_violation', 'policy_violation', 'system_anomaly'] as const;
    const statuses = ['open', 'investigating', 'resolved', 'false_positive'] as const;
    
    return Array.from({ length: 25 }, (_, i) => {
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        id: `alert_${i + 1}`,
        title: [
          'Suspicious Login Activity Detected',
          'Malware Signature Match Found',
          'Unusual Data Access Pattern',
          'Failed Administrator Authentication',
          'Policy Violation: Unauthorized File Access',
          'System Anomaly: High CPU Usage',
          'Potential Brute Force Attack',
          'Suspicious Network Traffic',
          'Unauthorized API Access Attempt',
          'Data Exfiltration Warning'
        ][i % 10],
        description: `Security alert detected in ${category.replace('_', ' ')} category with ${severity} severity level requiring immediate attention.`,
        severity,
        category,
        source: ['IDS', 'Firewall', 'Endpoint Protection', 'SIEM', 'Application Security', 'Network Monitor'][Math.floor(Math.random() * 6)],
        timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        status,
        assignedTo: status === 'investigating' ? `analyst_${Math.floor(Math.random() * 5) + 1}` : undefined,
        affectedAssets: [`asset_${Math.floor(Math.random() * 10) + 1}`],
        riskScore: Math.floor(Math.random() * 100),
        details: {
          sourceIP: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          targetIP: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          protocol: ['TCP', 'UDP', 'HTTP', 'HTTPS'][Math.floor(Math.random() * 4)],
          port: [80, 443, 22, 3389, 1433, 3306][Math.floor(Math.random() * 6)],
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: ['US', 'UK', 'DE', 'FR', 'RU', 'CN'][Math.floor(Math.random() * 6)],
          signatures: [`SIG_${Math.floor(Math.random() * 1000)}`],
          indicators: [
            {
              type: 'ip',
              value: `203.0.113.${Math.floor(Math.random() * 255)}`,
              confidence: 70 + Math.random() * 30,
              source: 'ThreatIntel',
              firstSeen: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
              lastSeen: Date.now() - Math.random() * 24 * 60 * 60 * 1000
            }
          ]
        },
        timeline: [
          {
            timestamp: Date.now() - Math.random() * 60 * 60 * 1000,
            action: 'Alert Created',
            user: 'System',
            description: 'Security alert automatically generated',
            status: 'success'
          }
        ],
        recommendations: [
          'Block suspicious IP address',
          'Review user access permissions',
          'Update security policies',
          'Conduct forensic analysis'
        ]
      };
    });
  }, []);

  const generateMockAssets = useCallback((): SecurityAsset[] => {
    const types = ['server', 'database', 'application', 'network', 'endpoint', 'service'] as const;
    const categories = ['critical', 'high', 'medium', 'low'] as const;
    const statuses = ['online', 'offline', 'maintenance', 'compromised'] as const;
    
    return Array.from({ length: 20 }, (_, i) => {
      const assetType = types[Math.floor(Math.random() * types.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const riskLevel = Math.random() * 100;
      
      return {
        id: `asset_${i + 1}`,
        name: `${assetType.charAt(0).toUpperCase() + assetType.slice(1)}-${String(i + 1).padStart(3, '0')}`,
        type: assetType,
        category,
        location: ['Data Center A', 'Data Center B', 'Cloud Region US-East', 'Cloud Region EU-West', 'Remote Office'][Math.floor(Math.random() * 5)],
        status,
        riskLevel,
        vulnerabilities: Array.from({ length: Math.floor(Math.random() * 5) }, (_, j) => ({
          id: `vuln_${i}_${j}`,
          title: `Security Vulnerability ${j + 1}`,
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
          cvssScore: 3 + Math.random() * 7,
          description: 'Security vulnerability requiring attention',
          solution: 'Apply security patch or configuration change',
          discoveredDate: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          status: ['open', 'in_progress', 'fixed', 'accepted_risk'][Math.floor(Math.random() * 4)] as any,
          affectedVersions: ['1.0', '1.1', '1.2'],
          patchAvailable: Math.random() > 0.3
        })),
        lastScanned: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        compliance: {
          frameworks: [
            {
              name: 'SOC 2',
              version: '2017',
              score: 80 + Math.random() * 20,
              requiredControls: 50,
              implementedControls: Math.floor(40 + Math.random() * 10),
              status: 'compliant'
            },
            {
              name: 'ISO 27001',
              version: '2013',
              score: 75 + Math.random() * 25,
              requiredControls: 114,
              implementedControls: Math.floor(90 + Math.random() * 24),
              status: 'partial'
            }
          ],
          overallScore: 80 + Math.random() * 15,
          lastAssessment: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
          nextAssessment: Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000,
          findings: []
        },
        monitoring: {
          enabled: Math.random() > 0.1,
          frequency: ['realtime', 'hourly', 'daily', 'weekly'][Math.floor(Math.random() * 4)] as any,
          alerting: Math.random() > 0.2,
          logging: Math.random() > 0.1,
          metrics: ['cpu', 'memory', 'disk', 'network']
        }
      };
    });
  }, []);

  const generateMockThreats = useCallback((): ThreatIntelligence[] => {
    const types = ['ioc', 'ttp', 'campaign', 'actor'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    
    return Array.from({ length: 15 }, (_, i) => ({
      id: `threat_${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      name: [
        'APT-29 Cozy Bear',
        'Emotet Banking Trojan',
        'Ransomware Campaign 2024',
        'Phishing Infrastructure',
        'C2 Server Network',
        'Cryptomining Botnet',
        'Data Theft Campaign',
        'Supply Chain Attack',
        'Zero-day Exploit Kit',
        'Nation State Actor'
      ][i % 10],
      description: 'Advanced persistent threat with significant impact potential requiring continuous monitoring.',
      severity: severities[Math.floor(Math.random() * severities.length)],
      confidence: 60 + Math.random() * 40,
      sources: ['Internal', 'Commercial Feed', 'Government', 'Open Source'],
      indicators: [
        {
          type: 'ip',
          value: `185.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          confidence: 80 + Math.random() * 20,
          source: 'ThreatIntel',
          firstSeen: Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000,
          lastSeen: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        }
      ],
      firstSeen: Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000,
      lastSeen: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      relatedThreats: [],
      mitigations: [
        'Block malicious IP addresses',
        'Update security signatures',
        'Enhance monitoring rules',
        'User awareness training'
      ]
    }));
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const mockMetrics = generateMockMetrics();
        const mockAlerts = generateMockAlerts();
        const mockAssets = generateMockAssets();
        const mockThreats = generateMockThreats();
        
        setMetrics(mockMetrics);
        setAlerts(mockAlerts);
        setAssets(mockAssets);
        setThreats(mockThreats);
      } catch (error) {
        console.error('Error loading security data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [generateMockMetrics, generateMockAlerts, generateMockAssets, generateMockThreats]);

  useEffect(() => {
    if (refreshInterval) {
      intervalRef.current = setInterval(() => {
        const newMetrics = generateMockMetrics();
        const newAlerts = generateMockAlerts();
        setMetrics(newMetrics);
        setAlerts(newAlerts);
      }, refreshInterval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshInterval, generateMockMetrics, generateMockAlerts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderMetricCard = (metric: SecurityMetric) => {
    const Icon = metric.category === 'threats' ? Shield :
                metric.category === 'access' ? Lock :
                metric.category === 'compliance' ? CheckCircle :
                metric.category === 'incidents' ? AlertTriangle :
                metric.category === 'vulnerabilities' ? XCircle :
                Activity;

    return (
      <div key={metric.id} className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{metric.name}</h3>
              <p className="text-sm text-gray-500">{metric.description}</p>
            </div>
          </div>
          {getTrendIcon(metric.trend)}
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {metric.unit === 'percentage' ? `${metric.value.toFixed(1)}%` : 
               metric.unit === 'bytes' ? `${(metric.value / 1024 / 1024).toFixed(1)}MB` :
               metric.value.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              {metric.previousValue !== undefined && (
                <span className={`${metric.value > metric.previousValue ? 'text-red-600' : 'text-green-600'}`}>
                  {metric.value > metric.previousValue ? '+' : ''}
                  {((metric.value - metric.previousValue) / metric.previousValue * 100).toFixed(1)}%
                </span>
              )}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
            {metric.status.toUpperCase()}
          </span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive security monitoring and threat management</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={() => {
              setMetrics(generateMockMetrics());
              setAlerts(generateMockAlerts());
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'alerts', name: 'Security Alerts', icon: AlertTriangle },
              { id: 'assets', name: 'Asset Security', icon: Server },
              { id: 'threats', name: 'Threat Intel', icon: Shield },
              { id: 'compliance', name: 'Compliance', icon: CheckCircle },
              { id: 'monitoring', name: 'Monitoring', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map(renderMetricCard)}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Security Alerts</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {alerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{alert.title}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(alert.timestamp).toLocaleString()} • {alert.source}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Asset Security Status</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {['online', 'offline', 'maintenance', 'compromised'].map((status) => {
                        const count = assets.filter(a => a.status === status).length;
                        const color = status === 'online' ? 'text-green-600 bg-green-50' :
                                     status === 'offline' ? 'text-gray-600 bg-gray-50' :
                                     status === 'maintenance' ? 'text-yellow-600 bg-yellow-50' :
                                     'text-red-600 bg-red-50';
                        
                        return (
                          <div key={status} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${color.split(' ')[1]}`}></div>
                              <span className="font-medium text-gray-900 capitalize">{status}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Threat Intelligence Summary</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['low', 'medium', 'high', 'critical'].map((severity) => {
                      const count = threats.filter(t => t.severity === severity).length;
                      return (
                        <div key={severity} className={`p-4 rounded-lg ${getSeverityColor(severity)}`}>
                          <div className="text-center">
                            <p className="text-2xl font-bold">{count}</p>
                            <p className="text-sm font-medium capitalize">{severity} Threats</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search alerts..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select 
                    value={alertFilter}
                    onChange={(e) => setAlertFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Alerts</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <Plus className="w-4 h-4" />
                  <span>Create Alert</span>
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alert</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {alerts.slice(0, 15).map((alert) => (
                        <tr key={alert.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                              <div className="text-sm text-gray-500">{alert.description.substring(0, 80)}...</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                            {alert.category.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              alert.status === 'open' ? 'bg-red-100 text-red-800' :
                              alert.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                              alert.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {alert.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{alert.source}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => {
                                setSelectedAlert(alert);
                                setShowAlertModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              Investigate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select 
                    value={assetFilter}
                    onChange={(e) => setAssetFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Assets</option>
                    <option value="critical">Critical</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Plus className="w-4 h-4" />
                  <span>Add Asset</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.slice(0, 12).map((asset) => (
                  <div key={asset.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          asset.status === 'online' ? 'bg-green-100 text-green-600' :
                          asset.status === 'offline' ? 'bg-gray-100 text-gray-600' :
                          asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {asset.type === 'server' ? <Server className="w-5 h-5" /> :
                           asset.type === 'database' ? <Database className="w-5 h-5" /> :
                           asset.type === 'network' ? <Network className="w-5 h-5" /> :
                           <Monitor className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                          <p className="text-sm text-gray-500">{asset.location}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        asset.category === 'critical' ? 'bg-red-100 text-red-800' :
                        asset.category === 'high' ? 'bg-orange-100 text-orange-800' :
                        asset.category === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {asset.category.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Risk Level:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                asset.riskLevel > 70 ? 'bg-red-500' :
                                asset.riskLevel > 40 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${asset.riskLevel}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{asset.riskLevel.toFixed(0)}%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Vulnerabilities:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {asset.vulnerabilities.filter(v => v.status === 'open').length} open
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Compliance:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {asset.compliance.overallScore.toFixed(0)}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Last Scanned:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(asset.lastScanned).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button 
                        onClick={() => {
                          setSelectedAsset(asset);
                          setShowAssetModal(true);
                        }}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;