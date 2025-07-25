'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  FileText,
  BarChart3,
  LineChart,
  PieChart,
  Table,
  Calendar,
  Clock,
  Filter,
  Search,
  Download,
  Upload,
  Save,
  Copy,
  Edit,
  Trash2,
  Share2,
  Send,
  Eye,
  EyeOff,
  Play,
  Pause,
  Square,
  RotateCcw,
  RefreshCw,
  Settings,
  Plus,
  Minus,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Maximize,
  Minimize,
  Grid3X3,
  List,
  Layers,
  Folder,
  FolderOpen,
  File,
  Code,
  Terminal,
  Database,
  Server,
  Globe,
  Users,
  User,
  DollarSign,
  Target,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Brain,
  Star,
  Award,
  Crown,
  Fire,
  Sparkles,
  Lightbulb,
  Heart,
  ThumbsUp,
  MessageCircle,
  Bell,
  BellOff,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Link,
  Mail,
  Phone,
  Shield,
  Lock,
  Unlock,
  Key,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  ExternalLink,
  Gamepad2
} from 'lucide-react';

interface ReportField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage';
  category: 'user' | 'revenue' | 'engagement' | 'performance' | 'system' | 'custom';
  description: string;
  format?: string;
  aggregatable: boolean;
  filterable: boolean;
  sortable: boolean;
  groupable: boolean;
}

interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'between' | 'is_null' | 'is_not_null';
  value: any;
  logicalOperator?: 'AND' | 'OR';
  enabled: boolean;
}

interface ReportSort {
  field: string;
  direction: 'asc' | 'desc';
  priority: number;
}

interface ReportGrouping {
  field: string;
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct';
  enabled: boolean;
}

interface ReportVisualization {
  type: 'table' | 'bar_chart' | 'line_chart' | 'pie_chart' | 'scatter_plot' | 'heatmap' | 'gauge' | 'metric_card';
  config: VisualizationConfig;
}

interface VisualizationConfig {
  xAxis?: string;
  yAxis?: string[];
  groupBy?: string;
  aggregation?: string;
  colors?: string[];
  showLegend?: boolean;
  showLabels?: boolean;
  showGrid?: boolean;
  chartTitle?: string;
  customOptions?: Record<string, any>;
}

interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: string[];
  filters: ReportFilter[];
  sorting: ReportSort[];
  grouping: ReportGrouping[];
  visualization: ReportVisualization;
  timeRange: {
    type: 'relative' | 'absolute' | 'custom';
    value: string;
    start?: number;
    end?: number;
  };
  refreshRate: number; // minutes
  permissions: ReportPermissions;
  schedule?: ReportSchedule;
  created: number;
  lastModified: number;
  lastRun?: number;
  owner: string;
  tags: string[];
  public: boolean;
  starred: boolean;
}

interface ReportPermissions {
  viewers: string[];
  editors: string[];
  owners: string[];
  public: boolean;
}

interface ReportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string;
  timezone: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv' | 'image';
  subject: string;
  message: string;
  lastSent?: number;
  nextRun: number;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  definition: Partial<ReportDefinition>;
  popularity: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  tags: string[];
  created: number;
  usageCount: number;
}

interface SavedReport {
  id: string;
  definition: ReportDefinition;
  data: ReportData;
  metadata: {
    rowCount: number;
    columnCount: number;
    executionTime: number;
    generatedAt: number;
    dataSize: number;
    cacheKey?: string;
  };
  status: 'generating' | 'completed' | 'failed' | 'cached';
  error?: string;
}

interface ReportData {
  headers: string[];
  rows: any[][];
  summary?: Record<string, any>;
  charts?: ChartData[];
}

interface ChartData {
  type: string;
  data: any;
  config: VisualizationConfig;
}

interface QueryBuilder {
  sql: string;
  visual: boolean;
  tables: string[];
  joins: QueryJoin[];
  conditions: QueryCondition[];
  aggregations: QueryAggregation[];
}

interface QueryJoin {
  table: string;
  type: 'inner' | 'left' | 'right' | 'full';
  on: string;
}

interface QueryCondition {
  field: string;
  operator: string;
  value: any;
  logical: 'AND' | 'OR';
}

interface QueryAggregation {
  field: string;
  function: 'count' | 'sum' | 'avg' | 'min' | 'max';
  alias: string;
}

interface CustomReportBuilderProps {
  className?: string;
}

