'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Save,
  Copy,
  Edit,
  Trash2,
  Share2,
  Play,
  Pause,
  Square,
  RotateCcw,
  Filter,
  Search,
  Calendar,
  Clock,
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
  Palette,
  Image,
  FileText,
  Code,
  Database,
  Server,
  Globe,
  Users,
  User,
  DollarSign,
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

interface DataVisualization {
  id: string;
  name: string;
  type: 'bar_chart' | 'line_chart' | 'area_chart' | 'pie_chart' | 'donut_chart' | 'scatter_plot' | 'bubble_chart' | 'heatmap' | 'treemap' | 'gauge' | 'funnel' | 'waterfall' | 'radar' | 'sankey' | 'candlestick';
  category: 'comparison' | 'trend' | 'distribution' | 'relationship' | 'composition' | 'flow' | 'geographic';
  description: string;
  dataSource: DataSource;
  configuration: ChartConfiguration;
  styling: ChartStyling;
  interactions: ChartInteraction[];
  dimensions: ChartDimensions;
  status: 'draft' | 'published' | 'archived';
  performance: PerformanceMetrics;
  permissions: VisualizationPermissions;
  tags: string[];
  created: number;
  lastModified: number;
  lastRendered: number;
  owner: string;
  starred: boolean;
  viewCount: number;
}

interface DataSource {
  type: 'api' | 'database' | 'file' | 'realtime' | 'mock';
  connection: string;
  query: string;
  fields: DataField[];
  filters: DataFilter[];
  aggregations: DataAggregation[];
  refreshRate: number; // seconds
  cacheEnabled: boolean;
  cacheDuration: number; // seconds
  lastFetched?: number;
  rowCount?: number;
  dataSize?: number;
}

interface DataField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage';
  role: 'dimension' | 'measure' | 'attribute';
  format?: string;
  nullable: boolean;
  unique: boolean;
  description: string;
  statistics?: FieldStatistics;
}

interface FieldStatistics {
  count: number;
  nullCount: number;
  uniqueCount: number;
  min?: any;
  max?: any;
  mean?: number;
  median?: number;
  mode?: any;
  standardDeviation?: number;
  distribution?: { value: any; count: number }[];
}

interface DataFilter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'between' | 'is_null' | 'is_not_null';
  value: any;
  enabled: boolean;
}

interface DataAggregation {
  id: string;
  field: string;
  function: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct' | 'median' | 'percentile';
  parameters?: Record<string, any>;
  alias: string;
}

interface ChartConfiguration {
  xAxis: AxisConfiguration;
  yAxis: AxisConfiguration[];
  groupBy?: string;
  colorBy?: string;
  sizeBy?: string;
  filterBy?: string;
  sortBy?: SortConfiguration;
  limits?: {
    maxRecords?: number;
    topN?: number;
  };
  customOptions?: Record<string, any>;
}

interface AxisConfiguration {
  field?: string;
  label?: string;
  type?: 'linear' | 'logarithmic' | 'categorical' | 'time';
  domain?: [number, number];
  format?: string;
  showGrid?: boolean;
  showLabels?: boolean;
  rotation?: number;
  reverse?: boolean;
}

interface SortConfiguration {
  field: string;
  direction: 'asc' | 'desc';
  priority: number;
}

interface ChartStyling {
  theme: 'light' | 'dark' | 'custom';
  colors: ColorScheme;
  fonts: FontConfiguration;
  spacing: SpacingConfiguration;
  borders: BorderConfiguration;
  animations: AnimationConfiguration;
  responsive: boolean;
  customCSS?: string;
}

interface ColorScheme {
  type: 'categorical' | 'sequential' | 'diverging' | 'custom';
  palette: string[];
  opacity?: number;
  gradient?: boolean;
}

interface FontConfiguration {
  family: string;
  title: FontStyle;
  axis: FontStyle;
  legend: FontStyle;
  tooltip: FontStyle;
}

