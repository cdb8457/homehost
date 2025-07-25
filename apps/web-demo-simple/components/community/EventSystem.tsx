'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  Target,
  Award,
  Star,
  Crown,
  Shield,
  Gamepad2,
  MapPin,
  Globe,
  Lock,
  Unlock,
  Eye,
  Edit,
  Save,
  Trash2,
  Plus,
  Minus,
  X,
  Check,
  CheckCircle,
  AlertCircle,
  Info,
  Search,
  Filter,
  Settings,
  Share2,
  Copy,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  Bell,
  BellOff,
  Heart,
  ThumbsUp,
  MessageCircle,
  Flag,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Square,
  Zap,
  Fire,
  Sparkles,
  Lightbulb,
  TrendingUp,
  Activity,
  DollarSign,
  Gift,
  Ticket,
  Medal,
  Camera,
  Video,
  FileText,
  Link2,
  Hash,
  AtSign
} from 'lucide-react';

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'tournament' | 'building_contest' | 'community_meetup' | 'pvp_tournament' | 'creative_showcase' | 'training_session' | 'celebration' | 'fundraiser';
  status: 'draft' | 'scheduled' | 'registration_open' | 'registration_closed' | 'live' | 'completed' | 'cancelled';
  visibility: 'public' | 'members_only' | 'invite_only' | 'private';
  organizer: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    role: 'owner' | 'admin' | 'moderator' | 'member';
  };
  schedule: {
    startTime: string;
    endTime: string;
    registrationStart: string;
    registrationEnd: string;
    timezone: string;
  };
  location: {
    type: 'server' | 'discord' | 'external' | 'multiple';
    details: string;
    serverInfo?: {
      serverId: string;
      serverName: string;
      gameType: string;
      address: string;
    };
  };
  participants: {
    registered: number;
    maxParticipants: number;
    waitlist: number;
    teams?: number;
    maxTeams?: number;
  };
  requirements: {
    minLevel?: number;
    minReputation?: number;
    requiredBadges?: string[];
    gameRequirements?: string[];
    equipmentNeeded?: string[];
  };
  prizes: EventPrize[];
  rules: string;
  format: EventFormat;
  registration: {
    requiresApproval: boolean;
    allowTeams: boolean;
    teamSize?: number;
    registrationFee?: number;
    cancellationPolicy: string;
  };
  media: {
    banner: string;
    gallery: string[];
    trailer?: string;
  };
  sponsors: EventSponsor[];
  tags: string[];
  featured: boolean;
  trending: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EventPrize {
  id: string;
  position: number;
  title: string;
  description: string;
  type: 'cash' | 'item' | 'badge' | 'rank' | 'access' | 'custom';
  value: string;
  image?: string;
  sponsor?: string;
}

interface EventFormat {
  type: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss' | 'bracket' | 'freestyle' | 'time_based' | 'score_based';
  rounds?: number;
  timePerRound?: number;
  scoringSystem?: string;
  brackets?: TournamentBracket[];
}

interface TournamentBracket {
  id: string;
  round: number;
  matches: BracketMatch[];
}

interface BracketMatch {
  id: string;
  participants: MatchParticipant[];
  winner?: string;
  score?: string;
  startTime?: string;
  status: 'pending' | 'live' | 'completed' | 'cancelled';
}

interface MatchParticipant {
  id: string;
  name: string;
  avatar: string;
  seed?: number;
  score?: number;
}

interface EventSponsor {
  id: string;
  name: string;
  logo: string;
  tier: 'title' | 'presenting' | 'official' | 'supporting';
  contribution: string;
}

interface EventRegistration {
  id: string;
  eventId: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  teamName?: string;
  teamMembers?: string[];
  registeredAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'waitlisted';
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
}

interface EventSystemProps {
  serverId?: string;
  userId: string;
  userRole: 'owner' | 'admin' | 'moderator' | 'member';
  compact?: boolean;
}

