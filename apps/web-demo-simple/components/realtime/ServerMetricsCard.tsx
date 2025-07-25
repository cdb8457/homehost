import { useRealTime } from '@/contexts/RealTimeContext';
import { Activity, Users, Cpu, HardDrive, Wifi, WifiOff } from 'lucide-react';

interface ServerMetricsCardProps {
  serverId?: string;
  className?: string;
}

export function ServerMetricsCard({ serverId, className = '' }: ServerMetricsCardProps) {
  const { state } = useRealTime();
  
  const server = serverId 
    ? state.servers.find(s => s.id === serverId)
    : state.servers[0]; // Default to first server if no ID provided

  if (!server) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Activity className="w-8 h-8 mx-auto mb-2" />
          <p>No server data available</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'text-green-600 bg-green-100';
      case 'STOPPED': return 'text-red-600 bg-red-100';
      case 'STARTING': return 'text-yellow-600 bg-yellow-100';
      case 'STOPPING': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string, isConnected: boolean) => {
    if (!isConnected) return <WifiOff className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{server.name}</h3>
          <p className="text-sm text-gray-600">{server.game} • {server.region}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIcon(server.status, state.isConnected)}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(server.status)}`}>
            {server.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Users className="w-4 h-4 text-blue-600 mr-1" />
            <span className="text-sm font-medium text-gray-600">Players</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {server.playerCount}/{server.maxPlayers}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Cpu className="w-4 h-4 text-orange-600 mr-1" />
            <span className="text-sm font-medium text-gray-600">CPU</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {Math.round(server.cpuUsage)}%
          </div>
        </div>

        {server.memoryUsage && (
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <HardDrive className="w-4 h-4 text-purple-600 mr-1" />
              <span className="text-sm font-medium text-gray-600">Memory</span>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {Math.round(server.memoryUsage)}%
            </div>
          </div>
        )}

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Activity className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-sm font-medium text-gray-600">Uptime</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {server.uptime}
          </div>
        </div>
      </div>

      {/* Progress bars for CPU and Memory */}
      <div className="mt-4 space-y-2">
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>CPU Usage</span>
            <span>{Math.round(server.cpuUsage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                server.cpuUsage > 80 ? 'bg-red-500' : 
                server.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, server.cpuUsage)}%` }}
            />
          </div>
        </div>

        {server.memoryUsage && (
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Memory Usage</span>
              <span>{Math.round(server.memoryUsage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  server.memoryUsage > 80 ? 'bg-red-500' : 
                  server.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, server.memoryUsage)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Connection status */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {state.isConnected ? 'Live updates' : 'Reconnecting...'}
          </span>
          {state.lastUpdate && (
            <span className="text-gray-500">
              Updated {new Date(state.lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ServerMetricsCard;