'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  FileText,
  Folder,
  Users,
  Settings,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  Copy,
  Share2,
  Send,
  Play,
  Pause,
  Square,
  RotateCcw,
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
  Globe,
  Server,
  Database,
  Network,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Code,
  Terminal,
  Lock,
  Unlock,
  Key,
  Info,
  AlertCircle,
  Star,
  Award,
  Crown,
  Fire,
  Sparkles,
  Lightbulb,
  Heart,
  ThumbsUp,
  MessageCircle,
  Brain,
  Zap,
  DollarSign,
  User,
  Gamepad2,
  ExternalLink,
  MoreHorizontal,
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
  X,
  Minus
} from 'lucide-react';

interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  category: 'security' | 'privacy' | 'financial' | 'industry' | 'regional';
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_assessed';
  overallScore: number;
  lastAssessment: number;
  nextAssessment: number;
  assessmentFrequency: 'monthly' | 'quarterly' | 'annually';
  controls: ComplianceControl[];
  requirements: ComplianceRequirement[];
  evidence: ComplianceEvidence[];
  gaps: ComplianceGap[];
  remediation: RemediationPlan[];
  assessor: string;
  certificationDate?: number;
  expiryDate?: number;
  isActive: boolean;
}

interface ComplianceControl {
  id: string;
  controlId: string;
  title: string;
  description: string;
  category: string;
  family: string;
  type: 'preventive' | 'detective' | 'corrective' | 'administrative' | 'technical' | 'physical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'implemented' | 'partial' | 'not_implemented' | 'not_applicable';
  maturityLevel: 'initial' | 'developing' | 'defined' | 'managed' | 'optimized';
  implementation: ControlImplementation;
  testing: ControlTesting;
  effectiveness: number;
  riskRating: 'low' | 'medium' | 'high' | 'critical';
  owner: string;
  lastReviewed: number;
  nextReview: number;
}

interface ControlImplementation {
  status: 'not_started' | 'in_progress' | 'completed' | 'verified';
  completionDate?: number;
  implementationDetails: string;
  automationLevel: 'manual' | 'semi_automated' | 'fully_automated';
  tools: string[];
  procedures: string[];
  responsibleParty: string;
  estimatedEffort: number;
  actualEffort?: number;
}

interface ControlTesting {
  lastTested?: number;
  nextTest: number;
  testFrequency: 'monthly' | 'quarterly' | 'annually' | 'continuous';
  testMethod: 'interview' | 'observation' | 'examination' | 'automated' | 'penetration';
  testResults: TestResult[];
  tester: string;
  testPlan: string;
  testEvidence: string[];
}

interface TestResult {
  date: number;
  result: 'pass' | 'fail' | 'partial' | 'not_tested';
  findings: string[];
  recommendations: string[];
  evidence: string[];
  tester: string;
  remediation?: string;
}

interface ComplianceRequirement {
  id: string;
  requirementId: string;
  title: string;
  description: string;
  mandatory: boolean;
  applicability: string;
  controls: string[];
  evidence: string[];
  status: 'met' | 'partial' | 'not_met' | 'not_applicable';
  assessment: RequirementAssessment;
  lastReviewed: number;
}

interface RequirementAssessment {
  assessor: string;
  date: number;
  method: 'document_review' | 'interview' | 'observation' | 'testing';
  findings: string;
  conclusion: string;
  recommendations: string[];
  evidence: string[];
}

interface ComplianceEvidence {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'screenshot' | 'log' | 'certificate' | 'policy' | 'procedure' | 'configuration';
  category: string;
  filePath: string;
  fileSize: number;
  uploadDate: number;
  uploadedBy: string;
  lastModified: number;
  version: string;
  controls: string[];
  requirements: string[];
  retention: number;
  confidentiality: 'public' | 'internal' | 'confidential' | 'restricted';
  integrity: boolean;
  tags: string[];
}

interface ComplianceGap {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'control_gap' | 'policy_gap' | 'procedure_gap' | 'training_gap' | 'technology_gap';
  framework: string;
  control?: string;
  requirement?: string;
  identifiedDate: number;
  identifiedBy: string;
  riskLevel: number;
  businessImpact: string;
  remediation: GapRemediation;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  dueDate: number;
  owner: string;
}

