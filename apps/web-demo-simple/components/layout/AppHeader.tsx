'use client';

import { useState } from 'react';
import { User, Notification } from '@/types/app';
import { 
  Search,
  Bell,
  Settings,
  LogOut,
  Menu,
  User as UserIcon,
  Shield,
  HelpCircle,
  ChevronDown,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  Trophy
} from 'lucide-react';

interface AppHeaderProps {
  user: User;
  notifications: Notification[];
  onMenuToggle: () => void;
  onSearch: (query: string) => void;
}

export default function AppHeader({ user, notifications, onMenuToggle, onSearch }: AppHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'server-alert': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'achievement': return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'community-update': return <UserIcon className="w-4 h-4 text-blue-500" />;
      case 'plugin-update': return <Shield className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-orange-500 bg-orange-50';
      case 'success': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search games, communities, plugins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors w-80"
              />
            </div>
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Search */}
          <button className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-600 mt-1">{unreadCount} unread notifications</p>
                  )}
                </div>

                <div className="py-2">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-l-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          getNotificationColor(notification.severity)
                        } ${!notification.read ? 'font-medium' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(notification.timestamp).toLocaleDateString()} at{' '}
                              {new Date(notification.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 10 && (
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-medium text-sm">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role} Host</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                {/* User Info */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">{user.stats.totalUptime} uptime</span>
                        </div>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">⭐ {user.stats.communityReputation}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-4 border-b border-gray-200">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{user.stats.serversHosted}</p>
                      <p className="text-xs text-gray-500">Servers</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{user.stats.communitiesJoined}</p>
                      <p className="text-xs text-gray-500">Communities</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{user.stats.pluginsInstalled}</p>
                      <p className="text-xs text-gray-500">Plugins</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <UserIcon className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <Settings className="w-4 h-4" />
                    Preferences
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <HelpCircle className="w-4 h-4" />
                    Help & Support
                  </button>
                  <hr className="my-2" />
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}