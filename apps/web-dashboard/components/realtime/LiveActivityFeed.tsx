import { useRealTime } from '@/contexts/RealTimeContext';
import { Activity, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface LiveActivityFeedProps {
  className?: string;
  maxItems?: number;
}

export function LiveActivityFeed({ className = '', maxItems = 10 }: LiveActivityFeedProps) {
  const { state, actions } = useRealTime();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <X className="w-4 h-4 text-red-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-500 bg-green-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'error': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const displayedActivities = state.activities.slice(0, maxItems);

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Live Activity</h3>
            {state.isConnected && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600">Live</span>
              </div>
            )}
          </div>
          
          {state.activities.length > 0 && (
            <button
              onClick={actions.clearActivities}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {displayedActivities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
            {!state.isConnected && (
              <div className="mt-2">
                <p className="text-xs text-red-500">
                  {state.isConnecting ? 'Connecting...' : 'Disconnected'}
                </p>
                {state.error && (
                  <p className="text-xs text-red-500 mt-1">{state.error}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayedActivities.map((activity) => (
              <div
                key={activity.id}
                className={`p-4 border-l-4 transition-all duration-300 ${getActivityColor(activity.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connection status footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              state.isConnected ? 'bg-green-500' : 
              state.isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-gray-600">
              {state.isConnected ? 'Connected' : 
               state.isConnecting ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
          
          {!state.isConnected && !state.isConnecting && (
            <button
              onClick={actions.reconnect}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Reconnect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveActivityFeed;