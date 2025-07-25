'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Users,
  User,
  Shield,
  Lock,
  Unlock,
  Key,
  Settings,
  Eye,
  EyeOff,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Crown,
  Award,
  Target,
  Activity,
  Clock,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Wifi,
  Server,
  Database,
  Network,
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
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  Copy,
  Share2,
  Send,
  Play,
  Pause,
  Square,
  RotateCcw,
  FileText,
  Folder,
  FolderOpen,
  File,
  Code,
  Terminal,
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
  X,
  Gamepad2
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  status: 'active' | 'inactive' | 'locked' | 'suspended' | 'pending';
  roles: Role[];
  groups: Group[];
  permissions: Permission[];
  profile: UserProfile;
  authentication: AuthenticationInfo;
  sessions: UserSession[];
  auditTrail: AuditEntry[];
  createdAt: number;
  lastLogin?: number;
  lastActivity?: number;
  passwordLastChanged?: number;
  failedLoginAttempts: number;
  riskScore: number;
  mfaEnabled: boolean;
  metadata: { [key: string]: any };
}

interface UserProfile {
  avatar?: string;
  department: string;
  title: string;
  manager?: string;
  location: string;
  timezone: string;
  phoneNumber?: string;
  employeeId?: string;
  startDate: number;
  endDate?: number;
  costCenter?: string;
  businessUnit?: string;
}

interface AuthenticationInfo {
  methods: AuthMethod[];
  lastPasswordChange: number;
  passwordExpiry?: number;
  accountLockout?: AccountLockout;
  mfa: MFAConfiguration;
  sso: SSOConfiguration;
  apiKeys: APIKey[];
}

interface AuthMethod {
  type: 'password' | 'mfa' | 'sso' | 'certificate' | 'biometric' | 'token';
  enabled: boolean;
  lastUsed?: number;
  configuration: any;
}

interface AccountLockout {
  isLocked: boolean;
  lockoutTime?: number;
  unlockTime?: number;
  reason: string;
  lockedBy: string;
}

interface MFAConfiguration {
  enabled: boolean;
  methods: MFAMethod[];
  backupCodes: string[];
  lastUsed?: number;
}

interface MFAMethod {
  type: 'totp' | 'sms' | 'email' | 'push' | 'hardware_token';
  enabled: boolean;
  verified: boolean;
  enrolledAt: number;
  lastUsed?: number;
  configuration: any;
}

interface SSOConfiguration {
  enabled: boolean;
  provider: string;
  externalId?: string;
  attributes: { [key: string]: any };
  lastSync?: number;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'revoked' | 'expired';
  permissions: string[];
  createdAt: number;
  lastUsed?: number;
  expiresAt?: number;
}

interface Role {
  id: string;
  name: string;
  description: string;
  type: 'built_in' | 'custom' | 'inherited';
  category: 'system' | 'application' | 'business' | 'data';
  permissions: Permission[];
  members: string[];
  groups: string[];
  inheritance: RoleInheritance[];
  constraints: RoleConstraint[];
  metadata: RoleMetadata;
  isActive: boolean;
  createdAt: number;
  lastModified: number;
  createdBy: string;
  modifiedBy: string;
}

interface RoleInheritance {
  parentRoleId: string;
  inheritedPermissions: string[];
  conditions: InheritanceCondition[];
}

interface InheritanceCondition {
  type: 'time' | 'location' | 'device' | 'attribute';
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
}

interface RoleConstraint {
  type: 'time' | 'location' | 'device' | 'ip_address' | 'authentication_method';
  conditions: ConstraintCondition[];
  enforcement: 'block' | 'warning' | 'log_only';
}

interface ConstraintCondition {
  field: string;
  operator: string;
  value: any;
  logicalOperator?: 'AND' | 'OR' | 'NOT';
}

interface RoleMetadata {
  businessOwner: string;
  technicalOwner: string;
  approver: string;
  reviewCycle: 'monthly' | 'quarterly' | 'annually';
  lastReview: number;
  nextReview: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceFrameworks: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  effect: 'allow' | 'deny';
  conditions: PermissionCondition[];
  scope: PermissionScope;
  category: 'read' | 'write' | 'delete' | 'admin' | 'execute' | 'approve';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  createdAt: number;
  lastModified: number;
}

interface PermissionCondition {
  type: 'attribute' | 'time' | 'location' | 'device' | 'context';
  attribute: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'matches' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR' | 'NOT';
}

