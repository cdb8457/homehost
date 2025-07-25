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
  EyeOff,
  Target,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Users,
  Server,
  Database,
  Network,
  Globe,
  Smartphone,
  Monitor,
  Wifi,
  WifiOff,
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
  Lock,
  Unlock,
  Key,
  DollarSign,
  User,
  Gamepad2
} from 'lucide-react';

interface ThreatDetectionRule {
  id: string;
  name: string;
  description: string;
  category: 'network' | 'endpoint' | 'application' | 'user_behavior' | 'data_loss' | 'malware';
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'signature' | 'anomaly' | 'behavioral' | 'machine_learning' | 'heuristic';
  status: 'active' | 'inactive' | 'testing';
  conditions: RuleCondition[];
  actions: RuleAction[];
  alertThreshold: number;
  confidence: number;
  falsePositiveRate: number;
  detectionCount: number;
  lastTriggered?: number;
  createdBy: string;
  createdAt: number;
  lastModified: number;
}

interface RuleCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'regex' | 'exists' | 'not_exists';
  value: any;
  logicalOperator?: 'AND' | 'OR' | 'NOT';
  weight: number;
}

interface RuleAction {
  type: 'alert' | 'block' | 'quarantine' | 'log' | 'notify' | 'escalate' | 'investigate';
  parameters: { [key: string]: any };
  enabled: boolean;
  priority: number;
}

interface ThreatDetection {
  id: string;
  ruleId: string;
  ruleName: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  confidence: number;
  riskScore: number;
  timestamp: number;
  status: 'new' | 'investigating' | 'confirmed' | 'false_positive' | 'resolved';
  sourceData: SourceData;
  indicators: ThreatIndicator[];
  context: DetectionContext;
  timeline: DetectionEvent[];
  artifacts: ThreatArtifact[];
  mitigation: MitigationAction[];
  analyst?: string;
  tags: string[];
}

interface SourceData {
  type: 'network' | 'endpoint' | 'application' | 'user' | 'file' | 'email';
  source: string;
  destination?: string;
  protocol?: string;
  port?: number;
  payload?: string;
  headers?: { [key: string]: string };
  metadata: { [key: string]: any };
}

interface ThreatIndicator {
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email' | 'file' | 'registry' | 'process';
  value: string;
  confidence: number;
  category: 'malicious' | 'suspicious' | 'informational';
  source: string;
  firstSeen: number;
  lastSeen: number;
  reputation?: number;
  geolocation?: string;
  asn?: string;
  description?: string;
}

interface DetectionContext {
  userAgent?: string;
  ipGeolocation?: string;
  userInfo?: {
    id: string;
    username: string;
    role: string;
    lastLogin: number;
    riskScore: number;
  };
  assetInfo?: {
    id: string;
    name: string;
    type: string;
    criticality: string;
    owner: string;
  };
  relatedEvents: RelatedEvent[];
  threatIntelligence: ThreatIntelMatch[];
}

interface RelatedEvent {
  id: string;
  type: string;
  timestamp: number;
  correlation: number;
  description: string;
}

interface ThreatIntelMatch {
  source: string;
  indicator: string;
  confidence: number;
  description: string;
  campaign?: string;
  actor?: string;
}

interface DetectionEvent {
  timestamp: number;
  action: string;
  user: string;
  description: string;
  automated: boolean;
  result: 'success' | 'failure' | 'pending';
}

interface ThreatArtifact {
  id: string;
  type: 'file' | 'memory_dump' | 'network_capture' | 'log' | 'screenshot' | 'registry_dump';
  name: string;
  size: number;
  hash: string;
  path: string;
  collected: number;
  analyst?: string;
}

interface MitigationAction {
  id: string;
  type: 'block_ip' | 'quarantine_file' | 'disable_user' | 'isolate_host' | 'update_rules' | 'patch_system';
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  automated: boolean;
  executed: number;
  executedBy: string;
  result?: string;
}

interface ThreatHunt {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  status: 'planning' | 'active' | 'completed' | 'suspended';
  priority: 'low' | 'medium' | 'high' | 'critical';
  huntType: 'manual' | 'automated' | 'hybrid';
  scope: HuntScope;
  queries: HuntQuery[];
  findings: HuntFinding[];
  timeline: HuntEvent[];
  hunter: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  estimatedDuration: number;
}

