'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Shield,
  Flag,
  Eye,
  EyeOff,
  Ban,
  Unlock,
  UserX,
  UserCheck,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Settings,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  Bell,
  BellOff,
  Mail,
  Phone,
  Globe,
  Lock,
  Trash2,
  Edit,
  Save,
  X,
  Plus,
  Minus,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Copy,
  Share2,
  FileText,
  Image,
  Video,
  Mic,
  Camera,
  Link,
  Hash,
  AtSign,
  Star,
  Crown,
  Award,
  Target,
  Zap,
  Fire,
  Sparkles,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Info,
  AlertCircle,
  CheckSquare,
  Square
} from 'lucide-react';

interface ModerationReport {
  id: string;
  type: 'user' | 'content' | 'message' | 'server' | 'behavior';
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    role: string;
    trustScore: number;
  };
  targetUser?: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    joinDate: string;
    lastSeen: string;
    warningCount: number;
    banHistory: number;
  };
  targetContent?: {
    id: string;
    type: 'post' | 'comment' | 'image' | 'video' | 'message';
    content: string;
    url?: string;
    timestamp: string;
  };
  category: string;
  reason: string;
  description: string;
  evidence: Evidence[];
  timestamp: string;
  assignedTo?: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  actions: ModerationAction[];
  notes: ModerationNote[];
  autoDetected: boolean;
  severity: number;
  tags: string[];
}

interface Evidence {
  id: string;
  type: 'screenshot' | 'recording' | 'log' | 'link' | 'testimony';
  title: string;
  url: string;
  description: string;
  timestamp: string;
  submittedBy: string;
}

interface ModerationAction {
  id: string;
  type: 'warning' | 'mute' | 'kick' | 'ban' | 'content_removal' | 'demotion' | 'restriction';
  moderator: {
    id: string;
    username: string;
    displayName: string;
  };
  reason: string;
  duration?: string;
  timestamp: string;
  automated: boolean;
  appealable: boolean;
  appealed: boolean;
  reversed: boolean;
}

interface ModerationNote {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  edited: boolean;
  internal: boolean;
}

interface AutoModerationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'content' | 'behavior' | 'spam' | 'toxicity' | 'security';
  triggers: {
    keywords: string[];
    patterns: string[];
    conditions: Record<string, any>;
  };
  actions: {
    immediate: string[];
    escalation: string[];
  };
  sensitivity: 'low' | 'medium' | 'high';
  scope: 'all' | 'new_users' | 'specific_channels' | 'specific_roles';
  createdBy: string;
  createdAt: string;
  lastModified: string;
  totalTriggers: number;
  accuracyRate: number;
}

interface ModerationStats {
  reports: {
    total: number;
    pending: number;
    resolved: number;
    dismissed: number;
    escalated: number;
  };
  actions: {
    warnings: number;
    mutes: number;
    kicks: number;
    bans: number;
    contentRemovals: number;
  };
  autoModeration: {
    totalDetections: number;
    accuracy: number;
    falsePositives: number;
    escalations: number;
  };
  trends: {
    reportsByDay: { date: string; count: number }[];
    topCategories: { category: string; count: number }[];
    moderatorActivity: { moderator: string; actions: number }[];
  };
}

interface BannedUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bannedAt: string;
  bannedBy: string;
  reason: string;
  duration: string;
  permanent: boolean;
  appealable: boolean;
  appealed: boolean;
  appealStatus?: 'pending' | 'approved' | 'denied';
}

