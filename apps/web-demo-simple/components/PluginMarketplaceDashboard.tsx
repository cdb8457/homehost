'use client';

import { useState } from 'react';
import PluginMarketplace from './PluginMarketplace';
import PluginInstallManager from './PluginInstallManager';
import PluginDeveloperDashboard from './PluginDeveloperDashboard';
import { 
  Store, 
  Package, 
  Code, 
  Settings, 
  BarChart3, 
  Users, 
  Shield, 
  Zap,
  Target,
  Award,
  TrendingUp,
  Activity,
  Download,
  Star
} from 'lucide-react';

interface PluginMarketplaceDashboardProps {
  userRole: 'alex' | 'sam' | 'developer' | 'admin';
  serverId?: string;
  serverName?: string;
  developerId?: string;
}

export default function PluginMarketplaceDashboard({ 
  userRole = 'alex',
  serverId,
  serverName,
  developerId
}: PluginMarketplaceDashboardProps) {
  const [activeSection, setActiveSection] = useState<'marketplace' | 'manager' | 'developer' | 'overview'>('overview');

  const navigationItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: Target, 
      description: 'Plugin ecosystem overview',
      available: true 
    },
    { 
      id: 'marketplace', 
      label: 'Plugin Marketplace', 
      icon: Store, 
      description: 'Discover and install plugins',
      available: true 
    },
    { 
      id: 'manager', 
      label: 'Plugin Manager', 
      icon: Package, 
      description: 'Manage installed plugins',
      available: serverId && serverName && (userRole === 'sam' || userRole === 'admin')
    },
    { 
      id: 'developer', 
      label: 'Developer Dashboard', 
      icon: Code, 
      description: 'Create and manage your plugins',
      available: developerId && (userRole === 'developer' || userRole === 'admin')
    }
  ];

  const availableNavItems = navigationItems.filter(item => item.available);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
        <h3 className="text-xl font-bold text-indigo-900 mb-3 flex items-center gap-2">
          <Target className="w-6 h-6" />
          Epic 3 Plugin Marketplace
        </h3>
        <p className="text-indigo-700 mb-4">
          A comprehensive plugin ecosystem with marketplace, installation management, and developer tools 
          for extending HomeHost gaming server capabilities.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Plugin Marketplace</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">✅ Complete</div>
            <div className="text-sm text-gray-600">Discovery and browsing system</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Plugin Manager</span>
            </div>
            <div className="text-2xl font-bold text-green-600">✅ Complete</div>
            <div className="text-sm text-gray-600">Installation and management</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">Developer Tools</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">✅ Complete</div>
            <div className="text-sm text-gray-600">SDK and developer dashboard</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-gray-900">Security System</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">✅ Complete</div>
            <div className="text-sm text-gray-600">Plugin validation and sandboxing</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            Marketplace Features
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Plugin discovery and browsing</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Advanced search and filtering</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Featured plugins and recommendations</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Plugin reviews and ratings</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Category-based organization</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Management Tools
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>One-click plugin installation</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Automatic updates and versioning</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Plugin configuration interface</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Server monitoring and logs</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Dependency management</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-600" />
            Developer Platform
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Plugin submission system</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Developer analytics dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Revenue tracking and payouts</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Plugin testing sandbox</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>API documentation and SDK</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Marketplace Statistics
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Total Plugins</span>
              </div>
              <span className="font-bold text-gray-900">247</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Total Downloads</span>
              </div>
              <span className="font-bold text-gray-900">170k+</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">Active Developers</span>
              </div>
              <span className="font-bold text-gray-900">89</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-600">Average Rating</span>
              </div>
              <span className="font-bold text-gray-900">4.7/5</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Recent Activity
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Advanced Chat Manager</div>
                <div className="text-xs text-gray-500">Updated to v2.1.5</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">New Plugin Submission</div>
                <div className="text-xs text-gray-500">Economy System Pro v3.0.2</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Developer Verified</div>
                <div className="text-xs text-gray-500">Plugin Dev Studios</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Featured Plugin</div>
                <div className="text-xs text-gray-500">Performance Optimizer</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">✓</span>
          </div>
          <div>
            <h4 className="font-semibold text-emerald-900">Epic 3 Plugin Marketplace - Complete!</h4>
            <p className="text-emerald-700">Full-featured plugin ecosystem ready for production deployment</p>
          </div>
        </div>
        <div className="text-sm text-emerald-700">
          The Plugin Marketplace provides a complete ecosystem for discovering, installing, and managing 
          plugins for HomeHost gaming servers. Developers can create and monetize plugins while users 
          enjoy a seamless plugin experience with enterprise-grade security and management tools.
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-lg border-r border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Plugin Marketplace</h2>
            <p className="text-sm text-gray-600">Epic 3 Plugin Ecosystem</p>
          </div>
          <nav className="p-4 space-y-2">
            {availableNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeSection === 'overview' && renderOverview()}
          
          {activeSection === 'marketplace' && (
            <PluginMarketplace userType={userRole === 'alex' ? 'alex' : userRole === 'sam' ? 'sam' : 'both'} />
          )}
          
          {activeSection === 'manager' && serverId && serverName && (
            <PluginInstallManager 
              serverId={serverId} 
              serverName={serverName}
              userRole={userRole as 'owner' | 'admin' | 'moderator'}
            />
          )}
          
          {activeSection === 'developer' && developerId && (
            <PluginDeveloperDashboard 
              developerId={developerId}
              userRole={userRole as 'developer' | 'admin'}
            />
          )}
        </div>
      </div>
    </div>
  );
}