interface PermissionScope {
  type: 'global' | 'organization' | 'department' | 'project' | 'resource_specific';
  targets: string[];
  constraints: ScopeConstraint[];
}

interface ScopeConstraint {
  field: string;
  operator: string;
  value: any;
}

interface Group {
  id: string;
  name: string;
  description: string;
  type: 'security' | 'distribution' | 'application' | 'project' | 'department';
  category: 'static' | 'dynamic' | 'nested';
  members: GroupMember[];
  roles: string[];
  permissions: string[];
  parentGroups: string[];
  childGroups: string[];
  rules: GroupRule[];
  metadata: GroupMetadata;
  isActive: boolean;
  createdAt: number;
  lastModified: number;
  createdBy: string;
  modifiedBy: string;
}

interface GroupMember {
  id: string;
  type: 'user' | 'group' | 'service_account';
  addedAt: number;
  addedBy: string;
  expiresAt?: number;
  isActive: boolean;
}

interface GroupRule {
  id: string;
  type: 'attribute_based' | 'role_based' | 'time_based' | 'approval_based';
  conditions: GroupRuleCondition[];
  actions: GroupRuleAction[];
  isActive: boolean;
}

interface GroupRuleCondition {
  attribute: string;
  operator: string;
  value: any;
  logicalOperator?: 'AND' | 'OR' | 'NOT';
}

interface GroupRuleAction {
  type: 'add_member' | 'remove_member' | 'grant_role' | 'revoke_role' | 'notify';
  parameters: { [key: string]: any };
}

interface GroupMetadata {
  owner: string;
  businessPurpose: string;
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  reviewCycle: 'monthly' | 'quarterly' | 'annually';
  lastReview: number;
  nextReview: number;
  approvalRequired: boolean;
  maxMembers?: number;
}

interface UserSession {
  id: string;
  userId: string;
  deviceId: string;
  deviceInfo: DeviceInfo;
  location: SessionLocation;
  authentication: SessionAuthentication;
  startTime: number;
  lastActivity: number;
  expiresAt: number;
  status: 'active' | 'expired' | 'terminated' | 'suspicious';
  riskScore: number;
  activities: SessionActivity[];
  metadata: { [key: string]: any };
}

interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet' | 'kiosk' | 'api' | 'service';
  os: string;
  browser?: string;
  userAgent: string;
  fingerprint: string;
  isTrusted: boolean;
  isManaged: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface SessionLocation {
  ipAddress: string;
  country: string;
  region: string;
  city: string;
  isp: string;
  isVPN: boolean;
  isTrusted: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface SessionAuthentication {
  method: 'password' | 'mfa' | 'sso' | 'certificate' | 'api_key';
  factors: string[];
  mfaVerified: boolean;
  riskAssessment: AuthRiskAssessment;
}

interface AuthRiskAssessment {
  score: number;
  factors: RiskFactor[];
  decision: 'allow' | 'challenge' | 'block';
  reasoning: string[];
}

interface RiskFactor {
  type: 'location' | 'device' | 'behavior' | 'time' | 'velocity';
  value: number;
  weight: number;
  description: string;
}

interface SessionActivity {
  timestamp: number;
  action: string;
  resource: string;
  result: 'success' | 'failure' | 'blocked';
  riskScore: number;
  details: { [key: string]: any };
}

interface AuditEntry {
  id: string;
  timestamp: number;
  action: string;
  resource: string;
  actor: AuditActor;
  target?: AuditTarget;
  result: 'success' | 'failure' | 'blocked';
  details: AuditDetails;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  compliance: ComplianceInfo[];
}

interface AuditActor {
  type: 'user' | 'service' | 'system' | 'api';
  id: string;
  name: string;
  roles: string[];
  sessionId?: string;
  ipAddress: string;
  userAgent?: string;
}

interface AuditTarget {
  type: 'user' | 'role' | 'permission' | 'group' | 'resource';
  id: string;
  name: string;
  attributes: { [key: string]: any };
}

interface AuditDetails {
  description: string;
  changes: AuditChange[];
  context: { [key: string]: any };
  metadata: { [key: string]: any };
}

interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'create' | 'update' | 'delete';
}