export function CommunityModeration() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'reports' | 'actions' | 'rules' | 'stats' | 'banned' | 'settings'>('reports');
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [autoRules, setAutoRules] = useState<AutoModerationRule[]>([]);
  const [moderationStats, setModerationStats] = useState<ModerationStats | null>(null);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    type: 'all',
    category: 'all',
    assignee: 'all',
    timeRange: 'all',
    autoDetected: 'all',
    searchQuery: ''
  });
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'severity'>('newest');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadModerationData();
  }, [activeTab, filters, sortBy]);

  const loadModerationData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (activeTab === 'reports') {
        setReports(generateMockReports());
      } else if (activeTab === 'rules') {
        setAutoRules(generateMockAutoRules());
      } else if (activeTab === 'stats') {
        setModerationStats(generateMockStats());
      } else if (activeTab === 'banned') {
        setBannedUsers(generateMockBannedUsers());
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockReports = (): ModerationReport[] => {
    const types = ['user', 'content', 'message', 'server', 'behavior'];
    const statuses = ['pending', 'investigating', 'resolved', 'dismissed', 'escalated'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    const categories = [
      'harassment', 'spam', 'inappropriate_content', 'cheating', 
      'toxicity', 'doxxing', 'copyright', 'advertising', 'griefing'
    ];

    return Array.from({ length: 100 }, (_, i) => ({
      id: `report-${i + 1}`,
      type: types[i % types.length] as any,
      status: statuses[i % statuses.length] as any,
      priority: priorities[i % priorities.length] as any,
      reportedBy: {
        id: `reporter-${(i % 20) + 1}`,
        username: `reporter${(i % 20) + 1}`,
        displayName: `Reporter ${(i % 20) + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        role: ['member', 'trusted', 'moderator'][i % 3],
        trustScore: Math.floor(Math.random() * 100) + 1
      },
      targetUser: Math.random() > 0.3 ? {
        id: `target-${(i % 30) + 1}`,
        username: `target${(i % 30) + 1}`,
        displayName: `Target User ${(i % 30) + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 100}`,
        joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        warningCount: Math.floor(Math.random() * 5),
        banHistory: Math.floor(Math.random() * 3)
      } : undefined,
      targetContent: Math.random() > 0.5 ? {
        id: `content-${i + 1}`,
        type: ['post', 'comment', 'image', 'video', 'message'][i % 5] as any,
        content: 'This is some example content that was reported for moderation review.',
        url: `https://example.com/content/${i + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      } : undefined,
      category: categories[i % categories.length],
      reason: [
        'Inappropriate language',
        'Harassment of other users',
        'Spam/promotional content',
        'Explicit content',
        'Cheating/exploiting',
        'Doxxing personal information',
        'Copyright violation',
        'Off-topic advertising',
        'Griefing/trolling'
      ][i % 9],
      description: 'Detailed description of the reported incident and any relevant context.',
      evidence: Math.random() > 0.7 ? [{
        id: `evidence-${i + 1}`,
        type: ['screenshot', 'recording', 'log', 'link'][i % 4] as any,
        title: 'Evidence Screenshot',
        url: `https://example.com/evidence/${i + 1}`,
        description: 'Screenshot showing the incident',
        timestamp: new Date().toISOString(),
        submittedBy: `reporter-${(i % 20) + 1}`
      }] : [],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: Math.random() > 0.6 ? {
        id: `mod-${(i % 5) + 1}`,
        username: `moderator${(i % 5) + 1}`,
        displayName: `Moderator ${(i % 5) + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 200}`
      } : undefined,
      actions: Math.random() > 0.5 ? [{
        id: `action-${i + 1}`,
        type: ['warning', 'mute', 'kick', 'ban', 'content_removal'][i % 5] as any,
        moderator: {
          id: `mod-${(i % 5) + 1}`,
          username: `moderator${(i % 5) + 1}`,
          displayName: `Moderator ${(i % 5) + 1}`
        },
        reason: 'Violation of community guidelines',
        duration: Math.random() > 0.5 ? '24 hours' : undefined,
        timestamp: new Date().toISOString(),
        automated: Math.random() > 0.7,
        appealable: true,
        appealed: Math.random() > 0.8,
        reversed: Math.random() > 0.9
      }] : [],
      notes: Math.random() > 0.7 ? [{
        id: `note-${i + 1}`,
        author: {
          id: `mod-${(i % 5) + 1}`,
          username: `moderator${(i % 5) + 1}`,
          displayName: `Moderator ${(i % 5) + 1}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 200}`
        },
        content: 'Internal note about this case',
        timestamp: new Date().toISOString(),
        edited: false,
        internal: true
      }] : [],
      autoDetected: Math.random() > 0.6,
      severity: Math.floor(Math.random() * 10) + 1,
      tags: ['reviewed', 'verified', 'escalated'].slice(0, Math.floor(Math.random() * 3) + 1)
    }));
  };

  const generateMockAutoRules = (): AutoModerationRule[] => {
    return [
      {
        id: 'rule-1',
        name: 'Spam Detection',
        description: 'Automatically detects and removes spam messages and posts',
        enabled: true,
        type: 'spam',
        triggers: {
          keywords: ['buy now', 'click here', 'limited time', 'free money'],
          patterns: ['repeated messages', 'excessive caps', 'rapid posting'],
          conditions: { messageFrequency: 5, timeWindow: 60 }
        },
        actions: {
          immediate: ['delete_message', 'warn_user'],
          escalation: ['mute_user', 'notify_moderators']
        },
        sensitivity: 'medium',
        scope: 'all',
        createdBy: 'system',
        createdAt: '2024-01-01T00:00:00Z',
        lastModified: '2024-01-15T00:00:00Z',
        totalTriggers: 1250,
        accuracyRate: 89.5
      },
      {
        id: 'rule-2',
        name: 'Toxicity Filter',
        description: 'Detects toxic language and inappropriate behavior',
        enabled: true,
        type: 'toxicity',
        triggers: {
          keywords: ['hate speech terms', 'slurs', 'threats'],
          patterns: ['aggressive tone', 'personal attacks'],
          conditions: { toxicityScore: 0.8 }
        },
        actions: {
          immediate: ['warn_user', 'hide_content'],
          escalation: ['timeout_user', 'escalate_to_human']
        },
        sensitivity: 'high',
        scope: 'all',
        createdBy: 'admin-1',
        createdAt: '2024-01-01T00:00:00Z',
        lastModified: '2024-01-20T00:00:00Z',
        totalTriggers: 856,
        accuracyRate: 92.3
      },
      {
        id: 'rule-3',
        name: 'New User Protection',
        description: 'Additional scrutiny for new user activities',
        enabled: true,
        type: 'behavior',
        triggers: {
          keywords: [],
          patterns: ['rapid friend requests', 'mass messaging'],
          conditions: { userAge: 7, activityScore: 10 }
        },
        actions: {
          immediate: ['rate_limit', 'flag_for_review'],
          escalation: ['restrict_permissions', 'manual_review']
        },
        sensitivity: 'low',
        scope: 'new_users',
        createdBy: 'admin-2',
        createdAt: '2024-01-05T00:00:00Z',
        lastModified: '2024-01-25T00:00:00Z',
        totalTriggers: 425,
        accuracyRate: 76.8
      }
    ];
  };

  const generateMockStats = (): ModerationStats => {
    return {
      reports: {
        total: 1456,
        pending: 89,
        resolved: 1245,
        dismissed: 122,
        escalated: 45
      },
      actions: {
        warnings: 856,
        mutes: 245,
        kicks: 89,
        bans: 67,
        contentRemovals: 1234
      },
      autoModeration: {
        totalDetections: 2891,
        accuracy: 87.5,
        falsePositives: 362,
        escalations: 145
      },
      trends: {
        reportsByDay: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 50) + 10
        })),
        topCategories: [
          { category: 'spam', count: 456 },
          { category: 'toxicity', count: 345 },
          { category: 'harassment', count: 234 },
          { category: 'inappropriate_content', count: 189 },
          { category: 'cheating', count: 123 }
        ],
        moderatorActivity: [
          { moderator: 'Moderator 1', actions: 234 },
          { moderator: 'Moderator 2', actions: 189 },
          { moderator: 'Moderator 3', actions: 156 },
          { moderator: 'Moderator 4', actions: 134 },
          { moderator: 'Moderator 5', actions: 98 }
        ]
      }
    };
  };

  const generateMockBannedUsers = (): BannedUser[] => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: `banned-${i + 1}`,
      username: `banneduser${i + 1}`,
      displayName: `Banned User ${i + 1}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 300}`,
      bannedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      bannedBy: `moderator${(i % 5) + 1}`,
      reason: [
        'Repeated harassment',
        'Spam and advertising',
        'Cheating/exploiting',
        'Doxxing',
        'Hate speech',
        'Griefing'
      ][i % 6],
      duration: Math.random() > 0.3 ? ['7 days', '30 days', '90 days', '1 year'][i % 4] : 'Permanent',
      permanent: Math.random() > 0.7,
      appealable: Math.random() > 0.3,
      appealed: Math.random() > 0.8,
      appealStatus: Math.random() > 0.5 ? ['pending', 'approved', 'denied'][i % 3] as any : undefined
    }));
  };

  const handleTakeAction = async (reportId: string, action: string) => {
    setReports(prev => 
      prev.map(report => 
        report.id === reportId
          ? { ...report, status: 'investigating' }
          : report
      )
    );
  };

  const handleResolveReport = async (reportId: string, resolution: string) => {
    setReports(prev => 
      prev.map(report => 
        report.id === reportId
          ? { ...report, status: 'resolved' }
          : report
      )
    );
  };

  const handleToggleRule = async (ruleId: string) => {
    setAutoRules(prev => 
      prev.map(rule => 
        rule.id === ruleId
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );
  };

  const filteredReports = reports.filter(report => {
    if (filters.status !== 'all' && report.status !== filters.status) return false;
    if (filters.priority !== 'all' && report.priority !== filters.priority) return false;
    if (filters.type !== 'all' && report.type !== filters.type) return false;
    if (filters.category !== 'all' && report.category !== filters.category) return false;
    if (filters.searchQuery && !report.reason.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'oldest':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'severity':
        return b.severity - a.severity;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Moderation</h2>
          <p className="text-gray-600">Manage reports, enforce rules, and maintain community standards</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Ban className="h-4 w-4 mr-2" />
            Quick Ban
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Mass Action
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'reports', name: 'Reports', icon: Flag },
            { id: 'actions', name: 'Actions', icon: Shield },
            { id: 'rules', name: 'Auto Rules', icon: Settings },
            { id: 'stats', name: 'Statistics', icon: BarChart3 },
            { id: 'banned', name: 'Banned Users', icon: Ban },
            { id: 'settings', name: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Quick Stats */}
      {moderationStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Pending Reports</p>
                <p className="text-2xl font-bold text-yellow-900">{moderationStats.reports.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <Ban className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Total Bans</p>
                <p className="text-2xl font-bold text-red-900">{moderationStats.actions.bans}</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Auto Detections</p>
                <p className="text-2xl font-bold text-blue-900">{moderationStats.autoModeration.totalDetections}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Accuracy Rate</p>
                <p className="text-2xl font-bold text-green-900">{moderationStats.autoModeration.accuracy}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
                <option value="escalated">Escalated</option>
              </select>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">By Priority</option>
              <option value="severity">By Severity</option>
            </select>
          </div>

          {/* Reports Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReports(filteredReports.map(r => r.id));
                          } else {
                            setSelectedReports([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reporter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.slice(0, 20).map(report => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedReports.includes(report.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedReports(prev => [...prev, report.id]);
                            } else {
                              setSelectedReports(prev => prev.filter(id => id !== report.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {report.type === 'user' && <User className="h-5 w-5 text-gray-400" />}
                            {report.type === 'content' && <FileText className="h-5 w-5 text-gray-400" />}
                            {report.type === 'message' && <MessageCircle className="h-5 w-5 text-gray-400" />}
                            {report.type === 'server' && <Globe className="h-5 w-5 text-gray-400" />}
                            {report.type === 'behavior' && <Activity className="h-5 w-5 text-gray-400" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {report.reason}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {report.category} • ID: {report.id}
                            </p>
                            {report.autoDetected && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                <Zap className="h-3 w-3 mr-1" />
                                Auto-detected
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : report.status === 'investigating'
                            ? 'bg-blue-100 text-blue-800'
                            : report.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : report.status === 'dismissed'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.priority === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : report.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : report.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {report.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={report.reportedBy.avatar}
                            alt={report.reportedBy.displayName}
                            className="h-8 w-8 rounded-full"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {report.reportedBy.displayName}
                            </p>
                            <p className="text-sm text-gray-500">
                              Trust: {report.reportedBy.trustScore}%
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.targetUser ? (
                          <div className="flex items-center">
                            <img
                              src={report.targetUser.avatar}
                              alt={report.targetUser.displayName}
                              className="h-8 w-8 rounded-full"
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {report.targetUser.displayName}
                              </p>
                              <p className="text-sm text-gray-500">
                                Warnings: {report.targetUser.warningCount}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Content/Other</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleTakeAction(report.id, 'investigate')}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleResolveReport(report.id, 'resolved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
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
            <h3 className="text-lg font-semibold text-gray-900">Auto-Moderation Rules</h3>
            <button
              onClick={() => setShowRuleModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {autoRules.map(rule => (
              <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{rule.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.enabled ? 'Active' : 'Disabled'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rule.type === 'spam'
                          ? 'bg-yellow-100 text-yellow-800'
                          : rule.type === 'toxicity'
                          ? 'bg-red-100 text-red-800'
                          : rule.type === 'behavior'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {rule.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{rule.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Triggers: </span>
                        <span className="text-gray-600">{rule.totalTriggers.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Accuracy: </span>
                        <span className="text-gray-600">{rule.accuracyRate}%</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Sensitivity: </span>
                        <span className="text-gray-600">{rule.sensitivity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`p-2 rounded-lg ${
                        rule.enabled
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {rule.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Report Details</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Report Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{selectedReport.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedReport.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reason:</span>
                        <span className="font-medium">{selectedReport.reason}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Severity:</span>
                        <span className="font-medium">{selectedReport.severity}/10</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedReport.description}</p>
                  </div>

                  {selectedReport.targetContent && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Reported Content</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{selectedReport.targetContent.content}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Posted: {new Date(selectedReport.targetContent.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedReport.evidence.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Evidence</h4>
                      <div className="space-y-3">
                        {selectedReport.evidence.map(evidence => (
                          <div key={evidence.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{evidence.title}</span>
                              <span className="text-sm text-gray-500">{evidence.type}</span>
                            </div>
                            <p className="text-gray-700">{evidence.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                        Warn User
                      </button>
                      <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                        Mute User
                      </button>
                      <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Ban User
                      </button>
                      <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        Remove Content
                      </button>
                      <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Resolve Report
                      </button>
                      <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                        Dismiss Report
                      </button>
                    </div>
                  </div>

                  {selectedReport.targetUser && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Target User</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={selectedReport.targetUser.avatar}
                            alt={selectedReport.targetUser.displayName}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <h5 className="font-medium text-gray-900">{selectedReport.targetUser.displayName}</h5>
                            <p className="text-sm text-gray-600">@{selectedReport.targetUser.username}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Join Date:</span>
                            <span>{new Date(selectedReport.targetUser.joinDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Warnings:</span>
                            <span>{selectedReport.targetUser.warningCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ban History:</span>
                            <span>{selectedReport.targetUser.banHistory}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Reporter</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={selectedReport.reportedBy.avatar}
                          alt={selectedReport.reportedBy.displayName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h5 className="font-medium text-gray-900">{selectedReport.reportedBy.displayName}</h5>
                          <p className="text-sm text-gray-600">@{selectedReport.reportedBy.username}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Role:</span>
                          <span>{selectedReport.reportedBy.role}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trust Score:</span>
                          <span>{selectedReport.reportedBy.trustScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}