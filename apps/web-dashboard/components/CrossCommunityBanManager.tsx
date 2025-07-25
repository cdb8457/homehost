'use client';

import { useState, useEffect } from 'react';
import { CrossServerBan, CommunityPlayer, CommunityServer } from '@/types/community';
import { 
  Shield, 
  Ban, 
  AlertTriangle, 
  Clock, 
  Search,
  Filter,
  Calendar,
  User,
  Gavel,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  ExternalLink,
  Globe,
  Server,
  Timer,
  Users,
  MessageSquare,
  Trash2,
  Edit,
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface CrossCommunityBanManagerProps {
  communityId: string;
  userRole: 'owner' | 'admin' | 'moderator' | 'member';
}

interface BanAppeal {
  id: string;
  banId: string;
  playerId: string;
  message: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

export default function CrossCommunityBanManager({ 
  communityId, 
  userRole = 'admin' 
}: CrossCommunityBanManagerProps) {
  const [bans, setBans] = useState<CrossServerBan[]>([]);
  const [appeals, setAppeals] = useState<BanAppeal[]>([]);
  const [selectedBan, setSelectedBan] = useState<CrossServerBan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'appealed'>('all');
  const [filterScope, setFilterScope] = useState<'all' | 'server_specific' | 'community_wide'>('all');
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showAppealDialog, setShowAppealDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBans();
    loadAppeals();
  }, [communityId]);

  const loadBans = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const mockBans: CrossServerBan[] = [
      {
        id: 'ban-1',
        playerId: 'player-3',
        communityId: communityId,
        serverIds: [], // Empty means all servers
        reason: 'Griefing multiple structures and harassment in chat',
        bannedBy: 'admin-1',
        bannedAt: new Date('2024-07-10'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true,
        appealUrl: 'https://homehost.gg/appeals/ban-1'
      },
      {
        id: 'ban-2',
        playerId: 'player-5',
        communityId: communityId,
        serverIds: ['server-1'], // Specific server only
        reason: 'Exploiting game mechanics on Server 1',
        bannedBy: 'moderator-2',
        bannedAt: new Date('2024-07-08'),
        expiresAt: new Date('2024-07-15'), // Expired
        isActive: false,
        appealUrl: 'https://homehost.gg/appeals/ban-2'
      },
      {
        id: 'ban-3',
        playerId: 'player-6',
        communityId: communityId,
        serverIds: ['server-2', 'server-3'],
        reason: 'Cheating and unfair advantage',
        bannedBy: 'admin-1',
        bannedAt: new Date('2024-07-01'),
        isActive: true // Permanent ban
      },
      {
        id: 'ban-4',
        playerId: 'player-7',
        communityId: communityId,
        serverIds: [],
        reason: 'Repeated toxic behavior and rule violations',
        bannedBy: 'owner-1',
        bannedAt: new Date('2024-06-25'),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        appealUrl: 'https://homehost.gg/appeals/ban-4'
      }
    ];

    setBans(mockBans);
    setLoading(false);
  };

  const loadAppeals = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const mockAppeals: BanAppeal[] = [
      {
        id: 'appeal-1',
        banId: 'ban-1',
        playerId: 'player-3',
        message: 'I was not griefing, I was just building near other structures. The harassment claim is unfair as I was defending myself.',
        submittedAt: new Date('2024-07-12'),
        status: 'pending'
      },
      {
        id: 'appeal-2',
        banId: 'ban-4',
        playerId: 'player-7',
        message: 'I have learned from my mistakes and would like another chance. I will follow all community rules.',
        submittedAt: new Date('2024-07-01'),
        status: 'rejected',
        reviewedBy: 'admin-1',
        reviewedAt: new Date('2024-07-03'),
        reviewNotes: 'Multiple previous warnings. Appeal too soon after ban.'
      }
    ];

    setAppeals(mockAppeals);
  };

  const filteredBans = bans.filter(ban => {
    // Search filter
    if (searchTerm && !ban.reason.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !ban.playerId.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Status filter
    const now = new Date();
    if (filterStatus === 'active' && (!ban.isActive || (ban.expiresAt && ban.expiresAt < now))) return false;
    if (filterStatus === 'expired' && (ban.isActive && (!ban.expiresAt || ban.expiresAt > now))) return false;
    if (filterStatus === 'appealed' && !appeals.some(appeal => appeal.banId === ban.id)) return false;

    // Scope filter
    if (filterScope === 'server_specific' && ban.serverIds.length === 0) return false;
    if (filterScope === 'community_wide' && ban.serverIds.length > 0) return false;

    return true;
  });

  const getBanStatusColor = (ban: CrossServerBan) => {
    if (!ban.isActive) return 'text-gray-600 bg-gray-100';
    if (ban.expiresAt && ban.expiresAt < new Date()) return 'text-gray-600 bg-gray-100';
    if (!ban.expiresAt) return 'text-red-600 bg-red-100'; // Permanent
    return 'text-orange-600 bg-orange-100'; // Temporary
  };

  const getBanStatusText = (ban: CrossServerBan) => {
    if (!ban.isActive) return 'Lifted';
    if (ban.expiresAt && ban.expiresAt < new Date()) return 'Expired';
    if (!ban.expiresAt) return 'Permanent';
    return 'Temporary';
  };

  const getBanScopeText = (ban: CrossServerBan) => {
    if (ban.serverIds.length === 0) return 'All Servers';
    if (ban.serverIds.length === 1) return `Server ${ban.serverIds[0].slice(-1)}`;
    return `${ban.serverIds.length} Servers`;
  };

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const remaining = expiresAt.getTime() - now.getTime();
    
    if (remaining <= 0) return 'Expired';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const handleBanAction = async (banId: string, action: 'lift' | 'extend' | 'modify') => {
    console.log(`Performing ${action} on ban ${banId}`);
    
    setBans(prev => prev.map(ban => {
      if (ban.id === banId) {
        switch (action) {
          case 'lift':
            return { ...ban, isActive: false };
          case 'extend':
            return { 
              ...ban, 
              expiresAt: ban.expiresAt ? new Date(ban.expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000) : undefined 
            };
          default:
            return ban;
        }
      }
      return ban;
    }));
  };

  const handleAppealAction = async (appealId: string, action: 'approve' | 'reject', notes?: string) => {
    console.log(`${action} appeal ${appealId}`, { notes });
    
    setAppeals(prev => prev.map(appeal => {
      if (appeal.id === appealId) {
        return {
          ...appeal,
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewedBy: 'current-admin',
          reviewedAt: new Date(),
          reviewNotes: notes
        };
      }
      return appeal;
    }));

    // If approved, lift the ban
    if (action === 'approve') {
      const appeal = appeals.find(a => a.id === appealId);
      if (appeal) {
        await handleBanAction(appeal.banId, 'lift');
      }
    }
  };

  const canPerformAction = (action: string) => {
    const permissions = {
      owner: ['ban', 'lift', 'modify', 'appeal_review'],
      admin: ['ban', 'lift', 'modify', 'appeal_review'],
      moderator: ['ban', 'appeal_review'],
      member: []
    };
    return permissions[userRole]?.includes(action) || false;
  };

  const activeBansCount = bans.filter(ban => ban.isActive && (!ban.expiresAt || ban.expiresAt > new Date())).length;
  const pendingAppealsCount = appeals.filter(appeal => appeal.status === 'pending').length;
  const communityWideBansCount = bans.filter(ban => ban.serverIds.length === 0 && ban.isActive).length;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-600" />
              Cross-Community Ban Management
            </h2>
            <p className="text-gray-600">
              Manage player bans across all community servers and handle ban appeals
            </p>
          </div>
          <div className="flex items-center gap-3">
            {canPerformAction('ban') && (
              <button
                onClick={() => setShowBanDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Plus className="w-4 h-4" />
                New Ban
              </button>
            )}
            <button
              onClick={loadBans}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-900">Active Bans</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{activeBansCount}</div>
            <div className="text-sm text-red-700">Currently enforced</div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">Pending Appeals</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{pendingAppealsCount}</div>
            <div className="text-sm text-orange-700">Awaiting review</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Community-Wide</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{communityWideBansCount}</div>
            <div className="text-sm text-purple-700">All servers banned</div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Server-Specific</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {bans.filter(ban => ban.serverIds.length > 0 && ban.isActive).length}
            </div>
            <div className="text-sm text-blue-700">Targeted bans</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bans by reason or player..."
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
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="appealed">Has Appeals</option>
            </select>

            <select
              value={filterScope}
              onChange={(e) => setFilterScope(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Scope</option>
              <option value="community_wide">Community-Wide</option>
              <option value="server_specific">Server-Specific</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bans Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading bans...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Player</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Scope</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Reason</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Banned By</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Appeals</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBans.map((ban) => {
                const banAppeals = appeals.filter(appeal => appeal.banId === ban.id);
                const pendingAppeal = banAppeals.find(appeal => appeal.status === 'pending');
                
                return (
                  <tr key={ban.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{ban.playerId}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBanStatusColor(ban)}`}>
                        {getBanStatusText(ban)}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {ban.serverIds.length === 0 ? (
                          <Globe className="w-4 h-4 text-purple-500" />
                        ) : (
                          <Server className="w-4 h-4 text-blue-500" />
                        )}
                        <span className="text-sm text-gray-700">{getBanScopeText(ban)}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={ban.reason}>
                        {ban.reason}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {ban.expiresAt ? (
                          <>
                            <div className="font-medium text-gray-900">
                              {formatTimeRemaining(ban.expiresAt)}
                            </div>
                            <div className="text-gray-500 text-xs">
                              Until {ban.expiresAt.toLocaleDateString()}
                            </div>
                          </>
                        ) : (
                          <span className="font-medium text-red-600">Permanent</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{ban.bannedBy}</div>
                        <div className="text-gray-500 text-xs">
                          {ban.bannedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {banAppeals.length > 0 && (
                          <span className="text-xs text-gray-600">{banAppeals.length}</span>
                        )}
                        {pendingAppeal && (
                          <MessageSquare className="w-4 h-4 text-orange-500" title="Pending appeal" />
                        )}
                        {ban.appealUrl && (
                          <ExternalLink className="w-4 h-4 text-blue-500" title="Appeal available" />
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedBan(ban)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canPerformAction('lift') && ban.isActive && (
                          <button
                            onClick={() => handleBanAction(ban.id, 'lift')}
                            className="p-1 text-green-400 hover:text-green-600"
                            title="Lift Ban"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {canPerformAction('modify') && ban.isActive && ban.expiresAt && (
                          <button
                            onClick={() => handleBanAction(ban.id, 'extend')}
                            className="p-1 text-orange-400 hover:text-orange-600"
                            title="Extend Ban"
                          >
                            <Timer className="w-4 h-4" />
                          </button>
                        )}

                        {canPerformAction('appeal_review') && pendingAppeal && (
                          <button
                            onClick={() => {
                              setSelectedBan(ban);
                              setShowAppealDialog(true);
                            }}
                            className="p-1 text-blue-400 hover:text-blue-600"
                            title="Review Appeal"
                          >
                            <Gavel className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredBans.length === 0 && (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No bans found matching your filters</p>
            </div>
          )}
        </div>
      )}

      {/* Pending Appeals Section */}
      {pendingAppealsCount > 0 && canPerformAction('appeal_review') && (
        <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Pending Ban Appeals ({pendingAppealsCount})
          </h3>
          <div className="space-y-3">
            {appeals.filter(appeal => appeal.status === 'pending').map((appeal) => {
              const ban = bans.find(b => b.id === appeal.banId);
              return (
                <div key={appeal.id} className="bg-white p-3 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">{appeal.playerId}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">
                          {ban?.reason}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{appeal.message}</p>
                      <div className="text-xs text-gray-500">
                        Submitted {appeal.submittedAt.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleAppealAction(appeal.id, 'approve', 'Appeal approved by admin')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAppealAction(appeal.id, 'reject', 'Appeal rejected')}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals would go here for ban creation and appeal review */}
    </div>
  );
}