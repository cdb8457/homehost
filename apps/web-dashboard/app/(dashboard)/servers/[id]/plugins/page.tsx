'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { serversApi } from '@/lib/api';
import PluginManagementDashboard from '@/components/plugins/PluginManagementDashboard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { ArrowLeft, Server, Loader2 } from 'lucide-react';

export default function ServerPluginsPage() {
  const params = useParams();
  const serverId = params.id as string;
  const [server, setServer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServer = async () => {
      try {
        const response = await serversApi.getUserServers();
        if (response.success && response.data) {
          const serverData = [
            ...response.data.ownedServers,
            ...response.data.memberServers
          ].find(s => s.id === serverId);
          
          setServer(serverData);
        }
      } catch (err) {
        console.error('Failed to load server:', err);
      } finally {
        setLoading(false);
      }
    };

    if (serverId) {
      loadServer();
    }
  }, [serverId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!server) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Server className="w-16 h-16 text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-400 mb-2">Server not found</h3>
        <p className="text-gray-500 mb-4">The server you're looking for doesn't exist or you don't have access to it.</p>
        <Link 
          href="/servers"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Servers
        </Link>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link 
            href="/servers" 
            className="text-gray-400 hover:text-white transition-colors"
          >
            Servers
          </Link>
          <span className="text-gray-600">/</span>
          <Link 
            href={`/servers/${serverId}`} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            {server.name}
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-white">Plugins</span>
        </div>

        {/* Back button */}
        <Link
          href={`/servers/${serverId}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Server Details
        </Link>

        {/* Server info header */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <Server className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{server.name}</h1>
              <p className="text-gray-400">{server.game} • {server.region}</p>
            </div>
            <div className="ml-auto">
              <div className={`px-3 py-1 rounded-full text-sm ${
                server.status === 'RUNNING' 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-red-900 text-red-300'
              }`}>
                {server.status}
              </div>
            </div>
          </div>
        </div>

        {/* Plugin Management Dashboard */}
        <PluginManagementDashboard 
          serverId={serverId} 
          serverName={server.name}
        />
      </div>
    </ProtectedRoute>
  );
}