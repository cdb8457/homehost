'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  FileText,
  Clock,
  Users,
  User,
  Shield,
  Lock,
  Key,
  Settings,
  Activity,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  Bell,
  BellOff,
  Target,
  Database,
  Server,
  Network,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Code,
  Terminal,
  Folder,
  File,
  Edit,
  Trash2,
  Save,
  Copy,
  Share2,
  Send,
  Plus,
  Minus,
  X,
  Play,
  Pause,
  Square,
  RotateCcw,
  Star,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Link,
  Mail,
  Phone,
  Brain,
  Zap,
  Fire,
  Sparkles,
  Lightbulb,
  Heart,
  ThumbsUp,
  MessageCircle,
  Award,
  Crown,
  DollarSign,
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
  Gamepad2
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: number;
  eventType: string;
  category: 'authentication' | 'authorization' | 'data_access' | 'configuration' | 'system' | 'user_management' | 'security' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  actor: AuditActor;
  target?: AuditTarget;
  action: string;
  resource: string;
  result: 'success' | 'failure' | 'error' | 'blocked' | 'warning';
  details: AuditDetails;
  context: AuditContext;
  metadata: AuditMetadata;
  correlation: AuditCorrelation[];
  compliance: ComplianceMapping[];
  retention: RetentionInfo;
  source: EventSource;
  integrity: IntegrityInfo;
}

interface AuditActor {
  type: 'user' | 'service_account' | 'system' | 'api_client' | 'admin' | 'anonymous';
  id: string;
  name: string;
  email?: string;
  roles: string[];
  groups: string[];
  permissions: string[];
  sessionId?: string;
  authentication: ActorAuthentication;
  location: ActorLocation;
  device: ActorDevice;
  riskScore: number;
}

interface ActorAuthentication {
  method: 'password' | 'mfa' | 'sso' | 'certificate' | 'api_key' | 'token';
  factors: string[];
  mfaVerified: boolean;
  authTime: number;
  tokenType?: string;
  issuer?: string;
}

interface ActorLocation {
  ipAddress: string;
  country: string;
  region: string;
  city: string;
  isp: string;
  isVPN: boolean;
  isTrusted: boolean;
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

interface ActorDevice {
  id: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'kiosk' | 'server' | 'iot' | 'unknown';
  os: string;
  browser?: string;
  userAgent: string;
  fingerprint: string;
  isTrusted: boolean;
  isManaged: boolean;
  lastSeen: number;
}

interface AuditTarget {
  type: 'user' | 'role' | 'permission' | 'group' | 'resource' | 'system' | 'data' | 'configuration';
  id: string;
  name: string;
  category: string;
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';
  owner: string;
  location: string;
  attributes: { [key: string]: any };
  classification: DataClassification;
}

interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';
  categories: string[];
  labels: string[];
  handling: string[];
  retention: number;
  encryption: boolean;
}

interface AuditDetails {
  description: string;
  summary: string;
  changes: FieldChange[];
  beforeState?: any;
  afterState?: any;
  parameters: { [key: string]: any };
  payload?: string;
  responseCode?: number;
  errorMessage?: string;
  duration: number;
  bytes?: number;
}

interface FieldChange {
  field: string;
  path: string;
  operation: 'create' | 'update' | 'delete' | 'move' | 'copy';
  oldValue?: any;
  newValue?: any;
  dataType: string;
  sensitive: boolean;
  validation: ChangeValidation;
}

