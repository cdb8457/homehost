'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Settings,
  Brain,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  User,
  Server,
  Activity,
  BarChart3,
  Target,
  Lightbulb,
  Shield,
  Clock,
  Cpu,
  HardDrive,
  Network,
  Users,
  MessageCircle,
  Sparkles,
  RefreshCw,
  Minimize2,
  Maximize2,
  X,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Star,
  History,
  Bookmark,
  Download,
  ExternalLink
} from 'lucide-react';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    intent?: string;
    confidence?: number;
    actions?: AIAction[];
    recommendations?: AIRecommendation[];
    analysis?: AIAnalysis;
  };
}

interface AIAction {
  id: string;
  type: 'optimize_server' | 'restart_service' | 'update_config' | 'install_plugin' | 'scale_resources';
  title: string;
  description: string;
  parameters?: Record<string, any>;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  impact: 'low' | 'medium' | 'high';
  estimatedTime?: string;
}

interface AIRecommendation {
  id: string;
  type: 'performance' | 'security' | 'cost' | 'maintenance' | 'feature';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  effort: 'low' | 'medium' | 'high';
  savings?: string;
  tags: string[];
}

interface AIAnalysis {
  serverHealth: {
    overall: number;
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    issues: string[];
  };
  playerInsights: {
    activity: 'increasing' | 'stable' | 'decreasing';
    peakHours: string[];
    retention: number;
    satisfaction: number;
  };
  recommendations: string[];
  predictions: {
    resourceNeeds: string;
    maintenanceWindows: string[];
    costProjection: string;
  };
}

interface AIGamingAssistantProps {
  serverId?: string;
  serverName?: string;
  compact?: boolean;
  initialPrompt?: string;
}

