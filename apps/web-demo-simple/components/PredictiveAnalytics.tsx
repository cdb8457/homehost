'use client';

import { useState, useEffect } from 'react';
import { PredictiveAnalytics, TimeSeries, ResourcePrediction, PerformancePrediction, PredictiveAlert } from '@/types/ai-optimization';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle, 
  Clock, 
  Brain, 
  Target, 
  Zap, 
  Users, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Network, 
  DollarSign, 
  BarChart3, 
  LineChart, 
  PieChart, 
  Calendar, 
  Eye, 
  Bell, 
  Shield, 
  RefreshCw, 
  ChevronUp, 
  ChevronDown, 
  Minus, 
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Timer,
  Gauge,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react';

interface PredictiveAnalyticsProps {
  serverId: string;
  serverName: string;
  timeRange: '24h' | '7d' | '30d' | '90d';
}

export default function PredictiveAnalytics({ 
  serverId, 
  serverName, 
  timeRange = '7d' 
}: PredictiveAnalyticsProps) {
  const [analytics, setAnalytics] = useState<PredictiveAnalytics | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'players' | 'cpu' | 'memory' | 'performance'>('players');
  const [showAlerts, setShowAlerts] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictiveAnalytics();
  }, [serverId, timeRange]);

  const loadPredictiveAnalytics = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Generate mock time series data
    const generateTimeSeries = (baseValue: number, variance: number, trend: number = 0): TimeSeries => {
      const dataPoints = [];
      const now = new Date();
      
      for (let i = 47; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000); // 30-minute intervals
        const trendValue = baseValue + (trend * (47 - i));
        const randomVariance = (Math.random() - 0.5) * variance;
        const value = Math.max(0, trendValue + randomVariance);
        const confidence = 0.7 + Math.random() * 0.25; // 70-95% confidence
        
        dataPoints.push({ timestamp, value, confidence });
      }
      
      return {
        dataPoints,
        forecast: {
          next24h: baseValue + trend * 48 + (Math.random() - 0.5) * variance,
          next7days: baseValue + trend * 48 * 7 + (Math.random() - 0.5) * variance * 2,
          next30days: baseValue + trend * 48 * 30 + (Math.random() - 0.5) * variance * 3
        }
      };
    };

    // Mock predictive analytics data
    const mockAnalytics: PredictiveAnalytics = {
      serverId: serverId,
      predictions: {
        playerCount: generateTimeSeries(24, 8, 0.1),
        resourceUsage: {
          cpu: {
            predicted: 72.5,
            confidence: 0.87,
            trend: 'increasing'
          },
          memory: {
            predicted: 8192,
            confidence: 0.92,
            trend: 'stable'
          },
          disk: {
            predicted: 125.6,
            confidence: 0.78,
            trend: 'increasing'
          },
          scalingRecommendation: {
            action: 'scale_up',
            reason: 'CPU usage trending upward, recommend scaling before reaching 80% threshold',
            confidence: 0.85
          }
        },
        performance: {
          expectedFPS: 58.4,
          expectedLatency: 28,
          expectedUptime: 99.7,
          bottleneckPrediction: {
            type: 'cpu',
            severity: 'medium',
            eta: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
            mitigation: 'Scale CPU cores from 4 to 6 to prevent bottleneck'
          }
        },
        costs: {
          currentMonthlyCost: 127.45,
          predictedMonthlyCost: 142.80,
          optimizationSavings: 18.25,
          recommendations: [
            {
              action: 'Optimize resource allocation during off-peak hours',
              savingsAmount: 12.30,
              impact: 'No performance impact'
            },
            {
              action: 'Enable intelligent auto-scaling',
              savingsAmount: 8.95,
              impact: 'Slight delay during scaling events'
            }
          ]
        }
      },
      trends: {
        direction: 'rising',
        confidence: 0.84,
        changeRate: 12.5
      },
      alerts: [
        {
          id: 'alert-1',
          type: 'performance_degradation',
          severity: 'medium',
          message: 'AI predicts 15% performance drop in next 4 hours due to CPU bottleneck',
          prediction: {
            likelihood: 0.78,
            timeframe: 'in 4 hours',
            impact: 'Players may experience lag during peak periods'
          },
          recommendations: [
            'Scale CPU cores from 4 to 6',
            'Enable automatic performance tuning',
            'Consider upgrading to high-performance tier'
          ],
          createdAt: new Date(Date.now() - 15 * 60 * 1000)
        },
        {
          id: 'alert-2',
          type: 'resource_exhaustion',
          severity: 'high',
          message: 'Memory usage approaching critical threshold in next 2 hours',
          prediction: {
            likelihood: 0.91,
            timeframe: 'within 2 hours',
            impact: 'Server may become unresponsive'
          },
          recommendations: [
            'Increase RAM allocation immediately',
            'Enable memory optimization',
            'Review memory-intensive plugins'
          ],
          createdAt: new Date(Date.now() - 45 * 60 * 1000)
        },
        {
          id: 'alert-3',
          type: 'anomaly_detected',
          severity: 'low',
          message: 'Unusual player activity pattern detected',
          prediction: {
            likelihood: 0.65,
            timeframe: 'ongoing',
            impact: 'Monitoring for potential issues'
          },
          recommendations: [
            'Monitor player behavior',
            'Check for unusual events',
            'Review server logs'
          ],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      ],
      recommendations: [
        'Enable predictive scaling to handle anticipated load increases',
        'Configure alerts for CPU usage above 75%',
        'Consider implementing load balancing for peak periods'
      ]
    };

    setAnalytics(mockAnalytics);
    setLoading(false);
  };

  const handleAlertAction = (alertId: string, action: 'acknowledge' | 'resolve') => {
    console.log(`${action} alert ${alertId}`);
    
    setAnalytics(prev => prev ? {
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId 
          ? { ...alert, [action === 'acknowledge' ? 'acknowledgedAt' : 'resolvedAt']: new Date() }
          : alert
      )
    } : null);
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-900';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'low': return 'bg-blue-100 border-blue-500 text-blue-900';
      default: return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'performance_degradation': return <TrendingDown className="w-5 h-5" />;
      case 'resource_exhaustion': return <AlertTriangle className="w-5 h-5" />;
      case 'anomaly_detected': return <Eye className="w-5 h-5" />;
      case 'maintenance_needed': return <Timer className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'falling': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatBytes = (bytes: number, decimals: number = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              Predictive Analytics - {serverName}
            </h2>
            <p className="text-gray-600">
              AI-powered predictions and insights for your server performance
            </p>
          </div>
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Bell className="w-4 h-4" />
            {showAlerts ? 'Hide' : 'Show'} Alerts
          </button>
        </div>

        {/* Predictive Alerts */}
        {showAlerts && analytics && analytics.alerts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Predictive Alerts
            </h3>
            <div className="space-y-3">
              {analytics.alerts.filter(alert => !alert.resolvedAt).map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{alert.message}</span>
                          <span className="text-xs bg-black/10 px-2 py-1 rounded">
                            {(alert.prediction.likelihood * 100).toFixed(0)}% likely
                          </span>
                        </div>
                        <div className="text-sm opacity-90 mb-2">
                          <span className="font-medium">Expected {alert.prediction.timeframe}</span>
                          <span className="mx-2">•</span>
                          <span>{alert.prediction.impact}</span>
                        </div>
                        <div className="text-sm opacity-80">
                          <span className="font-medium">Recommendations:</span>
                          <ul className="list-disc list-inside mt-1 ml-4">
                            {alert.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!alert.acknowledgedAt && (
                        <button
                          onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                          className="px-3 py-1 bg-black/10 rounded hover:bg-black/20 text-sm"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => handleAlertAction(alert.id, 'resolve')}
                        className="px-3 py-1 bg-black/10 rounded hover:bg-black/20 text-sm"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trend Summary */}
        {analytics && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getTrendIcon(analytics.trends.direction)}
                <div>
                  <span className="font-semibold text-gray-900">Overall Trend: </span>
                  <span className="capitalize">{analytics.trends.direction}</span>
                  <span className="text-gray-600 ml-2">
                    ({analytics.trends.changeRate > 0 ? '+' : ''}{analytics.trends.changeRate}% per day)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">
                  Confidence: <span className={getConfidenceColor(analytics.trends.confidence)}>
                    {(analytics.trends.confidence * 100).toFixed(0)}%
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prediction Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Player Count Prediction */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Player Count</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {Math.round(analytics.predictions.playerCount.forecast.next24h)}
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <div>Next 24h: {Math.round(analytics.predictions.playerCount.forecast.next24h)} players</div>
              <div>Next 7d: {Math.round(analytics.predictions.playerCount.forecast.next7days)} avg</div>
              <div>Next 30d: {Math.round(analytics.predictions.playerCount.forecast.next30days)} avg</div>
            </div>
          </div>

          {/* Resource Usage Prediction */}
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">CPU Usage</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {analytics.predictions.resourceUsage.cpu.predicted.toFixed(1)}%
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <div className="flex items-center gap-1">
                <span>Trend:</span>
                {analytics.predictions.resourceUsage.cpu.trend === 'increasing' ? (
                  <ArrowUp className="w-3 h-3 text-red-500" />
                ) : analytics.predictions.resourceUsage.cpu.trend === 'decreasing' ? (
                  <ArrowDown className="w-3 h-3 text-green-500" />
                ) : (
                  <Minus className="w-3 h-3 text-gray-500" />
                )}
                <span className="capitalize">{analytics.predictions.resourceUsage.cpu.trend}</span>
              </div>
              <div>
                Confidence: <span className={getConfidenceColor(analytics.predictions.resourceUsage.cpu.confidence)}>
                  {(analytics.predictions.resourceUsage.cpu.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Performance Prediction */}
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Performance</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {analytics.predictions.performance.expectedFPS.toFixed(1)} FPS
            </div>
            <div className="text-sm text-purple-700 space-y-1">
              <div>Latency: {analytics.predictions.performance.expectedLatency}ms</div>
              <div>Uptime: {analytics.predictions.performance.expectedUptime}%</div>
              {analytics.predictions.performance.bottleneckPrediction && (
                <div className="text-xs text-purple-600">
                  {analytics.predictions.performance.bottleneckPrediction.type.toUpperCase()} bottleneck predicted
                </div>
              )}
            </div>
          </div>

          {/* Cost Prediction */}
          <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">Monthly Cost</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {formatCurrency(analytics.predictions.costs.predictedMonthlyCost)}
            </div>
            <div className="text-sm text-orange-700 space-y-1">
              <div>Current: {formatCurrency(analytics.predictions.costs.currentMonthlyCost)}</div>
              <div className="text-green-600">
                Savings: {formatCurrency(analytics.predictions.costs.optimizationSavings)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Predictions */}
      {analytics && (
        <div className="space-y-6">
          {/* Resource Usage Details */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-indigo-600" />
              Resource Usage Predictions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900">CPU</span>
                </div>
                <div className="text-xl font-bold text-blue-600 mb-1">
                  {analytics.predictions.resourceUsage.cpu.predicted.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  Predicted usage
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <MemoryStick className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-900">Memory</span>
                </div>
                <div className="text-xl font-bold text-green-600 mb-1">
                  {formatBytes(analytics.predictions.resourceUsage.memory.predicted)}
                </div>
                <div className="text-sm text-gray-600">
                  Predicted usage
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <HardDrive className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-gray-900">Storage</span>
                </div>
                <div className="text-xl font-bold text-purple-600 mb-1">
                  {analytics.predictions.resourceUsage.disk.predicted.toFixed(1)} GB
                </div>
                <div className="text-sm text-gray-600">
                  Predicted usage
                </div>
              </div>
            </div>

            {/* Scaling Recommendation */}
            {analytics.predictions.resourceUsage.scalingRecommendation && (
              <div className="mt-4 p-4 bg-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Scaling Recommendation</span>
                </div>
                <div className="text-sm text-blue-800">
                  <div className="font-medium capitalize mb-1">
                    {analytics.predictions.resourceUsage.scalingRecommendation.action.replace('_', ' ')}
                  </div>
                  <div>{analytics.predictions.resourceUsage.scalingRecommendation.reason}</div>
                  <div className="mt-2">
                    <span className="font-medium">Confidence: </span>
                    <span className={getConfidenceColor(analytics.predictions.resourceUsage.scalingRecommendation.confidence)}>
                      {(analytics.predictions.resourceUsage.scalingRecommendation.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Performance Bottleneck Prediction */}
          {analytics.predictions.performance.bottleneckPrediction && (
            <div className="bg-red-50 p-6 rounded-xl border border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Predicted Bottleneck
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-red-700 space-y-2">
                    <div>
                      <span className="font-medium">Type:</span> {analytics.predictions.performance.bottleneckPrediction.type.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium">Severity:</span> {analytics.predictions.performance.bottleneckPrediction.severity}
                    </div>
                    <div>
                      <span className="font-medium">Expected:</span> {analytics.predictions.performance.bottleneckPrediction.eta.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-red-700">
                    <span className="font-medium">Mitigation:</span>
                    <div className="mt-1">{analytics.predictions.performance.bottleneckPrediction.mitigation}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cost Optimization */}
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Cost Optimization Opportunities
            </h3>
            <div className="space-y-3">
              {analytics.predictions.costs.recommendations.map((rec, index) => (
                <div key={index} className="bg-white p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{rec.action}</div>
                      <div className="text-sm text-gray-600">{rec.impact}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatCurrency(rec.savingsAmount)}</div>
                      <div className="text-xs text-gray-500">savings/month</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}