interface FontStyle {
  size: number;
  weight: 'normal' | 'bold' | 'lighter' | 'bolder';
  color: string;
  style?: 'normal' | 'italic';
}

interface SpacingConfiguration {
  margin: { top: number; right: number; bottom: number; left: number };
  padding: { top: number; right: number; bottom: number; left: number };
}

interface BorderConfiguration {
  width: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
  radius: number;
}

interface AnimationConfiguration {
  enabled: boolean;
  duration: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  delay: number;
}

interface ChartInteraction {
  type: 'hover' | 'click' | 'brush' | 'zoom' | 'pan' | 'selection';
  enabled: boolean;
  configuration: InteractionConfiguration;
}

interface InteractionConfiguration {
  tooltip?: TooltipConfiguration;
  drill?: DrillConfiguration;
  filter?: FilterConfiguration;
  highlight?: HighlightConfiguration;
  crossFilter?: boolean;
}

interface TooltipConfiguration {
  enabled: boolean;
  template: string;
  fields: string[];
  styling: TooltipStyling;
}

interface TooltipStyling {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderRadius: number;
  fontSize: number;
}

interface DrillConfiguration {
  enabled: boolean;
  levels: DrillLevel[];
}

interface DrillLevel {
  field: string;
  label: string;
  visualization?: Partial<DataVisualization>;
}

interface FilterConfiguration {
  enabled: boolean;
  fields: string[];
  operators: string[];
}

interface HighlightConfiguration {
  enabled: boolean;
  color: string;
  opacity: number;
}

interface ChartDimensions {
  width: number;
  height: number;
  aspectRatio?: number;
  responsive: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface PerformanceMetrics {
  renderTime: number;
  dataLoadTime: number;
  memoryUsage: number;
  elementCount: number;
  complexity: 'low' | 'medium' | 'high';
  optimizations: string[];
}

interface VisualizationPermissions {
  viewers: string[];
  editors: string[];
  owners: string[];
  public: boolean;
  embedAllowed: boolean;
  downloadAllowed: boolean;
}

interface VisualizationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  preview: string;
  configuration: Partial<ChartConfiguration>;
  styling: Partial<ChartStyling>;
  sampleData: any[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  popularity: number;
  created: number;
  usageCount: number;
}

interface ChartLibrary {
  id: string;
  name: string;
  version: string;
  description: string;
  supportedTypes: string[];
  features: string[];
  license: string;
  documentation: string;
  examples: ChartExample[];
  performance: LibraryPerformance;
  size: number; // KB
  dependencies: string[];
}

interface ChartExample {
  id: string;
  name: string;
  type: string;
  code: string;
  data: any[];
  description: string;
}

interface LibraryPerformance {
  renderSpeed: 'fast' | 'medium' | 'slow';
  memoryUsage: 'low' | 'medium' | 'high';
  bundleSize: number;
  browserSupport: string[];
}

interface RenderingEngine {
  type: 'canvas' | 'svg' | 'webgl' | 'hybrid';
  performance: PerformanceProfile;
  capabilities: EngineCapabilities;
  limitations: string[];
}

interface PerformanceProfile {
  maxDataPoints: number;
  renderTime: number;
  memoryEfficiency: number;
  animationSupport: boolean;
  interactivityLevel: 'basic' | 'advanced' | 'full';
}

interface EngineCapabilities {
  realTimeUpdates: boolean;
  streaming: boolean;
  largeDatasets: boolean;
  complexAnimations: boolean;
  multipleCharts: boolean;
  exportFormats: string[];
}

interface DataVisualizationEngineProps {
  className?: string;
}

export function DataVisualizationEngine({ className = '' }: DataVisualizationEngineProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [visualizations, setVisualizations] = useState<DataVisualization[]>([]);
  const [templates, setTemplates] = useState<VisualizationTemplate[]>([]);
  const [chartLibraries, setChartLibraries] = useState<ChartLibrary[]>([]);
  const [selectedVisualization, setSelectedVisualization] = useState<DataVisualization | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<VisualizationTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'templates' | 'builder' | 'libraries' | 'performance'>('gallery');
  const [builderStep, setBuilderStep] = useState<'data' | 'chart' | 'style' | 'interactions'>('data');
  const [selectedLibrary, setSelectedLibrary] = useState('d3');
  const [renderingEngine, setRenderingEngine] = useState<'svg' | 'canvas' | 'webgl'>('svg');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const generateMockVisualizations = useCallback((): DataVisualization[] => {
    const chartTypes = ['bar_chart', 'line_chart', 'pie_chart', 'scatter_plot', 'heatmap', 'gauge', 'funnel', 'radar'] as const;
    const categories = ['comparison', 'trend', 'distribution', 'relationship', 'composition'] as const;
    
    return Array.from({ length: 12 }, (_, i) => ({
      id: `viz-${i + 1}`,
      name: [
        'Revenue by Product Category',
        'User Growth Trends',
        'Geographic Distribution',
        'Performance Metrics Dashboard',
        'Customer Segmentation Analysis',
        'Sales Funnel Conversion',
        'Market Share Analysis',
        'Operational Efficiency',
        'User Engagement Patterns',
        'Financial Performance',
        'System Health Monitor',
        'Campaign Effectiveness'
      ][i],
      type: chartTypes[i % chartTypes.length],
      category: categories[i % categories.length],
      description: `Visualization ${i + 1} showing detailed analytics and insights`,
      dataSource: {
        type: ['api', 'database', 'file', 'realtime'][Math.floor(Math.random() * 4)] as const,
        connection: 'data-warehouse',
        query: `SELECT * FROM analytics_table_${i + 1}`,
        fields: Array.from({ length: 3 + Math.floor(Math.random() * 5) }, (_, j) => ({
          id: `field-${j + 1}`,
          name: `Field ${j + 1}`,
          type: ['string', 'number', 'date'][Math.floor(Math.random() * 3)] as const,
          role: ['dimension', 'measure'][Math.floor(Math.random() * 2)] as const,
          nullable: Math.random() > 0.7,
          unique: Math.random() > 0.8,
          description: `Description for field ${j + 1}`
        })),
        filters: [],
        aggregations: [],
        refreshRate: Math.floor(30 + Math.random() * 300),
        cacheEnabled: Math.random() > 0.3,
        cacheDuration: Math.floor(300 + Math.random() * 3600),
        rowCount: Math.floor(1000 + Math.random() * 10000)
      },
      configuration: {
        xAxis: {
          field: 'date',
          label: 'Time Period',
          type: 'time',
          showGrid: true,
          showLabels: true
        },
        yAxis: [{
          field: 'value',
          label: 'Value',
          type: 'linear',
          showGrid: true,
          showLabels: true
        }],
        groupBy: 'category',
        colorBy: 'category'
      },
      styling: {
        theme: 'light',
        colors: {
          type: 'categorical',
          palette: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
          opacity: 0.8
        },
        fonts: {
          family: 'Inter',
          title: { size: 16, weight: 'bold', color: '#1F2937' },
          axis: { size: 12, weight: 'normal', color: '#6B7280' },
          legend: { size: 12, weight: 'normal', color: '#374151' },
          tooltip: { size: 11, weight: 'normal', color: '#111827' }
        },
        spacing: {
          margin: { top: 20, right: 20, bottom: 40, left: 60 },
          padding: { top: 10, right: 10, bottom: 10, left: 10 }
        },
        borders: {
          width: 1,
          color: '#E5E7EB',
          style: 'solid',
          radius: 4
        },
        animations: {
          enabled: true,
          duration: 750,
          easing: 'ease-in-out',
          delay: 0
        },
        responsive: true
      },
      interactions: [
        {
          type: 'hover',
          enabled: true,
          configuration: {
            tooltip: {
              enabled: true,
              template: '{field}: {value}',
              fields: ['category', 'value'],
              styling: {
                backgroundColor: '#1F2937',
                textColor: '#F9FAFB',
                borderColor: '#374151',
                borderRadius: 4,
                fontSize: 12
              }
            }
          }
        }
      ],
      dimensions: {
        width: 600,
        height: 400,
        responsive: true,
        minWidth: 300,
        minHeight: 200
      },
      status: ['draft', 'published', 'archived'][Math.floor(Math.random() * 3)] as const,
      performance: {
        renderTime: Math.floor(50 + Math.random() * 200),
        dataLoadTime: Math.floor(100 + Math.random() * 500),
        memoryUsage: Math.floor(5 + Math.random() * 20),
        elementCount: Math.floor(50 + Math.random() * 500),
        complexity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as const,
        optimizations: ['data-virtualization', 'level-of-detail', 'progressive-rendering'].slice(0, Math.floor(Math.random() * 3))
      },
      permissions: {
        viewers: ['team@company.com'],
        editors: ['admin@company.com'],
        owners: ['owner@company.com'],
        public: Math.random() > 0.7,
        embedAllowed: Math.random() > 0.5,
        downloadAllowed: Math.random() > 0.6
      },
      tags: ['analytics', 'dashboard', 'business'].slice(0, Math.floor(1 + Math.random() * 3)),
      created: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
      lastModified: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      lastRendered: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
      owner: 'user@company.com',
      starred: Math.random() > 0.7,
      viewCount: Math.floor(Math.random() * 1000)
    }));
  }, []);

  const generateMockTemplates = useCallback((): VisualizationTemplate[] => {
    return [
      {
        id: 'template-1',
        name: 'Revenue Dashboard',
        description: 'Comprehensive revenue analytics with multiple chart types',
        category: 'Business Intelligence',
        type: 'dashboard',
        preview: 'https://example.com/preview1.png',
        configuration: {
          xAxis: { type: 'time', showGrid: true },
          yAxis: [{ type: 'linear', format: 'currency' }]
        },
        styling: {
          theme: 'light',
          colors: { type: 'sequential', palette: ['#E6F3FF', '#0066CC'] }
        },
        sampleData: [
          { date: '2024-01-01', revenue: 10000, category: 'Product A' },
          { date: '2024-01-02', revenue: 12000, category: 'Product B' }
        ],
        complexity: 'intermediate',
        tags: ['revenue', 'business', 'dashboard'],
        popularity: 95,
        created: Date.now() - 30 * 24 * 60 * 60 * 1000,
        usageCount: 450
      },
      {
        id: 'template-2',
        name: 'User Analytics',
        description: 'User behavior and engagement tracking visualizations',
        category: 'User Experience',
        type: 'analytics',
        preview: 'https://example.com/preview2.png',
        configuration: {
          groupBy: 'user_segment',
          colorBy: 'engagement_level'
        },
        styling: {
          theme: 'dark',
          colors: { type: 'categorical', palette: ['#FF6B6B', '#4ECDC4', '#45B7D1'] }
        },
        sampleData: [
          { segment: 'New Users', engagement: 75, count: 1200 },
          { segment: 'Returning Users', engagement: 85, count: 3400 }
        ],
        complexity: 'beginner',
        tags: ['users', 'engagement', 'analytics'],
        popularity: 88,
        created: Date.now() - 25 * 24 * 60 * 60 * 1000,
        usageCount: 320
      },
      {
        id: 'template-3',
        name: 'Performance Monitoring',
        description: 'Real-time system performance and health metrics',
        category: 'Operations',
        type: 'monitoring',
        preview: 'https://example.com/preview3.png',
        configuration: {
          xAxis: { type: 'time', label: 'Time' },
          yAxis: [{ type: 'linear', label: 'Response Time (ms)' }]
        },
        styling: {
          animations: { enabled: true, duration: 500 },
          responsive: true
        },
        sampleData: [
          { timestamp: Date.now(), response_time: 120, cpu_usage: 45 },
          { timestamp: Date.now() + 1000, response_time: 135, cpu_usage: 52 }
        ],
        complexity: 'advanced',
        tags: ['performance', 'monitoring', 'realtime'],
        popularity: 72,
        created: Date.now() - 20 * 24 * 60 * 60 * 1000,
        usageCount: 180
      }
    ];
  }, []);

  const generateMockLibraries = useCallback((): ChartLibrary[] => {
    return [
      {
        id: 'd3',
        name: 'D3.js',
        version: '7.8.5',
        description: 'Data-Driven Documents - the most flexible and powerful visualization library',
        supportedTypes: ['bar_chart', 'line_chart', 'scatter_plot', 'heatmap', 'treemap', 'sankey', 'chord'],
        features: ['Custom animations', 'SVG rendering', 'Data binding', 'Unlimited customization'],
        license: 'BSD-3-Clause',
        documentation: 'https://d3js.org',
        examples: [
          {
            id: 'bar-example',
            name: 'Bar Chart',
            type: 'bar_chart',
            code: 'const svg = d3.select("svg")\n.selectAll("rect")\n.data(data)\n.enter().append("rect")',
            data: [{ x: 'A', y: 10 }, { x: 'B', y: 20 }],
            description: 'Basic bar chart implementation'
          }
        ],
        performance: {
          renderSpeed: 'fast',
          memoryUsage: 'medium',
          bundleSize: 280,
          browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge']
        },
        size: 280,
        dependencies: []
      },
      {
        id: 'chart-js',
        name: 'Chart.js',
        version: '4.4.0',
        description: 'Simple yet flexible JavaScript charting for designers & developers',
        supportedTypes: ['bar_chart', 'line_chart', 'pie_chart', 'donut_chart', 'radar', 'bubble_chart'],
        features: ['Canvas rendering', 'Responsive design', 'Animation support', 'Plugin system'],
        license: 'MIT',
        documentation: 'https://chartjs.org',
        examples: [
          {
            id: 'line-example',
            name: 'Line Chart',
            type: 'line_chart',
            code: 'new Chart(ctx, {\n  type: "line",\n  data: chartData\n})',
            data: [{ x: 1, y: 10 }, { x: 2, y: 20 }],
            description: 'Responsive line chart'
          }
        ],
        performance: {
          renderSpeed: 'fast',
          memoryUsage: 'low',
          bundleSize: 180,
          browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge', 'IE11']
        },
        size: 180,
        dependencies: []
      },
      {
        id: 'plotly',
        name: 'Plotly.js',
        version: '2.26.0',
        description: 'High-level, declarative charting library built on D3.js and WebGL',
        supportedTypes: ['bar_chart', 'line_chart', 'scatter_plot', 'heatmap', '3d_plot', 'geographic', 'statistical'],
        features: ['WebGL acceleration', '3D plotting', 'Statistical charts', 'Geographic maps'],
        license: 'MIT',
        documentation: 'https://plotly.com/javascript',
        examples: [
          {
            id: 'scatter-example',
            name: '3D Scatter Plot',
            type: 'scatter_plot',
            code: 'Plotly.newPlot("div", [{\n  x: [1,2,3],\n  y: [4,5,6],\n  z: [7,8,9],\n  type: "scatter3d"\n}])',
            data: [{ x: 1, y: 4, z: 7 }],
            description: 'Interactive 3D scatter plot'
          }
        ],
        performance: {
          renderSpeed: 'medium',
          memoryUsage: 'high',
          bundleSize: 3500,
          browserSupport: ['Chrome', 'Firefox', 'Safari', 'Edge']
        },
        size: 3500,
        dependencies: ['d3']
      }
    ];
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVisualizations(generateMockVisualizations());
      setTemplates(generateMockTemplates());
      setChartLibraries(generateMockLibraries());
    } catch (error) {
      console.error('Failed to load visualization data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockVisualizations, generateMockTemplates, generateMockLibraries]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createVisualization = useCallback(() => {
    setIsEditing(true);
    setBuilderStep('data');
    setActiveTab('builder');
  }, []);

  const renderMockChart = useCallback((type: string, width: number = 300, height: number = 200) => {
    return (
      <div 
        className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center"
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          {type === 'bar_chart' && <BarChart3 className="h-12 w-12 mx-auto mb-2" />}
          {type === 'line_chart' && <LineChart className="h-12 w-12 mx-auto mb-2" />}
          {type === 'pie_chart' && <PieChart className="h-12 w-12 mx-auto mb-2" />}
          {type === 'scatter_plot' && <Activity className="h-12 w-12 mx-auto mb-2" />}
          {!['bar_chart', 'line_chart', 'pie_chart', 'scatter_plot'].includes(type) && (
            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
          )}
          <p className="text-sm font-medium">{type.replace('_', ' ').toUpperCase()}</p>
          <p className="text-xs">Mock Visualization</p>
        </div>
      </div>
    );
  }, []);

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bar_chart': return <BarChart3 className="h-4 w-4" />;
      case 'line_chart': return <LineChart className="h-4 w-4" />;
      case 'pie_chart': return <PieChart className="h-4 w-4" />;
      case 'scatter_plot': return <Activity className="h-4 w-4" />;
      case 'heatmap': return <Grid3X3 className="h-4 w-4" />;
      case 'gauge': return <Target className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Business Intelligence': return 'bg-blue-100 text-blue-800';
      case 'User Experience': return 'bg-green-100 text-green-800';
      case 'Operations': return 'bg-purple-100 text-purple-800';
      case 'comparison': return 'bg-orange-100 text-orange-800';
      case 'trend': return 'bg-teal-100 text-teal-800';
      case 'distribution': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'fast': case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'slow': case 'high': return 'text-red-600';
      default: return 'text-gray-600';
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Data Visualization Engine</h2>
              <p className="text-sm text-gray-500">Advanced charting and visualization creation platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={createVisualization}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Visualization</span>
              </button>
            )}
            {isEditing && (
              <div className="flex items-center space-x-2">
                <select 
                  value={selectedLibrary}
                  onChange={(e) => setSelectedLibrary(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="d3">D3.js</option>
                  <option value="chart-js">Chart.js</option>
                  <option value="plotly">Plotly.js</option>
                </select>
                <select 
                  value={renderingEngine}
                  onChange={(e) => setRenderingEngine(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="svg">SVG</option>
                  <option value="canvas">Canvas</option>
                  <option value="webgl">WebGL</option>
                </select>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`p-2 rounded ${previewMode ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-1">
          {['gallery', 'templates', 'builder', 'libraries', 'performance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              } ${isEditing && tab !== 'builder' ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isEditing && tab !== 'builder'}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'gallery' && !isEditing && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Visualization Gallery</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search visualizations..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64"
                  />
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option>All Types</option>
                  <option>Bar Charts</option>
                  <option>Line Charts</option>
                  <option>Pie Charts</option>
                  <option>Scatter Plots</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option>All Categories</option>
                  <option>Comparison</option>
                  <option>Trend</option>
                  <option>Distribution</option>
                  <option>Relationship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {visualizations.map((viz) => (
                <div key={viz.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(viz.type)}
                      <h4 className="font-semibold text-gray-900">{viz.name}</h4>
                    </div>
                    <div className="flex items-center space-x-1">
                      {viz.starred && <Star className="h-4 w-4 text-yellow-500" />}
                      {viz.permissions.public && <Globe className="h-4 w-4 text-green-500" />}
                    </div>
                  </div>

                  <div className="mb-4">
                    {renderMockChart(viz.type, 280, 160)}
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{viz.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(viz.category)}`}>
                      {viz.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      viz.status === 'published' ? 'bg-green-100 text-green-800' :
                      viz.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {viz.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Views:</span>
                      <span className="ml-1 font-medium">{viz.viewCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Performance:</span>
                      <span className={`ml-1 font-medium ${getPerformanceColor(viz.performance.complexity)}`}>
                        {viz.performance.complexity}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Modified {formatTimeAgo(viz.lastModified)}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setSelectedVisualization(viz)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-blue-600">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600">
                        <Edit className="h-4 w-4" />
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

        {activeTab === 'templates' && !isEditing && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Visualization Templates</h3>
              <div className="flex items-center space-x-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option>All Categories</option>
                  <option>Business Intelligence</option>
                  <option>User Experience</option>
                  <option>Operations</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option>All Complexity</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">{template.popularity}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    {renderMockChart(template.type, 280, 160)}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getComplexityColor(template.complexity)}`}>
                        {template.complexity}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <span>{template.usageCount} uses</span>
                      <span className="mx-2">•</span>
                      <span>Created {formatTimeAgo(template.created)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedTemplate(template)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'builder' && isEditing && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Visualization Builder</h3>
              <div className="flex items-center space-x-1">
                {['data', 'chart', 'style', 'interactions'].map((step, index) => (
                  <button
                    key={step}
                    onClick={() => setBuilderStep(step as any)}
                    className={`px-3 py-1 text-sm rounded ${
                      builderStep === step
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {index + 1}. {step.charAt(0).toUpperCase() + step.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Builder Configuration */}
              <div className="col-span-2 space-y-6">
                {builderStep === 'data' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Data Configuration</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option>Database Connection</option>
                          <option>API Endpoint</option>
                          <option>CSV File</option>
                          <option>Real-time Stream</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Rate</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option>Real-time</option>
                          <option>Every 5 minutes</option>
                          <option>Every hour</option>
                          <option>Daily</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Query</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                        rows={4}
                        placeholder="SELECT * FROM analytics_table WHERE date >= '2024-01-01'"
                      />
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Available Fields</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {['date', 'category', 'value', 'count', 'percentage'].map((field) => (
                          <div key={field} className="flex items-center space-x-2 p-2 border border-gray-200 rounded">
                            <Database className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">{field}</span>
                            <span className="text-xs text-gray-500 ml-auto">number</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {builderStep === 'chart' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Chart Configuration</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { type: 'bar_chart', name: 'Bar Chart', icon: BarChart3 },
                          { type: 'line_chart', name: 'Line Chart', icon: LineChart },
                          { type: 'pie_chart', name: 'Pie Chart', icon: PieChart },
                          { type: 'scatter_plot', name: 'Scatter Plot', icon: Activity }
                        ].map(({ type, name, icon: Icon }) => (
                          <button
                            key={type}
                            className="p-3 border border-gray-200 rounded-lg text-center hover:border-purple-500"
                          >
                            <Icon className="h-6 w-6 mx-auto mb-1" />
                            <span className="text-xs font-medium">{name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">X-Axis</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option>date</option>
                          <option>category</option>
                          <option>count</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Y-Axis</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option>value</option>
                          <option>percentage</option>
                          <option>count</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option>None</option>
                          <option>category</option>
                          <option>date</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color By</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option>None</option>
                          <option>category</option>
                          <option>value</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {builderStep === 'style' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Styling Options</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option>Light</option>
                          <option>Dark</option>
                          <option>Custom</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color Palette</label>
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map((color) => (
                              <div key={color} className="w-6 h-6 rounded" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Palette className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option>Inter</option>
                          <option>Roboto</option>
                          <option>Arial</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                        <input type="number" defaultValue="12" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius</label>
                        <input type="number" defaultValue="4" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Show Grid</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Show Legend</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Enable Animations</span>
                      </label>
                    </div>
                  </div>
                )}

                {builderStep === 'interactions' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Interactions</h4>
                    
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <span className="font-medium">Hover Tooltips</span>
                          <p className="text-sm text-gray-500">Show detailed information on hover</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </label>

                      <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <span className="font-medium">Click to Filter</span>
                          <p className="text-sm text-gray-500">Filter data by clicking chart elements</p>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </label>

                      <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <span className="font-medium">Zoom & Pan</span>
                          <p className="text-sm text-gray-500">Enable zooming and panning interactions</p>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </label>

                      <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <span className="font-medium">Drill Down</span>
                          <p className="text-sm text-gray-500">Navigate to detailed views</p>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tooltip Template</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={3}
                        placeholder="{category}: {value}"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Panel */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Preview</h4>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  {renderMockChart('bar_chart', 280, 200)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Render Time:</span>
                    <span className="font-medium">125ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data Points:</span>
                    <span className="font-medium">1,250</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Memory Usage:</span>
                    <span className="font-medium">12MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Library:</span>
                    <span className="font-medium">{selectedLibrary}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    Save Draft
                  </button>
                  <button className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Publish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'libraries' && !isEditing && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Chart Libraries</h3>
              <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                <Plus className="h-4 w-4 inline mr-1" />
                Add Library
              </button>
            </div>

            <div className="grid gap-6">
              {chartLibraries.map((library) => (
                <div key={library.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{library.name}</h4>
                      <p className="text-sm text-gray-500">Version {library.version}</p>
                      <p className="text-gray-700 mt-2">{library.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {library.license}
                      </span>
                      <span className="text-sm text-gray-500">{library.size}KB</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Supported Types</h5>
                      <div className="flex flex-wrap gap-1">
                        {library.supportedTypes.slice(0, 4).map((type) => (
                          <span key={type} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {type.replace('_', ' ')}
                          </span>
                        ))}
                        {library.supportedTypes.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            +{library.supportedTypes.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Performance</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Render Speed:</span>
                          <span className={`font-medium ${getPerformanceColor(library.performance.renderSpeed)}`}>
                            {library.performance.renderSpeed}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Memory Usage:</span>
                          <span className={`font-medium ${getPerformanceColor(library.performance.memoryUsage)}`}>
                            {library.performance.memoryUsage}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Bundle Size:</span>
                          <span className="font-medium">{library.performance.bundleSize}KB</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Features</h5>
                      <ul className="space-y-1">
                        {library.features.slice(0, 3).map((feature) => (
                          <li key={feature} className="text-sm text-gray-700 flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{library.examples.length} examples</span>
                      <span>{library.dependencies.length} dependencies</span>
                      <a href={library.documentation} className="text-blue-600 hover:text-blue-700">
                        Documentation
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                        View Examples
                      </button>
                      <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                        Install
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'performance' && !isEditing && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
            
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Avg Render Time</p>
                    <p className="text-2xl font-bold text-green-900">125ms</p>
                  </div>
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Memory Usage</p>
                    <p className="text-2xl font-bold text-blue-900">15MB</p>
                  </div>
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Active Charts</p>
                    <p className="text-2xl font-bold text-purple-900">24</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Optimization Score</p>
                    <p className="text-2xl font-bold text-orange-900">87%</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Rendering Performance</h4>
                <div className="space-y-3">
                  {['SVG Rendering', 'Canvas Rendering', 'WebGL Rendering'].map((engine, index) => (
                    <div key={engine} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{engine}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${85 - index * 10}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{85 - index * 10}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Optimization Recommendations</h4>
                <div className="space-y-3">
                  {[
                    'Enable data virtualization for large datasets',
                    'Use canvas rendering for high-frequency updates',
                    'Implement progressive loading for complex charts',
                    'Enable chart caching for static visualizations'
                  ].map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}