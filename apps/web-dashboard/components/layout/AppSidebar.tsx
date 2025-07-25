'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, NavigationItem } from '@/types/app';
import { NAVIGATION_ITEMS } from '@/data/app';
import { 
  Home,
  Gamepad2,
  Users,
  Monitor,
  Server,
  Puzzle,
  TrendingUp,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Activity,
  Search,
  Heart,
  BarChart3,
  Download,
  Play,
  UserPlus
} from 'lucide-react';

interface AppSidebarProps {
  user: User;
  collapsed: boolean;
  onToggle: () => void;
}

const ICON_MAP = {
  'home': Home,
  'gamepad-2': Gamepad2,
  'users': Users,
  'monitor': Monitor,
  'server': Server,
  'puzzle': Puzzle,
  'trending-up': TrendingUp,
  'help-circle': HelpCircle,
  'activity': Activity,
  'search': Search,
  'heart': Heart,
  'bar-chart-3': BarChart3,
  'download': Download,
  'play': Play,
  'user-plus': UserPlus
} as const;

export default function AppSidebar({ user, collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['communities', 'console', 'marketplace']);

  // Filter navigation items based on user type
  const filteredNavItems = NAVIGATION_ITEMS.filter(item => 
    item.userTypes.includes(user.role)
  );

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + '/');
  };

  const renderNavItem = (item: NavigationItem, depth = 0) => {
    const IconComponent = ICON_MAP[item.icon as keyof typeof ICON_MAP] || Home;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.url);

    return (
      <div key={item.id}>
        <div className={`group flex items-center ${depth > 0 ? 'pl-4' : ''}`}>
          <Link
            href={item.url}
            className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              active
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <IconComponent className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="font-medium">{item.title}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>

          {/* Expand/Collapse button for items with children */}
          {hasChildren && !collapsed && (
            <button
              onClick={() => toggleExpanded(item.id)}
              className={`p-1 rounded-md transition-colors ${
                active ? 'text-white hover:bg-indigo-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Children items */}
        {hasChildren && !collapsed && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.filter(child => child.userTypes.includes(user.role)).map(child => 
              renderNavItem(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            H
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">HomeHost</h1>
              <p className="text-xs text-gray-500">
                {user.role === 'USER' ? 'Casual Host' : 'Community Builder'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavItems.map(item => renderNavItem(item))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-medium text-sm">
            {user.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">{user.stats.totalUptime} uptime</span>
                </div>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{user.stats.serversHosted} servers</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:shadow-md transition-shadow"
      >
        <ChevronRight className={`w-3 h-3 text-gray-400 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>
    </div>
  );
}