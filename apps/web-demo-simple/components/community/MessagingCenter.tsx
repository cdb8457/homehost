'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  MessageCircle,
  Send,
  Search,
  Filter,
  Settings,
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Smile,
  Image,
  Mic,
  MicOff,
  Users,
  User,
  Edit,
  Trash2,
  Copy,
  Reply,
  Forward,
  Flag,
  Pin,
  Archive,
  Star,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  Info,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Volume2,
  VolumeX,
  Download,
  ExternalLink,
  Calendar,
  MapPin,
  Gamepad2,
  Crown,
  Shield,
  Heart,
  ThumbsUp,
  Zap,
  Fire,
  Sparkles,
  Camera,
  FileText,
  Link,
  Hash,
  AtSign,
  Maximize,
  Minimize,
  RefreshCw,
  Bell,
  BellOff
} from 'lucide-react';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: MessageContent;
  type: 'text' | 'image' | 'video' | 'file' | 'voice' | 'system' | 'game_invite' | 'server_invite';
  timestamp: string;
  edited: boolean;
  editedAt?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  reactions: MessageReaction[];
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
  forwarded?: boolean;
  pinned: boolean;
}

interface MessageContent {
  text?: string;
  media?: MediaAttachment[];
  file?: FileAttachment;
  voice?: VoiceAttachment;
  gameInvite?: GameInvite;
  serverInvite?: ServerInvite;
  system?: SystemMessage;
}

interface MediaAttachment {
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnail?: string;
  caption?: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    duration?: number;
  };
}

interface FileAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
  thumbnail?: string;
}

interface VoiceAttachment {
  url: string;
  duration: number;
  waveform: number[];
}

interface GameInvite {
  game: string;
  server: string;
  serverAddress: string;
  playerCount: number;
  maxPlayers: number;
  expiresAt: string;
}

interface ServerInvite {
  serverId: string;
  serverName: string;
  serverIcon: string;
  memberCount: number;
  expiresAt: string;
}

interface SystemMessage {
  type: 'user_join' | 'user_leave' | 'name_change' | 'role_change' | 'channel_create';
  data: Record<string, any>;
}

interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
  userReacted: boolean;
}

interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name?: string;
  avatar?: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  muted: boolean;
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: {
    canSendMessages: boolean;
    canSendMedia: boolean;
    canManageMessages: boolean;
    canInviteUsers: boolean;
  };
}

interface Participant {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  role?: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  lastSeen: string;
}

interface MessagingCenterProps {
  currentUserId: string;
  initialConversationId?: string;
  compact?: boolean;
}

export default function MessagingCenter({
  currentUserId,
  initialConversationId,
  compact = false
}: MessagingCenterProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [isRecording, setIsRecording] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiClient = new ApiClient();

  useEffect(() => {
    loadConversations();
  }, [currentUserId]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate loading conversations
      const mockConversations = generateMockConversations();
      setConversations(mockConversations);
      
      if (!activeConversation && mockConversations.length > 0) {
        setActiveConversation(mockConversations[0].id);
      }
    } catch (err) {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      
      // Simulate loading messages
      const mockMessages = generateMockMessages(conversationId);
      setMessages(mockMessages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const generateMockConversations = (): Conversation[] => [
    {
      id: '1',
      type: 'direct',
      participants: [
        {
          id: 'user1',
          username: 'BuildMaster42',
          displayName: 'Build Master',
          avatar: '/api/placeholder/40/40',
          status: 'online',
          joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastSeen: new Date().toISOString()
        }
      ],
      unreadCount: 3,
      muted: false,
      pinned: true,
      archived: false,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      permissions: {
        canSendMessages: true,
        canSendMedia: true,
        canManageMessages: false,
        canInviteUsers: false
      }
    },
    {
      id: '2',
      type: 'group',
      name: 'Building Team',
      avatar: '/api/placeholder/40/40',
      participants: [
        {
          id: 'user1',
          username: 'BuildMaster42',
          displayName: 'Build Master',
          avatar: '/api/placeholder/32/32',
          status: 'online',
          role: 'admin',
          joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          lastSeen: new Date().toISOString()
        },
        {
          id: 'user2',
          username: 'CreativeGenius',
          displayName: 'Creative Genius',
          avatar: '/api/placeholder/32/32',
          status: 'away',
          role: 'member',
          joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      ],
      unreadCount: 0,
      muted: false,
      pinned: false,
      archived: false,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      permissions: {
        canSendMessages: true,
        canSendMedia: true,
        canManageMessages: false,
        canInviteUsers: true
      }
    },
    {
      id: '3',
      type: 'direct',
      participants: [
        {
          id: 'user3',
          username: 'PvPWarrior',
          displayName: 'PvP Warrior',
          avatar: '/api/placeholder/40/40',
          status: 'busy',
          joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        }
      ],
      unreadCount: 1,
      muted: false,
      pinned: false,
      archived: false,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      permissions: {
        canSendMessages: true,
        canSendMedia: true,
        canManageMessages: false,
        canInviteUsers: false
      }
    }
  ];

  const generateMockMessages = (conversationId: string): Message[] => [
    {
      id: '1',
      conversationId,
      senderId: 'user1',
      senderName: 'Build Master',
      senderAvatar: '/api/placeholder/32/32',
      content: {
        text: 'Hey! I just finished working on that medieval castle project. Want to check it out?'
      },
      type: 'text',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      edited: false,
      status: 'read',
      reactions: [
        { emoji: '👍', count: 2, users: ['user2', 'user3'], userReacted: false },
        { emoji: '🔥', count: 1, users: ['user2'], userReacted: false }
      ],
      pinned: false
    },
    {
      id: '2',
      conversationId,
      senderId: currentUserId,
      senderName: 'You',
      senderAvatar: '/api/placeholder/32/32',
      content: {
        text: 'Absolutely! I\'d love to see what you\'ve built. Your castles are always incredible.'
      },
      type: 'text',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      edited: false,
      status: 'read',
      reactions: [],
      pinned: false
    },
    {
      id: '3',
      conversationId,
      senderId: 'user1',
      senderName: 'Build Master',
      senderAvatar: '/api/placeholder/32/32',
      content: {
        media: [
          {
            type: 'image',
            url: '/api/placeholder/400/300',
            caption: 'The main castle entrance with working drawbridge',
            metadata: { width: 1920, height: 1080, size: 2500000 }
          }
        ]
      },
      type: 'image',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      edited: false,
      status: 'read',
      reactions: [
        { emoji: '😍', count: 3, users: ['user2', 'user3', currentUserId], userReacted: true }
      ],
      pinned: false
    },
    {
      id: '4',
      conversationId,
      senderId: 'user1',
      senderName: 'Build Master',
      senderAvatar: '/api/placeholder/32/32',
      content: {
        gameInvite: {
          game: 'Minecraft',
          server: 'Creative Builders',
          serverAddress: 'creative.epicgaming.com:25566',
          playerCount: 12,
          maxPlayers: 30,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      },
      type: 'game_invite',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      edited: false,
      status: 'delivered',
      reactions: [],
      pinned: false
    },
    {
      id: '5',
      conversationId,
      senderId: currentUserId,
      senderName: 'You',
      senderAvatar: '/api/placeholder/32/32',
      content: {
        text: 'That looks amazing! The detail work on the towers is incredible. I\'ll hop on the server now to see it in person.'
      },
      type: 'text',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      edited: false,
      status: 'sent',
      reactions: [],
      replyTo: {
        messageId: '3',
        content: 'The main castle entrance with working drawbridge',
        senderName: 'Build Master'
      },
      pinned: false
    }
  ];

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId: activeConversation,
      senderId: currentUserId,
      senderName: 'You',
      senderAvatar: '/api/placeholder/32/32',
      content: { text: messageInput },
      type: 'text',
      timestamp: new Date().toISOString(),
      edited: false,
      status: 'sending',
      reactions: [],
      replyTo: replyingTo ? {
        messageId: replyingTo.id,
        content: replyingTo.content.text || 'Media message',
        senderName: replyingTo.senderName
      } : undefined,
      pinned: false
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    setReplyingTo(null);

    // Simulate message sending
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    }, 1000);
  };

  const handleReactToMessage = async (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(message => {
      if (message.id !== messageId) return message;

      const existingReaction = message.reactions.find(r => r.emoji === emoji);
      if (existingReaction) {
        if (existingReaction.userReacted) {
          // Remove reaction
          return {
            ...message,
            reactions: message.reactions.map(r => 
              r.emoji === emoji 
                ? { 
                    ...r, 
                    count: r.count - 1, 
                    users: r.users.filter(u => u !== currentUserId),
                    userReacted: false 
                  }
                : r
            ).filter(r => r.count > 0)
          };
        } else {
          // Add reaction
          return {
            ...message,
            reactions: message.reactions.map(r => 
              r.emoji === emoji 
                ? { 
                    ...r, 
                    count: r.count + 1, 
                    users: [...r.users, currentUserId],
                    userReacted: true 
                  }
                : r
            )
          };
        }
      } else {
        // New reaction
        return {
          ...message,
          reactions: [...message.reactions, {
            emoji,
            count: 1,
            users: [currentUserId],
            userReacted: true
          }]
        };
      }
    }));
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    setMessages(prev => prev.map(message => 
      message.id === messageId 
        ? { 
            ...message, 
            content: { ...message.content, text: newContent },
            edited: true,
            editedAt: new Date().toISOString()
          }
        : message
    ));
    setEditingMessage(null);
  };

  const handleDeleteMessage = async (messageId: string) => {
    setMessages(prev => prev.filter(message => message.id !== messageId));
  };

  const handleFileUpload = async (files: FileList) => {
    // Handle file upload logic
    console.log('Uploading files:', files);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === 'group' || conversation.type === 'channel') {
      return conversation.name || 'Group Chat';
    }
    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
    return otherParticipant?.displayName || 'Unknown User';
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.avatar) return conversation.avatar;
    if (conversation.type === 'group' || conversation.type === 'channel') {
      return '/api/placeholder/40/40';
    }
    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
    return otherParticipant?.avatar || '/api/placeholder/40/40';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sending': return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent': return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-blue-400" />;
      default: return null;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const activeConv = conversations.find(c => c.id === activeConversation);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading messages..." />
      </div>
    );
  }

  return (
    <div className={`flex h-full ${compact ? 'max-h-96' : 'h-screen'} bg-gray-900`}>
      {/* Conversations Sidebar */}
      <div className={`${compact ? 'w-80' : 'w-96'} bg-gray-800 border-r border-gray-700 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Messages</h2>
            <button className="p-2 text-gray-400 hover:text-white rounded">
              <Settings className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setActiveConversation(conversation.id)}
              className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${
                activeConversation === conversation.id ? 'bg-gray-700' : 'hover:bg-gray-750'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img
                    src={getConversationAvatar(conversation)}
                    alt={getConversationName(conversation)}
                    className="w-12 h-12 rounded-full"
                  />
                  {conversation.type === 'direct' && (
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                      getStatusColor(conversation.participants.find(p => p.id !== currentUserId)?.status || 'offline')
                    }`} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-white truncate">
                      {getConversationName(conversation)}
                    </h3>
                    <div className="flex items-center gap-1">
                      {conversation.pinned && <Pin className="w-3 h-3 text-blue-400" />}
                      {conversation.muted && <VolumeX className="w-3 h-3 text-gray-400" />}
                      <span className="text-xs text-gray-400">
                        {formatTime(conversation.updatedAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400 truncate">
                      {conversation.lastMessage?.content.text || 'No messages yet'}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={getConversationAvatar(activeConv)}
                    alt={getConversationName(activeConv)}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium text-white">{getConversationName(activeConv)}</h3>
                    <p className="text-sm text-gray-400">
                      {activeConv.type === 'direct' 
                        ? activeConv.participants.find(p => p.id !== currentUserId)?.status || 'offline'
                        : `${activeConv.participants.length} members`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-white rounded">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white rounded">
                    <Video className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="p-2 text-gray-400 hover:text-white rounded"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white rounded">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner size="md" text="Loading messages..." />
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.senderId === currentUserId ? 'flex-row-reverse' : ''}`}
                  >
                    <img
                      src={message.senderAvatar}
                      alt={message.senderName}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    
                    <div className={`max-w-lg ${message.senderId === currentUserId ? 'items-end' : 'items-start'} flex flex-col`}>
                      {/* Reply Reference */}
                      {message.replyTo && (
                        <div className="mb-1 px-3 py-2 bg-gray-700 rounded-lg text-sm">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Reply className="w-3 h-3" />
                            <span>Replying to {message.replyTo.senderName}</span>
                          </div>
                          <p className="text-gray-300 truncate">{message.replyTo.content}</p>
                        </div>
                      )}
                      
                      {/* Message Content */}
                      <div className={`rounded-lg p-3 ${
                        message.senderId === currentUserId 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-200'
                      }`}>
                        {/* Text Content */}
                        {message.content.text && (
                          <p className="whitespace-pre-wrap">{message.content.text}</p>
                        )}
                        
                        {/* Media Content */}
                        {message.content.media && message.content.media.length > 0 && (
                          <div className="space-y-2">
                            {message.content.media.map((media, index) => (
                              <div key={index}>
                                <img
                                  src={media.url}
                                  alt={media.caption || 'Media'}
                                  className="max-w-full rounded"
                                />
                                {media.caption && (
                                  <p className="text-sm mt-1">{media.caption}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Game Invite */}
                        {message.content.gameInvite && (
                          <div className="bg-green-900 bg-opacity-50 rounded-lg p-3 border border-green-600">
                            <div className="flex items-center gap-2 mb-2">
                              <Gamepad2 className="w-5 h-5 text-green-400" />
                              <span className="font-medium text-green-200">Game Invitation</span>
                            </div>
                            <h4 className="font-bold text-white">{message.content.gameInvite.game}</h4>
                            <p className="text-green-300">{message.content.gameInvite.server}</p>
                            <div className="flex items-center justify-between mt-2 text-sm">
                              <span className="text-green-400">
                                {message.content.gameInvite.playerCount}/{message.content.gameInvite.maxPlayers} players
                              </span>
                              <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors">
                                Join Game
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Message Footer */}
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>{formatTime(message.timestamp)}</span>
                        {message.edited && <span>• edited</span>}
                        {message.senderId === currentUserId && getMessageStatusIcon(message.status)}
                      </div>
                      
                      {/* Reactions */}
                      {message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.reactions.map((reaction) => (
                            <button
                              key={reaction.emoji}
                              onClick={() => handleReactToMessage(message.id, reaction.emoji)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                                reaction.userReacted 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              <span>{reaction.emoji}</span>
                              <span>{reaction.count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Banner */}
            {replyingTo && (
              <div className="px-4 py-2 bg-gray-700 border-t border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Reply className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-blue-400">Replying to {replyingTo.senderName}</span>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-300 truncate ml-6">
                  {replyingTo.content.text || 'Media message'}
                </p>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <div className="flex items-end gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    className="p-2 text-gray-400 hover:text-white rounded"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  {showAttachmentMenu && (
                    <div className="absolute bottom-full left-0 mb-2 bg-gray-700 rounded-lg border border-gray-600 p-2">
                      <div className="space-y-1">
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-600 rounded">
                          <Image className="w-4 h-4" />
                          Photo
                        </button>
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-600 rounded">
                          <FileText className="w-4 h-4" />
                          File
                        </button>
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-600 rounded">
                          <Gamepad2 className="w-4 h-4" />
                          Game Invite
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <textarea
                    ref={messageInputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
                    rows={1}
                  />
                </div>
                
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-400 hover:text-white rounded"
                >
                  <Smile className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Participants Panel */}
      {showParticipants && activeConv && activeConv.type !== 'direct' && (
        <div className="w-64 bg-gray-800 border-l border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Participants</h3>
          <div className="space-y-3">
            {activeConv.participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={participant.avatar}
                    alt={participant.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(participant.status)}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{participant.displayName}</span>
                    {participant.role === 'admin' && <Crown className="w-4 h-4 text-yellow-500" />}
                    {participant.role === 'moderator' && <Shield className="w-4 h-4 text-blue-500" />}
                  </div>
                  <span className="text-xs text-gray-400 capitalize">{participant.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  );
}