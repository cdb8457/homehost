'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Notification, AppState } from '@/types/app';
import { MOCK_NOTIFICATIONS } from '@/data/app';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { Plus, Smartphone } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  userType?: string;
}

export default function AppLayout({ children, userType }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const [appState, setAppState] = useState<AppState>({
    user: null,
    notifications: MOCK_NOTIFICATIONS,
    sidebarCollapsed: false,
    currentSection: 'dashboard',
    searchQuery: '',
    isLoading: loading
  });

  // Update app state when user changes
  useEffect(() => {
    if (user) {
      setAppState(prev => ({
        ...prev,
        user: {
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
          email: user.email,
          avatar: '',
          role: user.role,
          preferences: {
            theme: 'light',
            experienceMode: 'auto',
            notifications: {
              serverAlerts: true,
              communityUpdates: true,
              pluginUpdates: true,
              newFeatures: true
            }
          },
          stats: {
            serversHosted: 0,
            communitiesJoined: 0,
            pluginsInstalled: 0,
            totalUptime: '0%',
            communityReputation: 0
          }
        } as User,
        isLoading: false
      }));
    } else {
      setAppState(prev => ({ ...prev, isLoading: loading }));
    }
  }, [user, loading]);

  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setAppState(prev => ({ ...prev, sidebarCollapsed: true }));
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setAppState(prev => ({ 
        ...prev, 
        sidebarCollapsed: !prev.sidebarCollapsed 
      }));
    }
  };

  const handleSearch = (query: string) => {
    setAppState(prev => ({ ...prev, searchQuery: query }));
    // TODO: Implement unified search across games, communities, plugins
  };

  const getQuickActionForUser = () => {
    if (!appState.user) return null;
    
    return appState.user.role === 'USER' 
      ? { text: 'Deploy Server', url: '/app/servers/new', icon: Plus }
      : { text: 'Server Status', url: '/app/monitoring', icon: Smartphone };
  };

  const quickAction = getQuickActionForUser();

  if (!appState.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HomeHost...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className={`hidden lg:block transition-all duration-300 ${
        appState.sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="fixed h-full">
          <AppSidebar 
            user={appState.user}
            collapsed={appState.sidebarCollapsed}
            onToggle={handleSidebarToggle}
          />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64 h-full">
            <AppSidebar 
              user={appState.user}
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <AppHeader 
          user={appState.user}
          notifications={appState.notifications}
          onMenuToggle={handleSidebarToggle}
          onSearch={handleSearch}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>

        {/* Mobile Quick Action Button */}
        {isMobile && quickAction && (
          <div className="fixed bottom-6 right-6 z-40">
            <a
              href={quickAction.url}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 hover:scale-105"
            >
              <quickAction.icon className="w-5 h-5" />
              <span className="font-medium">{quickAction.text}</span>
            </a>
          </div>
        )}

        {/* Connection Status Bar (Mobile) */}
        {isMobile && (
          <div className="bg-white border-t border-gray-200 px-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">
                  {appState.user.stats.serversHosted} servers • {appState.user.stats.totalUptime} uptime
                </span>
              </div>
              <span className="text-gray-500">
                ⭐ {appState.user.stats.communityReputation}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Global Loading Overlay */}
      {appState.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="text-gray-900 font-medium">Processing...</span>
            </div>
          </div>
        </div>
      )}

      {/* Development Helper (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-30 bg-black text-white px-3 py-2 rounded-lg text-xs font-mono">
          {appState.user?.role === 'USER' ? '👤 User Mode' : '👑 Admin Mode'} • 
          {isMobile ? ' 📱 Mobile' : ' 💻 Desktop'} • 
          {appState.sidebarCollapsed ? ' 📌 Collapsed' : ' 📖 Expanded'}
        </div>
      )}
    </div>
  );
}