export default function EventSystem({
  serverId,
  userId,
  userRole,
  compact = false
}: EventSystemProps) {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'live' | 'past' | 'manage' | 'create'>('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const apiClient = new ApiClient();

  useEffect(() => {
    loadEventData();
  }, [serverId, userId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate loading event data
      const mockEvents = generateMockEvents();
      const mockRegistrations = generateMockRegistrations();

      setEvents(mockEvents);
      setRegistrations(mockRegistrations);
    } catch (err) {
      setError('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockEvents = (): CommunityEvent[] => [
    {
      id: '1',
      title: 'Epic Building Championship 2024',
      description: 'The ultimate creative building contest where imagination meets skill. Participants will have 3 hours to create the most impressive medieval castle. Judged by our community experts on creativity, technical skill, and adherence to theme.',
      type: 'building_contest',
      status: 'registration_open',
      visibility: 'public',
      organizer: {
        id: 'org1',
        username: 'EventMaster',
        displayName: 'Event Master',
        avatar: '/api/placeholder/40/40',
        role: 'admin'
      },
      schedule: {
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        registrationStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        registrationEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        timezone: 'UTC'
      },
      location: {
        type: 'server',
        details: 'Creative Building Server - Plot World',
        serverInfo: {
          serverId: 'server1',
          serverName: 'Creative Builders',
          gameType: 'Minecraft',
          address: 'creative.epicgaming.com:25566'
        }
      },
      participants: {
        registered: 47,
        maxParticipants: 100,
        waitlist: 3
      },
      requirements: {
        minLevel: 10,
        minReputation: 70,
        gameRequirements: ['Minecraft Java Edition 1.20+'],
        equipmentNeeded: ['Microphone for voice chat (optional)']
      },
      prizes: [
        {
          id: '1',
          position: 1,
          title: 'Grand Champion',
          description: 'Master Builder rank + $100 gift card',
          type: 'custom',
          value: '$100 + Rank',
          image: '/api/placeholder/64/64'
        },
        {
          id: '2',
          position: 2,
          title: 'Second Place',
          description: 'Expert Builder rank + $50 gift card',
          type: 'custom',
          value: '$50 + Rank',
          image: '/api/placeholder/64/64'
        },
        {
          id: '3',
          position: 3,
          title: 'Third Place',
          description: 'Advanced Builder rank + $25 gift card',
          type: 'custom',
          value: '$25 + Rank',
          image: '/api/placeholder/64/64'
        }
      ],
      rules: `1. All builds must be original work created during the event
2. Theme: Medieval Castles - must include towers, walls, and a main keep
3. No pre-built templates or copy/paste from external sources
4. Time limit: 3 hours from event start
5. Judging criteria: Creativity (40%), Technical skill (30%), Theme adherence (30%)
6. Respectful behavior required - no griefing or toxic language
7. Screenshots will be taken for judging - ensure good lighting`,
      format: {
        type: 'time_based',
        timePerRound: 180,
        scoringSystem: 'Judge scoring (1-100 points per category)'
      },
      registration: {
        requiresApproval: false,
        allowTeams: false,
        cancellationPolicy: 'Free cancellation up to 24 hours before event'
      },
      media: {
        banner: '/api/placeholder/800/300',
        gallery: ['/api/placeholder/300/200', '/api/placeholder/300/200', '/api/placeholder/300/200']
      },
      sponsors: [
        {
          id: '1',
          name: 'BlockCraft Tools',
          logo: '/api/placeholder/100/50',
          tier: 'title',
          contribution: 'Prize sponsorship and building tools'
        }
      ],
      tags: ['building', 'creative', 'medieval', 'contest', 'prizes'],
      featured: true,
      trending: true,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: 'Weekly PvP Tournament',
      description: 'Fast-paced 1v1 PvP battles in our custom arena. Prove your combat skills and climb the leaderboard!',
      type: 'pvp_tournament',
      status: 'live',
      visibility: 'public',
      organizer: {
        id: 'org2',
        username: 'PvPMaster',
        displayName: 'PvP Master',
        avatar: '/api/placeholder/40/40',
        role: 'moderator'
      },
      schedule: {
        startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
        registrationStart: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        registrationEnd: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        timezone: 'UTC'
      },
      location: {
        type: 'server',
        details: 'PvP Arena - Tournament Grounds',
        serverInfo: {
          serverId: 'server2',
          serverName: 'PvP Arena',
          gameType: 'Minecraft',
          address: 'pvp.epicgaming.com:25567'
        }
      },
      participants: {
        registered: 32,
        maxParticipants: 32,
        waitlist: 8
      },
      requirements: {
        minLevel: 15,
        minReputation: 60,
        requiredBadges: ['PvP Novice']
      },
      prizes: [
        {
          id: '1',
          position: 1,
          title: 'Tournament Champion',
          description: 'Champion rank + exclusive weapon skin',
          type: 'rank',
          value: 'Champion Rank + Skin'
        }
      ],
      rules: 'Standard PvP rules apply. No external modifications or cheats.',
      format: {
        type: 'single_elimination',
        rounds: 5
      },
      registration: {
        requiresApproval: false,
        allowTeams: false,
        cancellationPolicy: 'No cancellation after registration closes'
      },
      media: {
        banner: '/api/placeholder/800/300',
        gallery: []
      },
      sponsors: [],
      tags: ['pvp', 'tournament', 'combat', 'weekly'],
      featured: false,
      trending: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      title: 'Community Movie Night',
      description: 'Join us for a relaxing movie night! We\'ll be watching classic gaming documentaries and community-made content.',
      type: 'community_meetup',
      status: 'scheduled',
      visibility: 'members_only',
      organizer: {
        id: 'org3',
        username: 'CommunityHost',
        displayName: 'Community Host',
        avatar: '/api/placeholder/40/40',
        role: 'admin'
      },
      schedule: {
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        registrationStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        registrationEnd: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        timezone: 'UTC'
      },
      location: {
        type: 'discord',
        details: 'Community Discord - Movie Room'
      },
      participants: {
        registered: 23,
        maxParticipants: 50,
        waitlist: 0
      },
      requirements: {},
      prizes: [],
      rules: 'Be respectful and enjoy the movies! Popcorn recommended.',
      format: {
        type: 'freestyle'
      },
      registration: {
        requiresApproval: false,
        allowTeams: false,
        cancellationPolicy: 'Free cancellation anytime'
      },
      media: {
        banner: '/api/placeholder/800/300',
        gallery: []
      },
      sponsors: [],
      tags: ['community', 'social', 'movies', 'relaxed'],
      featured: false,
      trending: false,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const generateMockRegistrations = (): EventRegistration[] => [
    {
      id: '1',
      eventId: '1',
      participantId: userId,
      participantName: 'You',
      participantAvatar: '/api/placeholder/32/32',
      registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'approved'
    }
  ];

  const handleRegisterForEvent = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const newRegistration: EventRegistration = {
      id: Date.now().toString(),
      eventId,
      participantId: userId,
      participantName: 'You',
      participantAvatar: '/api/placeholder/32/32',
      registeredAt: new Date().toISOString(),
      status: event.registration.requiresApproval ? 'pending' : 'approved'
    };

    setRegistrations(prev => [...prev, newRegistration]);
    
    // Update participant count
    setEvents(prev => prev.map(e => 
      e.id === eventId 
        ? { ...e, participants: { ...e.participants, registered: e.participants.registered + 1 }}
        : e
    ));

    setShowRegistrationModal(false);
  };

  const handleCancelRegistration = async (eventId: string) => {
    setRegistrations(prev => prev.filter(r => r.eventId !== eventId || r.participantId !== userId));
    
    // Update participant count
    setEvents(prev => prev.map(e => 
      e.id === eventId 
        ? { ...e, participants: { ...e.participants, registered: e.participants.registered - 1 }}
        : e
    ));
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'tournament': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'building_contest': return <Award className="w-5 h-5 text-blue-500" />;
      case 'community_meetup': return <Users className="w-5 h-5 text-green-500" />;
      case 'pvp_tournament': return <Target className="w-5 h-5 text-red-500" />;
      case 'creative_showcase': return <Star className="w-5 h-5 text-purple-500" />;
      case 'training_session': return <Gamepad2 className="w-5 h-5 text-orange-500" />;
      case 'celebration': return <Sparkles className="w-5 h-5 text-pink-500" />;
      case 'fundraiser': return <Heart className="w-5 h-5 text-rose-500" />;
      default: return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-red-400 bg-red-900';
      case 'registration_open': return 'text-green-400 bg-green-900';
      case 'registration_closed': return 'text-yellow-400 bg-yellow-900';
      case 'scheduled': return 'text-blue-400 bg-blue-900';
      case 'completed': return 'text-gray-400 bg-gray-700';
      case 'cancelled': return 'text-red-400 bg-red-900';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4 text-green-500" />;
      case 'members_only': return <Users className="w-4 h-4 text-blue-500" />;
      case 'invite_only': return <Lock className="w-4 h-4 text-yellow-500" />;
      case 'private': return <Eye className="w-4 h-4 text-red-500" />;
      default: return <Globe className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      return `${Math.round(diffMinutes)}m`;
    }
    return `${diffHours.toFixed(1)}h`;
  };

  const isUserRegistered = (eventId: string) => {
    return registrations.some(r => r.eventId === eventId && r.participantId === userId);
  };

  const canUserRegister = (event: CommunityEvent) => {
    if (isUserRegistered(event.id)) return false;
    if (event.status !== 'registration_open') return false;
    if (event.participants.registered >= event.participants.maxParticipants) return false;
    
    // Check requirements
    if (event.requirements.minLevel && event.requirements.minLevel > 25) return false; // Mock user level
    if (event.requirements.minReputation && event.requirements.minReputation > 85) return false; // Mock user reputation
    
    return true;
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = eventTypeFilter === 'all' || event.type === eventTypeFilter;
    
    let matchesTab = true;
    const now = new Date();
    const startTime = new Date(event.schedule.startTime);
    const endTime = new Date(event.schedule.endTime);
    
    switch (selectedTab) {
      case 'upcoming':
        matchesTab = startTime > now;
        break;
      case 'live':
        matchesTab = startTime <= now && endTime > now;
        break;
      case 'past':
        matchesTab = endTime <= now;
        break;
      case 'manage':
        matchesTab = event.organizer.id === userId || ['owner', 'admin'].includes(userRole);
        break;
    }
    
    return matchesSearch && matchesType && matchesTab;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading events..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            Community Events
          </h2>
          <p className="text-gray-400">Discover and participate in exciting community events</p>
        </div>
        
        <div className="flex items-center gap-2">
          {(['owner', 'admin', 'moderator'].includes(userRole)) && (
            <button
              onClick={() => setShowCreateEvent(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
          )}
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            {viewMode === 'grid' ? <Activity className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'upcoming', label: 'Upcoming', icon: Clock, count: events.filter(e => new Date(e.schedule.startTime) > new Date()).length },
          { id: 'live', label: 'Live', icon: Play, count: events.filter(e => {
            const now = new Date();
            return new Date(e.schedule.startTime) <= now && new Date(e.schedule.endTime) > now;
          }).length },
          { id: 'past', label: 'Past', icon: CheckCircle, count: events.filter(e => new Date(e.schedule.endTime) <= new Date()).length },
          ...((['owner', 'admin', 'moderator'].includes(userRole)) ? [
            { id: 'manage', label: 'Manage', icon: Settings, count: events.filter(e => e.organizer.id === userId).length }
          ] : [])
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <select
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="tournament">Tournaments</option>
          <option value="building_contest">Building Contests</option>
          <option value="community_meetup">Community Meetups</option>
          <option value="pvp_tournament">PvP Tournaments</option>
          <option value="creative_showcase">Creative Showcases</option>
          <option value="training_session">Training Sessions</option>
        </select>
      </div>

      {/* Events Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              {/* Event Banner */}
              <div className="relative">
                <img
                  src={event.media.banner}
                  alt={event.title}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute top-2 left-2 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status.replace('_', ' ')}
                  </span>
                  {event.featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                  {event.trending && <TrendingUp className="w-4 h-4 text-red-500" />}
                </div>
                <div className="absolute top-2 right-2">
                  {getVisibilityIcon(event.visibility)}
                </div>
              </div>

              <div className="p-4">
                {/* Event Header */}
                <div className="flex items-start gap-2 mb-2">
                  {getEventTypeIcon(event.type)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-white line-clamp-2">{event.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{event.description}</p>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatDateTime(event.schedule.startTime).date}</span>
                    <span>{formatDateTime(event.schedule.startTime).time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{event.participants.registered}/{event.participants.maxParticipants} participants</span>
                  </div>
                  
                  {event.location.serverInfo && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location.serverInfo.serverName}</span>
                    </div>
                  )}
                </div>

                {/* Prizes Preview */}
                {event.prizes.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-400">Prizes</span>
                    </div>
                    <div className="text-sm text-gray-300">
                      {event.prizes[0].title}: {event.prizes[0].value}
                      {event.prizes.length > 1 && ` +${event.prizes.length - 1} more`}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                  >
                    View Details
                  </button>
                  
                  {isUserRegistered(event.id) ? (
                    <button
                      onClick={() => handleCancelRegistration(event.id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : canUserRegister(event) ? (
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowRegistrationModal(true);
                      }}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-3 py-2 bg-gray-600 text-gray-400 rounded cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {event.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                  {event.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                      +{event.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={event.media.banner}
                    alt={event.title}
                    className="w-16 h-16 rounded object-cover"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getEventTypeIcon(event.type)}
                      <h3 className="font-semibold text-white">{event.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status.replace('_', ' ')}
                      </span>
                      {event.featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-2 line-clamp-2">{event.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(event.schedule.startTime).date} at {formatDateTime(event.schedule.startTime).time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{event.participants.registered}/{event.participants.maxParticipants}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        <span>{event.prizes.length} prizes</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                  >
                    Details
                  </button>
                  
                  {isUserRegistered(event.id) ? (
                    <button
                      onClick={() => handleCancelRegistration(event.id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      Cancel
                    </button>
                  ) : canUserRegister(event) ? (
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowRegistrationModal(true);
                      }}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      Register
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-3 py-2 bg-gray-600 text-gray-400 rounded cursor-not-allowed"
                    >
                      Unavailable
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No events found</h3>
          <p className="text-gray-500">
            {searchTerm || eventTypeFilter !== 'all'
              ? 'No events match your current filters.'
              : 'No events are currently scheduled. Check back later!'}
          </p>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && !showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">{selectedEvent.title}</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Event Banner */}
              <img
                src={selectedEvent.media.banner}
                alt={selectedEvent.title}
                className="w-full h-48 object-cover rounded-lg"
              />

              {/* Event Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Description</h3>
                    <p className="text-gray-300">{selectedEvent.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">Schedule</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div>Start: {formatDateTime(selectedEvent.schedule.startTime).date} at {formatDateTime(selectedEvent.schedule.startTime).time}</div>
                      <div>Duration: {formatDuration(selectedEvent.schedule.startTime, selectedEvent.schedule.endTime)}</div>
                      <div>Registration ends: {formatDateTime(selectedEvent.schedule.registrationEnd).date}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">Location</h3>
                    <div className="text-gray-300">
                      {selectedEvent.location.serverInfo ? (
                        <div>
                          <div>{selectedEvent.location.serverInfo.serverName}</div>
                          <div className="text-sm text-gray-400">{selectedEvent.location.serverInfo.address}</div>
                        </div>
                      ) : (
                        selectedEvent.location.details
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Participants</h3>
                    <div className="text-gray-300">
                      {selectedEvent.participants.registered} / {selectedEvent.participants.maxParticipants} registered
                      {selectedEvent.participants.waitlist > 0 && (
                        <div className="text-sm text-gray-400">{selectedEvent.participants.waitlist} on waitlist</div>
                      )}
                    </div>
                  </div>

                  {selectedEvent.requirements && Object.keys(selectedEvent.requirements).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-white mb-2">Requirements</h3>
                      <div className="space-y-1 text-sm text-gray-300">
                        {selectedEvent.requirements.minLevel && (
                          <div>Minimum Level: {selectedEvent.requirements.minLevel}</div>
                        )}
                        {selectedEvent.requirements.minReputation && (
                          <div>Minimum Reputation: {selectedEvent.requirements.minReputation}</div>
                        )}
                        {selectedEvent.requirements.gameRequirements && (
                          <div>Game: {selectedEvent.requirements.gameRequirements.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedEvent.prizes.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-white mb-2">Prizes</h3>
                      <div className="space-y-2">
                        {selectedEvent.prizes.map((prize) => (
                          <div key={prize.id} className="flex items-center gap-3 p-2 bg-gray-700 rounded">
                            <div className="w-8 h-8 bg-yellow-600 rounded flex items-center justify-center text-white font-bold text-sm">
                              {prize.position}
                            </div>
                            <div>
                              <div className="font-medium text-white">{prize.title}</div>
                              <div className="text-sm text-gray-400">{prize.value}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rules */}
              {selectedEvent.rules && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Rules</h3>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <pre className="text-gray-300 whitespace-pre-wrap text-sm">{selectedEvent.rules}</pre>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-700">
                {isUserRegistered(selectedEvent.id) ? (
                  <button
                    onClick={() => handleCancelRegistration(selectedEvent.id)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Cancel Registration
                  </button>
                ) : canUserRegister(selectedEvent) ? (
                  <button
                    onClick={() => setShowRegistrationModal(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Register for Event
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-6 py-3 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed"
                  >
                    Registration Unavailable
                  </button>
                )}
                
                <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                  Share Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Register for Event</h2>
              <button
                onClick={() => setShowRegistrationModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">{selectedEvent.title}</h3>
                <p className="text-gray-400 text-sm">{formatDateTime(selectedEvent.schedule.startTime).date} at {formatDateTime(selectedEvent.schedule.startTime).time}</p>
              </div>

              {selectedEvent.registration.registrationFee && (
                <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-200">Registration Fee: ${selectedEvent.registration.registrationFee}</span>
                  </div>
                </div>
              )}

              {selectedEvent.registration.requiresApproval && (
                <div className="bg-blue-900 border border-blue-600 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-200">Registration requires approval</span>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-400">
                <strong>Cancellation Policy:</strong> {selectedEvent.registration.cancellationPolicy}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowRegistrationModal(false)}
                  className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRegisterForEvent(selectedEvent.id)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Confirm Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}