interface ChangeValidation {
  isValid: boolean;
  violations: ValidationViolation[];
  approvals: ChangeApproval[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ValidationViolation {
  type: 'policy' | 'security' | 'compliance' | 'business_rule';
  rule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediation: string;
}

interface ChangeApproval {
  approver: string;
  approved: boolean;
  timestamp: number;
  comments: string;
  conditions: string[];
}

interface AuditContext {
  requestId: string;
  transactionId: string;
  parentEventId?: string;
  childEventIds: string[];
  workflow: WorkflowContext;
  business: BusinessContext;
  technical: TechnicalContext;
  security: SecurityContext;
}

interface WorkflowContext {
  processId: string;
  processName: string;
  stepId: string;
  stepName: string;
  stage: string;
  approvals: WorkflowApproval[];
  escalations: WorkflowEscalation[];
}

interface WorkflowApproval {
  level: number;
  approver: string;
  status: 'pending' | 'approved' | 'rejected' | 'timeout';
  timestamp?: number;
  reason?: string;
}

interface WorkflowEscalation {
  level: number;
  escalatedTo: string;
  reason: string;
  timestamp: number;
  resolved: boolean;
}

interface BusinessContext {
  department: string;
  businessUnit: string;
  costCenter: string;
  project: string;
  initiative: string;
  businessJustification: string;
  impact: BusinessImpact;
}

interface BusinessImpact {
  scope: 'individual' | 'team' | 'department' | 'organization' | 'external';
  severity: 'low' | 'medium' | 'high' | 'critical';
  categories: string[];
  financialImpact?: number;
  operationalImpact: string;
  reputationalRisk: string;
}

interface TechnicalContext {
  system: string;
  component: string;
  version: string;
  environment: 'development' | 'staging' | 'production' | 'testing';
  deployment: DeploymentContext;
  performance: PerformanceMetrics;
  dependencies: string[];
}

interface DeploymentContext {
  region: string;
  zone: string;
  cluster: string;
  namespace: string;
  pod: string;
  container: string;
}

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
}

interface SecurityContext {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  securityLabels: string[];
  clearanceLevel: string;
  compartments: string[];
  caveat: string[];
  encryption: EncryptionContext;
  monitoring: MonitoringContext;
}

interface EncryptionContext {
  inTransit: boolean;
  atRest: boolean;
  algorithm: string;
  keyId: string;
  keyRotation: number;
}

interface MonitoringContext {
  sensors: string[];
  alerts: string[];
  anomalies: AnomalyDetection[];
  baselines: BaselineMetric[];
}

interface AnomalyDetection {
  type: 'statistical' | 'machine_learning' | 'rule_based' | 'threshold';
  detected: boolean;
  confidence: number;
  deviation: number;
  model: string;
  explanation: string;
}

interface BaselineMetric {
  name: string;
  value: number;
  threshold: number;
  variance: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface AuditMetadata {
  version: string;
  schemaVersion: string;
  sourceSystem: string;
  ingestionTime: number;
  processingTime: number;
  enrichments: Enrichment[];
  tags: string[];
  labels: { [key: string]: string };
  annotations: { [key: string]: string };
}

interface Enrichment {
  type: 'geolocation' | 'threat_intelligence' | 'user_context' | 'asset_context' | 'risk_scoring';
  provider: string;
  timestamp: number;
  data: any;
  confidence: number;
}

interface AuditCorrelation {
  id: string;
  type: 'sequence' | 'pattern' | 'anomaly' | 'campaign' | 'incident';
  events: string[];
  confidence: number;
  timeWindow: number;
  pattern: CorrelationPattern;
}

interface CorrelationPattern {
  name: string;
  description: string;
  rules: CorrelationRule[];
  indicators: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface CorrelationRule {
  field: string;
  operator: string;
  value: any;
  weight: number;
  logicalOperator?: 'AND' | 'OR' | 'NOT';
}

interface ComplianceMapping {
  framework: string;
  control: string;
  requirement: string;
  evidence: boolean;
  attestation: boolean;
  monitoring: boolean;
  reporting: boolean;
  retention: number;
}

interface RetentionInfo {
  policy: string;
  category: string;
  retentionPeriod: number;
  archiveDate: number;
  deletionDate: number;
  legalHold: boolean;
  immutable: boolean;
}

interface EventSource {
  type: 'application' | 'system' | 'network' | 'security' | 'database' | 'api' | 'manual';
  name: string;
  version: string;
  instance: string;
  host: string;
  collectTime: number;
  forwarder: string;
  pipeline: string[];
}

interface IntegrityInfo {
  hash: string;
  algorithm: 'sha256' | 'sha512' | 'blake2b';
  signature?: string;
  certificate?: string;
  verified: boolean;
  tamperEvidence: boolean;
  chain: string[];
}

interface AuditQuery {
  id: string;
  name: string;
  description: string;
  query: string;
  filters: QueryFilter[];
  timeRange: TimeRange;
  aggregations: Aggregation[];
  sorting: SortCriteria[];
  limit: number;
  offset: number;
  format: 'json' | 'csv' | 'excel' | 'pdf';
}

interface QueryFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'between' | 'exists' | 'not_exists';
  value: any;
  logicalOperator?: 'AND' | 'OR' | 'NOT';
  caseSensitive?: boolean;
}

interface TimeRange {
  type: 'relative' | 'absolute' | 'rolling';
  start?: number;
  end?: number;
  duration?: string;
  timezone: string;
}

interface Aggregation {
  field: string;
  function: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct' | 'percentile';
  groupBy?: string[];
  having?: QueryFilter[];
}

interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
  priority: number;
}

interface AuditReport {
  id: string;
  name: string;
  description: string;
  type: 'compliance' | 'security' | 'operational' | 'forensic' | 'performance' | 'custom';
  template: ReportTemplate;
  schedule: ReportSchedule;
  recipients: ReportRecipient[];
  delivery: ReportDelivery;
  retention: ReportRetention;
  status: 'active' | 'inactive' | 'suspended' | 'error';
  lastRun?: number;
  nextRun?: number;
  createdBy: string;
  createdAt: number;
  lastModified: number;
}

interface ReportTemplate {
  sections: ReportSection[];
  styling: ReportStyling;
  branding: ReportBranding;
  format: 'html' | 'pdf' | 'excel' | 'json' | 'csv';
}

interface ReportSection {
  id: string;
  name: string;
  type: 'summary' | 'table' | 'chart' | 'text' | 'image' | 'metrics';
  query: AuditQuery;
  visualization: SectionVisualization;
  filters: QueryFilter[];
  order: number;
  conditional: boolean;
  conditions: SectionCondition[];
}

interface SectionVisualization {
  type: 'table' | 'bar_chart' | 'line_chart' | 'pie_chart' | 'heatmap' | 'timeline' | 'summary';
  options: VisualizationOptions;
}

interface VisualizationOptions {
  title: string;
  subtitle?: string;
  xAxis?: string;
  yAxis?: string;
  colors?: string[];
  legend: boolean;
  tooltips: boolean;
  animations: boolean;
  responsive: boolean;
}

interface SectionCondition {
  field: string;
  operator: string;
  value: any;
  action: 'include' | 'exclude' | 'highlight' | 'warn';
}

interface ReportStyling {
  theme: 'light' | 'dark' | 'corporate' | 'minimal';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
    monospace: string;
  };
}