export function CustomReportBuilder({ className = '' }: CustomReportBuilderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [availableFields, setAvailableFields] = useState<ReportField[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [currentReport, setCurrentReport] = useState<ReportDefinition | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [activeTab, setActiveTab] = useState<'builder' | 'templates' | 'saved' | 'schedule' | 'permissions'>('builder');
  const [builderMode, setBuilderMode] = useState<'visual' | 'sql'>('visual');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const generateMockFields = useCallback((): ReportField[] => {
    return [
      // User fields
      { id: 'user_id', name: 'User ID', type: 'string', category: 'user', description: 'Unique user identifier', aggregatable: false, filterable: true, sortable: true, groupable: true },
      { id: 'username', name: 'Username', type: 'string', category: 'user', description: 'User display name', aggregatable: false, filterable: true, sortable: true, groupable: true },
      { id: 'email', name: 'Email', type: 'string', category: 'user', description: 'User email address', aggregatable: false, filterable: true, sortable: true, groupable: false },
      { id: 'registration_date', name: 'Registration Date', type: 'date', category: 'user', description: 'When user registered', aggregatable: false, filterable: true, sortable: true, groupable: true },
      { id: 'last_active', name: 'Last Active', type: 'date', category: 'user', description: 'Last user activity', aggregatable: false, filterable: true, sortable: true, groupable: true },
      { id: 'user_status', name: 'User Status', type: 'string', category: 'user', description: 'Current user status', aggregatable: false, filterable: true, sortable: true, groupable: true },
      { id: 'country', name: 'Country', type: 'string', category: 'user', description: 'User country', aggregatable: false, filterable: true, sortable: true, groupable: true },
      { id: 'age', name: 'Age', type: 'number', category: 'user', description: 'User age', aggregatable: true, filterable: true, sortable: true, groupable: true },
      
      // Revenue fields
      { id: 'revenue', name: 'Revenue', type: 'currency', category: 'revenue', description: 'Total revenue amount', aggregatable: true, filterable: true, sortable: true, groupable: false },
      { id: 'transaction_amount', name: 'Transaction Amount', type: 'currency', category: 'revenue', description: 'Individual transaction value', aggregatable: true, filterable: true, sortable: true, groupable: false },
      { id: 'transaction_date', name: 'Transaction Date', type: 'date', category: 'revenue', description: 'When transaction occurred', aggregatable: false, filterable: true, sortable: true, groupable: true },
      { id: 'product_name', name: 'Product Name', type: 'string', category: 'revenue', description: 'Product purchased', aggregatable: false, filterable: true, sortable: true, groupable: true },
      { id: 'payment_method', name: 'Payment Method', type: 'string', category: 'revenue', description: 'Payment method used', aggregatable: false, filterable: true, sortable: true, groupable: true },
      { id: 'subscription_tier', name: 'Subscription Tier', type: 'string', category: 'revenue', description: 'Subscription level', aggregatable: false, filterable: true, sortable: true, groupable: true },
      { id: 'refund_amount', name: 'Refund Amount', type: 'currency', category: 'revenue', description: 'Amount refunded', aggregatable: true, filterable: true, sortable: true, groupable: false },
      
      // Engagement fields
      { id: 'session_count', name: 'Session Count', type: 'number', category: 'engagement', description: 'Number of sessions', aggregatable: true, filterable: true, sortable: true, groupable: false },
      { id: 'session_duration', name: 'Session Duration', type: 'number', category: 'engagement', description: 'Length of session in minutes', aggregatable: true, filterable: true, sortable: true, groupable: false },
      { id: 'page_views', name: 'Page Views', type: 'number', category: 'engagement', description: 'Number of pages viewed', aggregatable: true, filterable: true, sortable: true, groupable: false },
      { id: 'bounce_rate', name: 'Bounce Rate', type: 'percentage', category: 'engagement', description: 'Percentage of single-page sessions', aggregatable: true, filterable: true, sortable: true, groupable: false },
      { id: 'conversion_rate', name: 'Conversion Rate', type: 'percentage', category: 'engagement', description: 'Percentage of conversions', aggregatable: true, filterable: true, sortable: true, groupable: false },
      { id: 'feature_usage', name: 'Feature Usage', type: 'number', category: 'engagement', description: 'Number of feature uses', aggregatable: true, filterable: true, sortable: true, groupable: false },
      
      // Performance fields
      { id: 'response_time', name: 'Response Time', type: 'number', category: 'performance', description: 'Server response time in ms', aggregatable: true, filterable: true, sortable: true, groupable: false },
      { id: 'error_rate', name: 'Error Rate', type: 'percentage', category: 'performance', description: 'Percentage of errors', aggregatable: true, filterable: true, sortable: true, groupable: false },
      { id: 'uptime', name: 'Uptime', type: 'percentage', category: 'performance', description: 'System uptime percentage', aggregatable: true, filterable: true, sortable: true, groupable: false },
      { id: 'cpu_usage', name: 'CPU Usage', type: 'percentage', category: 'performance', description: 'CPU utilization percentage', aggregatable: true, filterable: true, sortable: true, groupable: false },
      { id: 'memory_usage', name: 'Memory Usage', type: 'percentage', category: 'performance', description: 'Memory utilization percentage', aggregatable: true, filterable: true, sortable: true, groupable: false },
      
      // System fields
      { id: 'log_level', name: 'Log Level', type: 'string', category: 'system', description: 'System log severity level', aggregatable: false, filterable: true, sortable: true, groupable: true },
      { id: 'event_timestamp', name: 'Event Timestamp', type: 'date', category: 'system', description: 'When system event occurred', aggregatable: false, filterable: true, sortable: true, groupable: true },
      { id: 'component', name: 'Component', type: 'string', category: 'system', description: 'System component name', aggregatable: false, filterable: true, sortable: true, groupable: true },
      { id: 'alert_count', name: 'Alert Count', type: 'number', category: 'system', description: 'Number of alerts generated', aggregatable: true, filterable: true, sortable: true, groupable: false }
    ];
  }, []);

  const generateMockTemplates = useCallback((): ReportTemplate[] => {
    return [
      {
        id: 'template-1',
        name: 'User Activity Report',
        description: 'Comprehensive analysis of user engagement and activity patterns',
        category: 'User Analytics',
        icon: 'Users',
        definition: {
          name: 'User Activity Report',
          fields: ['user_id', 'username', 'last_active', 'session_count', 'session_duration', 'page_views'],
          visualization: {
            type: 'table',
            config: { showGrid: true, showLabels: true }
          },
          timeRange: { type: 'relative', value: '30d' }
        },
        popularity: 95,
        difficulty: 'beginner',
        estimatedTime: 5,
        tags: ['users', 'engagement', 'activity'],
        created: Date.now() - 30 * 24 * 60 * 60 * 1000,
        usageCount: 1250
      },
      {
        id: 'template-2',
        name: 'Revenue Analysis',
        description: 'Detailed revenue breakdown by product, time period, and customer segment',
        category: 'Financial',
        icon: 'DollarSign',
        definition: {
          name: 'Revenue Analysis',
          fields: ['transaction_date', 'revenue', 'product_name', 'payment_method', 'subscription_tier'],
          visualization: {
            type: 'bar_chart',
            config: { xAxis: 'transaction_date', yAxis: ['revenue'], groupBy: 'product_name' }
          },
          timeRange: { type: 'relative', value: '90d' }
        },
        popularity: 88,
        difficulty: 'intermediate',
        estimatedTime: 10,
        tags: ['revenue', 'financial', 'products'],
        created: Date.now() - 25 * 24 * 60 * 60 * 1000,
        usageCount: 890
      },
      {
        id: 'template-3',
        name: 'Performance Dashboard',
        description: 'System performance metrics and health indicators',
        category: 'Technical',
        icon: 'Activity',
        definition: {
          name: 'Performance Dashboard',
          fields: ['event_timestamp', 'response_time', 'error_rate', 'cpu_usage', 'memory_usage', 'uptime'],
          visualization: {
            type: 'line_chart',
            config: { xAxis: 'event_timestamp', yAxis: ['response_time', 'error_rate'] }
          },
          timeRange: { type: 'relative', value: '24h' }
        },
        popularity: 76,
        difficulty: 'intermediate',
        estimatedTime: 8,
        tags: ['performance', 'system', 'monitoring'],
        created: Date.now() - 20 * 24 * 60 * 60 * 1000,
        usageCount: 650
      },
      {
        id: 'template-4',
        name: 'Conversion Funnel',
        description: 'Track user journey and conversion rates through the funnel',
        category: 'Marketing',
        icon: 'Target',
        definition: {
          name: 'Conversion Funnel',
          fields: ['registration_date', 'user_status', 'conversion_rate', 'session_count', 'revenue'],
          visualization: {
            type: 'pie_chart',
            config: { groupBy: 'user_status', aggregation: 'count' }
          },
          timeRange: { type: 'relative', value: '7d' }
        },
        popularity: 82,
        difficulty: 'advanced',
        estimatedTime: 15,
        tags: ['conversion', 'funnel', 'marketing'],
        created: Date.now() - 15 * 24 * 60 * 60 * 1000,
        usageCount: 420
      },
      {
        id: 'template-5',
        name: 'Geographic Distribution',
        description: 'User and revenue distribution across geographic regions',
        category: 'Geographic',
        icon: 'Globe',
        definition: {
          name: 'Geographic Distribution',
          fields: ['country', 'user_id', 'revenue', 'session_count'],
          visualization: {
            type: 'heatmap',
            config: { groupBy: 'country', aggregation: 'sum', yAxis: ['revenue'] }
          },
          timeRange: { type: 'relative', value: '30d' }
        },
        popularity: 68,
        difficulty: 'intermediate',
        estimatedTime: 12,
        tags: ['geographic', 'distribution', 'users'],
        created: Date.now() - 10 * 24 * 60 * 60 * 1000,
        usageCount: 320
      },
      {
        id: 'template-6',
        name: 'Customer Lifetime Value',
        description: 'Analysis of customer value and retention patterns',
        category: 'Customer Analytics',
        icon: 'Star',
        definition: {
          name: 'Customer Lifetime Value',
          fields: ['user_id', 'registration_date', 'revenue', 'session_count', 'last_active'],
          visualization: {
            type: 'scatter_plot',
            config: { xAxis: 'session_count', yAxis: ['revenue'] }
          },
          timeRange: { type: 'relative', value: '365d' }
        },
        popularity: 71,
        difficulty: 'advanced',
        estimatedTime: 20,
        tags: ['ltv', 'customers', 'retention'],
        created: Date.now() - 5 * 24 * 60 * 60 * 1000,
        usageCount: 180
      }
    ];
  }, []);

  const generateMockSavedReports = useCallback((): SavedReport[] => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: `report-${i + 1}`,
      definition: {
        id: `report-${i + 1}`,
        name: [
          'Weekly User Summary',
          'Monthly Revenue Report',
          'Performance Metrics',
          'Customer Segmentation',
          'Product Analytics',
          'Marketing Campaign Results',
          'System Health Check',
          'A/B Test Results'
        ][i],
        description: `Saved report ${i + 1} description`,
        category: ['Analytics', 'Financial', 'Technical', 'Marketing'][i % 4],
        fields: ['user_id', 'revenue', 'session_count'].slice(0, Math.floor(2 + Math.random() * 2)),
        filters: [],
        sorting: [],
        grouping: [],
        visualization: {
          type: ['table', 'bar_chart', 'line_chart', 'pie_chart'][i % 4] as const,
          config: {}
        },
        timeRange: { type: 'relative', value: '30d' },
        refreshRate: 60,
        permissions: {
          viewers: ['team@company.com'],
          editors: ['admin@company.com'],
          owners: ['owner@company.com'],
          public: false
        },
        created: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        lastModified: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        lastRun: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
        owner: 'user@company.com',
        tags: ['analytics', 'report'],
        public: Math.random() > 0.7,
        starred: Math.random() > 0.6
      },
      data: {
        headers: ['Column 1', 'Column 2', 'Column 3'],
        rows: Array.from({ length: 10 }, () => [
          Math.floor(Math.random() * 1000),
          Math.floor(Math.random() * 500),
          Math.floor(Math.random() * 100)
        ]),
        summary: {
          totalRows: 10,
          totalRevenue: Math.floor(Math.random() * 50000),
          avgValue: Math.floor(Math.random() * 100)
        }
      },
      metadata: {
        rowCount: 10,
        columnCount: 3,
        executionTime: Math.floor(Math.random() * 5000),
        generatedAt: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
        dataSize: Math.floor(Math.random() * 1000000)
      },
      status: ['completed', 'generating', 'failed', 'cached'][Math.floor(Math.random() * 4)] as const,
      error: Math.random() > 0.8 ? 'Sample error message' : undefined
    }));
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAvailableFields(generateMockFields());
      setReportTemplates(generateMockTemplates());
      setSavedReports(generateMockSavedReports());
    } catch (error) {
      console.error('Failed to load report builder data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockFields, generateMockTemplates, generateMockSavedReports]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createNewReport = useCallback(() => {
    const newReport: ReportDefinition = {
      id: `report-${Date.now()}`,
      name: 'New Report',
      description: '',
      category: 'Custom',
      fields: [],
      filters: [],
      sorting: [],
      grouping: [],
      visualization: {
        type: 'table',
        config: { showGrid: true, showLabels: true }
      },
      timeRange: { type: 'relative', value: '30d' },
      refreshRate: 60,
      permissions: {
        viewers: [],
        editors: [],
        owners: ['current-user@company.com'],
        public: false
      },
      created: Date.now(),
      lastModified: Date.now(),
      owner: 'current-user@company.com',
      tags: [],
      public: false,
      starred: false
    };
    setCurrentReport(newReport);
    setIsBuilding(true);
  }, []);

  const loadTemplate = useCallback((template: ReportTemplate) => {
    const reportFromTemplate: ReportDefinition = {
      id: `report-${Date.now()}`,
      name: template.name,
      description: template.description,
      category: template.category,
      fields: template.definition.fields || [],
      filters: template.definition.filters || [],
      sorting: template.definition.sorting || [],
      grouping: template.definition.grouping || [],
      visualization: template.definition.visualization || {
        type: 'table',
        config: { showGrid: true, showLabels: true }
      },
      timeRange: template.definition.timeRange || { type: 'relative', value: '30d' },
      refreshRate: template.definition.refreshRate || 60,
      permissions: {
        viewers: [],
        editors: [],
        owners: ['current-user@company.com'],
        public: false
      },
      created: Date.now(),
      lastModified: Date.now(),
      owner: 'current-user@company.com',
      tags: template.tags,
      public: false,
      starred: false
    };
    setCurrentReport(reportFromTemplate);
    setIsBuilding(true);
    setActiveTab('builder');
  }, []);

  const generateReport = useCallback(async () => {
    if (!currentReport) return;

    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock data based on selected fields
      const headers = currentReport.fields.map(fieldId => {
        const field = availableFields.find(f => f.id === fieldId);
        return field?.name || fieldId;
      });

      const rows = Array.from({ length: 50 }, () => 
        currentReport.fields.map(fieldId => {
          const field = availableFields.find(f => f.id === fieldId);
          switch (field?.type) {
            case 'currency':
              return `$${(Math.random() * 1000).toFixed(2)}`;
            case 'percentage':
              return `${(Math.random() * 100).toFixed(1)}%`;
            case 'date':
              return new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString();
            case 'number':
              return Math.floor(Math.random() * 1000);
            case 'boolean':
              return Math.random() > 0.5 ? 'Yes' : 'No';
            default:
              return `Sample ${Math.floor(Math.random() * 100)}`;
          }
        })
      );

      setReportData({
        headers,
        rows,
        summary: {
          totalRows: rows.length,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [currentReport, availableFields]);

  const addField = useCallback((field: ReportField) => {
    if (!currentReport || currentReport.fields.includes(field.id)) return;
    
    setCurrentReport({
      ...currentReport,
      fields: [...currentReport.fields, field.id],
      lastModified: Date.now()
    });
  }, [currentReport]);

  const removeField = useCallback((fieldId: string) => {
    if (!currentReport) return;
    
    setCurrentReport({
      ...currentReport,
      fields: currentReport.fields.filter(id => id !== fieldId),
      lastModified: Date.now()
    });
  }, [currentReport]);

  const addFilter = useCallback(() => {
    if (!currentReport) return;
    
    const newFilter: ReportFilter = {
      id: `filter-${Date.now()}`,
      field: currentReport.fields[0] || availableFields[0]?.id || '',
      operator: 'equals',
      value: '',
      enabled: true
    };
    
    setCurrentReport({
      ...currentReport,
      filters: [...currentReport.filters, newFilter],
      lastModified: Date.now()
    });
  }, [currentReport, availableFields]);

  const updateFilter = useCallback((filterId: string, updates: Partial<ReportFilter>) => {
    if (!currentReport) return;
    
    setCurrentReport({
      ...currentReport,
      filters: currentReport.filters.map(filter => 
        filter.id === filterId ? { ...filter, ...updates } : filter
      ),
      lastModified: Date.now()
    });
  }, [currentReport]);

  const removeFilter = useCallback((filterId: string) => {
    if (!currentReport) return;
    
    setCurrentReport({
      ...currentReport,
      filters: currentReport.filters.filter(filter => filter.id !== filterId),
      lastModified: Date.now()
    });
  }, [currentReport]);

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor(diff / (60 * 1000));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getFieldIcon = (category: string) => {
    switch (category) {
      case 'user': return <Users className="h-4 w-4" />;
      case 'revenue': return <DollarSign className="h-4 w-4" />;
      case 'engagement': return <Activity className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'system': return <Server className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getVisualizationIcon = (type: string) => {
    switch (type) {
      case 'table': return <Table className="h-4 w-4" />;
      case 'bar_chart': return <BarChart3 className="h-4 w-4" />;
      case 'line_chart': return <LineChart className="h-4 w-4" />;
      case 'pie_chart': return <PieChart className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'User Analytics': return 'bg-blue-100 text-blue-800';
      case 'Financial': return 'bg-green-100 text-green-800';
      case 'Technical': return 'bg-purple-100 text-purple-800';
      case 'Marketing': return 'bg-orange-100 text-orange-800';
      case 'Geographic': return 'bg-teal-100 text-teal-800';
      case 'Customer Analytics': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Custom Report Builder</h2>
              <p className="text-sm text-gray-500">Create, customize, and schedule detailed analytics reports</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isBuilding && (
              <button
                onClick={createNewReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Report</span>
              </button>
            )}
            {isBuilding && (
              <div className="flex items-center space-x-2">
                <select 
                  value={builderMode}
                  onChange={(e) => setBuilderMode(e.target.value as 'visual' | 'sql')}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="visual">Visual Builder</option>
                  <option value="sql">SQL Mode</option>
                </select>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`p-2 rounded ${previewMode ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  <span>{isGenerating ? 'Generating...' : 'Generate Report'}</span>
                </button>
                <button
                  onClick={() => setIsBuilding(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {!isBuilding && (
          <div className="flex space-x-1">
            {['templates', 'saved', 'schedule', 'permissions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  activeTab === tab
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-6">
        {isBuilding ? (
          <div className="grid grid-cols-4 gap-6 h-full">
            {/* Fields Panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Available Fields</h3>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search fields..."
                    className="pl-10 pr-4 py-1 border border-gray-300 rounded text-sm w-full"
                  />
                </div>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableFields.map((field) => (
                  <div
                    key={field.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                      currentReport?.fields.includes(field.id) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                    }`}
                    onClick={() => addField(field)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getFieldIcon(field.category)}
                        <span className="font-medium text-sm text-gray-900">{field.name}</span>
                      </div>
                      {currentReport?.fields.includes(field.id) && (
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {field.type}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {field.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Builder */}
            <div className="col-span-2 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Report Configuration</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
                      <input
                        type="text"
                        value={currentReport?.name || ''}
                        onChange={(e) => currentReport && setCurrentReport({
                          ...currentReport,
                          name: e.target.value,
                          lastModified: Date.now()
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter report name..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <input
                        type="text"
                        value={currentReport?.category || ''}
                        onChange={(e) => currentReport && setCurrentReport({
                          ...currentReport,
                          category: e.target.value,
                          lastModified: Date.now()
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter category..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={currentReport?.description || ''}
                      onChange={(e) => currentReport && setCurrentReport({
                        ...currentReport,
                        description: e.target.value,
                        lastModified: Date.now()
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={2}
                      placeholder="Enter report description..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Selected Fields</h4>
                  <span className="text-sm text-gray-500">{currentReport?.fields.length || 0} fields</span>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {currentReport?.fields.map((fieldId, index) => {
                    const field = availableFields.find(f => f.id === fieldId);
                    return field ? (
                      <div key={fieldId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{index + 1}.</span>
                          {getFieldIcon(field.category)}
                          <span className="font-medium text-sm text-gray-900">{field.name}</span>
                        </div>
                        <button
                          onClick={() => removeField(fieldId)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null;
                  })}
                  {(!currentReport?.fields.length) && (
                    <p className="text-center text-gray-500 py-4">No fields selected. Choose fields from the left panel.</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Filters</h4>
                  <button
                    onClick={addFilter}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 inline mr-1" />
                    Add Filter
                  </button>
                </div>
                
                <div className="space-y-2">
                  {currentReport?.filters.map((filter) => (
                    <div key={filter.id} className="flex items-center space-x-2 p-2 border border-gray-200 rounded">
                      <select
                        value={filter.field}
                        onChange={(e) => updateFilter(filter.id, { field: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {availableFields.filter(f => f.filterable).map(field => (
                          <option key={field.id} value={field.id}>{field.name}</option>
                        ))}
                      </select>
                      
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(filter.id, { operator: e.target.value as any })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="equals">Equals</option>
                        <option value="not_equals">Not Equals</option>
                        <option value="greater_than">Greater Than</option>
                        <option value="less_than">Less Than</option>
                        <option value="contains">Contains</option>
                        <option value="not_contains">Not Contains</option>
                      </select>
                      
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm flex-1"
                        placeholder="Filter value..."
                      />
                      
                      <button
                        onClick={() => removeFilter(filter.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Visualization</h4>
                
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { type: 'table', name: 'Table', icon: Table },
                    { type: 'bar_chart', name: 'Bar Chart', icon: BarChart3 },
                    { type: 'line_chart', name: 'Line Chart', icon: LineChart },
                    { type: 'pie_chart', name: 'Pie Chart', icon: PieChart }
                  ].map(({ type, name, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => currentReport && setCurrentReport({
                        ...currentReport,
                        visualization: { type: type as any, config: {} },
                        lastModified: Date.now()
                      })}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        currentReport?.visualization.type === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-xs font-medium">{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Preview</h3>
              
              {reportData ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{currentReport?.name}</h4>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{reportData.rows.length} rows</p>
                  </div>
                  
                  {currentReport?.visualization.type === 'table' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            {reportData.headers.map((header, i) => (
                              <th key={i} className="text-left p-2 font-medium text-gray-900">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.rows.slice(0, 10).map((row, i) => (
                            <tr key={i} className="border-b border-gray-100">
                              {row.map((cell, j) => (
                                <td key={j} className="p-2 text-gray-700">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {currentReport?.visualization.type !== 'table' && (
                    <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        {getVisualizationIcon(currentReport?.visualization.type || 'table')}
                        <p className="mt-2 text-sm">Chart visualization preview</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Generate report to see preview</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {activeTab === 'templates' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Report Templates</h3>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search templates..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64"
                      />
                    </div>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg">
                      <option>All Categories</option>
                      <option>User Analytics</option>
                      <option>Financial</option>
                      <option>Technical</option>
                      <option>Marketing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {reportTemplates.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {getVisualizationIcon(template.definition.visualization?.type || 'table')}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{template.name}</h4>
                            <p className="text-sm text-gray-500">{template.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">{template.popularity}</span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(template.category)}`}>
                            {template.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(template.difficulty)}`}>
                            {template.difficulty}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>~{template.estimatedTime} min</span>
                          <span>{template.usageCount} uses</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Created {formatTimeAgo(template.created)}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedTemplate(template)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => loadTemplate(template)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Use Template
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Saved Reports</h3>
                  <div className="flex items-center space-x-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-lg">
                      <option>All Reports</option>
                      <option>My Reports</option>
                      <option>Shared with Me</option>
                      <option>Public Reports</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Sort by: Last Modified</option>
                      <option>Sort by: Name</option>
                      <option>Sort by: Created Date</option>
                      <option>Sort by: Category</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4">
                  {savedReports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded">
                            {getVisualizationIcon(report.definition.visualization.type)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{report.definition.name}</h4>
                            <p className="text-sm text-gray-500">{report.definition.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {report.definition.starred && <Star className="h-4 w-4 text-yellow-500" />}
                          {report.definition.public && <Globe className="h-4 w-4 text-green-500" />}
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            report.status === 'completed' ? 'bg-green-100 text-green-800' :
                            report.status === 'generating' ? 'bg-blue-100 text-blue-800' :
                            report.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <span className="ml-1 font-medium">{report.definition.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Rows:</span>
                          <span className="ml-1 font-medium">{report.metadata.rowCount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Run:</span>
                          <span className="ml-1 font-medium">
                            {report.definition.lastRun ? formatTimeAgo(report.definition.lastRun) : 'Never'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Owner:</span>
                          <span className="ml-1 font-medium">{report.definition.owner.split('@')[0]}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {report.definition.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-gray-400 hover:text-blue-600">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-green-600">
                            <Copy className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-purple-600">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Download className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Continue with schedule and permissions tabs... */}
          </div>
        )}
      </div>
    </div>
  );
}