interface ComplianceInfo {
  framework: string;
  control: string;
  requirement: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

interface AccessRequest {
  id: string;
  requestId: string;
  requester: string;
  requestType: 'role_assignment' | 'permission_grant' | 'group_membership' | 'resource_access' | 'privilege_escalation';
  targetUser?: string;
  targetResource: string;
  requestedAccess: RequestedAccess;
  justification: string;
  businessCase: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  workflow: ApprovalWorkflow;
  timeline: RequestTimeline;
  riskAssessment: RequestRiskAssessment;
  compliance: RequestCompliance;
  metadata: { [key: string]: any };
}

interface RequestedAccess {
  roles: string[];
  permissions: string[];
  groups: string[];
  resources: string[];
  duration?: number;
  conditions: AccessCondition[];
}

interface AccessCondition {
  type: 'time' | 'location' | 'approval' | 'monitoring';
  parameters: { [key: string]: any };
}

interface ApprovalWorkflow {
  steps: ApprovalStep[];
  currentStep: number;
  autoApproval: boolean;
  escalation: EscalationRule[];
}

interface ApprovalStep {
  id: string;
  name: string;
  approvers: string[];
  requiredApprovals: number;
  timeoutHours: number;
  status: 'pending' | 'approved' | 'rejected' | 'timeout';
  approvals: Approval[];
  autoApproval: boolean;
  conditions: ApprovalCondition[];
}

interface Approval {
  approver: string;
  decision: 'approve' | 'reject';
  timestamp: number;
  comments: string;
  conditions: string[];
}

interface ApprovalCondition {
  field: string;
  operator: string;
  value: any;
}

interface EscalationRule {
  trigger: 'timeout' | 'rejection' | 'risk_level';
  action: 'escalate' | 'auto_approve' | 'auto_reject' | 'notify';
  parameters: { [key: string]: any };
}

interface RequestTimeline {
  created: number;
  submitted: number;
  approved?: number;
  implemented?: number;
  expired?: number;
  duration?: number;
}

interface RequestRiskAssessment {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  mitigations: string[];
  monitoring: string[];
}

interface RequestCompliance {
  frameworks: string[];
  requirements: string[];
  attestations: string[];
  evidence: string[];
}

const AccessControlSystem: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions' | 'groups' | 'sessions' | 'requests' | 'audit'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(30);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateMockUsers = useCallback((): User[] => {
    const statuses = ['active', 'inactive', 'locked', 'suspended', 'pending'] as const;
    const departments = ['Engineering', 'Product', 'Security', 'Marketing', 'Sales', 'HR', 'Finance'];
    const titles = ['Manager', 'Director', 'Engineer', 'Analyst', 'Specialist', 'Coordinator'];
    
    return Array.from({ length, 50 }, (_, i) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const riskScore = Math.random() * 100;
      
      return {
        id: `user_${i + 1}`,
        username: `user${i + 1}`,
        email: `user${i + 1}@company.com`,
        firstName: `First${i + 1}`,
        lastName: `Last${i + 1}`,
        displayName: `First${i + 1} Last${i + 1}`,
        status,
        roles: [
          {
            id: `role_${Math.floor(Math.random() * 10) + 1}`,
            name: ['Admin', 'User', 'Manager', 'Analyst', 'Developer'][Math.floor(Math.random() * 5)],
            description: 'Role description',
            type: 'built_in',
            category: 'application',
            permissions: [],
            members: [],
            groups: [],
            inheritance: [],
            constraints: [],
            metadata: {
              businessOwner: 'owner',
              technicalOwner: 'tech_owner',
              approver: 'approver',
              reviewCycle: 'quarterly',
              lastReview: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
              nextReview: Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000,
              riskLevel: 'medium',
              complianceFrameworks: ['SOC2']
            },
            isActive: true,
            createdAt: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
            lastModified: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
            createdBy: 'admin',
            modifiedBy: 'admin'
          }
        ],
        groups: [],
        permissions: [],
        profile: {
          department,
          title,
          location: ['New York', 'San Francisco', 'London', 'Remote'][Math.floor(Math.random() * 4)],
          timezone: 'UTC-5',
          employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
          startDate: Date.now() - Math.random() * 1095 * 24 * 60 * 60 * 1000,
          costCenter: `CC${Math.floor(Math.random() * 100)}`,
          businessUnit: department
        },
        authentication: {
          methods: [
            {
              type: 'password',
              enabled: true,
              lastUsed: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
              configuration: {}
            }
          ],
          lastPasswordChange: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
          passwordExpiry: Date.now() + (90 - Math.random() * 30) * 24 * 60 * 60 * 1000,
          mfa: {
            enabled: Math.random() > 0.3,
            methods: [
              {
                type: 'totp',
                enabled: Math.random() > 0.5,
                verified: true,
                enrolledAt: Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000,
                configuration: {}
              }
            ],
            backupCodes: [],
            lastUsed: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          },
          sso: {
            enabled: Math.random() > 0.6,
            provider: 'Azure AD',
            externalId: `ext_${i + 1}`,
            attributes: {},
            lastSync: Date.now() - Math.random() * 24 * 60 * 60 * 1000
          },
          apiKeys: []
        },
        sessions: [],
        auditTrail: [],
        createdAt: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
        lastLogin: status === 'active' ? Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 : undefined,
        lastActivity: status === 'active' ? Date.now() - Math.random() * 24 * 60 * 60 * 1000 : undefined,
        passwordLastChanged: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
        failedLoginAttempts: Math.floor(Math.random() * 5),
        riskScore,
        mfaEnabled: Math.random() > 0.3,
        metadata: {
          source: 'internal',
          syncSource: 'manual'
        }
      };
    });
  }, []);

  const generateMockRoles = useCallback((): Role[] => {
    const roleNames = [
      'System Administrator',
      'Security Administrator', 
      'User Administrator',
      'Application Admin',
      'Read Only User',
      'Data Analyst',
      'Developer',
      'Manager',
      'Finance User',
      'HR Administrator'
    ];
    
    const categories = ['system', 'application', 'business', 'data'] as const;
    const types = ['built_in', 'custom', 'inherited'] as const;
    
    return roleNames.map((name, i) => ({
      id: `role_${i + 1}`,
      name,
      description: `${name} role with specific permissions and access controls`,
      type: types[Math.floor(Math.random() * types.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      permissions: [],
      members: Array.from({ length: Math.floor(Math.random() * 20) }, (_, j) => `user_${j + 1}`),
      groups: [],
      inheritance: [],
      constraints: [],
      metadata: {
        businessOwner: `owner_${i + 1}`,
        technicalOwner: `tech_owner_${i + 1}`,
        approver: `approver_${i + 1}`,
        reviewCycle: ['monthly', 'quarterly', 'annually'][Math.floor(Math.random() * 3)] as any,
        lastReview: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
        nextReview: Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000,
        riskLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
        complianceFrameworks: ['SOC2', 'ISO27001', 'PCI-DSS']
      },
      isActive: Math.random() > 0.1,
      createdAt: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
      lastModified: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      createdBy: 'admin',
      modifiedBy: 'admin'
    }));
  }, []);

  const generateMockSessions = useCallback((): UserSession[] => {
    const deviceTypes = ['desktop', 'mobile', 'tablet', 'api'] as const;
    const statuses = ['active', 'expired', 'terminated', 'suspicious'] as const;
    
    return Array.from({ length: 30 }, (_, i) => {
      const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const riskScore = Math.random() * 100;
      
      return {
        id: `session_${i + 1}`,
        userId: `user_${Math.floor(Math.random() * 50) + 1}`,
        deviceId: `device_${i + 1}`,
        deviceInfo: {
          type: deviceType,
          os: ['Windows 11', 'macOS', 'iOS', 'Android', 'Linux'][Math.floor(Math.random() * 5)],
          browser: deviceType !== 'api' ? ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)] : undefined,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          fingerprint: `fp_${Math.random().toString(36).substring(7)}`,
          isTrusted: Math.random() > 0.2,
          isManaged: Math.random() > 0.3,
          riskLevel: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low'
        },
        location: {
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          country: ['US', 'UK', 'DE', 'FR', 'CA'][Math.floor(Math.random() * 5)],
          region: 'Region',
          city: ['New York', 'London', 'Berlin', 'Paris', 'Toronto'][Math.floor(Math.random() * 5)],
          isp: 'ISP Provider',
          isVPN: Math.random() > 0.8,
          isTrusted: Math.random() > 0.1,
          riskLevel: 'low'
        },
        authentication: {
          method: ['password', 'mfa', 'sso'][Math.floor(Math.random() * 3)] as any,
          factors: ['password', 'totp'],
          mfaVerified: Math.random() > 0.3,
          riskAssessment: {
            score: riskScore,
            factors: [
              {
                type: 'location',
                value: Math.random() * 100,
                weight: 0.3,
                description: 'Location risk assessment'
              }
            ],
            decision: riskScore > 80 ? 'challenge' : riskScore > 60 ? 'challenge' : 'allow',
            reasoning: ['Normal login pattern', 'Trusted device']
          }
        },
        startTime: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        lastActivity: Date.now() - Math.random() * 60 * 60 * 1000,
        expiresAt: Date.now() + Math.random() * 24 * 60 * 60 * 1000,
        status,
        riskScore,
        activities: [],
        metadata: {}
      };
    });
  }, []);

  const generateMockRequests = useCallback((): AccessRequest[] => {
    const requestTypes = ['role_assignment', 'permission_grant', 'group_membership', 'resource_access'] as const;
    const statuses = ['pending', 'approved', 'rejected', 'cancelled', 'expired'] as const;
    const urgencies = ['low', 'medium', 'high', 'emergency'] as const;
    
    return Array.from({ length: 20 }, (_, i) => {
      const requestType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];
      const riskScore = Math.random() * 100;
      
      return {
        id: `request_${i + 1}`,
        requestId: `REQ-${String(i + 1).padStart(6, '0')}`,
        requester: `user_${Math.floor(Math.random() * 50) + 1}`,
        requestType,
        targetUser: requestType === 'role_assignment' ? `user_${Math.floor(Math.random() * 50) + 1}` : undefined,
        targetResource: `resource_${Math.floor(Math.random() * 20) + 1}`,
        requestedAccess: {
          roles: [`role_${Math.floor(Math.random() * 10) + 1}`],
          permissions: [],
          groups: [],
          resources: [],
          duration: Math.random() > 0.5 ? 30 : undefined,
          conditions: []
        },
        justification: 'Access required for project work and business objectives',
        businessCase: 'Supporting critical business initiative with appropriate access controls',
        urgency,
        status,
        workflow: {
          steps: [
            {
              id: 'step_1',
              name: 'Manager Approval',
              approvers: [`manager_${Math.floor(Math.random() * 5) + 1}`],
              requiredApprovals: 1,
              timeoutHours: 48,
              status: status === 'approved' ? 'approved' : status === 'pending' ? 'pending' : 'rejected',
              approvals: status === 'approved' ? [
                {
                  approver: `manager_${Math.floor(Math.random() * 5) + 1}`,
                  decision: 'approve',
                  timestamp: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
                  comments: 'Approved for business needs',
                  conditions: []
                }
              ] : [],
              autoApproval: false,
              conditions: []
            }
          ],
          currentStep: status === 'approved' ? 1 : 0,
          autoApproval: false,
          escalation: []
        },
        timeline: {
          created: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          submitted: Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000,
          approved: status === 'approved' ? Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000 : undefined,
          implemented: status === 'approved' ? Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000 : undefined
        },
        riskAssessment: {
          score: riskScore,
          level: riskScore > 80 ? 'critical' : riskScore > 60 ? 'high' : riskScore > 40 ? 'medium' : 'low',
          factors: [
            {
              type: 'location',
              value: Math.random() * 100,
              weight: 0.2,
              description: 'Request origin assessment'
            }
          ],
          mitigations: ['Regular access review', 'Monitoring enabled'],
          monitoring: ['Activity logging', 'Anomaly detection']
        },
        compliance: {
          frameworks: ['SOC2', 'ISO27001'],
          requirements: ['Access Control', 'Least Privilege'],
          attestations: [],
          evidence: []
        },
        metadata: {}
      };
    });
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const mockUsers = generateMockUsers();
        const mockRoles = generateMockRoles();
        const mockSessions = generateMockSessions();
        const mockRequests = generateMockRequests();
        
        setUsers(mockUsers);
        setRoles(mockRoles);
        setSessions(mockSessions);
        setRequests(mockRequests);
        
        if (mockUsers.length > 0) {
          setSelectedUser(mockUsers[0]);
        }
      } catch (error) {
        console.error('Error loading access control data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [generateMockUsers, generateMockRoles, generateMockSessions, generateMockRequests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'implemented':
        return 'text-green-600 bg-green-50';
      case 'pending':
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-50';
      case 'inactive':
      case 'rejected':
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      case 'locked':
      case 'suspended':
      case 'expired':
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'suspicious':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return 'text-red-600 bg-red-50';
    if (riskScore >= 60) return 'text-orange-600 bg-orange-50';
    if (riskScore >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
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
          <h1 className="text-3xl font-bold text-gray-900">Access Control & Identity Management</h1>
          <p className="text-gray-600 mt-2">Comprehensive identity and access management platform</p>
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
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'users', name: 'Users', icon: Users },
              { id: 'roles', name: 'Roles', icon: Crown },
              { id: 'permissions', name: 'Permissions', icon: Key },
              { id: 'groups', name: 'Groups', icon: Users },
              { id: 'sessions', name: 'Active Sessions', icon: Activity },
              { id: 'requests', name: 'Access Requests', icon: UserCheck },
              { id: 'audit', name: 'Audit Trail', icon: FileText }
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
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Active Users</p>
                      <p className="text-2xl font-bold text-green-900">
                        {users.filter(u => u.status === 'active').length}
                      </p>
                    </div>
                    <UserCheck className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {users.filter(u => u.status === 'pending').length}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Locked/Suspended</p>
                      <p className="text-2xl font-bold text-red-900">
                        {users.filter(u => ['locked', 'suspended'].includes(u.status)).length}
                      </p>
                    </div>
                    <UserX className="w-8 h-8 text-red-500" />
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">MFA Enabled</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {users.filter(u => u.mfaEnabled).length}
                      </p>
                    </div>
                    <Shield className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">High Risk</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {users.filter(u => u.riskScore > 70).length}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="locked">Locked</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                  <select 
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="low">Low Risk (0-40)</option>
                    <option value="medium">Medium Risk (40-60)</option>
                    <option value="high">High Risk (60-80)</option>
                    <option value="critical">Critical Risk (80+)</option>
                  </select>
                </div>
                <button
                  onClick={() => setUsers(generateMockUsers())}
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MFA</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.slice(0, 15).map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {user.firstName[0]}{user.lastName[0]}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                              {user.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.profile.department}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {user.roles.slice(0, 2).map((role) => (
                                <span key={role.id} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                  {role.name}
                                </span>
                              ))}
                              {user.roles.length > 2 && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                  +{user.roles.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    user.riskScore > 70 ? 'bg-red-500' :
                                    user.riskScore > 40 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${user.riskScore}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{user.riskScore.toFixed(0)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4">
                            {user.mfaEnabled ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              Manage
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

          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Active Sessions</p>
                      <p className="text-2xl font-bold text-green-900">
                        {sessions.filter(s => s.status === 'active').length}
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Suspicious</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {sessions.filter(s => s.status === 'suspicious').length}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Mobile Sessions</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {sessions.filter(s => s.deviceInfo.type === 'mobile').length}
                      </p>
                    </div>
                    <Smartphone className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">High Risk</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {sessions.filter(s => s.riskScore > 70).length}
                      </p>
                    </div>
                    <Shield className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sessions.slice(0, 15).map((session) => (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{session.userId}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {session.deviceInfo.type === 'desktop' ? <Monitor className="w-4 h-4" /> :
                               session.deviceInfo.type === 'mobile' ? <Smartphone className="w-4 h-4" /> :
                               session.deviceInfo.type === 'tablet' ? <Tablet className="w-4 h-4" /> :
                               <Server className="w-4 h-4" />}
                              <span className="text-sm text-gray-900">{session.deviceInfo.os}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{session.location.city}, {session.location.country}</div>
                            <div className="text-sm text-gray-500">{session.location.ipAddress}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                              {session.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    session.riskScore > 70 ? 'bg-red-500' :
                                    session.riskScore > 40 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${session.riskScore}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{session.riskScore.toFixed(0)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(session.startTime).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(session.lastActivity).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                              Terminate
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

          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {['pending', 'approved', 'rejected', 'expired'].map((status) => {
                  const count = requests.filter(r => r.status === status).length;
                  const color = status === 'approved' ? 'text-green-600 bg-green-50' :
                               status === 'pending' ? 'text-yellow-600 bg-yellow-50' :
                               status === 'rejected' ? 'text-red-600 bg-red-50' :
                               'text-gray-600 bg-gray-50';
                  
                  return (
                    <div key={status} className={`rounded-lg p-6 ${color}`}>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-sm font-medium capitalize">{status} Requests</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {requests.slice(0, 10).map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.requestId}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{request.requester}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                            {request.requestType.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{request.targetResource}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                              {request.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(request.riskAssessment.score)}`}>
                              {request.riskAssessment.level.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(request.timeline.submitted).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => setShowRequestModal(true)}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              Review
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
        </div>
      </div>
    </div>
  );
};

export default AccessControlSystem;