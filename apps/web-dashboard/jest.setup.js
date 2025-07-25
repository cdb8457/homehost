import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: ({ className }) => <div className={className}>Search</div>,
  Filter: ({ className }) => <div className={className}>Filter</div>,
  Users: ({ className }) => <div className={className}>Users</div>,
  Star: ({ className }) => <div className={className}>Star</div>,
  TrendingUp: ({ className }) => <div className={className}>TrendingUp</div>,
  Activity: ({ className }) => <div className={className}>Activity</div>,
  Sparkles: ({ className }) => <div className={className}>Sparkles</div>,
  Globe: ({ className }) => <div className={className}>Globe</div>,
  Heart: ({ className }) => <div className={className}>Heart</div>,
  Trophy: ({ className }) => <div className={className}>Trophy</div>,
  Coffee: ({ className }) => <div className={className}>Coffee</div>,
  Grid3X3: ({ className }) => <div className={className}>Grid3X3</div>,
  List: ({ className }) => <div className={className}>List</div>,
  ChevronDown: ({ className }) => <div className={className}>ChevronDown</div>,
  SlidersHorizontal: ({ className }) => <div className={className}>SlidersHorizontal</div>,
  X: ({ className }) => <div className={className}>X</div>,
  UserPlus: ({ className }) => <div className={className}>UserPlus</div>,
  Lock: ({ className }) => <div className={className}>Lock</div>,
  Mail: ({ className }) => <div className={className}>Mail</div>,
  Calendar: ({ className }) => <div className={className}>Calendar</div>,
  PlayCircle: ({ className }) => <div className={className}>PlayCircle</div>,
  UserCheck: ({ className }) => <div className={className}>UserCheck</div>,
  MapPin: ({ className }) => <div className={className}>MapPin</div>,
  Gamepad2: ({ className }) => <div className={className}>Gamepad2</div>,
  Eye: ({ className }) => <div className={className}>Eye</div>,
  BarChart3: ({ className }) => <div className={className}>BarChart3</div>,
  Settings: ({ className }) => <div className={className}>Settings</div>,
  Crown: ({ className }) => <div className={className}>Crown</div>,
  ChevronRight: ({ className }) => <div className={className}>ChevronRight</div>,
  Fire: ({ className }) => <div className={className}>Fire</div>,
  Clock: ({ className }) => <div className={className}>Clock</div>,
  Hash: ({ className }) => <div className={className}>Hash</div>,
  Bell: ({ className }) => <div className={className}>Bell</div>,
  MessageCircle: ({ className }) => <div className={className}>MessageCircle</div>,
  Zap: ({ className }) => <div className={className}>Zap</div>,
  Shield: ({ className }) => <div className={className}>Shield</div>,
  Server: ({ className }) => <div className={className}>Server</div>,
  AlertTriangle: ({ className }) => <div className={className}>AlertTriangle</div>,
  DollarSign: ({ className }) => <div className={className}>DollarSign</div>,
  Play: ({ className }) => <div className={className}>Play</div>,
  Square: ({ className }) => <div className={className}>Square</div>,
  RotateCcw: ({ className }) => <div className={className}>RotateCcw</div>,
  Database: ({ className }) => <div className={className}>Database</div>,
  Download: ({ className }) => <div className={className}>Download</div>,
  CheckSquare: ({ className }) => <div className={className}>CheckSquare</div>,
  RefreshCw: ({ className }) => <div className={className}>RefreshCw</div>,
  Wifi: ({ className }) => <div className={className}>Wifi</div>,
  HardDrive: ({ className }) => <div className={className}>HardDrive</div>,
  Cpu: ({ className }) => <div className={className}>Cpu</div>,
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';