interface HuntScope {
  timeRange: {
    start: number;
    end: number;
  };
  assets: string[];
  dataTypes: string[];
  indicators: string[];
}

interface HuntQuery {
  id: string;
  name: string;
  query: string;
  queryType: 'siem' | 'edr' | 'network' | 'custom';
  results: number;
  executed: number;
  duration: number;
}

interface HuntFinding {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  evidence: Evidence[];
  recommendations: string[];
  status: 'new' | 'validated' | 'false_positive' | 'escalated';
}

interface Evidence {
  type: 'log' | 'artifact' | 'indicator' | 'correlation';
  source: string;
  data: any;
  timestamp: number;
  relevance: number;
}

interface HuntEvent {
  timestamp: number;
  action: string;
  description: string;
  user: string;
}

interface ThreatIntelligence {
  feeds: ThreatFeed[];
  indicators: ThreatIndicator[];
  campaigns: ThreatCampaign[];
  actors: ThreatActor[];
  reports: ThreatReport[];
}

interface ThreatFeed {
  id: string;
  name: string;
  source: string;
  type: 'commercial' | 'open_source' | 'government' | 'internal';
  status: 'active' | 'inactive' | 'error';
  lastUpdate: number;
  indicatorCount: number;
  confidence: number;
  description: string;
}

interface ThreatCampaign {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  firstSeen: number;
  lastSeen: number;
  actor?: string;
  ttps: string[];
  indicators: string[];
  targets: string[];
  confidence: number;
}

interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  motivation: string[];
  sophistication: 'low' | 'medium' | 'high' | 'expert';
  firstSeen: number;
  lastSeen: number;
  campaigns: string[];
  ttps: string[];
  targets: string[];
}

interface ThreatReport {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  published: number;
  source: string;
  confidence: number;
  tlp: 'white' | 'green' | 'amber' | 'red';
  indicators: string[];
  campaigns: string[];
  actors: string[];
}

const ThreatDetectionSystem: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'detections' | 'rules' | 'hunts' | 'intelligence' | 'analytics'>('detections');
  const [detections, setDetections] = useState<ThreatDetection[]>([]);
  const [rules, setRules] = useState<ThreatDetectionRule[]>([]);
  const [hunts, setHunts] = useState<ThreatHunt[]>([]);
  const [intelligence, setIntelligence] = useState<ThreatIntelligence | null>(null);
  const [selectedDetection, setSelectedDetection] = useState<ThreatDetection | null>(null);
  const [selectedRule, setSelectedRule] = useState<ThreatDetectionRule | null>(null);
  const [showDetectionModal, setShowDetectionModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showHuntModal, setShowHuntModal] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(30);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateMockDetections = useCallback((): ThreatDetection[] => {
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    const categories = ['network', 'endpoint', 'application', 'user_behavior', 'data_loss', 'malware'] as const;
    const statuses = ['new', 'investigating', 'confirmed', 'false_positive', 'resolved'] as const;
    
    return Array.from({ length: 30 }, (_, i) => {
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const confidence = 60 + Math.random() * 40;
      const riskScore = Math.random() * 100;
      
      return {
        id: `detection_${i + 1}`,
        ruleId: `rule_${Math.floor(Math.random() * 20) + 1}`,
        ruleName: `${category.charAt(0).toUpperCase() + category.slice(1)} Detection Rule ${Math.floor(Math.random() * 5) + 1}`,
        title: [
          'Suspicious Network Traffic Detected',
          'Malware Execution Attempt',
          'Unauthorized Data Access',
          'Anomalous User Behavior',
          'Potential Data Exfiltration',
          'Brute Force Attack Detected',
          'Suspicious File Execution',
          'Unauthorized Admin Access',
          'Potential Insider Threat',
          'C2 Communication Detected'
        ][i % 10],
        description: `${category} threat detected with ${severity} severity level requiring immediate investigation and potential response actions.`,
        severity,
        category,
        confidence,
        riskScore,
        timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        status,
        sourceData: {
          type: ['network', 'endpoint', 'application', 'user', 'file', 'email'][Math.floor(Math.random() * 6)] as any,
          source: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          destination: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          protocol: ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'SMTP'][Math.floor(Math.random() * 6)],
          port: [80, 443, 22, 3389, 1433, 3306, 53, 25][Math.floor(Math.random() * 8)],
          payload: 'Encoded payload data...',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Content-Type': 'application/json'
          },
          metadata: {
            size: Math.floor(Math.random() * 10000),
            encoding: 'utf-8'
          }
        },
        indicators: [
          {
            type: ['ip', 'domain', 'hash', 'url', 'email'][Math.floor(Math.random() * 5)] as any,
            value: `malicious-${Math.random().toString(36).substring(7)}.com`,
            confidence: 80 + Math.random() * 20,
            category: ['malicious', 'suspicious', 'informational'][Math.floor(Math.random() * 3)] as any,
            source: 'ThreatIntel Feed',
            firstSeen: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
            lastSeen: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
            reputation: Math.floor(Math.random() * 100),
            geolocation: ['US', 'RU', 'CN', 'KP', 'IR'][Math.floor(Math.random() * 5)],
            asn: `AS${Math.floor(Math.random() * 65535)}`,
            description: 'Known malicious indicator from threat intelligence'
          }
        ],
        context: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipGeolocation: 'United States',
          userInfo: {
            id: `user_${Math.floor(Math.random() * 1000)}`,
            username: `user${Math.floor(Math.random() * 1000)}`,
            role: ['admin', 'user', 'service'][Math.floor(Math.random() * 3)],
            lastLogin: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
            riskScore: Math.random() * 100
          },
          assetInfo: {
            id: `asset_${Math.floor(Math.random() * 100)}`,
            name: `Server-${Math.floor(Math.random() * 100)}`,
            type: 'server',
            criticality: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
            owner: 'IT Department'
          },
          relatedEvents: [
            {
              id: `event_${Math.random().toString(36).substring(7)}`,
              type: 'authentication',
              timestamp: Date.now() - Math.random() * 60 * 60 * 1000,
              correlation: 85 + Math.random() * 15,
              description: 'Related authentication event'
            }
          ],
          threatIntelligence: [
            {
              source: 'Commercial Feed',
              indicator: 'malicious-domain.com',
              confidence: 90 + Math.random() * 10,
              description: 'Known C2 infrastructure',
              campaign: 'APT Campaign 2024',
              actor: 'Advanced Threat Group'
            }
          ]
        },
        timeline: [
          {
            timestamp: Date.now() - Math.random() * 60 * 60 * 1000,
            action: 'Detection Created',
            user: 'System',
            description: 'Threat detection automatically generated',
            automated: true,
            result: 'success'
          }
        ],
        artifacts: [
          {
            id: `artifact_${Math.random().toString(36).substring(7)}`,
            type: ['file', 'memory_dump', 'network_capture', 'log'][Math.floor(Math.random() * 4)] as any,
            name: `evidence_${Math.random().toString(36).substring(7)}.bin`,
            size: Math.floor(Math.random() * 1000000),
            hash: `sha256:${Math.random().toString(36).repeat(16).substring(0, 64)}`,
            path: '/evidence/collected/',
            collected: Date.now() - Math.random() * 60 * 60 * 1000,
            analyst: status === 'investigating' ? 'analyst_1' : undefined
          }
        ],
        mitigation: [
          {
            id: `mitigation_${Math.random().toString(36).substring(7)}`,
            type: ['block_ip', 'quarantine_file', 'disable_user', 'isolate_host'][Math.floor(Math.random() * 4)] as any,
            description: 'Automatic mitigation action executed',
            status: ['pending', 'executing', 'completed', 'failed'][Math.floor(Math.random() * 4)] as any,
            automated: true,
            executed: Date.now() - Math.random() * 30 * 60 * 1000,
            executedBy: 'System',
            result: 'Successfully executed mitigation action'
          }
        ],
        analyst: status === 'investigating' ? `analyst_${Math.floor(Math.random() * 5) + 1}` : undefined,
        tags: ['automated', category, severity]
      };
    });
  }, []);

  const generateMockRules = useCallback((): ThreatDetectionRule[] => {
    const categories = ['network', 'endpoint', 'application', 'user_behavior', 'data_loss', 'malware'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    const types = ['signature', 'anomaly', 'behavioral', 'machine_learning', 'heuristic'] as const;
    const statuses = ['active', 'inactive', 'testing'] as const;
    
    return Array.from({ length: 25 }, (_, i) => {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        id: `rule_${i + 1}`,
        name: `${category.charAt(0).toUpperCase() + category.slice(1)} Detection Rule ${i + 1}`,
        description: `Advanced ${type} based detection rule for ${category} threats with ${severity} severity classification.`,
        category,
        severity,
        type,
        status,
        conditions: [
          {
            id: `condition_${i + 1}_1`,
            field: 'source_ip',
            operator: 'not_equals',
            value: '192.168.0.0/16',
            weight: 0.8
          },
          {
            id: `condition_${i + 1}_2`,
            field: 'event_type',
            operator: 'equals',
            value: 'network_connection',
            logicalOperator: 'AND',
            weight: 0.6
          }
        ],
        actions: [
          {
            type: 'alert',
            parameters: {
              severity: severity,
              notify: ['security_team', 'soc_analyst']
            },
            enabled: true,
            priority: 1
          },
          {
            type: 'log',
            parameters: {
              destination: 'siem',
              format: 'json'
            },
            enabled: true,
            priority: 2
          }
        ],
        alertThreshold: 1 + Math.random() * 9,
        confidence: 70 + Math.random() * 30,
        falsePositiveRate: Math.random() * 5,
        detectionCount: Math.floor(Math.random() * 100),
        lastTriggered: Math.random() > 0.3 ? Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 : undefined,
        createdBy: `analyst_${Math.floor(Math.random() * 5) + 1}`,
        createdAt: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
        lastModified: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      };
    });
  }, []);

  const generateMockHunts = useCallback((): ThreatHunt[] => {
    const statuses = ['planning', 'active', 'completed', 'suspended'] as const;
    const priorities = ['low', 'medium', 'high', 'critical'] as const;
    const huntTypes = ['manual', 'automated', 'hybrid'] as const;
    
    return Array.from({ length: 12 }, (_, i) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const huntType = huntTypes[Math.floor(Math.random() * huntTypes.length)];
      
      return {
        id: `hunt_${i + 1}`,
        name: [
          'APT Activity Investigation',
          'Insider Threat Analysis',
          'Malware Campaign Hunt',
          'Data Exfiltration Search',
          'Lateral Movement Detection',
          'C2 Infrastructure Hunt',
          'Credential Theft Investigation',
          'Zero-Day Exploitation Hunt',
          'Supply Chain Attack Analysis',
          'Ransomware Activity Hunt'
        ][i % 10],
        description: `Comprehensive threat hunting operation to identify and analyze ${priority} priority security threats using ${huntType} methodologies.`,
        hypothesis: `Threat actors may be using advanced techniques to evade detection and establish persistence within the network infrastructure.`,
        status,
        priority,
        huntType,
        scope: {
          timeRange: {
            start: Date.now() - 30 * 24 * 60 * 60 * 1000,
            end: Date.now()
          },
          assets: [`asset_${Math.floor(Math.random() * 50) + 1}`, `asset_${Math.floor(Math.random() * 50) + 1}`],
          dataTypes: ['network_logs', 'endpoint_logs', 'authentication_logs', 'file_system_logs'],
          indicators: ['suspicious_ips', 'malicious_domains', 'file_hashes']
        },
        queries: [
          {
            id: `query_${i + 1}_1`,
            name: 'Network Anomaly Search',
            query: 'SELECT * FROM network_logs WHERE bytes_out > 1000000 AND dest_port NOT IN (80, 443)',
            queryType: 'siem',
            results: Math.floor(Math.random() * 1000),
            executed: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
            duration: Math.floor(Math.random() * 300)
          }
        ],
        findings: status === 'completed' ? [
          {
            id: `finding_${i + 1}_1`,
            title: 'Suspicious Network Communication',
            description: 'Identified unusual outbound traffic patterns indicating potential data exfiltration',
            severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
            confidence: 70 + Math.random() * 30,
            evidence: [
              {
                type: 'log',
                source: 'network_monitor',
                data: { bytes_transferred: 50000000, duration: 3600 },
                timestamp: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
                relevance: 90 + Math.random() * 10
              }
            ],
            recommendations: [
              'Block suspicious IP addresses',
              'Review user access permissions',
              'Implement additional monitoring'
            ],
            status: 'new'
          }
        ] : [],
        timeline: [
          {
            timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
            action: 'Hunt Created',
            description: 'Threat hunt initiated based on intelligence indicators',
            user: `hunter_${Math.floor(Math.random() * 3) + 1}`
          }
        ],
        hunter: `hunter_${Math.floor(Math.random() * 3) + 1}`,
        createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        startedAt: status !== 'planning' ? Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000 : undefined,
        completedAt: status === 'completed' ? Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000 : undefined,
        estimatedDuration: 24 + Math.random() * 120
      };
    });
  }, []);

  const generateMockIntelligence = useCallback((): ThreatIntelligence => {
    return {
      feeds: Array.from({ length: 8 }, (_, i) => ({
        id: `feed_${i + 1}`,
        name: [
          'Commercial Threat Feed A',
          'OSINT Indicator Feed',
          'Government Advisory Feed',
          'Industry Threat Sharing',
          'Malware Signature Feed',
          'IP Reputation Feed',
          'Domain Blocklist Feed',
          'APT Intelligence Feed'
        ][i],
        source: ['Commercial', 'Open Source', 'Government', 'Industry'][Math.floor(Math.random() * 4)],
        type: ['commercial', 'open_source', 'government', 'internal'][Math.floor(Math.random() * 4)] as any,
        status: ['active', 'inactive', 'error'][Math.floor(Math.random() * 3)] as any,
        lastUpdate: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
        indicatorCount: Math.floor(Math.random() * 10000) + 1000,
        confidence: 70 + Math.random() * 30,
        description: 'High-quality threat intelligence feed providing actionable indicators'
      })),
      indicators: Array.from({ length: 20 }, (_, i) => ({
        type: ['ip', 'domain', 'hash', 'url', 'email'][Math.floor(Math.random() * 5)] as any,
        value: `malicious-${Math.random().toString(36).substring(7)}.com`,
        confidence: 60 + Math.random() * 40,
        category: ['malicious', 'suspicious', 'informational'][Math.floor(Math.random() * 3)] as any,
        source: 'ThreatIntel Feed',
        firstSeen: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
        lastSeen: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        reputation: Math.floor(Math.random() * 100),
        geolocation: ['US', 'RU', 'CN', 'KP', 'IR'][Math.floor(Math.random() * 5)],
        description: 'Threat indicator from intelligence feeds'
      })),
      campaigns: Array.from({ length: 6 }, (_, i) => ({
        id: `campaign_${i + 1}`,
        name: [
          'Operation Silent Dragon',
          'APT Campaign Moonlight',
          'Ransomware Wave 2024',
          'Supply Chain Infiltration',
          'Banking Trojan Campaign',
          'State Sponsored Espionage'
        ][i],
        aliases: [`Campaign-${i + 1}`, `Operation-${i + 1}`],
        description: 'Advanced persistent threat campaign targeting critical infrastructure',
        firstSeen: Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000,
        lastSeen: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        actor: `Actor-${Math.floor(Math.random() * 5) + 1}`,
        ttps: ['T1566.001', 'T1059.001', 'T1055', 'T1082'],
        indicators: [`indicator_${i + 1}_1`, `indicator_${i + 1}_2`],
        targets: ['Government', 'Healthcare', 'Financial', 'Manufacturing'],
        confidence: 80 + Math.random() * 20
      })),
      actors: Array.from({ length: 5 }, (_, i) => ({
        id: `actor_${i + 1}`,
        name: [
          'APT29 Cozy Bear',
          'Lazarus Group',
          'FIN7',
          'Carbanak',
          'APT40'
        ][i],
        aliases: [`Group-${i + 1}`, `Team-${i + 1}`],
        description: 'Advanced persistent threat actor with nation-state capabilities',
        motivation: ['espionage', 'financial', 'sabotage'][Math.floor(Math.random() * 3)],
        sophistication: ['low', 'medium', 'high', 'expert'][Math.floor(Math.random() * 4)] as any,
        firstSeen: Date.now() - Math.random() * 1095 * 24 * 60 * 60 * 1000,
        lastSeen: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        campaigns: [`campaign_${i + 1}`],
        ttps: ['T1566', 'T1059', 'T1055', 'T1082', 'T1083'],
        targets: ['Government', 'Defense', 'Technology']
      })),
      reports: Array.from({ length, 8 }, (_, i) => ({
        id: `report_${i + 1}`,
        title: [
          'APT29 Advanced Tactics Analysis',
          'Ransomware Landscape 2024',
          'Supply Chain Threat Assessment',
          'Banking Malware Evolution',
          'Mobile Threat Trends',
          'Cloud Security Threat Report',
          'IoT Botnet Analysis',
          'Insider Threat Intelligence'
        ][i],
        summary: 'Comprehensive analysis of emerging threats and attack methodologies',
        content: 'Detailed threat intelligence report providing actionable insights...',
        author: `Analyst ${i + 1}`,
        published: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        source: 'Internal Research',
        confidence: 85 + Math.random() * 15,
        tlp: ['white', 'green', 'amber', 'red'][Math.floor(Math.random() * 4)] as any,
        indicators: [`indicator_${i + 1}_1`, `indicator_${i + 1}_2`],
        campaigns: [`campaign_${Math.floor(Math.random() * 6) + 1}`],
        actors: [`actor_${Math.floor(Math.random() * 5) + 1}`]
      }))
    };
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const mockDetections = generateMockDetections();
        const mockRules = generateMockRules();
        const mockHunts = generateMockHunts();
        const mockIntelligence = generateMockIntelligence();
        
        setDetections(mockDetections);
        setRules(mockRules);
        setHunts(mockHunts);
        setIntelligence(mockIntelligence);
      } catch (error) {
        console.error('Error loading threat detection data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [generateMockDetections, generateMockRules, generateMockHunts, generateMockIntelligence]);

  useEffect(() => {
    if (refreshInterval) {
      intervalRef.current = setInterval(() => {
        const newDetections = generateMockDetections();
        setDetections(newDetections);
      }, refreshInterval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshInterval, generateMockDetections]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-50';
      case 'investigating': return 'text-yellow-600 bg-yellow-50';
      case 'confirmed': return 'text-red-600 bg-red-50';
      case 'false_positive': return 'text-gray-600 bg-gray-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'testing': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Threat Detection System</h1>
          <p className="text-gray-600 mt-2">Advanced threat detection, hunting, and intelligence platform</p>
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
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Rule</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'detections', name: 'Threat Detections', icon: AlertTriangle },
              { id: 'rules', name: 'Detection Rules', icon: Shield },
              { id: 'hunts', name: 'Threat Hunting', icon: Target },
              { id: 'intelligence', name: 'Threat Intel', icon: Brain },
              { id: 'analytics', name: 'Analytics', icon: BarChart3 }
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
          {activeTab === 'detections' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search detections..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select 
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="new">New</option>
                    <option value="investigating">Investigating</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="false_positive">False Positive</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <button
                  onClick={() => setDetections(generateMockDetections())}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Critical Threats</p>
                      <p className="text-2xl font-bold text-red-900">
                        {detections.filter(d => d.severity === 'critical').length}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">High Severity</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {detections.filter(d => d.severity === 'high').length}
                      </p>
                    </div>
                    <Shield className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Under Investigation</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {detections.filter(d => d.status === 'investigating').length}
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Resolved</p>
                      <p className="text-2xl font-bold text-green-900">
                        {detections.filter(d => d.status === 'resolved').length}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detection</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {detections.slice(0, 15).map((detection) => (
                        <tr key={detection.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{detection.title}</div>
                              <div className="text-sm text-gray-500">{detection.description.substring(0, 60)}...</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(detection.severity)}`}>
                              {detection.severity.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                            {detection.category.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(detection.status)}`}>
                              {detection.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    detection.riskScore > 70 ? 'bg-red-500' :
                                    detection.riskScore > 40 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${detection.riskScore}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{detection.riskScore.toFixed(0)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(detection.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => {
                                setSelectedDetection(detection);
                                setShowDetectionModal(true);
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

          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search rules..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">All Categories</option>
                    <option value="network">Network</option>
                    <option value="endpoint">Endpoint</option>
                    <option value="application">Application</option>
                    <option value="user_behavior">User Behavior</option>
                  </select>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  <span>Create Rule</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rules.slice(0, 12).map((rule) => (
                  <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{rule.description.substring(0, 80)}...</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
                        {rule.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Severity:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                          {rule.severity.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Type:</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{rule.type.replace('_', ' ')}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Detections:</span>
                        <span className="text-sm font-medium text-gray-900">{rule.detectionCount}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Confidence:</span>
                        <span className="text-sm font-medium text-gray-900">{rule.confidence.toFixed(1)}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">FP Rate:</span>
                        <span className="text-sm font-medium text-gray-900">{rule.falsePositiveRate.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                      <button 
                        onClick={() => {
                          setSelectedRule(rule);
                          setShowRuleModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <span className="text-xs text-gray-500">
                        Modified {new Date(rule.lastModified).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hunts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Threat Hunting Operations</h2>
                  <p className="text-gray-600">Proactive threat hunting and investigation campaigns</p>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <Plus className="w-4 h-4" />
                  <span>New Hunt</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {['planning', 'active', 'completed', 'suspended'].map((status) => {
                  const count = hunts.filter(h => h.status === status).length;
                  const color = status === 'active' ? 'text-blue-600 bg-blue-50' :
                               status === 'completed' ? 'text-green-600 bg-green-50' :
                               status === 'suspended' ? 'text-red-600 bg-red-50' :
                               'text-yellow-600 bg-yellow-50';
                  
                  return (
                    <div key={status} className={`rounded-lg p-6 ${color}`}>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-sm font-medium capitalize">{status} Hunts</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hunts.slice(0, 8).map((hunt) => (
                  <div key={hunt.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{hunt.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{hunt.description.substring(0, 100)}...</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hunt.status)}`}>
                          {hunt.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(hunt.priority)}`}>
                          {hunt.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Hunter:</span>
                        <span className="text-sm font-medium text-gray-900">{hunt.hunter}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Type:</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{hunt.huntType}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Duration:</span>
                        <span className="text-sm font-medium text-gray-900">{hunt.estimatedDuration}h</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Findings:</span>
                        <span className="text-sm font-medium text-gray-900">{hunt.findings.length}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Created:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(hunt.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button 
                        onClick={() => setShowHuntModal(true)}
                        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        View Hunt Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'intelligence' && intelligence && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Threat Intelligence</h2>
                  <p className="text-gray-600">Actionable threat intelligence and indicators</p>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  <Download className="w-4 h-4" />
                  <span>Import Indicators</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Active Feeds</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {intelligence.feeds.filter(f => f.status === 'active').length}
                      </p>
                    </div>
                    <Database className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Indicators</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {intelligence.indicators.length.toLocaleString()}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Campaigns</p>
                      <p className="text-2xl font-bold text-green-900">
                        {intelligence.campaigns.length}
                      </p>
                    </div>
                    <Shield className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Threat Actors</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {intelligence.actors.length}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Threat Intelligence Feeds</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {intelligence.feeds.slice(0, 6).map((feed) => (
                        <div key={feed.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{feed.name}</p>
                            <p className="text-sm text-gray-500">
                              {feed.indicatorCount.toLocaleString()} indicators • Last updated {new Date(feed.lastUpdate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feed.status)}`}>
                            {feed.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Threat Reports</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {intelligence.reports.slice(0, 6).map((report) => (
                        <div key={report.id} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{report.title}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              report.tlp === 'red' ? 'bg-red-100 text-red-800' :
                              report.tlp === 'amber' ? 'bg-yellow-100 text-yellow-800' :
                              report.tlp === 'green' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              TLP:{report.tlp.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{report.summary}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>By {report.author}</span>
                            <span>{new Date(report.published).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatDetectionSystem;