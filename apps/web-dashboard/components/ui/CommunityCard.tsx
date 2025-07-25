'use client';

import { useState } from 'react';
import { Community } from '@/lib/api';
import { 
  Users, 
  Globe, 
  Star, 
  TrendingUp, 
  Shield, 
  Clock, 
  Play,
  UserPlus,
  Lock,
  Mail,
  Eye,
  BarChart3,
  Settings,
  Crown,
  ChevronRight,
  Gamepad2,
  MapPin,
  Activity,
  Loader2
} from 'lucide-react';

interface CommunityCardProps {
  community: Community;
  onJoin: (communityId: string, joinType: string) => void;
  onViewDetails: (communityId: string) => void;
  showAdminView?: boolean;
  className?: string;
  joinLoading?: boolean;
}

export default function CommunityCard({ 
  community, 
  onJoin, 
  onViewDetails, 
  showAdminView = false,
  className = '',
  joinLoading = false
}: CommunityCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showServerPreview, setShowServerPreview] = useState(false);

  const getJoinButtonConfig = () => {
    switch (community.joinType) {
      case 'open':
        return {
          text: 'Join Now',
          icon: <UserPlus className="w-4 h-4" />,
          style: 'bg-green-600 hover:bg-green-700 text-white',
          disabled: false
        };
      case 'application':
        return {
          text: 'Apply to Join',
          icon: <Mail className="w-4 h-4" />,
          style: 'bg-blue-600 hover:bg-blue-700 text-white',
          disabled: false
        };
      case 'invite_only':
        return {
          text: 'Invite Only',
          icon: <Lock className="w-4 h-4" />,
          style: 'bg-gray-400 cursor-not-allowed text-white',
          disabled: true
        };
    }
  };

  const getActivityColor = () => {
    const activityRatio = (community.onlineMembers || 0) / community.memberCount;
    if (activityRatio > 0.2) return 'text-green-600';
    if (activityRatio > 0.1) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getGrowthIndicator = () => {
    // Simple growth indicator based on member count (placeholder logic)
    const growthRate = Math.random() * 20 - 5; // Random between -5 and 15
    if (growthRate > 5) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (growthRate > 0) {
      return <Activity className="w-4 h-4 text-blue-600" />;
    } else {
      return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
    }
  };

  const getGrowthRate = () => {
    // Simple growth rate calculation (placeholder)
    return Math.floor(Math.random() * 20 - 5);
  };

  const joinConfig = getJoinButtonConfig();

  return (
    <div 
      className={`group relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Community Banner */}
      <div 
        className="relative h-32 bg-gradient-to-r overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, #6366f1, #8b5cf6)`
        }}
      >
        {/* Verification Badge */}
        {community.verified && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white p-1 rounded-full">
            <Shield className="w-4 h-4" />
          </div>
        )}

        {/* Featured Badge */}
        {community.featured && (
          <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Star className="w-3 h-3" />
            Featured
          </div>
        )}

        {/* Community Logo */}
        <div className="absolute -bottom-6 left-6">
          <div 
            className="w-12 h-12 rounded-xl border-3 border-white shadow-lg flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: '#6366f1' }}
          >
            {community.name.charAt(0)}
          </div>
        </div>

        {/* Activity Indicator */}
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
          <div className="flex items-center gap-1 text-white text-xs">
            <div className={`w-2 h-2 rounded-full ${(community.onlineMembers || 0) > 0 ? 'bg-green-400' : 'bg-gray-400'}`} />
            <span>{community.onlineMembers || 0} online</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-8">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{community.name}</h3>
            <div className="flex items-center gap-1">
              {getGrowthIndicator()}
              <span className="text-sm font-medium text-gray-600">
                {community.growth.memberGrowthRate > 0 ? '+' : ''}{community.growth.memberGrowthRate}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{community.description}</p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {community.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                {tag}
              </span>
            ))}
            {community.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                +{community.tags.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {community.memberCount.toLocaleString()}
              </div>
              <div className={`text-xs ${getActivityColor()}`}>
                {community.membersOnline} online
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <div>
              <div className="text-sm font-semibold text-gray-900">{community.rating}</div>
              <div className="text-xs text-gray-500">{community.reviewCount} reviews</div>
            </div>
          </div>
        </div>

        {/* Games */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Games</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {community.games.map((game) => (
              <span key={game} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                {game}
              </span>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        {community.socialProof.friendsInCommunity > 0 && (
          <div className="mb-4 p-3 bg-pink-50 rounded-lg border border-pink-200">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-pink-600" />
              <span className="text-sm font-medium text-pink-800">
                {community.socialProof.friendsInCommunity} friend{community.socialProof.friendsInCommunity > 1 ? 's' : ''} play here
              </span>
            </div>
            <div className="text-xs text-pink-700">
              {community.socialProof.mutualFriends.slice(0, 2).join(', ')}
              {community.socialProof.mutualFriends.length > 2 && 
                ` and ${community.socialProof.mutualFriends.length - 2} other${community.socialProof.mutualFriends.length > 3 ? 's' : ''}`
              }
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Recent Activity</span>
          </div>
          <div className="text-xs text-gray-600">{community.socialProof.recentActivity}</div>
        </div>

        {/* Server Preview (on hover) */}
        {isHovered && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Active Servers</span>
            </div>
            <div className="space-y-1">
              {community.servers.filter(s => s.isOnline).slice(0, 2).map((server) => (
                <div key={server.id} className="flex items-center justify-between text-xs">
                  <span className="text-blue-700 font-medium">{server.name}</span>
                  <span className="text-blue-600">{server.playerCount}/{server.maxPlayers}</span>
                </div>
              ))}
              {community.servers.filter(s => s.isOnline).length > 2 && (
                <div className="text-xs text-blue-600">
                  +{community.servers.filter(s => s.isOnline).length - 2} more servers
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin Preview for Sam */}
        {showAdminView && community.adminData && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Admin Dashboard</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-purple-700">WAU: </span>
                <span className="text-purple-900 font-medium">
                  {community.adminData.analytics.weeklyActiveUsers}
                </span>
              </div>
              <div>
                <span className="text-purple-700">Retention: </span>
                <span className="text-purple-900 font-medium">
                  {community.adminData.analytics.memberRetentionRate}%
                </span>
              </div>
              {community.adminData.analytics.revenueThisMonth && (
                <div className="col-span-2">
                  <span className="text-purple-700">Revenue: </span>
                  <span className="text-purple-900 font-medium">
                    ${community.adminData.analytics.revenueThisMonth.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onJoin(community.id, community.joinType)}
            disabled={joinConfig.disabled}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${joinConfig.style}`}
          >
            {joinConfig.icon}
            {joinConfig.text}
          </button>

          <button
            onClick={() => onViewDetails(community.id)}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Eye className="w-4 h-4" />
          </button>

          {showAdminView && community.adminData && (
            <button
              onClick={() => onViewDetails(community.id)}
              className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Region and Join Type */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{community.region}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Globe className="w-3 h-3" />
            <span className="capitalize">{community.joinType.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}