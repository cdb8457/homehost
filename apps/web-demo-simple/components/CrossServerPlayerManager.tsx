'use client';

import { useState, useEffect } from 'react';
import { CommunityPlayer, PlayerAction, CrossServerBan } from '@/types/community';
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Search,
  Filter,
  MoreVertical,
  Ban,
  CheckCircle,
  XCircle,
  Star,
  Award,
  Activity,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  MessageSquare,
  FileText,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface CrossServerPlayerManagerProps {
  communityId: string;
  userRole: 'owner' | 'admin' | 'moderator' | 'member';
}

export default function CrossServerPlayerManager({ 
  communityId, 
  userRole = 'admin' 
}: CrossServerPlayerManagerProps) {
  const [players, setPlayers] = useState<CommunityPlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<CommunityPlayer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'banned' | 'warned'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'member' | 'vip' | 'moderator' | 'admin'>('all');
  const [showPlayerDetails, setShowPlayerDetails] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    loadPlayers();
  }, [communityId]);

  const loadPlayers = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockPlayers: CommunityPlayer[] = [
      {
        id: 'player-1',
        steamId: '76561198001234567',
        username: 'ProGamer123',
        displayName: 'ProGamer123',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        joinedAt: new Date('2024-01-15'),
        lastSeen: new Date(),
        isOnline: true,
        currentServerId: 'server-1',
        role: 'member',
        reputation: {
          score: 85,
          commendations: 12,
          warnings: 1,
          isBanned: false
        },
        activity: {
          totalPlayTime: 2400, // 40 hours
          favoriteServer: 'server-1',
          serverPlayTime: { 'server-1': 1800, 'server-2': 600 },
          lastActivity: {
            serverId: 'server-1',
            action: 'Building base',
            timestamp: new Date()
          }
        },
        permissions: ['chat', 'build'],
        notes: 'Active community member, good builder'
      },
      {
        id: 'player-2',
        steamId: '76561198002345678',
        username: 'CasualPlayer',
        displayName: 'Casual Player',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b25aa10a?w=100',
        joinedAt: new Date('2024-02-20'),
        lastSeen: new Date(Date.now() - 86400000), // 1 day ago
        isOnline: false,
        role: 'vip',
        reputation: {
          score: 92,
          commendations: 18,
          warnings: 0,
          isBanned: false
        },
        activity: {
          totalPlayTime: 1200, // 20 hours
          favoriteServer: 'server-2',
          serverPlayTime: { 'server-1': 300, 'server-2': 900 },
          lastActivity: {
            serverId: 'server-2',
            action: 'Resource gathering',
            timestamp: new Date(Date.now() - 86400000)
          }
        },
        permissions: ['chat', 'build', 'vip_areas'],
        notes: 'VIP supporter, very helpful to new players'
      },
      {
        id: 'player-3',
        steamId: '76561198003456789',
        username: 'TrollUser',
        displayName: 'Problem Player',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        joinedAt: new Date('2024-03-01'),
        lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
        isOnline: false,
        role: 'member',
        reputation: {
          score: 25,
          commendations: 2,
          warnings: 5,
          isBanned: true,
          banReason: 'Griefing and harassment',
          banExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        },
        activity: {
          totalPlayTime: 600, // 10 hours
          favoriteServer: 'server-1',
          serverPlayTime: { 'server-1': 400, 'server-2': 200 },
          lastActivity: {
            serverId: 'server-1',
            action: 'Disconnected (banned)',
            timestamp: new Date(Date.now() - 3600000)
          }
        },
        permissions: [],
        notes: 'Multiple warnings for griefing. Temporary ban issued.'
      },
      {
        id: 'player-4',
        steamId: '76561198004567890',
        username: 'ModeratorMike',
        displayName: 'Moderator Mike',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        joinedAt: new Date('2024-01-10'),
        lastSeen: new Date(Date.now() - 1800000), // 30 minutes ago
        isOnline: true,
        currentServerId: 'server-2',
        role: 'moderator',
        reputation: {
          score: 98,
          commendations: 45,
          warnings: 0,
          isBanned: false
        },
        activity: {
          totalPlayTime: 4800, // 80 hours
          favoriteServer: 'server-2',
          serverPlayTime: { 'server-1': 1200, 'server-2': 3600 },
          lastActivity: {
            serverId: 'server-2',
            action: 'Moderating chat',
            timestamp: new Date(Date.now() - 1800000)
          }
        },
        permissions: ['chat', 'build', 'moderate', 'kick', 'temp_ban'],
        notes: 'Trusted moderator, excellent community management'
      }
    ];

    setPlayers(mockPlayers);
    setLoading(false);
  };

  const filteredPlayers = players.filter(player => {
    // Search filter
    if (searchTerm && !player.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !player.displayName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filterStatus === 'online' && !player.isOnline) return false;
    if (filterStatus === 'banned' && !player.reputation.isBanned) return false;
    if (filterStatus === 'warned' && player.reputation.warnings === 0) return false;

    // Role filter
    if (filterRole !== 'all' && player.role !== filterRole) return false;

    return true;
  });

  const getReputationColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      case 'vip': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handlePlayerAction = async (playerId: string, action: string, reason?: string) => {
    // Simulate API call
    console.log(`Performing ${action} on player ${playerId}`, { reason });
    
    // Update local state
    setPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        switch (action) {
          case 'ban':
            return {
              ...player,
              reputation: {
                ...player.reputation,
                isBanned: true,
                banReason: reason || 'Unspecified',
                banExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              }
            };
          case 'unban':
            return {
              ...player,
              reputation: {
                ...player.reputation,
                isBanned: false,
                banReason: undefined,
                banExpiresAt: undefined
              }
            };
          case 'warn':
            return {
              ...player,
              reputation: {
                ...player.reputation,
                warnings: player.reputation.warnings + 1,
                score: Math.max(0, player.reputation.score - 10)
              }
            };
          case 'commend':
            return {
              ...player,
              reputation: {
                ...player.reputation,
                commendations: player.reputation.commendations + 1,
                score: Math.min(100, player.reputation.score + 5)
              }
            };
        }
      }
      return player;
    }));
  };

  const canPerformAction = (action: string) => {
    const permissions = {
      owner: ['ban', 'unban', 'warn', 'commend', 'promote', 'demote', 'notes'],
      admin: ['ban', 'unban', 'warn', 'commend', 'promote', 'notes'],
      moderator: ['warn', 'commend', 'temp_ban', 'notes'],
      member: []
    };
    return permissions[userRole]?.includes(action) || false;
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              Cross-Server Player Management
            </h2>
            <p className="text-gray-600">
              Manage player reputation, activities, and moderation across all community servers
            </p>
          </div>
          <button
            onClick={loadPlayers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Total Players</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{players.length}</div>
            <div className="text-sm text-blue-700">{players.filter(p => p.isOnline).length} online</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">High Reputation</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {players.filter(p => p.reputation.score >= 80).length}
            </div>
            <div className="text-sm text-green-700">Score ≥ 80</div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-900">Banned Players</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {players.filter(p => p.reputation.isBanned).length}
            </div>
            <div className="text-sm text-red-700">Active bans</div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-900">Warnings</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {players.reduce((sum, p) => sum + p.reputation.warnings, 0)}
            </div>
            <div className="text-sm text-yellow-700">Total warnings</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search players..."
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
              <option value="online">Online</option>
              <option value="banned">Banned</option>
              <option value="warned">Warned</option>
            </select>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="member">Members</option>
              <option value="vip">VIP</option>
              <option value="moderator">Moderators</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {/* Players Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading players...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Player</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Reputation</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Play Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Last Activity</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => (
                <tr key={player.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={player.avatar}
                        alt={player.displayName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{player.displayName}</div>
                        <div className="text-sm text-gray-500">@{player.username}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {player.isOnline ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-600 text-sm">Online</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="text-gray-600 text-sm">Offline</span>
                        </>
                      )}
                      {player.reputation.isBanned && (
                        <Ban className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReputationColor(player.reputation.score)}`}>
                        {player.reputation.score}
                      </span>
                      <div className="text-xs text-gray-500">
                        <div>👍 {player.reputation.commendations}</div>
                        <div>⚠️ {player.reputation.warnings}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(player.role)}`}>
                      {player.role}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div className="font-medium">{formatPlayTime(player.activity.totalPlayTime)}</div>
                      <div className="text-gray-500 text-xs">
                        Favorite: Server {player.activity.favoriteServer?.slice(-1)}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div className="text-gray-900">{player.activity.lastActivity.action}</div>
                      <div className="text-gray-500 text-xs">
                        {new Date(player.activity.lastActivity.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedPlayer(player);
                          setShowPlayerDetails(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {canPerformAction('commend') && (
                        <button
                          onClick={() => handlePlayerAction(player.id, 'commend')}
                          className="p-1 text-green-400 hover:text-green-600"
                          title="Commend Player"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}

                      {canPerformAction('warn') && !player.reputation.isBanned && (
                        <button
                          onClick={() => handlePlayerAction(player.id, 'warn', 'Warning issued')}
                          className="p-1 text-yellow-400 hover:text-yellow-600"
                          title="Issue Warning"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      )}

                      {canPerformAction('ban') && !player.reputation.isBanned && (
                        <button
                          onClick={() => {
                            setSelectedPlayer(player);
                            setShowBanDialog(true);
                          }}
                          className="p-1 text-red-400 hover:text-red-600"
                          title="Ban Player"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}

                      {canPerformAction('unban') && player.reputation.isBanned && (
                        <button
                          onClick={() => handlePlayerAction(player.id, 'unban')}
                          className="p-1 text-blue-400 hover:text-blue-600"
                          title="Unban Player"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPlayers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No players found matching your filters</p>
            </div>
          )}
        </div>
      )}

      {/* Player Details Modal would go here */}
      {/* Ban Dialog Modal would go here */}
    </div>
  );
}