export default function AIGamingAssistant({
  serverId,
  serverName,
  compact = false,
  initialPrompt
}: AIGamingAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [executingActions, setExecutingActions] = useState<Set<string>>(new Set());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const apiClient = new ApiClient();

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: AIMessage = {
      id: '1',
      type: 'assistant',
      content: `Hello! I'm your AI Gaming Assistant. I can help you optimize your servers, troubleshoot issues, analyze performance, and provide intelligent recommendations. ${serverName ? `I can see you're working with ${serverName}.` : ''} What would you like to know?`,
      timestamp: new Date().toISOString(),
      metadata: {
        intent: 'welcome',
        confidence: 1.0,
        recommendations: [
          {
            id: '1',
            type: 'performance',
            title: 'Server Health Check',
            description: 'Run a comprehensive health check on your servers',
            priority: 'medium',
            impact: 'Get insights into server performance and potential issues',
            effort: 'low',
            tags: ['health', 'monitoring', 'performance']
          },
          {
            id: '2',
            type: 'feature',
            title: 'Smart Optimization',
            description: 'Enable AI-powered automatic optimization',
            priority: 'high',
            impact: 'Improve server performance by 15-30%',
            effort: 'low',
            tags: ['optimization', 'automation', 'performance']
          },
          {
            id: '3',
            type: 'maintenance',
            title: 'Predictive Maintenance',
            description: 'Set up predictive maintenance alerts',
            priority: 'medium',
            impact: 'Prevent 80% of server downtime',
            effort: 'medium',
            tags: ['maintenance', 'alerts', 'prevention']
          }
        ]
      }
    };

    setMessages([welcomeMessage]);

    // Handle initial prompt if provided
    if (initialPrompt) {
      setTimeout(() => {
        handleSendMessage(initialPrompt);
      }, 1000);
    }
  }, [initialPrompt, serverName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputMessage.trim();
    if (!messageText || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setAiThinking(true);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await processAIMessage(messageText);
      
      setMessages(prev => [...prev, response]);
    } catch (error) {
      const errorMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setAiThinking(false);
    }
  };

  const processAIMessage = async (message: string): Promise<AIMessage> => {
    // Simulate AI processing with different response types based on message content
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('health') || lowerMessage.includes('status') || lowerMessage.includes('check')) {
      return generateHealthAnalysisResponse();
    } else if (lowerMessage.includes('optimize') || lowerMessage.includes('improve') || lowerMessage.includes('performance')) {
      return generateOptimizationResponse();
    } else if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('error')) {
      return generateTroubleshootingResponse();
    } else if (lowerMessage.includes('player') || lowerMessage.includes('user') || lowerMessage.includes('activity')) {
      return generatePlayerAnalysisResponse();
    } else if (lowerMessage.includes('predict') || lowerMessage.includes('forecast') || lowerMessage.includes('future')) {
      return generatePredictiveResponse();
    } else {
      return generateGeneralResponse(message);
    }
  };

  const generateHealthAnalysisResponse = (): AIMessage => {
    const analysis: AIAnalysis = {
      serverHealth: {
        overall: 87,
        cpu: 65,
        memory: 82,
        disk: 91,
        network: 95,
        issues: ['CPU usage spike during peak hours', 'Memory leak detected in plugin system']
      },
      playerInsights: {
        activity: 'increasing',
        peakHours: ['19:00-22:00', '12:00-14:00'],
        retention: 78,
        satisfaction: 4.2
      },
      recommendations: [
        'Consider upgrading CPU for better peak performance',
        'Investigate memory usage in plugin system',
        'Schedule maintenance during low-activity hours (03:00-06:00)'
      ],
      predictions: {
        resourceNeeds: 'CPU upgrade recommended within 2 weeks',
        maintenanceWindows: ['2024-01-25 03:00', '2024-02-01 03:00'],
        costProjection: '$45/month savings with optimization'
      }
    };

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: `I've analyzed your server health. Overall, your server is performing well with an 87% health score. However, I've identified a few areas for improvement:

**Key Findings:**
• CPU usage peaks during prime hours (19:00-22:00)
• Memory leak detected in the plugin system
• Network performance is excellent (95%)
• Disk usage is healthy (91%)

**Player Activity:**
• Player activity is increasing (+12% this week)
• Peak hours: 7-10 PM and 12-2 PM
• Player retention: 78%
• Satisfaction score: 4.2/5

I recommend addressing the CPU optimization and memory leak to improve performance during peak hours.`,
      timestamp: new Date().toISOString(),
      metadata: {
        intent: 'health_analysis',
        confidence: 0.95,
        analysis,
        actions: [
          {
            id: '1',
            type: 'optimize_server',
            title: 'Optimize CPU Usage',
            description: 'Apply CPU optimization settings for peak hours',
            status: 'pending',
            impact: 'medium',
            estimatedTime: '5 minutes'
          },
          {
            id: '2',
            type: 'restart_service',
            title: 'Restart Plugin System',
            description: 'Restart plugin system to clear memory leak',
            status: 'pending',
            impact: 'low',
            estimatedTime: '2 minutes'
          }
        ],
        recommendations: [
          {
            id: '1',
            type: 'performance',
            title: 'CPU Scaling',
            description: 'Enable automatic CPU scaling during peak hours',
            priority: 'high',
            impact: 'Reduce CPU bottlenecks by 40%',
            effort: 'low',
            savings: '$30/month',
            tags: ['cpu', 'scaling', 'performance']
          },
          {
            id: '2',
            type: 'maintenance',
            title: 'Plugin Memory Audit',
            description: 'Schedule regular memory audits for plugins',
            priority: 'medium',
            impact: 'Prevent memory leaks and crashes',
            effort: 'medium',
            tags: ['memory', 'plugins', 'maintenance']
          }
        ]
      }
    };
  };

  const generateOptimizationResponse = (): AIMessage => {
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: `I can help optimize your server performance! Based on my analysis, here are the key optimization opportunities:

**Performance Improvements:**
• Enable smart resource allocation (15-20% performance boost)
• Optimize database queries (reduce latency by 30%)
• Configure intelligent caching (40% faster load times)
• Enable compression for network traffic (25% bandwidth savings)

**Recommended Actions:**
I can apply these optimizations automatically. The process is safe and reversible. Would you like me to proceed?`,
      timestamp: new Date().toISOString(),
      metadata: {
        intent: 'optimization',
        confidence: 0.92,
        actions: [
          {
            id: '1',
            type: 'optimize_server',
            title: 'Apply Smart Resource Allocation',
            description: 'Configure intelligent resource management',
            status: 'pending',
            impact: 'high',
            estimatedTime: '10 minutes'
          },
          {
            id: '2',
            type: 'update_config',
            title: 'Enable Intelligent Caching',
            description: 'Configure optimized caching settings',
            status: 'pending',
            impact: 'medium',
            estimatedTime: '5 minutes'
          }
        ]
      }
    };
  };

  const generateTroubleshootingResponse = (): AIMessage => {
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: `I'm here to help troubleshoot your issues! I can analyze logs, diagnose problems, and provide solutions.

**Common Issues I Can Help With:**
• Server connectivity problems
• Performance bottlenecks
• Plugin conflicts
• Database issues
• Network configuration problems

**Diagnostic Tools:**
• Real-time log analysis
• Performance profiling
• Network connectivity tests
• Plugin compatibility checks

What specific issue are you experiencing? I can run diagnostics and provide targeted solutions.`,
      timestamp: new Date().toISOString(),
      metadata: {
        intent: 'troubleshooting',
        confidence: 0.88,
        actions: [
          {
            id: '1',
            type: 'restart_service',
            title: 'Run System Diagnostics',
            description: 'Comprehensive system health check',
            status: 'pending',
            impact: 'low',
            estimatedTime: '3 minutes'
          }
        ]
      }
    };
  };

  const generatePlayerAnalysisResponse = (): AIMessage => {
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: `Here's your player activity analysis:

**Player Insights:**
• **Activity Trend**: +15% increase this week
• **Peak Hours**: 7-10 PM (highest activity)
• **Player Retention**: 78% (above average)
• **New Players**: 24 this week
• **Satisfaction Score**: 4.2/5 stars

**Behavioral Patterns:**
• Average session: 2.5 hours
• Most popular game modes: Survival (45%), Creative (30%)
• Weekend activity 40% higher than weekdays

**Recommendations:**
• Schedule events during peak hours (7-10 PM)
• Consider expanding world size for growing player base
• Implement loyalty rewards for 78% retention rate`,
      timestamp: new Date().toISOString(),
      metadata: {
        intent: 'player_analysis',
        confidence: 0.91,
        recommendations: [
          {
            id: '1',
            type: 'feature',
            title: 'Player Retention Program',
            description: 'Implement rewards for regular players',
            priority: 'medium',
            impact: 'Increase retention by 10-15%',
            effort: 'medium',
            tags: ['retention', 'rewards', 'engagement']
          }
        ]
      }
    };
  };

  const generatePredictiveResponse = (): AIMessage => {
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: `Based on predictive analysis of your server data:

**Performance Predictions:**
• **Next 7 Days**: Expect 20% increase in player activity
• **Resource Needs**: CPU upgrade recommended by Feb 1st
• **Maintenance Windows**: Optimal times - Jan 25 & Feb 1 at 3 AM

**Cost Projections:**
• Current trajectory: $120/month
• With optimization: $85/month (30% savings)
• ROI on upgrades: 3.2x within 6 months

**Risk Assessment:**
• **Low Risk**: Current configuration stable
• **Medium Risk**: Plugin memory usage trending up
• **Recommendation**: Proactive optimization reduces 90% of potential issues`,
      timestamp: new Date().toISOString(),
      metadata: {
        intent: 'prediction',
        confidence: 0.87,
        actions: [
          {
            id: '1',
            type: 'scale_resources',
            title: 'Schedule Resource Scaling',
            description: 'Auto-scale resources based on predictions',
            status: 'pending',
            impact: 'medium',
            estimatedTime: '15 minutes'
          }
        ]
      }
    };
  };

  const generateGeneralResponse = (message: string): AIMessage => {
    const responses = [
      `I understand you're asking about "${message}". I can help you with server management, performance optimization, troubleshooting, and player analytics. What specific aspect would you like to explore?`,
      `That's an interesting question about "${message}". As your AI Gaming Assistant, I can provide insights on server performance, player behavior, and optimization strategies. How can I assist you further?`,
      `I'm here to help with "${message}". I have access to your server data and can provide intelligent recommendations for optimization, troubleshooting, and management. What would you like to know more about?`
    ];

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date().toISOString(),
      metadata: {
        intent: 'general',
        confidence: 0.75
      }
    };
  };

  const handleExecuteAction = async (action: AIAction) => {
    setExecutingActions(prev => new Set(prev).add(action.id));
    
    try {
      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const successMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `✅ Successfully executed: ${action.title}. ${action.description} completed.`,
        timestamp: new Date().toISOString(),
        metadata: {
          intent: 'action_result',
          confidence: 1.0
        }
      };
      
      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      const errorMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `❌ Failed to execute: ${action.title}. Please try again or check system status.`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setExecutingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(action.id);
        return newSet;
      });
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="w-5 h-5" />;
      case 'assistant': return <Bot className="w-5 h-5 text-blue-400" />;
      case 'system': return <Settings className="w-5 h-5 text-green-400" />;
      default: return <MessageCircle className="w-5 h-5" />;
    }
  };

  if (compact && isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
        >
          <Bot className="w-5 h-5" />
          <span className="font-medium">AI Assistant</span>
          {aiThinking && <div className="animate-pulse w-2 h-2 bg-white rounded-full" />}
        </button>
      </div>
    );
  }

  return (
    <div className={`${compact ? 'fixed bottom-4 right-4 z-50' : ''}`}>
      <div className={`bg-gray-800 rounded-lg border border-gray-700 shadow-xl ${
        compact ? 'w-96 h-96' : 'w-full h-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Gaming Assistant</h3>
              <p className="text-sm text-gray-400">
                {aiThinking ? 'Thinking...' : 'Ready to help'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {compact && (
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className={`overflow-y-auto p-4 space-y-4 ${
            compact ? 'h-64' : 'h-96'
          }`}
        >
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}>
              {message.type !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  {getMessageIcon(message.type)}
                </div>
              )}
              
              <div className={`max-w-[80%] ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : message.type === 'system'
                  ? 'bg-green-900 text-green-200'
                  : 'bg-gray-700 text-gray-200'
              } rounded-lg p-3`}>
                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                </div>
                
                <div className="text-xs opacity-75 mt-1">
                  {formatTime(message.timestamp)}
                </div>

                {/* AI Actions */}
                {message.metadata?.actions && message.metadata.actions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-medium text-gray-300">Suggested Actions:</div>
                    {message.metadata.actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleExecuteAction(action)}
                        disabled={executingActions.has(action.id)}
                        className="flex items-center gap-2 w-full p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors disabled:opacity-50"
                      >
                        {executingActions.has(action.id) ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                        <span>{action.title}</span>
                        <span className="text-xs text-gray-400">({action.estimatedTime})</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* AI Recommendations */}
                {message.metadata?.recommendations && message.metadata.recommendations.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-medium text-gray-300">Recommendations:</div>
                    {message.metadata.recommendations.slice(0, 2).map((rec) => (
                      <div key={rec.id} className="p-2 bg-gray-600 rounded text-sm">
                        <div className="font-medium">{rec.title}</div>
                        <div className="text-xs text-gray-300">{rec.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs ${
                            rec.priority === 'high' ? 'bg-red-900 text-red-200' :
                            rec.priority === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                            'bg-green-900 text-green-200'
                          }`}>
                            {rec.priority}
                          </span>
                          <span className="text-xs text-gray-400">{rec.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {aiThinking && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <Brain className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about your servers..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
            
            <button
              onClick={handleVoiceInput}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => handleSendMessage('Check server health')}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full text-xs transition-colors"
            >
              Health Check
            </button>
            <button
              onClick={() => handleSendMessage('Optimize performance')}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full text-xs transition-colors"
            >
              Optimize
            </button>
            <button
              onClick={() => handleSendMessage('Analyze players')}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full text-xs transition-colors"
            >
              Player Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}