interface ReportBranding {
  logo?: string;
  companyName: string;
  department?: string;
  classification?: string;
  watermark?: string;
}

interface ReportSchedule {
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'on_demand';
  cron?: string;
  timezone: string;
  enabled: boolean;
}

interface ReportRecipient {
  type: 'user' | 'group' | 'email' | 'webhook' | 'api';
  target: string;
  permissions: string[];
  filters?: QueryFilter[];
}

interface ReportDelivery {
  methods: DeliveryMethod[];
  encryption: boolean;
  compression: boolean;
  splitting: boolean;
  maxSize: number;
}

interface DeliveryMethod {
  type: 'email' | 'sftp' | 'webhook' | 'api' | 'portal' | 'storage';
  configuration: { [key: string]: any };
  authentication: { [key: string]: any };
  retries: number;
  timeout: number;
}

interface ReportRetention {
  duration: number;
  archiveAfter: number;
  deleteAfter: number;
  location: string;
  encryption: boolean;
}

const AuditTrailSystem: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'search' | 'analytics' | 'reports' | 'compliance' | 'forensics'>('logs');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showQueryBuilder, setShowQueryBuilder] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(30);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateMockAuditLogs = useCallback((): AuditLog[] => {
    const categories = ['authentication', 'authorization', 'data_access', 'configuration', 'system', 'user_management', 'security', 'compliance'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    const results = ['success', 'failure', 'error', 'blocked', 'warning'] as const;
    const actorTypes = ['user', 'service_account', 'system', 'api_client', 'admin'] as const;
    const targetTypes = ['user', 'role', 'permission', 'group', 'resource', 'system', 'data', 'configuration'] as const;
    
    const eventTypes = [
      'user_login', 'user_logout', 'password_change', 'mfa_enabled', 'role_assigned', 'permission_granted',
      'data_accessed', 'file_uploaded', 'configuration_changed', 'system_restart', 'security_alert',
      'compliance_check', 'audit_report_generated', 'user_created', 'user_deleted', 'group_modified',
      'policy_updated', 'certificate_renewed', 'backup_completed', 'vulnerability_detected'
    ];
    
    const actions = [
      'CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'GRANT', 'REVOKE',
      'ASSIGN', 'UNASSIGN', 'ENABLE', 'DISABLE', 'APPROVE', 'REJECT', 'ESCALATE',
      'ARCHIVE', 'RESTORE', 'EXPORT', 'IMPORT', 'SYNC', 'VALIDATE', 'AUDIT'
    ];
    
    const resources = [
      'user_profile', 'role_definition', 'security_policy', 'audit_log', 'compliance_report',
      'system_configuration', 'database_table', 'api_endpoint', 'file_system', 'network_resource',
      'certificate_store', 'backup_archive', 'monitoring_dashboard', 'alert_rule', 'workflow_process'
    ];

    return Array.from({ length: 100 }, (_, i) => {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const result = results[Math.floor(Math.random() * results.length)];
      const actorType = actorTypes[Math.floor(Math.random() * actorTypes.length)];
      const targetType = targetTypes[Math.floor(Math.random() * targetTypes.length)];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const resource = resources[Math.floor(Math.random() * resources.length)];
      const riskScore = Math.random() * 100;
      
      return {
        id: `audit_${i + 1}`,
        timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        eventType,
        category,
        severity,
        actor: {
          type: actorType,
          id: `${actorType}_${Math.floor(Math.random() * 100) + 1}`,
          name: actorType === 'user' ? `User ${Math.floor(Math.random() * 100) + 1}` : 
                actorType === 'system' ? 'System Service' :
                actorType === 'api_client' ? 'API Client' :
                'Service Account',
          email: actorType === 'user' ? `user${Math.floor(Math.random() * 100) + 1}@company.com` : undefined,
          roles: [`role_${Math.floor(Math.random() * 5) + 1}`],
          groups: [`group_${Math.floor(Math.random() * 3) + 1}`],
          permissions: [`permission_${Math.floor(Math.random() * 10) + 1}`],
          sessionId: actorType === 'user' ? `session_${Math.random().toString(36).substring(7)}` : undefined,
          authentication: {
            method: ['password', 'mfa', 'sso', 'certificate', 'api_key'][Math.floor(Math.random() * 5)] as any,
            factors: ['password', 'totp'],
            mfaVerified: Math.random() > 0.3,
            authTime: Date.now() - Math.random() * 8 * 60 * 60 * 1000,
            tokenType: actorType === 'api_client' ? 'Bearer' : undefined,
            issuer: 'auth.company.com'
          },
          location: {
            ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            country: ['US', 'UK', 'DE', 'FR', 'CA'][Math.floor(Math.random() * 5)],
            region: 'Region',
            city: ['New York', 'London', 'Berlin', 'Paris', 'Toronto'][Math.floor(Math.random() * 5)],
            isp: 'ISP Provider',
            isVPN: Math.random() > 0.9,
            isTrusted: Math.random() > 0.1,
            geolocation: {
              latitude: 40.7128 + (Math.random() - 0.5) * 10,
              longitude: -74.0060 + (Math.random() - 0.5) * 10,
              accuracy: 100 + Math.random() * 900
            }
          },
          device: {
            id: `device_${Math.random().toString(36).substring(7)}`,
            type: ['desktop', 'mobile', 'tablet', 'server'][Math.floor(Math.random() * 4)] as any,
            os: ['Windows 11', 'macOS', 'iOS', 'Android', 'Linux'][Math.floor(Math.random() * 5)],
            browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            fingerprint: `fp_${Math.random().toString(36).substring(7)}`,
            isTrusted: Math.random() > 0.2,
            isManaged: Math.random() > 0.3,
            lastSeen: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          },
          riskScore
        },
        target: Math.random() > 0.3 ? {
          type: targetType,
          id: `${targetType}_${Math.floor(Math.random() * 100) + 1}`,
          name: `${targetType.charAt(0).toUpperCase() + targetType.slice(1)} ${Math.floor(Math.random() * 100) + 1}`,
          category: 'business',
          sensitivity: ['public', 'internal', 'confidential', 'restricted'][Math.floor(Math.random() * 4)] as any,
          owner: `owner_${Math.floor(Math.random() * 10) + 1}`,
          location: '/path/to/resource',
          attributes: {
            department: 'Engineering',
            project: 'Platform'
          },
          classification: {
            level: ['public', 'internal', 'confidential', 'restricted'][Math.floor(Math.random() * 4)] as any,
            categories: ['business', 'technical'],
            labels: ['production', 'sensitive'],
            handling: ['encrypt_at_rest', 'encrypt_in_transit'],
            retention: 2555,
            encryption: true
          }
        } : undefined,
        action,
        resource,
        result,
        details: {
          description: `${action} operation on ${resource} ${result === 'success' ? 'completed successfully' : `failed with ${result}`}`,
          summary: `User performed ${action.toLowerCase()} action`,
          changes: result === 'success' && action === 'UPDATE' ? [
            {
              field: 'status',
              path: '/status',
              operation: 'update',
              oldValue: 'inactive',
              newValue: 'active',
              dataType: 'string',
              sensitive: false,
              validation: {
                isValid: true,
                violations: [],
                approvals: [],
                riskLevel: 'low'
              }
            }
          ] : [],
          beforeState: action === 'UPDATE' ? { status: 'inactive' } : undefined,
          afterState: action === 'UPDATE' ? { status: 'active' } : undefined,
          parameters: {
            method: 'POST',
            endpoint: '/api/v1/resource'
          },
          responseCode: result === 'success' ? 200 : result === 'failure' ? 400 : 500,
          errorMessage: result !== 'success' ? `Operation failed: ${result}` : undefined,
          duration: Math.random() * 5000,
          bytes: Math.floor(Math.random() * 10000)
        },
        context: {
          requestId: `req_${Math.random().toString(36).substring(7)}`,
          transactionId: `txn_${Math.random().toString(36).substring(7)}`,
          childEventIds: [],
          workflow: {
            processId: `proc_${Math.floor(Math.random() * 100) + 1}`,
            processName: 'User Management Process',
            stepId: `step_${Math.floor(Math.random() * 10) + 1}`,
            stepName: 'Validation Step',
            stage: 'execution',
            approvals: [],
            escalations: []
          },
          business: {
            department: 'Engineering',
            businessUnit: 'Technology',
            costCenter: 'CC100',
            project: 'Platform Development',
            initiative: 'Security Enhancement',
            businessJustification: 'Required for operational efficiency',
            impact: {
              scope: 'individual',
              severity: severity,
              categories: ['operational'],
              operationalImpact: 'Minimal disruption expected',
              reputationalRisk: 'Low risk to company reputation'
            }
          },
          technical: {
            system: 'HomeHost Platform',
            component: 'Auth Service',
            version: 'v2.1.0',
            environment: 'production',
            deployment: {
              region: 'us-east-1',
              zone: 'us-east-1a',
              cluster: 'prod-cluster',
              namespace: 'default',
              pod: `pod-${Math.random().toString(36).substring(7)}`,
              container: 'auth-service'
            },
            performance: {
              responseTime: Math.random() * 1000,
              throughput: Math.random() * 1000,
              errorRate: Math.random() * 5,
              cpuUsage: Math.random() * 100,
              memoryUsage: Math.random() * 100,
              diskUsage: Math.random() * 100,
              networkUsage: Math.random() * 1000
            },
            dependencies: ['database', 'cache', 'message_queue']
          },
          security: {
            threatLevel: severity === 'critical' ? 'high' : severity === 'high' ? 'medium' : 'low',
            riskScore,
            securityLabels: ['production', 'sensitive'],
            clearanceLevel: 'SECRET',
            compartments: ['INTEL', 'SECURITY'],
            caveat: ['NOFORN', 'REL TO USA'],
            encryption: {
              inTransit: true,
              atRest: true,
              algorithm: 'AES-256-GCM',
              keyId: `key_${Math.random().toString(36).substring(7)}`,
              keyRotation: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
            },
            monitoring: {
              sensors: ['ids', 'siem', 'edr'],
              alerts: severity === 'high' || severity === 'critical' ? [`alert_${Math.random().toString(36).substring(7)}`] : [],
              anomalies: [
                {
                  type: 'statistical',
                  detected: riskScore > 70,
                  confidence: Math.random() * 100,
                  deviation: Math.random() * 10,
                  model: 'gaussian_mixture',
                  explanation: 'Statistical anomaly in user behavior pattern'
                }
              ],
              baselines: []
            }
          }
        },
        metadata: {
          version: '1.0.0',
          schemaVersion: '2023.1',
          sourceSystem: 'audit-service',
          ingestionTime: Date.now() - Math.random() * 60 * 1000,
          processingTime: Date.now() - Math.random() * 30 * 1000,
          enrichments: [
            {
              type: 'geolocation',
              provider: 'MaxMind',
              timestamp: Date.now() - Math.random() * 5 * 60 * 1000,
              data: { accuracy: 'city' },
              confidence: 85
            }
          ],
          tags: [category, severity, result],
          labels: {
            environment: 'production',
            service: 'audit',
            version: 'v2.1.0'
          },
          annotations: {
            compliance: 'SOC2,ISO27001',
            retention: '7y'
          }
        },
        correlation: riskScore > 60 ? [
          {
            id: `corr_${Math.random().toString(36).substring(7)}`,
            type: 'anomaly',
            events: [`audit_${Math.floor(Math.random() * 20) + 1}`],
            confidence: Math.random() * 100,
            timeWindow: 3600000,
            pattern: {
              name: 'Suspicious Login Pattern',
              description: 'Multiple failed login attempts followed by successful login',
              rules: [
                {
                  field: 'result',
                  operator: 'equals',
                  value: 'failure',
                  weight: 0.8
                }
              ],
              indicators: ['failed_login', 'successful_login'],
              severity: 'high'
            }
          }
        ] : [],
        compliance: [
          {
            framework: 'SOC2',
            control: 'CC6.1',
            requirement: 'Logical and Physical Access Controls',
            evidence: true,
            attestation: true,
            monitoring: true,
            reporting: true,
            retention: 2555
          },
          {
            framework: 'ISO27001',
            control: 'A.9.4.2',
            requirement: 'Secure log-on procedures',
            evidence: true,
            attestation: false,
            monitoring: true,
            reporting: true,
            retention: 2555
          }
        ],
        retention: {
          policy: 'security_audit_policy',
          category: 'security',
          retentionPeriod: 2555,
          archiveDate: Date.now() + 365 * 24 * 60 * 60 * 1000,
          deletionDate: Date.now() + 2555 * 24 * 60 * 60 * 1000,
          legalHold: severity === 'critical',
          immutable: true
        },
        source: {
          type: 'application',
          name: 'homehost-platform',
          version: 'v2.1.0',
          instance: 'instance-001',
          host: 'app-server-01',
          collectTime: Date.now() - Math.random() * 10 * 1000,
          forwarder: 'fluentd',
          pipeline: ['collector', 'processor', 'enricher', 'storage']
        },
        integrity: {
          hash: `sha256:${Math.random().toString(36).repeat(16).substring(0, 64)}`,
          algorithm: 'sha256',
          signature: `sig_${Math.random().toString(36).substring(7)}`,
          certificate: `cert_${Math.random().toString(36).substring(7)}`,
          verified: true,
          tamperEvidence: false,
          chain: [`hash_${Math.random().toString(36).substring(7)}`]
        }
      };
    });
  }, []);

  const generateMockReports = useCallback((): AuditReport[] => {
    const reportTypes = ['compliance', 'security', 'operational', 'forensic', 'performance'] as const;
    const frequencies = ['daily', 'weekly', 'monthly', 'quarterly'] as const;
    const statuses = ['active', 'inactive', 'suspended', 'error'] as const;
    
    return Array.from({ length: 15 }, (_, i) => {
      const type = reportTypes[Math.floor(Math.random() * reportTypes.length)];
      const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        id: `report_${i + 1}`,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Report ${i + 1}`,
        description: `Automated ${type} audit report generated ${frequency}`,
        type,
        template: {
          sections: [
            {
              id: 'summary',
              name: 'Executive Summary',
              type: 'summary',
              query: {
                id: 'summary_query',
                name: 'Summary Query',
                description: 'Summary statistics',
                query: 'SELECT COUNT(*) FROM audit_logs WHERE category = ?',
                filters: [],
                timeRange: { type: 'relative', duration: '30d', timezone: 'UTC' },
                aggregations: [],
                sorting: [],
                limit: 100,
                offset: 0,
                format: 'json'
              },
              visualization: {
                type: 'summary',
                options: {
                  title: 'Summary Statistics',
                  legend: false,
                  tooltips: true,
                  animations: true,
                  responsive: true
                }
              },
              filters: [],
              order: 1,
              conditional: false,
              conditions: []
            }
          ],
          styling: {
            theme: 'corporate',
            colors: {
              primary: '#1f2937',
              secondary: '#6b7280',
              accent: '#3b82f6',
              background: '#ffffff',
              text: '#111827'
            },
            fonts: {
              heading: 'Inter',
              body: 'Inter',
              monospace: 'Monaco'
            }
          },
          branding: {
            companyName: 'HomeHost Gaming',
            department: 'Security',
            classification: 'Internal'
          },
          format: 'pdf'
        },
        schedule: {
          frequency,
          timezone: 'UTC',
          enabled: status === 'active'
        },
        recipients: [
          {
            type: 'email',
            target: 'security-team@company.com',
            permissions: ['view', 'download'],
            filters: []
          }
        ],
        delivery: {
          methods: [
            {
              type: 'email',
              configuration: {
                smtp: 'smtp.company.com',
                port: 587,
                encryption: 'tls'
              },
              authentication: {},
              retries: 3,
              timeout: 30000
            }
          ],
          encryption: true,
          compression: true,
          splitting: false,
          maxSize: 10485760
        },
        retention: {
          duration: 2555,
          archiveAfter: 365,
          deleteAfter: 2555,
          location: 's3://audit-reports/',
          encryption: true
        },
        status,
        lastRun: status === 'active' ? Date.now() - Math.random() * 24 * 60 * 60 * 1000 : undefined,
        nextRun: status === 'active' ? Date.now() + Math.random() * 24 * 60 * 60 * 1000 : undefined,
        createdBy: `analyst_${Math.floor(Math.random() * 5) + 1}`,
        createdAt: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
        lastModified: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      };
    });
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const mockLogs = generateMockAuditLogs();
        const mockReports = generateMockReports();
        
        setAuditLogs(mockLogs);
        setReports(mockReports);
        
        if (mockLogs.length > 0) {
          setSelectedLog(mockLogs[0]);
        }
      } catch (error) {
        console.error('Error loading audit trail data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [generateMockAuditLogs, generateMockReports]);

  useEffect(() => {
    if (refreshInterval) {
      intervalRef.current = setInterval(() => {
        const newLogs = generateMockAuditLogs();
        setAuditLogs(newLogs);
      }, refreshInterval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshInterval, generateMockAuditLogs]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'failure': return 'text-red-600 bg-red-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'blocked': return 'text-orange-600 bg-orange-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return Key;
      case 'authorization': return Shield;
      case 'data_access': return Database;
      case 'configuration': return Settings;
      case 'system': return Server;
      case 'user_management': return Users;
      case 'security': return Lock;
      case 'compliance': return CheckCircle;
      default: return Activity;
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
          <h1 className="text-3xl font-bold text-gray-900">Audit Trail & Logging System</h1>
          <p className="text-gray-600 mt-2">Comprehensive audit logging, analysis, and compliance reporting platform</p>
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
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'logs', name: 'Audit Logs', icon: FileText },
              { id: 'search', name: 'Advanced Search', icon: Search },
              { id: 'analytics', name: 'Analytics', icon: BarChart3 },
              { id: 'reports', name: 'Reports', icon: FileText },
              { id: 'compliance', name: 'Compliance', icon: CheckCircle },
              { id: 'forensics', name: 'Forensics', icon: Eye }
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
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Events</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {auditLogs.length.toLocaleString()}
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Critical Events</p>
                      <p className="text-2xl font-bold text-red-900">
                        {auditLogs.filter(log => log.severity === 'critical').length}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Failed Actions</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {auditLogs.filter(log => ['failure', 'error', 'blocked'].includes(log.result)).length}
                      </p>
                    </div>
                    <XCircle className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Compliance Events</p>
                      <p className="text-2xl font-bold text-green-900">
                        {auditLogs.filter(log => log.category === 'compliance').length}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search audit logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="authentication">Authentication</option>
                    <option value="authorization">Authorization</option>
                    <option value="data_access">Data Access</option>
                    <option value="configuration">Configuration</option>
                    <option value="system">System</option>
                    <option value="security">Security</option>
                    <option value="compliance">Compliance</option>
                  </select>
                  <select 
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Severities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <select 
                    value={resultFilter}
                    onChange={(e) => setResultFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Results</option>
                    <option value="success">Success</option>
                    <option value="failure">Failure</option>
                    <option value="error">Error</option>
                    <option value="blocked">Blocked</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>
                <button
                  onClick={() => setAuditLogs(generateMockAuditLogs())}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {auditLogs.slice(0, 20).map((log) => {
                        const Icon = getCategoryIcon(log.category);
                        return (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <Icon className="w-4 h-4 text-gray-500" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{log.eventType}</div>
                                  <div className="text-sm text-gray-500 capitalize">{log.category.replace('_', ' ')}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{log.actor.name}</div>
                              <div className="text-sm text-gray-500">{log.actor.type}</div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.action}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{log.resource}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getResultColor(log.result)}`}>
                                {log.result.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(log.severity)}`}>
                                {log.severity.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => {
                                  setSelectedLog(log);
                                  setShowLogModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Audit Analytics Dashboard</h2>
                <p className="text-gray-600">Real-time insights and trends from audit log data</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Events by Category</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {['authentication', 'authorization', 'data_access', 'configuration', 'system', 'security'].map((category) => {
                        const count = auditLogs.filter(log => log.category === category).length;
                        const percentage = (count / auditLogs.length) * 100;
                        const Icon = getCategoryIcon(category);
                        
                        return (
                          <div key={category} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Icon className="w-5 h-5 text-blue-500" />
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {category.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold text-gray-900">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Security Events Trend</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {['success', 'failure', 'error', 'blocked', 'warning'].map((result) => {
                        const count = auditLogs.filter(log => log.result === result).length;
                        const color = result === 'success' ? 'bg-green-500' :
                                     result === 'failure' ? 'bg-red-500' :
                                     result === 'error' ? 'bg-red-600' :
                                     result === 'blocked' ? 'bg-orange-500' :
                                     'bg-yellow-500';
                        
                        return (
                          <div key={result} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 capitalize">{result}</span>
                            <div className="flex items-center space-x-3">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`${color} h-2 rounded-full`}
                                  style={{ width: `${(count / auditLogs.length) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold text-gray-900">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Top Risk Indicators</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border border-red-200 rounded-lg bg-red-50">
                      <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-red-900">
                        {auditLogs.filter(log => log.actor.riskScore > 80).length}
                      </p>
                      <p className="text-sm font-medium text-red-600">High Risk Events</p>
                    </div>
                    
                    <div className="text-center p-4 border border-orange-200 rounded-lg bg-orange-50">
                      <Shield className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-900">
                        {auditLogs.filter(log => log.correlation.length > 0).length}
                      </p>
                      <p className="text-sm font-medium text-orange-600">Correlated Events</p>
                    </div>
                    
                    <div className="text-center p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                      <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-yellow-900">
                        {auditLogs.filter(log => log.context.security.monitoring.anomalies.some(a => a.detected)).length}
                      </p>
                      <p className="text-sm font-medium text-yellow-600">Anomalies Detected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Audit Reports</h2>
                  <p className="text-gray-600">Automated and on-demand audit reports</p>
                </div>
                <button 
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Report</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'active' ? 'bg-green-100 text-green-800' :
                        report.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        report.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Type:</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{report.type}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Frequency:</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {report.schedule.frequency}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Recipients:</span>
                        <span className="text-sm font-medium text-gray-900">{report.recipients.length}</span>
                      </div>
                      
                      {report.lastRun && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Last Run:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(report.lastRun).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {report.nextRun && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Next Run:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(report.nextRun).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                      <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                        Edit
                      </button>
                      <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                        Run Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Compliance Monitoring</h2>
                <p className="text-gray-600">Audit trail compliance with regulatory frameworks</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['SOC2', 'ISO27001', 'PCI-DSS'].map((framework) => {
                  const complianceEvents = auditLogs.filter(log => 
                    log.compliance.some(c => c.framework === framework)
                  );
                  const evidenceEvents = complianceEvents.filter(log => 
                    log.compliance.some(c => c.framework === framework && c.evidence)
                  );
                  const complianceRate = complianceEvents.length > 0 ? 
                    (evidenceEvents.length / complianceEvents.length) * 100 : 0;
                  
                  return (
                    <div key={framework} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{framework}</h3>
                        <CheckCircle className={`w-6 h-6 ${complianceRate > 90 ? 'text-green-500' : complianceRate > 70 ? 'text-yellow-500' : 'text-red-500'}`} />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Compliance Rate:</span>
                          <span className={`text-sm font-medium ${complianceRate > 90 ? 'text-green-600' : complianceRate > 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {complianceRate.toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${complianceRate > 90 ? 'bg-green-500' : complianceRate > 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${complianceRate}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Total Events:</span>
                          <span className="text-sm font-medium text-gray-900">{complianceEvents.length}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Evidence Collected:</span>
                          <span className="text-sm font-medium text-gray-900">{evidenceEvents.length}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Compliance Events by Control</h3>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Framework</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Control</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requirement</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Events</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evidence</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compliance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {auditLogs.slice(0, 10).filter(log => log.compliance.length > 0).map((log) => 
                          log.compliance.map((compliance, index) => (
                            <tr key={`${log.id}_${index}`} className="hover:bg-gray-50">
                              <td className="px-4 py-4 text-sm font-medium text-gray-900">{compliance.framework}</td>
                              <td className="px-4 py-4 text-sm text-gray-900">{compliance.control}</td>
                              <td className="px-4 py-4 text-sm text-gray-900">{compliance.requirement}</td>
                              <td className="px-4 py-4 text-sm text-gray-900">1</td>
                              <td className="px-4 py-4">
                                {compliance.evidence ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-500" />
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  compliance.evidence && compliance.attestation ? 'bg-green-100 text-green-800' :
                                  compliance.evidence ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {compliance.evidence && compliance.attestation ? 'Compliant' :
                                   compliance.evidence ? 'Partial' : 'Non-Compliant'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
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

export default AuditTrailSystem;