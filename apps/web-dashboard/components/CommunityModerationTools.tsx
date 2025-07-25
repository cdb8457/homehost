'use client';

import { useState, useEffect } from 'react';
import { CommunityPlayer, PlayerAction, CrossServerBan } from '@/types/community';
import { 
  Shield, 
  Gavel, 
  Eye, 
  AlertTriangle, 
  Ban,
  Clock,
  MessageSquare,
  Flag,
  User,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Star,
  UserMinus,
  UserPlus,
  Volume2,
  VolumeX,
  FileText,
  Calendar,
  TrendingUp,
  Activity,
  Target,
  Zap,
  Settings,
  Bell
} from 'lucide-react';

interface CommunityModerationToolsProps {
  communityId: string;
  userRole: 'owner' | 'admin' | 'moderator' | 'member';
}

interface ModerationReport {
  id: string;
  reportedPlayerId: string;
  reportedBy: string;
  reason: string;
  description: string;
  evidence?: string[];
  serverId: string;
  timestamp: Date;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  assignedTo?: string;
  resolution?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface ModerationAction {
  id: string;
  type: 'warn' | 'mute' | 'kick' | 'temp_ban' | 'permanent_ban' | 'commend' | 'note';
  playerId: string;
  moderatorId: string;
  reason: string;
  duration?: number; // minutes for temporary actions
  timestamp: Date;
  serverId?: string;
  isActive: boolean;
  evidence?: string[];
}

interface QuickAction {
  id: string;
  name: string;
  type: ModerationAction['type'];
  reason: string;
  duration?: number;
  icon: string;
  color: string;
}

export default function CommunityModerationTools({ 
  communityId, 
  userRole = 'admin' 
}: CommunityModerationToolsProps) {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [activeTab, setActiveTab] = useState<'reports' | 'actions' | 'quick_actions' | 'settings'>('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'investigating' | 'resolved'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all');
  const [loading, setLoading] = useState(true);

  const quickActions: QuickAction[] = [
    { id: 'warn_spam', name: 'Warning - Spam', type: 'warn', reason: 'Spamming chat', icon: 'AlertTriangle', color: 'yellow' },
    { id: 'warn_language', name: 'Warning - Language', type: 'warn', reason: 'Inappropriate language', icon: 'MessageSquare', color: 'yellow' },
    { id: 'mute_1h', name: 'Mute 1 Hour', type: 'mute', reason: 'Chat violation', duration: 60, icon: 'VolumeX', color: 'orange' },
    { id: 'kick_grief', name: 'Kick - Griefing', type: 'kick', reason: 'Griefing other players', icon: 'UserMinus', color: 'red' },
    { id: 'temp_ban_24h', name: 'Ban 24 Hours', type: 'temp_ban', reason: 'Severe rule violation', duration: 1440, icon: 'Ban', color: 'red' },
    { id: 'commend_helpful', name: 'Commend - Helpful', type: 'commend', reason: 'Helping other players', icon: 'Star', color: 'green' }
  ];

  useEffect(() => {
    loadModerationData();
  }, [communityId]);

  const loadModerationData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mockReports: ModerationReport[] = [
      {
        id: 'report-1',
        reportedPlayerId: 'player-3',
        reportedBy: 'player-1',
        reason: 'Griefing',
        description: 'Player destroyed my base without permission and was laughing about it in chat',
        evidence: ['screenshot1.png', 'chat_log.txt'],
        serverId: 'server-1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'high'
      },
      {
        id: 'report-2',
        reportedPlayerId: 'player-5',
        reportedBy: 'player-2',
        reason: 'Cheating',
        description: 'Player is using speed hacks and flying around the map',
        evidence: ['recording.mp4'],
        serverId: 'server-2',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'investigating',
        assignedTo: 'moderator-1',
        priority: 'urgent'
      },
      {
        id: 'report-3',
        reportedPlayerId: 'player-6',
        reportedBy: 'player-4',
        reason: 'Harassment',
        description: 'Player has been following me around and making inappropriate comments',
        serverId: 'server-1',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        status: 'resolved',
        assignedTo: 'admin-1',
        resolution: 'Player warned and muted for 24 hours',
        priority: 'medium'
      }
    ];

    const mockActions: ModerationAction[] = [
      {
        id: 'action-1',
        type: 'warn',
        playerId: 'player-6',
        moderatorId: 'admin-1',
        reason: 'Inappropriate comments towards other players',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        serverId: 'server-1',
        isActive: true
      },
      {
        id: 'action-2',
        type: 'temp_ban',
        playerId: 'player-3',
        moderatorId: 'moderator-1',
        reason: 'Griefing other players structures',
        duration: 1440, // 24 hours
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        serverId: 'server-1',
        isActive: true,
        evidence: ['screenshot1.png', 'chat_log.txt']
      },
      {
        id: 'action-3',
        type: 'commend',
        playerId: 'player-1',
        moderatorId: 'admin-1',
        reason: 'Helped new players learn the game mechanics',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isActive: true
      }
    ];

    setReports(mockReports);
    setActions(mockActions);
    setLoading(false);
  };

  const filteredReports = reports.filter(report => {
    if (searchTerm && !report.reason.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !report.reportedPlayerId.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterStatus !== 'all' && report.status !== filterStatus) return false;
    if (filterPriority !== 'all' && report.priority !== filterPriority) return false;
    return true;
  });