interface GapRemediation {
  plan: string;
  actions: RemediationAction[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: number;
  estimatedEffort: number;
  timeline: number;
  dependencies: string[];
  approver: string;
  status: 'planned' | 'approved' | 'in_progress' | 'completed' | 'deferred';
}

interface RemediationAction {
  id: string;
  description: string;
  type: 'policy_update' | 'procedure_change' | 'training' | 'technology' | 'process_improvement';
  owner: string;
  dueDate: number;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  progress: number;
  dependencies: string[];
  resources: string[];
  cost: number;
  effort: number;
}

interface RemediationPlan {
  id: string;
  name: string;
  description: string;
  scope: string;
  objectives: string[];
  actions: RemediationAction[];
  timeline: PlanTimeline;
  budget: PlanBudget;
  resources: PlanResource[];
  milestones: PlanMilestone[];
  risks: PlanRisk[];
  stakeholders: string[];
  status: 'draft' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  owner: string;
  approver: string;
  createdDate: number;
  lastUpdated: number;
}

interface PlanTimeline {
  startDate: number;
  endDate: number;
  phases: PlanPhase[];
  criticalPath: string[];
}

interface PlanPhase {
  id: string;
  name: string;
  description: string;
  startDate: number;
  endDate: number;
  deliverables: string[];
  dependencies: string[];
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
}

interface PlanBudget {
  totalCost: number;
  allocatedBudget: number;
  spentBudget: number;
  remainingBudget: number;
  categories: BudgetCategory[];
}

interface BudgetCategory {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
}

interface PlanResource {
  id: string;
  name: string;
  role: string;
  type: 'internal' | 'external' | 'contractor';
  allocation: number;
  cost: number;
  skills: string[];
  availability: ResourceAvailability[];
}

interface ResourceAvailability {
  startDate: number;
  endDate: number;
  availability: number;
}

interface PlanMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: number;
  status: 'pending' | 'achieved' | 'missed' | 'at_risk';
  dependencies: string[];
  deliverables: string[];
  criteria: string[];
}

interface PlanRisk {
  id: string;
  description: string;
  category: 'technical' | 'resource' | 'schedule' | 'budget' | 'regulatory';
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  contingency: string;
  owner: string;
  status: 'identified' | 'mitigating' | 'resolved' | 'realized';
}

interface ComplianceAssessment {
  id: string;
  name: string;
  framework: string;
  scope: string;
  type: 'self_assessment' | 'internal_audit' | 'external_audit' | 'certification';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  assessor: AssessmentTeam;
  timeline: AssessmentTimeline;
  methodology: string;
  findings: AssessmentFinding[];
  recommendations: AssessmentRecommendation[];
  conclusion: AssessmentConclusion;
  deliverables: string[];
  evidence: string[];
  createdDate: number;
  lastUpdated: number;
}

interface AssessmentTeam {
  lead: string;
  members: TeamMember[];
  external: boolean;
  organization?: string;
  credentials: string[];
}

interface TeamMember {
  name: string;
  role: string;
  expertise: string[];
  certification: string[];
}

interface AssessmentTimeline {
  plannedStart: number;
  plannedEnd: number;
  actualStart?: number;
  actualEnd?: number;
  phases: AssessmentPhase[];
}

interface AssessmentPhase {
  name: string;
  startDate: number;
  endDate: number;
  activities: string[];
  deliverables: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

interface AssessmentFinding {
  id: string;
  type: 'deficiency' | 'observation' | 'strength' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  control: string;
  requirement: string;
  description: string;
  evidence: string[];
  impact: string;
  recommendation: string;
  managementResponse: string;
  targetDate: number;
  responsible: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted';
}

interface AssessmentRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  rationale: string;
  benefits: string[];
  implementation: string;
  cost: number;
  timeline: number;
  dependencies: string[];
  risks: string[];
  success_criteria: string[];
}

interface AssessmentConclusion {
  overallRating: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'unsatisfactory';
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  criticalIssues: string[];
  recommendations: string[];
  certification: boolean;
  validityPeriod?: number;
  conditions: string[];
}

const ComplianceManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'frameworks' | 'controls' | 'assessments' | 'gaps' | 'remediation'>('overview');
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<ComplianceAssessment | null>(null);
  const [showFrameworkModal, setShowFrameworkModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showGapModal, setShowGapModal] = useState(false);
  const [timeRange, setTimeRange] = useState('12m');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateMockFrameworks = useCallback((): ComplianceFramework[] => {
    const frameworkNames = [
      { name: 'SOC 2 Type II', category: 'security', version: '2017' },
      { name: 'ISO 27001', category: 'security', version: '2013' },
      { name: 'GDPR', category: 'privacy', version: '2018' },
      { name: 'PCI DSS', category: 'financial', version: '4.0' },
      { name: 'HIPAA', category: 'privacy', version: '2013' },
      { name: 'NIST Cybersecurity Framework', category: 'security', version: '1.1' },
      { name: 'ISO 27017', category: 'security', version: '2015' },
      { name: 'CCPA', category: 'privacy', version: '2020' }
    ];

    const statuses = ['compliant', 'partial', 'non_compliant', 'not_assessed'] as const;
    
    return frameworkNames.map((fw, i) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const overallScore = status === 'compliant' ? 85 + Math.random() * 15 :
                          status === 'partial' ? 60 + Math.random() * 25 :
                          status === 'non_compliant' ? 30 + Math.random() * 30 :
                          0;
      
      const controlCount = 50 + Math.floor(Math.random() * 100);
      const controls = Array.from({ length: controlCount }, (_, j) => {
        const controlStatuses = ['implemented', 'partial', 'not_implemented', 'not_applicable'] as const;
        const controlStatus = controlStatuses[Math.floor(Math.random() * controlStatuses.length)];
        
        return {
          id: `control_${i}_${j}`,
          controlId: `${fw.name.split(' ')[0]}-${String(j + 1).padStart(3, '0')}`,
          title: `${fw.name} Control ${j + 1}`,
          description: `Security control requirement for ${fw.name} compliance framework implementation`,
          category: ['Access Control', 'Data Protection', 'System Security', 'Monitoring', 'Incident Response'][Math.floor(Math.random() * 5)],
          family: ['AC', 'DP', 'SS', 'MO', 'IR'][Math.floor(Math.random() * 5)],
          type: ['preventive', 'detective', 'corrective', 'administrative', 'technical', 'physical'][Math.floor(Math.random() * 6)] as any,
          priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
          status: controlStatus,
          maturityLevel: ['initial', 'developing', 'defined', 'managed', 'optimized'][Math.floor(Math.random() * 5)] as any,
          implementation: {
            status: ['not_started', 'in_progress', 'completed', 'verified'][Math.floor(Math.random() * 4)] as any,
            completionDate: controlStatus === 'implemented' ? Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000 : undefined,
            implementationDetails: 'Control implementation following organizational security policies and procedures',
            automationLevel: ['manual', 'semi_automated', 'fully_automated'][Math.floor(Math.random() * 3)] as any,
            tools: ['Security Tool A', 'Monitoring System B'],
            procedures: ['Procedure Document A', 'Procedure Document B'],
            responsibleParty: `team_${Math.floor(Math.random() * 5) + 1}`,
            estimatedEffort: 20 + Math.random() * 80,
            actualEffort: controlStatus === 'implemented' ? 25 + Math.random() * 75 : undefined
          },
          testing: {
            lastTested: controlStatus === 'implemented' ? Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000 : undefined,
            nextTest: Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000,
            testFrequency: ['monthly', 'quarterly', 'annually', 'continuous'][Math.floor(Math.random() * 4)] as any,
            testMethod: ['interview', 'observation', 'examination', 'automated', 'penetration'][Math.floor(Math.random() * 5)] as any,
            testResults: [],
            tester: `auditor_${Math.floor(Math.random() * 3) + 1}`,
            testPlan: 'Comprehensive testing plan for control validation',
            testEvidence: []
          },
          effectiveness: controlStatus === 'implemented' ? 70 + Math.random() * 30 : Math.random() * 70,
          riskRating: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
          owner: `owner_${Math.floor(Math.random() * 10) + 1}`,
          lastReviewed: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
          nextReview: Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000
        };
      });

      return {
        id: `framework_${i + 1}`,
        name: fw.name,
        version: fw.version,
        description: `Comprehensive ${fw.category} compliance framework ensuring organizational adherence to industry standards and regulatory requirements`,
        category: fw.category as any,
        status,
        overallScore,
        lastAssessment: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
        nextAssessment: Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000,
        assessmentFrequency: ['monthly', 'quarterly', 'annually'][Math.floor(Math.random() * 3)] as any,
        controls,
        requirements: [],
        evidence: [],
        gaps: [],
        remediation: [],
        assessor: `assessor_${Math.floor(Math.random() * 5) + 1}`,
        certificationDate: status === 'compliant' ? Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000 : undefined,
        expiryDate: status === 'compliant' ? Date.now() + (365 + Math.random() * 730) * 24 * 60 * 60 * 1000 : undefined,
        isActive: Math.random() > 0.1
      };
    });
  }, []);

  const generateMockAssessments = useCallback((): ComplianceAssessment[] => {
    const assessmentTypes = ['self_assessment', 'internal_audit', 'external_audit', 'certification'] as const;
    const statuses = ['planned', 'in_progress', 'completed', 'cancelled'] as const;
    
    return Array.from({ length: 12 }, (_, i) => {
      const type = assessmentTypes[Math.floor(Math.random() * assessmentTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        id: `assessment_${i + 1}`,
        name: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ${i + 1}`,
        framework: `Framework ${Math.floor(Math.random() * 5) + 1}`,
        scope: 'Full organizational assessment covering all applicable controls and requirements',
        type,
        status,
        assessor: {
          lead: `lead_assessor_${Math.floor(Math.random() * 3) + 1}`,
          members: [
            {
              name: `Assessor ${i + 1}`,
              role: 'Senior Auditor',
              expertise: ['Security', 'Compliance', 'Risk Management'],
              certification: ['CISA', 'CISSP', 'ISO 27001 Lead Auditor']
            }
          ],
          external: type === 'external_audit' || type === 'certification',
          organization: type === 'external_audit' ? 'External Audit Firm' : undefined,
          credentials: ['ISO 27001', 'SOC 2', 'PCI DSS']
        },
        timeline: {
          plannedStart: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
          plannedEnd: Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000,
          actualStart: status !== 'planned' ? Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000 : undefined,
          actualEnd: status === 'completed' ? Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000 : undefined,
          phases: [
            {
              name: 'Planning',
              startDate: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
              endDate: Date.now() - Math.random() * 75 * 24 * 60 * 60 * 1000,
              activities: ['Scope definition', 'Resource allocation', 'Timeline planning'],
              deliverables: ['Assessment plan', 'Resource allocation'],
              status: 'completed'
            },
            {
              name: 'Execution',
              startDate: Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000,
              endDate: Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000,
              activities: ['Control testing', 'Evidence review', 'Interviews'],
              deliverables: ['Test results', 'Evidence documentation'],
              status: status === 'completed' ? 'completed' : 'in_progress'
            }
          ]
        },
        methodology: 'Risk-based assessment approach following industry best practices',
        findings: status === 'completed' ? [
          {
            id: `finding_${i + 1}_1`,
            type: ['deficiency', 'observation', 'strength', 'recommendation'][Math.floor(Math.random() * 4)] as any,
            severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
            control: `Control-${Math.floor(Math.random() * 50) + 1}`,
            requirement: `Requirement-${Math.floor(Math.random() * 20) + 1}`,
            description: 'Assessment finding requiring management attention and remediation',
            evidence: ['Evidence Document A', 'Evidence Document B'],
            impact: 'Potential impact on security posture and compliance status',
            recommendation: 'Implement recommended controls and procedures',
            managementResponse: 'Management agrees and will implement recommendations',
            targetDate: Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000,
            responsible: 'Security Team',
            status: 'open'
          }
        ] : [],
        recommendations: [],
        conclusion: status === 'completed' ? {
          overallRating: ['excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'][Math.floor(Math.random() * 5)] as any,
          score: 60 + Math.random() * 40,
          summary: 'Overall assessment conclusion and recommendations for improvement',
          strengths: ['Strong security culture', 'Effective monitoring'],
          weaknesses: ['Documentation gaps', 'Training needs'],
          criticalIssues: [],
          recommendations: ['Improve documentation', 'Enhance training programs'],
          certification: Math.random() > 0.3,
          validityPeriod: 365,
          conditions: []
        } : {} as any,
        deliverables: ['Assessment Report', 'Executive Summary', 'Action Plan'],
        evidence: [],
        createdDate: Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000,
        lastUpdated: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      };
    });
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const mockFrameworks = generateMockFrameworks();
        const mockAssessments = generateMockAssessments();
        
        setFrameworks(mockFrameworks);
        setAssessments(mockAssessments);
        
        if (mockFrameworks.length > 0) {
          setSelectedFramework(mockFrameworks[0]);
        }
      } catch (error) {
        console.error('Error loading compliance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [generateMockFrameworks, generateMockAssessments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'implemented':
      case 'completed':
      case 'resolved':
        return 'text-green-600 bg-green-50';
      case 'partial':
      case 'in_progress':
      case 'developing':
        return 'text-yellow-600 bg-yellow-50';
      case 'non_compliant':
      case 'not_implemented':
      case 'open':
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'not_assessed':
      case 'not_applicable':
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return Shield;
      case 'privacy': return Lock;
      case 'financial': return DollarSign;
      case 'industry': return Settings;
      case 'regional': return Globe;
      default: return FileText;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Management</h1>
          <p className="text-gray-600 mt-2">Comprehensive compliance framework management and assessment platform</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="12m">Last 12 Months</option>
            <option value="24m">Last 24 Months</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Assessment</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'frameworks', name: 'Frameworks', icon: Shield },
              { id: 'controls', name: 'Controls', icon: Settings },
              { id: 'assessments', name: 'Assessments', icon: Eye },
              { id: 'gaps', name: 'Gaps & Issues', icon: AlertTriangle },
              { id: 'remediation', name: 'Remediation', icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Compliant Frameworks</p>
                      <p className="text-3xl font-bold">
                        {frameworks.filter(f => f.status === 'compliant').length}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100">Partial Compliance</p>
                      <p className="text-3xl font-bold">
                        {frameworks.filter(f => f.status === 'partial').length}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-yellow-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100">Non-Compliant</p>
                      <p className="text-3xl font-bold">
                        {frameworks.filter(f => f.status === 'non_compliant').length}
                      </p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Active Assessments</p>
                      <p className="text-3xl font-bold">
                        {assessments.filter(a => a.status === 'in_progress').length}
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-200" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Compliance Status by Framework</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {frameworks.slice(0, 6).map((framework) => {
                        const Icon = getCategoryIcon(framework.category);
                        return (
                          <div key={framework.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${getStatusColor(framework.status)}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{framework.name}</p>
                                <p className="text-sm text-gray-500">Score: {framework.overallScore.toFixed(1)}%</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(framework.status)}`}>
                              {framework.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Assessment Activity</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {assessments.slice(0, 6).map((assessment) => (
                        <div key={assessment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{assessment.name}</p>
                            <p className="text-sm text-gray-500">
                              {assessment.framework} • {assessment.type.replace('_', ' ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                              {assessment.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(assessment.lastUpdated).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Compliance Score Trends</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['security', 'privacy', 'financial'].map((category) => {
                      const categoryFrameworks = frameworks.filter(f => f.category === category);
                      const avgScore = categoryFrameworks.length > 0 ? 
                        categoryFrameworks.reduce((sum, f) => sum + f.overallScore, 0) / categoryFrameworks.length : 0;
                      
                      return (
                        <div key={category} className="text-center p-4 border border-gray-200 rounded-lg">
                          <h4 className="text-lg font-semibold text-gray-900 capitalize">{category}</h4>
                          <p className="text-3xl font-bold text-blue-600 mt-2">{avgScore.toFixed(1)}%</p>
                          <p className="text-sm text-gray-500 mt-1">{categoryFrameworks.length} frameworks</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'frameworks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search frameworks..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="security">Security</option>
                    <option value="privacy">Privacy</option>
                    <option value="financial">Financial</option>
                    <option value="industry">Industry</option>
                    <option value="regional">Regional</option>
                  </select>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="compliant">Compliant</option>
                    <option value="partial">Partial</option>
                    <option value="non_compliant">Non-Compliant</option>
                    <option value="not_assessed">Not Assessed</option>
                  </select>
                </div>
                <button 
                  onClick={() => setShowFrameworkModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Framework</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {frameworks.map((framework) => {
                  const Icon = getCategoryIcon(framework.category);
                  const implementedControls = framework.controls.filter(c => c.status === 'implemented').length;
                  const totalControls = framework.controls.length;
                  
                  return (
                    <div 
                      key={framework.id}
                      onClick={() => setSelectedFramework(framework)}
                      className={`bg-white border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                        selectedFramework?.id === framework.id
                          ? 'border-blue-500 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getStatusColor(framework.status)}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{framework.name}</h3>
                            <p className="text-sm text-gray-500">v{framework.version}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(framework.status)}`}>
                          {framework.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Compliance Score</span>
                            <span className="text-sm text-gray-900">{framework.overallScore.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                framework.overallScore >= 90 ? 'bg-green-500' :
                                framework.overallScore >= 70 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${framework.overallScore}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Controls:</span>
                          <span className="font-medium">{implementedControls}/{totalControls}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Last Assessment:</span>
                          <span className="font-medium">
                            {new Date(framework.lastAssessment).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Next Assessment:</span>
                          <span className="font-medium">
                            {new Date(framework.nextAssessment).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {framework.certificationDate && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-gold-500" />
                            <span className="text-sm text-gray-600">
                              Certified until {new Date(framework.expiryDate!).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'controls' && selectedFramework && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedFramework.name} Controls</h2>
                  <p className="text-gray-600">Control implementation status and testing results</p>
                </div>
                <div className="flex items-center space-x-4">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">All Controls</option>
                    <option value="implemented">Implemented</option>
                    <option value="partial">Partial</option>
                    <option value="not_implemented">Not Implemented</option>
                  </select>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    <span>Add Control</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {['implemented', 'partial', 'not_implemented', 'not_applicable'].map((status) => {
                  const count = selectedFramework.controls.filter(c => c.status === status).length;
                  return (
                    <div key={status} className={`rounded-lg p-6 ${getStatusColor(status)}`}>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-sm font-medium capitalize">{status.replace('_', ' ')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Control</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effectiveness</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedFramework.controls.slice(0, 15).map((control) => (
                        <tr key={control.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{control.controlId}</div>
                              <div className="text-sm text-gray-500">{control.title}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{control.category}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(control.status)}`}>
                              {control.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(control.priority)}`}>
                              {control.priority.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    control.effectiveness > 80 ? 'bg-green-500' :
                                    control.effectiveness > 60 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${control.effectiveness}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{control.effectiveness.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{control.owner}</td>
                          <td className="px-6 py-4">
                            <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assessments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search assessments..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">All Types</option>
                    <option value="self_assessment">Self Assessment</option>
                    <option value="internal_audit">Internal Audit</option>
                    <option value="external_audit">External Audit</option>
                    <option value="certification">Certification</option>
                  </select>
                </div>
                <button 
                  onClick={() => setShowAssessmentModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Assessment</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{assessment.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{assessment.framework}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                        {assessment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Type:</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {assessment.type.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Lead Assessor:</span>
                        <span className="text-sm font-medium text-gray-900">{assessment.assessor.lead}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Timeline:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(assessment.timeline.plannedStart).toLocaleDateString()} - {new Date(assessment.timeline.plannedEnd).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {assessment.status === 'completed' && assessment.conclusion && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Rating:</span>
                          <span className={`text-sm font-medium ${
                            assessment.conclusion.overallRating === 'excellent' ? 'text-green-600' :
                            assessment.conclusion.overallRating === 'good' ? 'text-blue-600' :
                            assessment.conclusion.overallRating === 'satisfactory' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {assessment.conclusion.overallRating.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Findings:</span>
                        <span className="text-sm font-medium text-gray-900">{assessment.findings.length}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button 
                        onClick={() => {
                          setSelectedAssessment(assessment);
                          setShowAssessmentModal(true);
                        }}
                        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        View Assessment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceManagement;