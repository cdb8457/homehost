'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  Eye,
  EyeOff,
  Key,
  FileText,
  Search,
  Filter,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  RotateCcw,
  Clock,
  Calendar,
  Target,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Users,
  User,
  Server,
  Database,
  Network,
  Globe,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Plus,
  Minus,
  X,
  Edit,
  Save,
  Copy,
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
  Folder,
  FolderOpen,
  File,
  Code,
  Terminal,
  Brain,
  Zap,
  Fire,
  Sparkles,
  Lightbulb,
  Star,
  Award,
  Crown,
  Heart,
  ThumbsUp,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Link,
  Gamepad2
} from 'lucide-react';

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  category: 'authentication' | 'authorization' | 'encryption' | 'network' | 'data_protection' | 'compliance';
  status: 'active' | 'inactive' | 'warning' | 'violated';
  severity: 'low' | 'medium' | 'high' | 'critical';
  compliance: ComplianceFramework[];
  rules: SecurityRule[];
  violations: SecurityViolation[];
  lastEvaluated: number;
  nextEvaluation: number;
  automatedRemediation: boolean;
  owner: string;
  created: number;
  lastModified: number;
}

interface SecurityRule {
  id: string;
  name: string;
  description: string;
  type: 'preventive' | 'detective' | 'corrective' | 'compensating';
  enabled: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  exceptions: string[];
  metrics: {
    triggers: number;
    violations: number;
    effectiveness: number;
  };
}

interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'regex' | 'range';
  value: any;
  weight: number;
}

interface RuleAction {
  type: 'alert' | 'block' | 'quarantine' | 'log' | 'remediate' | 'notify';
  parameters: Record<string, any>;
  enabled: boolean;
}

interface SecurityViolation {
  id: string;
  policyId: string;
  ruleId: string;
  serverId: string;
  serverName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive' | 'accepted_risk';
  title: string;
  description: string;
  category: string;
  evidence: ViolationEvidence[];
  impact: {
    confidentiality: 'none' | 'low' | 'medium' | 'high';
    integrity: 'none' | 'low' | 'medium' | 'high';
    availability: 'none' | 'low' | 'medium' | 'high';
    estimatedCost: number;
  };
  remediation: {
    steps: string[];
    estimatedTime: number;
    automation: boolean;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
  };
  detected: number;
  resolved?: number;
  assignee: string;
}

interface ViolationEvidence {
  type: 'log' | 'network_traffic' | 'file_access' | 'configuration' | 'behavioral';
  source: string;
  timestamp: number;
  data: any;
  severity: string;
}

interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
  score: number;
  controls: ComplianceControl[];
  lastAssessment: number;
  nextAssessment: number;
}

interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'not_assessed';
  evidence: string[];
  gaps: string[];
  lastChecked: number;
}

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  type: 'data_breach' | 'unauthorized_access' | 'malware' | 'ddos' | 'insider_threat' | 'compliance_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'assigned' | 'investigating' | 'contained' | 'resolved' | 'closed';
  source: string;
  affectedSystems: string[];
  timeline: IncidentEvent[];
  response: {
    team: string[];
    actions: string[];
    communications: string[];
    costs: number;
  };
  lessons: string[];
  created: number;
  resolved?: number;
  assignee: string;
}

interface IncidentEvent {
  timestamp: number;
  type: 'detection' | 'escalation' | 'action' | 'communication' | 'resolution';
  description: string;
  actor: string;
}

interface SecurityMetric {
  id: string;
  name: string;
  category: 'detection' | 'response' | 'prevention' | 'compliance' | 'awareness';
  value: number;
  unit: string;
  target: number;
  trend: 'improving' | 'degrading' | 'stable';
  period: string;
  benchmark: number;
  lastUpdated: number;
}

interface SecurityThreat {
  id: string;
  name: string;
  type: 'vulnerability' | 'malware' | 'attack_pattern' | 'insider_threat' | 'supply_chain';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: number;
  riskScore: number;
  status: 'identified' | 'analyzed' | 'mitigated' | 'accepted' | 'transferred';
  mitigations: ThreatMitigation[];
  indicators: ThreatIndicator[];
  intelligence: {
    source: string;
    confidence: number;
    lastUpdated: number;
  };
  affectedAssets: string[];
  created: number;
  lastModified: number;
}

interface ThreatMitigation {
  id: string;
  description: string;
  type: 'preventive' | 'detective' | 'corrective';
  status: 'planned' | 'implementing' | 'completed' | 'verified';
  effectiveness: number;
  cost: number;
  owner: string;
}