  const handleReportAction = async (reportId: string, action: 'assign' | 'investigate' | 'resolve' | 'dismiss', data?: any) => {
    console.log(`Performing ${action} on report ${reportId}`, data);
    
    setReports(prev => prev.map(report => {
      if (report.id === reportId) {
        switch (action) {
          case 'assign':
            return { ...report, assignedTo: data.moderatorId, status: 'investigating' };
          case 'investigate':
            return { ...report, status: 'investigating' };
          case 'resolve':
            return { ...report, status: 'resolved', resolution: data.resolution };
          case 'dismiss':
            return { ...report, status: 'dismissed' };
          default:
            return report;
        }
      }
      return report;
    }));
  };

  const executeQuickAction = async (action: QuickAction, playerId: string, serverId?: string) => {
    console.log(`Executing quick action: ${action.name}`, { playerId, serverId });
    
    const newAction: ModerationAction = {
      id: `action-${Date.now()}`,
      type: action.type,
      playerId,
      moderatorId: 'current-user',
      reason: action.reason,
      duration: action.duration,
      timestamp: new Date(),
      serverId,
      isActive: true
    };

    setActions(prev => [newAction, ...prev]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 bg-red-100';
      case 'high': return 'text-orange-700 bg-orange-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-700 bg-orange-100';
      case 'investigating': return 'text-blue-700 bg-blue-100';
      case 'resolved': return 'text-green-700 bg-green-100';
      case 'dismissed': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'mute': return <VolumeX className="w-4 h-4 text-orange-600" />;
      case 'kick': return <UserMinus className="w-4 h-4 text-red-600" />;
      case 'temp_ban': return <Ban className="w-4 h-4 text-red-600" />;
      case 'permanent_ban': return <Ban className="w-4 h-4 text-red-800" />;
      case 'commend': return <Star className="w-4 h-4 text-green-600" />;
      case 'note': return <FileText className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const canPerformAction = (action: string) => {
    const permissions = {
      owner: ['warn', 'mute', 'kick', 'temp_ban', 'permanent_ban', 'commend', 'note', 'assign', 'resolve'],
      admin: ['warn', 'mute', 'kick', 'temp_ban', 'commend', 'note', 'assign', 'resolve'],
      moderator: ['warn', 'mute', 'kick', 'commend', 'note', 'investigate'],
      member: []
    };
    return permissions[userRole]?.includes(action) || false;
  };

  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;
  const urgentReportsCount = reports.filter(r => r.priority === 'urgent').length;
  const activeActionsCount = actions.filter(a => a.isActive).length;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-600" />
              Community Moderation Tools
            </h2>
            <p className="text-gray-600">
              Manage reports, take moderation actions, and maintain community standards
            </p>
          </div>
          <button
            onClick={loadModerationData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Flag className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">Pending Reports</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{pendingReportsCount}</div>
            <div className="text-sm text-orange-700">Need review</div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-900">Urgent Reports</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{urgentReportsCount}</div>
            <div className="text-sm text-red-700">High priority</div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gavel className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Active Actions</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{activeActionsCount}</div>
            <div className="text-sm text-blue-700">Currently enforced</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Response Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <div className="text-sm text-green-700">Within 2 hours</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'reports', label: 'Reports', icon: Flag },
              { id: 'actions', label: 'Actions', icon: Gavel },
              { id: 'quick_actions', label: 'Quick Actions', icon: Zap },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'reports' && (
        <div>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                        {report.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">#{report.id.slice(-6)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{report.reportedPlayerId}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{report.reason}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{report.serverId}</span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{report.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Reported by: {report.reportedBy}</span>
                      <span>•</span>
                      <span>{report.timestamp.toLocaleString()}</span>
                      {report.assignedTo && (
                        <>
                          <span>•</span>
                          <span>Assigned to: {report.assignedTo}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {canPerformAction('assign') && report.status === 'pending' && (
                      <button
                        onClick={() => handleReportAction(report.id, 'investigate')}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Investigate
                      </button>
                    )}
                    
                    {canPerformAction('resolve') && report.status === 'investigating' && (
                      <button
                        onClick={() => handleReportAction(report.id, 'resolve', { resolution: 'Action taken' })}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'actions' && (
        <div>
          <div className="space-y-4">
            {actions.map((action) => (
              <div key={action.id} className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getActionIcon(action.type)}
                    <div>
                      <div className="font-medium text-gray-900 capitalize">
                        {action.type.replace('_', ' ')} - {action.playerId}
                      </div>
                      <div className="text-sm text-gray-600">{action.reason}</div>
                      <div className="text-xs text-gray-500">
                        By {action.moderatorId} • {action.timestamp.toLocaleString()}
                        {action.duration && ` • Duration: ${Math.floor(action.duration / 60)}h ${action.duration % 60}m`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {action.isActive && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'quick_actions' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <div key={action.id} className="p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-${action.color}-100`}>
                    {getActionIcon(action.type)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{action.name}</div>
                    <div className="text-sm text-gray-600">{action.reason}</div>
                    {action.duration && (
                      <div className="text-xs text-gray-500">
                        Duration: {Math.floor(action.duration / 60)}h {action.duration % 60}m
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => executeQuickAction(action, 'selected-player')}
                  className={`w-full px-3 py-2 bg-${action.color}-600 text-white rounded hover:bg-${action.color}-700`}
                  disabled={!canPerformAction(action.type)}
                >
                  Execute Action
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Automation Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                <span className="text-sm text-gray-700">Auto-assign reports to available moderators</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                <span className="text-sm text-gray-700">Send notifications for urgent reports</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Auto-escalate unresolved reports after 24 hours</span>
              </label>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Report Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Griefing', 'Cheating', 'Harassment', 'Spam', 'Inappropriate Content', 'Other'].map(category => (
                <div key={category} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="text-sm text-gray-700">{category}</span>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}