interface ThreatIndicator {
  type: 'ip_address' | 'domain' | 'file_hash' | 'behavior' | 'anomaly';
  value: string;
  confidence: number;
  lastSeen: number;
}

interface SecurityComplianceMonitoringProps {
  className?: string;
}

export function SecurityComplianceMonitoring({ className = '' }: SecurityComplianceMonitoringProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [compliance, setCompliance] = useState<ComplianceFramework[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<SecurityViolation | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'violations' | 'incidents' | 'compliance' | 'threats'>('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const wsRef = useRef<WebSocket | null>(null);

  const generateMockPolicies = useCallback((): SecurityPolicy[] => {
    const categories = ['authentication', 'authorization', 'encryption', 'network', 'data_protection', 'compliance'] as const;
    const statuses = ['active', 'inactive', 'warning', 'violated'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;

    return Array.from({ length: 12 }, (_, i) => ({
      id: `policy-${i + 1}`,
      name: [
        'Multi-Factor Authentication Policy',
        'Password Complexity Requirements',
        'Data Encryption Standards',
        'Network Access Control',
        'Privileged User Management',
        'Data Loss Prevention',
        'Incident Response Protocol',
        'Vulnerability Management',
        'Access Review Requirements',
        'Backup Security Policy',
        'Cloud Security Configuration',
        'Third-Party Risk Management'
      ][i],
      description: `Security policy for ${categories[i % categories.length]} controls and compliance requirements`,
      category: categories[i % categories.length],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      compliance: [
        { id: 'sox', name: 'SOX', version: '2023', status: 'compliant', score: 95, controls: [], lastAssessment: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, nextAssessment: Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000 },
        { id: 'pci', name: 'PCI DSS', version: '4.0', status: 'partial', score: 78, controls: [], lastAssessment: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, nextAssessment: Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000 }
      ].slice(0, Math.floor(1 + Math.random() * 2)),
      rules: Array.from({ length: Math.floor(2 + Math.random() * 5) }, (_, j) => ({
        id: `rule-${j + 1}`,
        name: `Security Rule ${j + 1}`,
        description: `Rule description for ${j + 1}`,
        type: ['preventive', 'detective', 'corrective', 'compensating'][Math.floor(Math.random() * 4)] as const,
        enabled: Math.random() > 0.2,
        conditions: [],
        actions: [],
        exceptions: [],
        metrics: {
          triggers: Math.floor(Math.random() * 100),
          violations: Math.floor(Math.random() * 20),
          effectiveness: 0.7 + Math.random() * 0.29
        }
      })),
      violations: [],
      lastEvaluated: Date.now() - Math.random() * 6 * 60 * 60 * 1000,
      nextEvaluation: Date.now() + Math.random() * 24 * 60 * 60 * 1000,
      automatedRemediation: Math.random() > 0.5,
      owner: ['Security Team', 'IT Operations', 'Compliance Team'][Math.floor(Math.random() * 3)],
      created: Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000,
      lastModified: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    }));
  }, []);

  const generateMockViolations = useCallback((): SecurityViolation[] => {
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    const statuses = ['open', 'investigating', 'resolved', 'false_positive', 'accepted_risk'] as const;
    const categories = ['Authentication', 'Authorization', 'Encryption', 'Network', 'Data Protection'];

    return Array.from({ length: 15 }, (_, i) => ({
      id: `violation-${i + 1}`,
      policyId: `policy-${Math.floor(Math.random() * 12) + 1}`,
      ruleId: `rule-${Math.floor(Math.random() * 5) + 1}`,
      serverId: `server-${Math.floor(Math.random() * 10) + 1}`,
      serverName: `GameServer-${Math.floor(Math.random() * 10) + 1}`,
      severity: severities[Math.floor(Math.random() * severities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      title: [
        'Failed login attempts exceed threshold',
        'Unauthorized privilege escalation detected',
        'Unencrypted data transmission detected',
        'Suspicious network access pattern',
        'Data exfiltration attempt blocked',
        'Configuration drift detected',
        'Outdated security patches found',
        'Weak password policy violation',
        'Excessive user permissions granted',
        'Insecure API endpoint exposed',
        'Missing security headers',
        'SQL injection attempt detected',
        'Cross-site scripting vulnerability',
        'File integrity violation',
        'Unauthorized software installation'
      ][i],
      description: `Detailed description of security violation ${i + 1} including technical details and potential impact`,
      category: categories[i % categories.length],
      evidence: Array.from({ length: Math.floor(1 + Math.random() * 3) }, (_, j) => ({
        type: ['log', 'network_traffic', 'file_access', 'configuration', 'behavioral'][j % 5] as const,
        source: `Evidence Source ${j + 1}`,
        timestamp: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
        data: { details: `Evidence data ${j + 1}` },
        severity: severities[Math.floor(Math.random() * severities.length)]
      })),
      impact: {
        confidentiality: ['none', 'low', 'medium', 'high'][Math.floor(Math.random() * 4)] as const,
        integrity: ['none', 'low', 'medium', 'high'][Math.floor(Math.random() * 4)] as const,
        availability: ['none', 'low', 'medium', 'high'][Math.floor(Math.random() * 4)] as const,
        estimatedCost: Math.floor(Math.random() * 10000)
      },
      remediation: {
        steps: [
          'Investigate the security violation',
          'Identify root cause',
          'Apply security patches',
          'Update security configurations',
          'Monitor for recurrence'
        ],
        estimatedTime: Math.floor(1 + Math.random() * 24),
        automation: Math.random() > 0.5,
        status: ['pending', 'in_progress', 'completed', 'failed'][Math.floor(Math.random() * 4)] as const
      },
      detected: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      resolved: Math.random() > 0.5 ? Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000 : undefined,
      assignee: ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown'][Math.floor(Math.random() * 4)]
    }));
  }, []);

  const generateMockIncidents = useCallback((): SecurityIncident[] => {
    const types = ['data_breach', 'unauthorized_access', 'malware', 'ddos', 'insider_threat', 'compliance_violation'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    const statuses = ['new', 'assigned', 'investigating', 'contained', 'resolved', 'closed'] as const;

    return Array.from({ length: 8 }, (_, i) => ({
      id: `incident-${i + 1}`,
      title: [
        'Suspected data breach in customer database',
        'Unauthorized access to admin panel',
        'Malware detected on game servers',
        'DDoS attack targeting web infrastructure',
        'Insider threat: suspicious data access',
        'PCI compliance violation detected',
        'Phishing attack targeting employees',
        'Ransomware attempt blocked'
      ][i],
      description: `Detailed description of security incident ${i + 1} including timeline and impact assessment`,
      type: types[i % types.length],
      severity: severities[Math.floor(Math.random() * severities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      source: ['IDS', 'SIEM', 'User Report', 'Automated Scan', 'Third Party'][Math.floor(Math.random() * 5)],
      affectedSystems: [`System-${Math.floor(Math.random() * 5) + 1}`, `System-${Math.floor(Math.random() * 5) + 6}`],
      timeline: Array.from({ length: Math.floor(2 + Math.random() * 5) }, (_, j) => ({
        timestamp: Date.now() - (j * 2 * 60 * 60 * 1000),
        type: ['detection', 'escalation', 'action', 'communication', 'resolution'][j % 5] as const,
        description: `Timeline event ${j + 1}`,
        actor: ['System', 'Security Team', 'Manager', 'External'][Math.floor(Math.random() * 4)]
      })),
      response: {
        team: ['Security Team', 'IT Operations', 'Legal Team'].slice(0, Math.floor(1 + Math.random() * 3)),
        actions: ['Isolated affected systems', 'Collected evidence', 'Notified stakeholders'],
        communications: ['Internal team notification', 'Management briefing'],
        costs: Math.floor(Math.random() * 50000)
      },
      lessons: ['Improve monitoring coverage', 'Update incident response procedures'],
      created: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      resolved: Math.random() > 0.5 ? Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 : undefined,
      assignee: ['Alice Johnson', 'Bob Smith', 'Carol Williams'][Math.floor(Math.random() * 3)]
    }));
  }, []);

  const generateMockThreats = useCallback((): SecurityThreat[] => {
    const types = ['vulnerability', 'malware', 'attack_pattern', 'insider_threat', 'supply_chain'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    const statuses = ['identified', 'analyzed', 'mitigated', 'accepted', 'transferred'] as const;

    return Array.from({ length: 10 }, (_, i) => ({
      id: `threat-${i + 1}`,
      name: [
        'CVE-2024-1234: Remote Code Execution',
        'Advanced Persistent Threat Group APT29',
        'Credential Stuffing Campaign',
        'Insider Threat: Privileged User Risk',
        'Supply Chain Compromise: Third-party Library',
        'Zero-day Exploit in Web Framework',
        'Ransomware Family: BlackCat',
        'State-sponsored Cyber Espionage',
        'Social Engineering Campaign',
        'IoT Botnet: Mirai Variant'
      ][i],
      type: types[i % types.length],
      severity: severities[Math.floor(Math.random() * severities.length)],
      probability: Math.random(),
      impact: Math.random(),
      riskScore: Math.random() * 100,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      mitigations: Array.from({ length: Math.floor(1 + Math.random() * 3) }, (_, j) => ({
        id: `mitigation-${j + 1}`,
        description: `Mitigation strategy ${j + 1}`,
        type: ['preventive', 'detective', 'corrective'][Math.floor(Math.random() * 3)] as const,
        status: ['planned', 'implementing', 'completed', 'verified'][Math.floor(Math.random() * 4)] as const,
        effectiveness: Math.random(),
        cost: Math.floor(Math.random() * 10000),
        owner: 'Security Team'
      })),
      indicators: Array.from({ length: Math.floor(1 + Math.random() * 4) }, (_, k) => ({
        type: ['ip_address', 'domain', 'file_hash', 'behavior', 'anomaly'][k % 5] as const,
        value: `Indicator-${k + 1}`,
        confidence: Math.random(),
        lastSeen: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      })),
      intelligence: {
        source: ['Internal Analysis', 'Threat Feed', 'Open Source', 'Commercial Intel'][Math.floor(Math.random() * 4)],
        confidence: Math.random(),
        lastUpdated: Date.now() - Math.random() * 24 * 60 * 60 * 1000
      },
      affectedAssets: [`Asset-${Math.floor(Math.random() * 10) + 1}`],
      created: Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000,
      lastModified: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    }));
  }, []);

  const generateMockCompliance = useCallback((): ComplianceFramework[] => {
    return [
      {
        id: 'sox',
        name: 'Sarbanes-Oxley (SOX)',
        version: '2023',
        status: 'compliant',
        score: 92,
        controls: Array.from({ length: 15 }, (_, i) => ({
          id: `sox-${i + 1}`,
          name: `SOX Control ${i + 1}`,
          description: `SOX compliance control ${i + 1}`,
          status: ['passed', 'failed', 'warning', 'not_assessed'][Math.floor(Math.random() * 4)] as const,
          evidence: [`Evidence ${i + 1}`],
          gaps: Math.random() > 0.7 ? [`Gap ${i + 1}`] : [],
          lastChecked: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        })),
        lastAssessment: Date.now() - 60 * 24 * 60 * 60 * 1000,
        nextAssessment: Date.now() + 305 * 24 * 60 * 60 * 1000
      },
      {
        id: 'pci',
        name: 'PCI DSS',
        version: '4.0',
        status: 'partial',
        score: 78,
        controls: Array.from({ length: 12 }, (_, i) => ({
          id: `pci-${i + 1}`,
          name: `PCI Control ${i + 1}`,
          description: `PCI DSS control ${i + 1}`,
          status: ['passed', 'failed', 'warning', 'not_assessed'][Math.floor(Math.random() * 4)] as const,
          evidence: [`Evidence ${i + 1}`],
          gaps: Math.random() > 0.6 ? [`Gap ${i + 1}`] : [],
          lastChecked: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        })),
        lastAssessment: Date.now() - 30 * 24 * 60 * 60 * 1000,
        nextAssessment: Date.now() + 335 * 24 * 60 * 60 * 1000
      }
    ];
  }, []);

  const generateMockMetrics = useCallback((): SecurityMetric[] => {
    const categories = ['detection', 'response', 'prevention', 'compliance', 'awareness'] as const;
    
    return Array.from({ length: 10 }, (_, i) => ({
      id: `metric-${i + 1}`,
      name: [
        'Mean Time to Detection (MTTD)',
        'Mean Time to Response (MTTR)',
        'Security Incidents Prevented',
        'Compliance Score',
        'Security Training Completion',
        'Vulnerability Remediation Rate',
        'False Positive Rate',
        'Security Policy Adherence',
        'Threat Intelligence Accuracy',
        'Security Awareness Score'
      ][i],
      category: categories[i % categories.length],
      value: Math.random() * 100,
      unit: ['minutes', 'hours', 'count', 'percentage', 'score'][Math.floor(Math.random() * 5)],
      target: 50 + Math.random() * 40,
      trend: ['improving', 'degrading', 'stable'][Math.floor(Math.random() * 3)] as const,
      period: '30 days',
      benchmark: 60 + Math.random() * 30,
      lastUpdated: Date.now() - Math.random() * 24 * 60 * 60 * 1000
    }));
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setPolicies(generateMockPolicies());
      setViolations(generateMockViolations());
      setIncidents(generateMockIncidents());
      setThreats(generateMockThreats());
      setCompliance(generateMockCompliance());
      setMetrics(generateMockMetrics());
    } catch (error) {
      console.error('Failed to load security compliance data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockPolicies, generateMockViolations, generateMockIncidents, generateMockThreats, generateMockCompliance, generateMockMetrics]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadData();
      }, refreshInterval * 1000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadData]);

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'compliant': case 'passed': case 'resolved': return 'text-green-600 bg-green-50';
      case 'warning': case 'partial': case 'investigating': return 'text-yellow-600 bg-yellow-50';
      case 'violated': case 'non_compliant': case 'failed': case 'open': return 'text-red-600 bg-red-50';
      case 'inactive': case 'closed': case 'not_assessed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const activePolicies = policies.filter(p => p.status === 'active').length;
  const openViolations = violations.filter(v => v.status === 'open').length;
  const criticalViolations = violations.filter(v => v.severity === 'critical' && v.status === 'open').length;
  const avgComplianceScore = compliance.length > 0 ? compliance.reduce((sum, c) => sum + c.score, 0) / compliance.length : 0;
  const openIncidents = incidents.filter(i => !['resolved', 'closed'].includes(i.status)).length;

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Security & Compliance Monitoring</h2>
              <p className="text-sm text-gray-500">Comprehensive security monitoring and compliance management</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded ${autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={loadData}
              className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Policies</p>
                <p className="text-2xl font-bold text-green-900">{activePolicies}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Open Violations</p>
                <p className="text-2xl font-bold text-red-900">{openViolations}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Critical Issues</p>
                <p className="text-2xl font-bold text-orange-900">{criticalViolations}</p>
              </div>
              <XCircle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Open Incidents</p>
                <p className="text-2xl font-bold text-yellow-900">{openIncidents}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Compliance Score</p>
                <p className="text-2xl font-bold text-blue-900">{avgComplianceScore.toFixed(0)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="flex space-x-1 mt-6">
          {['overview', 'policies', 'violations', 'incidents', 'compliance', 'threats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Violations</h3>
                  <AlertTriangle className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-3">
                  {violations.slice(0, 5).map((violation) => (
                    <div key={violation.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{violation.title}</p>
                        <p className="text-xs text-gray-500">{violation.serverName} • {violation.category}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(violation.severity)}`}>
                          {violation.severity}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(violation.detected)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Active Incidents</h3>
                  <AlertCircle className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-3">
                  {incidents.slice(0, 5).map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{incident.title}</p>
                        <p className="text-xs text-gray-500">{incident.type} • {incident.assignee}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(incident.created)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Compliance Status</h3>
                  <CheckCircle className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-3">
                  {compliance.map((framework) => (
                    <div key={framework.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{framework.name}</p>
                        <p className="text-xs text-gray-500">Version {framework.version}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(framework.status)}`}>
                          {framework.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{framework.score}% score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Security Metrics</h3>
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-3">
                  {metrics.slice(0, 5).map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{metric.name}</p>
                        <p className="text-xs text-gray-500">{metric.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-gray-900">{metric.value.toFixed(1)} {metric.unit}</p>
                        <p className={`text-xs ${
                          metric.trend === 'improving' ? 'text-green-600' :
                          metric.trend === 'degrading' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {metric.trend}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Security Policies</h3>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  <Plus className="h-4 w-4 inline mr-1" />
                  New Policy
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  <Upload className="h-4 w-4 inline mr-1" />
                  Import
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {policies.map((policy) => (
                <div key={policy.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${getStatusColor(policy.status)}`}>
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{policy.name}</h4>
                        <p className="text-sm text-gray-500">{policy.category} • {policy.owner}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(policy.severity)}`}>
                        {policy.severity}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(policy.status)}`}>
                        {policy.status}
                      </span>
                      <button
                        onClick={() => setSelectedPolicy(policy)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Rules</p>
                      <p className="font-semibold text-blue-600">{policy.rules.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Violations</p>
                      <p className="font-semibold text-red-600">{policy.violations.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Evaluated</p>
                      <p className="font-semibold text-gray-900">{formatTimeAgo(policy.lastEvaluated)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Auto Remediation</p>
                      <p className={`font-semibold ${policy.automatedRemediation ? 'text-green-600' : 'text-gray-600'}`}>
                        {policy.automatedRemediation ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{policy.compliance.length} frameworks</span>
                      <span>Modified {formatTimeAgo(policy.lastModified)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-gray-400 hover:text-blue-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600">
                        <Play className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue with other tabs... */}
        {/* Similar structure for violations, incidents, compliance, and threats tabs */}
      </div>
    </div>
  );
}