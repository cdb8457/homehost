'use client';

import { useState, useEffect } from 'react';
import { 
  CommunityEvent, 
  EventParticipant, 
  EventResult, 
  Tournament, 
  TournamentBracket, 
  UserProfile 
} from '@/types/community';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Trophy, 
  Target, 
  Award, 
  Crown, 
  Medal, 
  Star,
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  UserPlus, 
  UserMinus,
  Play, 
  Pause, 
  Square,
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Settings,
  Filter,
  Search,
  MoreHorizontal,
  Share2,
  Download,
  Upload,
  Copy,
  ExternalLink,
  Bell,
  BellOff,
  Bookmark,
  BookmarkPlus,
  Flag,
  Send,
  MessageCircle,
  Heart,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  X,
  Check,
  Info,
  Zap,
  Flame,
  Sparkles,
  Gift,
  DollarSign,
  Coins,
  CreditCard,
  Gamepad2,
  Sword,
  Shield,
  Crosshair,
  Building,
  Hammer,
  Wrench,
  Lightbulb,
  Palette,
  Music,
  Video,
  Camera,
  Mic,
  Volume2,
  Headphones,
  Radio,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Server,
  Database,
  Cloud,
  Wifi,
  Signal,
  Battery,
  Power,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Globe,
  Compass,
  Map,
  Navigation,
  Route,
  Car,
  Plane,
  Ship,
  Train,
  Bus,
  Bike,
  Walk,
  Run,
  Mountain,
  TreePine,
  Sun,
  Moon,
  CloudSun,
  CloudRain,
  Snowflake,
  Wind,
  Thermometer,
  Umbrella,
  Rainbow,
  Sunrise,
  Sunset,
  Stars,
  Comet,
  Rocket,
  Satellite,
  Telescope,
  Atom,
  Dna,
  Microscope,
  TestTube,
  Beaker,
  Flask,
  Pill,
  Stethoscope,
  Bandage,
  Cross,
  HeartPulse,
  Brain,
  Ear,
  Nose,
  Mouth,
  Hand,
  Handshake,
  Peace,
  Victory,
  Accessibility,
  Glasses,
  Shirt,
  Hat,
  Watch,
  Ring,
  Gem,
  Key,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Security,
  Fingerprint,
  ScanFace,
  UserScan,
  IdCard,
  Passport,
  QrCode,
  Barcode,
  ScanLine,
  Scan,
  CameraOff,
  VideoOff,
  Image,
  Images,
  FileImage,
  FileVideo,
  Gallery,
  Paintbrush,
  PaintBucket,
  Pipette,
  Eraser,
  Pen,
  PenTool,
  Pencil,
  Edit2,
  Edit3,
  Highlighter,
  Marker,
  Scissors,
  Ruler,
  Triangle,
  Hexagon,
  Octagon,
  Pentagon,
  Circle,
  Square as SquareIcon,
  Diamond,
  Spade,
  Club,
  Drop,
  Droplet,
  Droplets,
  Waves,
  Fish,
  Turtle,
  Rabbit,
  Squirrel,
  Bird,
  Cat,
  Dog,
  Bone,
  PawPrint,
  Feather,
  Egg,
  Shell,
  Bug,
  Butterfly,
  Bee,
  Ladybug,
  Worm,
  Snail,
  Spider,
  Ant,
  Leaf,
  Seedling,
  TreeDeciduous,
  Flower,
  Flower2,
  Blossom,
  Rose,
  Tulip,
  Sunflower,
  Apple,
  Banana,
  Cherry,
  Grape,
  Orange,
  Lemon,
  Strawberry,
  Carrot,
  Corn,
  Wheat,
  Coffee,
  Tea,
  Wine,
  Beer,
  Martini,
  Cocktail,
  Milk,
  Baby,
  BabyBottle,
  Utensils,
  UtensilsCrossed,
  ChefHat,
  Cookie,
  Pizza,
  Sandwich,
  Salad,
  Soup,
  Beef,
  EggFried,
  IceCream,
  Cake,
  Candle,
  PartyPopper,
  Balloon,
  Fireworks,
  Confetti,
  GiftCard,
  Tag,
  Tags,
  Ticket,
  Receipt,
  Invoice,
  CreditCard as CreditCardIcon,
  Banknote,
  Wallet,
  PiggyBank,
  HandCoins,
  Euro,
  Pound,
  Yen,
  Ruble,
  IndianRupee,
  Bitcoin,
  ShoppingCart,
  ShoppingBag,
  Store,
  Storefront,
  Package,
  Package2,
  PackageOpen,
  PackageCheck,
  PackageX,
  PackagePlus,
  PackageMinus,
  PackageSearch,
  Box,
  Boxes,
  Container,
  Truck,
  Warehouse,
  Factory,
  Building2,
  Home,
  Hotel,
  School,
  University,
  Hospital,
  Pharmacy,
  Bank,
  Museum,
  Library,
  Landmark,
  Church,
  Castle,
  Stadium,
  Theater,
  Cinema,
  GraduationCap,
  BookOpen,
  Book,
  BookMarked,
  Newspaper,
  FileText,
  Scroll,
  Folder,
  FolderOpen,
  File,
  FilePlus,
  FileMinus,
  FileEdit,
  FileCheck,
  FileX,
  FileSearch,
  FileHeart,
  FileStar,
  FileLock,
  FileKey,
  FileSync,
  FileInput,
  FileOutput,
  FileUp,
  FileDown,
  FileCopy,
  FileMove,
  FileQuestion,
  FileWarning,
  FileDigit,
  FileType,
  FileType2,
  FileText2,
  FileAudio,
  FileMusic,
  FilePdf,
  FileSpreadsheet,
  FilePresentation,
  FileCode,
  FileArchive,
  New,
  NewFile,
  NewFolder,
  Open,
  OpenFile,
  Save,
  SaveAs,
  SaveAll,
  Export,
  Import,
  Link,
  Unlink,
  ChainLink,
  Paperclip,
  AttachFile,
  Attach,
  Detach,
  Connect,
  Disconnect,
  Plugin,
  PowerOff,
  Restart,
  Sleep,
  Hibernate,
  Suspend,
  Shutdown,
  Reboot,
  Reset,
  Refresh,
  Reload,
  Update,
  Upgrade,
  Sync,
  Backup,
  Restore,
  Clone,
  Duplicate,
  Cut,
  Paste,
  Undo,
  Redo,
  Cancel,
  Close,
  Exit,
  Quit,
  Escape,
  Back,
  Next,
  Previous,
  Continue,
  Finish,
  Done,
  Complete,
  Submit,
  Confirm,
  Accept,
  Approve,
  Reject,
  Decline,
  Deny,
  Block,
  Unblock,
  Ban,
  Unban,
  Mute,
  Unmute,
  Hide,
  Show,
  Visible,
  Invisible,
  Public,
  Private,
  Secret,
  Confidential,
  Classified,
  TopSecret,
  Restricted,
  Unrestricted,
  Limited,
  Unlimited,
  Free,
  Paid,
  Premium,
  Pro,
  VIP,
  Gold,
  Silver,
  Bronze,
  Platinum,
  Ruby,
  Emerald,
  Sapphire,
  Pearl,
  Crystal,
  Jewel,
  Treasure,
  Chest,
  Safe,
  Vault,
  ATM,
  CashRegister,
  Till,
  Cashier,
  Bill,
  Statement,
  Report,
  Document,
  Paper,
  Note,
  Memo,
  Letter,
  Message,
  Notification,
  Alert,
  Warning,
  Error,
  Question,
  Help,
  Support,
  FAQ,
  Guide,
  Tutorial,
  Manual,
  Documentation,
  Wiki,
  Blog,
  News,
  Article,
  Post,
  Comment,
  Review,
  Rating,
  Feedback,
  Survey,
  Poll,
  Vote,
  Election,
  Ballot,
  Campaign,
  Politics,
  Government,
  Law,
  Legal,
  Justice,
  Court,
  Judge,
  Lawyer,
  Attorney,
  Contract,
  Agreement,
  Terms,
  Conditions,
  Policy,
  Privacy,
  Safety,
  Protection,
  Insurance,
  Warranty,
  Guarantee,
  Certified,
  Verified,
  Authenticated,
  Authorized,
  Licensed,
  Registered,
  Trademarked,
  Copyrighted,
  Patented,
  Intellectual,
  Property,
  Rights,
  Ownership,
  Possession,
  Asset,
  Equity,
  Investment,
  Portfolio,
  Stock,
  Share,
  Bond,
  Fund,
  ETF,
  Mutual,
  Index,
  Commodity,
  Forex,
  Crypto,
  Ethereum,
  Blockchain,
  Mining,
  Exchange,
  Trading,
  Broker,
  Market,
  Finance,
  Economy,
  Business,
  Company,
  Corporation,
  Enterprise,
  Startup,
  Entrepreneur,
  Investor,
  Venture,
  Capital,
  Funding,
  Revenue,
  Profit,
  Loss,
  Growth,
  Decline,
  Success,
  Failure,
  Achievement,
  Goal,
  Objective,
  Mission,
  Vision,
  Strategy,
  Plan,
  Project,
  Task,
  Todo,
  Checklist,
  Progress,
  Status,
  Milestone,
  Deadline,
  Schedule,
  Timeline,
  Event,
  Meeting,
  Appointment,
  Reminder,
  Alarm,
  Timer,
  Stopwatch,
  Duration,
  Period,
  Interval,
  Frequency,
  Rate,
  Speed,
  Velocity,
  Acceleration,
  Deceleration,
  Distance,
  Length,
  Width,
  Height,
  Depth,
  Area,
  Volume,
  Weight,
  Mass,
  Density,
  Temperature,
  Pressure,
  Force,
  Energy,
  Voltage,
  Current,
  Resistance,
  Capacity,
  Wavelength,
  Amplitude,
  Phase,
  Noise,
  Quality,
  Clarity,
  Resolution,
  Definition,
  Detail,
  Precision,
  Accuracy,
  Tolerance,
  Margin,
  Range,
  Limit,
  Boundary,
  Border,
  Edge,
  Corner,
  Center,
  Middle,
  Top,
  Bottom,
  Left,
  Right,
  Front,
  Behind,
  Side,
  Inside,
  Outside,
  Above,
  Below,
  Beside,
  Between,
  Among,
  Around,
  Through,
  Across,
  Along,
  Against,
  Towards,
  Away,
  Near,
  Far,
  Close,
  Distant,
  Local,
  Remote,
  Online,
  Offline,
  Connected,
  Disconnected,
  Available,
  Unavailable,
  Active,
  Inactive,
  Enabled,
  Disabled,
  On,
  Off,
  Locked,
  Unlocked,
  Secure,
  Insecure,
  Stable,
  Unstable,
  Reliable,
  Unreliable,
  Consistent,
  Inconsistent,
  Regular,
  Irregular,
  Normal,
  Abnormal,
  Standard,
  Custom,
  Default,
  Alternative,
  Optional,
  Required,
  Mandatory,
  Voluntary,
  Automatic,
  Manual,
  Programmed,
  Scheduled,
  Planned,
  Unplanned,
  Expected,
  Unexpected,
  Known,
  Unknown,
  Familiar,
  Unfamiliar,
  Simple,
  Complex,
  Easy,
  Hard,
  Difficult,
  Challenging,
  Basic,
  Advanced,
  Beginner,
  Intermediate,
  Expert,
  Professional,
  Amateur,
  Student,
  Teacher,
  Instructor,
  Professor,
  Scholar,
  Researcher,
  Scientist,
  Engineer,
  Developer,
  Programmer,
  Designer,
  Artist,
  Creator,
  Author,
  Writer,
  Editor,
  Publisher,
  Producer,
  Director,
  Manager,
  Leader,
  Boss,
  CEO,
  CTO,
  CFO,
  COO,
  VP,
  President,
  Chairman,
  Founder,
  Owner,
  Partner,
  Shareholder,
  Stakeholder,
  Customer,
  Client,
  User,
  Member,
  Subscriber,
  Follower,
  Fan,
  Supporter,
  Advocate,
  Ambassador,
  Representative,
  Agent,
  Delegate,
  Spokesperson,
  Presenter,
  Speaker,
  Host,
  Guest,
  Visitor,
  Tourist,
  Traveler,
  Explorer,
  Adventurer,
  Pioneer,
  Innovator,
  Inventor,
  Builder,
  Maker,
  Craftsman,
  Artisan,
  Specialist,
  Consultant,
  Advisor,
  Mentor,
  Coach,
  Trainer,
  Helper,
  Assistant,
  Service,
  Care,
  Maintenance,
  Repair,
  Fix,
  Troubleshoot,
  Debug,
  Test,
  Validate,
  Verify,
  Inspect,
  Examine,
  Analyze,
  Evaluate,
  Assess,
  Measure,
  Calculate,
  Compute,
  Process,
  Execute,
  Start,
  Begin,
  Initialize,
  Launch,
  Deploy,
  Install,
  Setup,
  Configure,
  Customize,
  Personalize,
  Optimize,
  Improve,
  Enhance,
  Modify,
  Change,
  Adjust,
  Tune,
  Calibrate,
  Balance,
  Align,
  Synchronize,
  Coordinate,
  Organize,
  Arrange,
  Order,
  Sort,
  Group,
  Classify,
  Categorize,
  Label,
  Mark,
  Highlight,
  Emphasize,
  Focus,
  Attention,
  Notice,
  Observe,
  Watch,
  Monitor,
  Track,
  Follow,
  Trace,
  Record,
  Log,
  Register,
  Document,
  Annotation,
  Explanation,
  Description,
  Definition,
  Specification,
  Requirement,
  Condition,
  Rule,
  Regulation,
  Guideline,
  Principle,
  Procedure,
  Protocol,
  Method,
  Technique,
  Approach,
  Tactic,
  Solution,
  Answer,
  Response,
  Reaction,
  Action,
  Operation,
  Function,
  Feature,
  Capability,
  Ability,
  Skill,
  Talent,
  Strength,
  Weakness,
  Advantage,
  Disadvantage,
  Benefit,
  Drawback,
  Positive,
  Negative,
  Good,
  Bad,
  Better,
  Worse,
  Best,
  Worst,
  Perfect,
  Imperfect,
  Finished,
  Unfinished,
  Ready,
  Unready,
  Prepared,
  Unprepared,
  Organized,
  Disorganized,
  Clean,
  Dirty,
  Clear,
  Unclear,
  Obvious,
  Hidden,
  Transparent,
  Opaque,
  Bright,
  Dark,
  Light,
  Heavy,
  Thick,
  Thin,
  Wide,
  Narrow,
  Large,
  Small,
  Big,
  Little,
  Huge,
  Tiny,
  Giant,
  Miniature,
  Maximum,
  Minimum,
  More,
  Less,
  Most,
  Least,
  All,
  None,
  Some,
  Few,
  Many,
  Several,
  Multiple,
  Single,
  Double,
  Triple,
  Quadruple,
  Half,
  Quarter,
  Third,
  Eighth,
  Tenth,
  Hundredth,
  Thousandth,
  Million,
  Billion,
  Trillion,
  Infinite,
  Zero,
  One,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Eleven,
  Twelve,
  Thirteen,
  Fourteen,
  Fifteen,
  Sixteen,
  Seventeen,
  Eighteen,
  Nineteen,
  Twenty,
  Thirty,
  Forty,
  Fifty,
  Sixty,
  Seventy,
  Eighty,
  Ninety,
  Hundred,
  Thousand,
  First,
  Second,
  Fourth,
  Fifth,
  Sixth,
  Seventh,
  Ninth,
  Last,
  Final,
  Ultimate,
  Primary,
  Secondary,
  Tertiary,
  Main,
  Sub,
  Major,
  Minor,
  Important,
  Unimportant,
  Significant,
  Insignificant,
  Relevant,
  Irrelevant,
  Useful,
  Useless,
  Valuable,
  Worthless,
  Precious,
  Cheap,
  Expensive,
  Affordable,
  Costly,
  Priceless,
  Personal,
  Commercial,
  Industrial,
  Educational,
  Academic,
  Scientific,
  Medical,
  Healthcare,
  Financial,
  Technical,
  Creative,
  Artistic,
  Cultural,
  Social,
  Political,
  Religious,
  Spiritual,
  Philosophical,
  Psychological,
  Physical,
  Mental,
  Emotional,
  Intellectual,
  Rational,
  Logical,
  Practical,
  Theoretical,
  Abstract,
  Concrete,
  Real,
  Virtual,
  Digital,
  Analog,
  Electronic,
  Mechanical,
  Electrical,
  Chemical,
  Biological,
  Organic,
  Inorganic,
  Natural,
  Artificial,
  Synthetic,
  Genuine,
  Fake,
  Authentic,
  Original,
  Replica,
  Imitation,
  Simulation,
  Model,
  Prototype,
  Template,
  Pattern,
  Design,
  Style,
  Format,
  Layout,
  Structure,
  Framework,
  System,
  Platform,
  Grid,
  Matrix,
  Array,
  List,
  Table,
  Chart,
  Graph,
  Diagram,
  Blueprint,
  Scheme,
  Outline,
  Summary,
  Overview,
  Preview,
  Analysis,
  Study,
  Research,
  Investigation,
  Inquiry,
  Interview,
  Discussion,
  Debate,
  Argument,
  Conversation,
  Chat,
  Talk,
  Speech,
  Presentation,
  Lecture,
  Seminar,
  Workshop,
  Conference,
  Assembly,
  Gathering,
  Occasion,
  Ceremony,
  Celebration,
  Party,
  Festival,
  Holiday,
  Vacation,
  Break,
  Rest,
  Wait,
  Delay,
  Postpone,
  Abort,
  Terminate,
  End,
  Conclude,
  Shut,
  Seal,
  Protect,
  Guard,
  Defend,
  Cover,
  Conceal,
  Mask,
  Disguise,
  Camouflage,
  Stealth,
  Apparent,
  Evident,
  Manifest,
  Plain,
  Tough,
  Sophisticated,
  Skilled,
  Talented,
  Gifted,
  Capable,
  Able,
  Competent,
  Qualified,
  Experienced,
  Veteran,
  Senior,
  Junior,
  Novice,
  Learner,
  Trainee,
  Apprentice,
  Intern,
  Graduate,
  Alumni,
  Educator,
  Tutor,
  Supervisor,
  Executive,
  Administrator,
  Coordinator,
  Organizer,
  Planner,
  Scheduler,
  Controller,
  Operator,
  Technician,
  Counselor,
  Therapist,
  Doctor,
  Nurse,
  Surgeon,
  Dentist,
  Veterinarian,
  Pharmacist,
  Paralegal,
  Accountant,
  Auditor,
  Bookkeeper,
  Banker,
  Teller,
  Realtor,
  Salesperson,
  Clerk,
  Receptionist,
  Secretary,
  VicePresident,
  BoardMember,
  Entrepreneur,
  Organization,
  Institution,
  Association,
  Society,
  Team,
  Crew,
  Squad,
  Unit,
  Division,
  Department,
  Section,
  Branch,
  Office,
  Bureau,
  Agency,
  Authority,
  Commission,
  Committee,
  Board,
  Council,
  Parliament,
  Congress,
  Senate,
  House,
  Chamber,
  Tribunal,
  Jury,
  Panel,
  Summit,
  Forum,
  Symposium,
  Convention,
  Expo,
  Fair,
  Exhibition,
  Display,
  Demonstration,
  Performance,
  Concert,
  Show,
  Play,
  Drama,
  Movie,
  Film,
  Documentary,
  Series,
  Episode,
  Season,
  Channel,
  Program,
  Broadcast,
  Transmission,
  Stream,
  Live,
  Recording,
  Podcast,
  Song,
  Album,
  Track,
  Playlist,
  Artist,
  Musician,
  Singer,
  Band,
  Orchestra,
  Choir,
  Conductor,
  Composer,
  Mixer,
  DJ,
  MC,
  Announcer,
  Commentator,
  Reporter,
  Journalist,
  Poet,
  Novelist,
  Playwright,
  Screenwriter,
  Columnist,
  Blogger,
  Publicist,
  Marketer,
  Advertiser,
  Promoter,
  Sponsor,
  Buyer,
  Purchaser,
  Consumer,
  Shopper,
  Passenger,
  Driver,
  Pilot,
  Captain,
  Sailor,
  Navigator,
  Discoverer,
  Coder,
  Architect,
  Illustrator,
  Photographer,
  Videographer,
  Filmmaker,
  Animator,
  Modeler,
  Sculptor,
  Painter,
  Drawer,
  Sketcher,
  Constructor,
  Contractor,
  Carpenter,
  Plumber,
  Electrician,
  Mechanic,
  Repairman,
  Janitor,
  Cleaner,
  Housekeeper,
  Gardener,
  Landscaper,
  Farmer,
  Rancher,
  Fisherman,
  Hunter,
  Cook,
  Chef,
  Baker,
  Butcher,
  Waiter,
  Waitress,
  Bartender,
  Barista,
  Delivery,
  Courier,
  Postman,
  Mailman,
  Chauffeur,
  Taxi,
  Uber,
  Lyft,
  Subway,
  Metro,
  Tram,
  Trolley,
  Cable,
  Gondola,
  Ferry,
  Boat,
  Yacht,
  Cruise,
  Sailboat,
  Speedboat,
  Jet,
  Helicopter,
  Aircraft,
  Space,
  Universe,
  Galaxy,
  Planet,
  Mars,
  Jupiter,
  Saturn,
  Uranus,
  Neptune,
  Pluto,
  Asteroid,
  Meteor,
  BlackHole,
  Nebula,
  Constellation,
  Orbit,
  Gravity,
  Atmosphere,
  Oxygen,
  Hydrogen,
  Helium,
  Carbon,
  Nitrogen,
  Element,
  Molecule,
  Particle,
  Electron,
  Proton,
  Neutron,
  Nucleus,
  Motion,
  Friction,
  Heat,
  Cold,
  Fire,
  Ice,
  Water,
  Steam,
  Gas,
  Liquid,
  Solid,
  Plasma,
  Matter,
  Surface,
  Radius,
  Diameter,
  Circumference,
  Perimeter,
  Angle,
  Curve,
  Line,
  Point,
  Dot,
  Pixel,
  Inch,
  Foot,
  Yard,
  Mile,
  Millimeter,
  Centimeter,
  Meter,
  Kilometer,
  Gram,
  Kilogram,
  Pound,
  Ounce,
  Ton,
  Liter,
  Gallon,
  Quart,
  Pint,
  Cup,
  Tablespoon,
  Teaspoon,
  Celsius,
  Fahrenheit,
  Kelvin,
  Second,
  Minute,
  Hour,
  Day,
  Week,
  Month,
  Year,
  Decade,
  Century,
  Millennium,
  Era,
  Age,
  Epoch,
  Past,
  Present,
  Future,
  History,
  Ancient,
  Modern,
  Contemporary,
  Recent,
  Current,
  Latest,
  Newest,
  Oldest,
  Young,
  Old,
  New,
  Fresh,
  Vintage,
  Classic,
  Traditional,
  Conventional,
  Innovative,
  Revolutionary,
  Cutting,
  Leading,
  Trending,
  Popular,
  Famous,
  Renowned,
  Celebrated,
  Notable,
  Distinguished,
  Outstanding,
  Excellent,
  Superior,
  Luxury,
  Deluxe,
  Finest,
  Greatest,
  Highest,
  Supreme,
  Ideal,
  Optimal,
  Peak,
  Apex,
  Pinnacle,
  Champion,
  Winner,
  Victory,
  Accomplishment,
  Triumph,
  Conquest,
  Mastery,
  Excellence,
  Perfection,
  Grade,
  Level,
  Tier,
  Rank,
  Position,
  Place,
  Spot,
  Location,
  Site,
  Venue,
  Destination,
  Address,
  Coordinates,
  GPS,
  Direction,
  Path,
  Trail,
  Road,
  Street,
  Avenue,
  Boulevard,
  Highway,
  Freeway,
  Interstate,
  Bridge,
  Tunnel,
  Intersection,
  Junction,
  Roundabout,
  Entrance,
  Gateway,
  Door,
  Window,
  Opening,
  Hole,
  Gap,
  Room,
  Zone,
  Region,
  Territory,
  District,
  Neighborhood,
  Community,
  City,
  Town,
  Village,
  County,
  State,
  Province,
  Country,
  Nation,
  Continent,
  World,
  Atlas,
  Plot,
  Menu,
  Options,
  Preferences,
  Configuration,
  Installation,
  Deployment,
  Transfer,
  Move,
  Load,
  Uninstall,
  Remove,
  Delete,
  Clear,
  Clean,
  Purge,
  Empty,
  Void,
  Null,
  Nothing,
  Blank,
  Full,
  Partial,
  Total,
  Sum,
  Amount,
  Quantity,
  Number,
  Count,
  Measure,
  Unit,
  Scale,
  Size,
  Dimension,
  Proportion,
  Ratio,
  Percentage,
  Fraction,
  Decimal,
  Integer,
  Float,
  Double,
  Long,
  Short,
  Byte,
  Bit,
  Kilobyte,
  Megabyte,
  Gigabyte,
  Terabyte,
  Petabyte,
  Exabyte,
  Zettabyte,
  Yottabyte,
  Hertz,
  Kilohertz,
  Megahertz,
  Gigahertz,
  Terahertz,
  Sharpness,
  Color,
  Red,
  Green,
  Blue,
  Yellow,
  Orange,
  Purple,
  Pink,
  Brown,
  Black,
  White,
  Gray,
  Copper,
  Tin,
  Lead,
  Zinc,
  Nickel,
  Cobalt,
  Lithium,
  Sodium,
  Potassium,
  Calcium,
  Magnesium,
  Silicon,
  Phosphorus,
  Sulfur,
  Chlorine,
  Argon,
  Metal,
  Iron,
  Steel,
  Aluminum,
  Titanium,
  Chrome,
  Brass
} from 'lucide-react';

interface EventSystemProps {
  serverId: string;
  serverName: string;
  currentUserId: string;
  userRole: 'owner' | 'admin' | 'moderator' | 'member';
}

interface EventFilter {
  type: 'all' | 'tournament' | 'community' | 'building' | 'pvp' | 'social' | 'educational';
  status: 'all' | 'upcoming' | 'registration_open' | 'in_progress' | 'completed';
  timeframe: 'all' | 'today' | 'week' | 'month';
}

export default function EventSystem({ 
  serverId, 
  serverName, 
  currentUserId, 
  userRole 
}: EventSystemProps) {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [userEvents, setUserEvents] = useState<EventParticipant[]>([]);
  const [activeTab, setActiveTab] = useState<'events' | 'tournaments' | 'calendar' | 'my-events'>('events');
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EventFilter>({
    type: 'all',
    status: 'all',
    timeframe: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');

  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventType: 'community' as CommunityEvent['eventType'],
    startTime: '',
    endTime: '',
    location: 'server' as CommunityEvent['location'],
    maxParticipants: '',
    registrationRequired: false,
    registrationDeadline: '',
    prizes: [] as { position: number; reward: string; value: number; currency: string; description: string }[],
    requirements: {
      minLevel: '',
      gameMode: '',
      equipment: [] as string[]
    },
    rules: ''
  });

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [serverId, filters]);

  const loadEvents = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Mock events data
    const mockEvents: CommunityEvent[] = [
      {
        id: 'event-1',
        serverId: serverId,
        creatorId: 'user-1',
        title: 'Weekly PvP Tournament',
        description: 'Join our weekly PvP tournament! Battle your way to the top and claim victory. Open to all skill levels with separate brackets for beginners and experts.',
        eventType: 'tournament',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours duration
        location: 'server',
        maxParticipants: 32,
        registrationRequired: true,
        registrationDeadline: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000),
        prizes: [
          { position: 1, reward: '1000 Server Credits + Champion Title', value: 1000, currency: 'credits', description: 'First place prize with custom title' },
          { position: 2, reward: '500 Server Credits', value: 500, currency: 'credits', description: 'Second place prize' },
          { position: 3, reward: '250 Server Credits', value: 250, currency: 'credits', description: 'Third place prize' }
        ],
        requirements: {
          gameMode: 'PvP',
          equipment: ['Diamond gear or better', 'No enchanted items above level 3']
        },
        rules: 'No cheating, griefing, or harassment. Respect all players. Follow server rules at all times.',
        status: 'registration_open',
        participants: [
          {
            id: 'part-1',
            userId: 'user-2',
            eventId: 'event-1',
            status: 'registered',
            registeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            user: {
              id: 'user-2',
              userId: 'user-2',
              displayName: 'PvP_Champion',
              avatarUrl: '/api/placeholder/40/40',
              bannerUrl: '/api/placeholder/400/200',
              location: 'USA',
              socialLinks: {},
              stats: {
                totalPlayTime: 156780,
                serversJoined: 8,
                friendsCount: 67,
                postsCount: 89,
                achievementsCount: 78,
                reputationScore: 1023
              },
              preferences: {
                showOnlineStatus: true,
                allowFriendRequests: true,
                showGameActivity: true,
                emailNotifications: true,
                pushNotifications: true
              },
              badges: [],
              joinedAt: new Date('2023-09-05'),
              lastActive: new Date(Date.now() - 30 * 60 * 1000)
            }
          }
        ],
        spectators: [],
        creator: {
          id: 'user-1',
          userId: 'user-1',
          displayName: 'Tournament_Host',
          avatarUrl: '/api/placeholder/40/40',
          bannerUrl: '/api/placeholder/400/200',
          location: 'Canada',
          socialLinks: {},
          stats: {
            totalPlayTime: 89450,
            serversJoined: 5,
            friendsCount: 34,
            postsCount: 156,
            achievementsCount: 45,
            reputationScore: 654
          },
          preferences: {
            showOnlineStatus: true,
            allowFriendRequests: true,
            showGameActivity: true,
            emailNotifications: true,
            pushNotifications: true
          },
          badges: [],
          joinedAt: new Date('2023-11-10'),
          lastActive: new Date(Date.now() - 15 * 60 * 1000)
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: 'event-2',
        serverId: serverId,
        creatorId: 'user-3',
        title: 'Medieval Castle Building Contest',
        description: 'Show off your building skills! Create the most impressive medieval castle for a chance to win amazing prizes. Theme: Authentic Medieval Architecture.',
        eventType: 'building',
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        location: 'server',
        registrationRequired: false,
        prizes: [
          { position: 1, reward: 'Master Builder Badge + 1500 Credits', value: 1500, currency: 'credits', description: 'Winner gets special recognition badge' },
          { position: 2, reward: '1000 Credits', value: 1000, currency: 'credits', description: 'Second place prize' },
          { position: 3, reward: '500 Credits', value: 500, currency: 'credits', description: 'Third place prize' }
        ],
        requirements: {
          gameMode: 'Creative',
          equipment: ['Must use only medieval-appropriate blocks']
        },
        rules: 'Original builds only. No copying existing designs. Must be completed within the contest period.',
        status: 'upcoming',
        participants: [],
        spectators: [],
        creator: {
          id: 'user-3',
          userId: 'user-3',
          displayName: 'Master_Architect',
          avatarUrl: '/api/placeholder/40/40',
          bannerUrl: '/api/placeholder/400/200',
          location: 'UK',
          socialLinks: {},
          stats: {
            totalPlayTime: 67230,
            serversJoined: 3,
            friendsCount: 28,
            postsCount: 67,
            achievementsCount: 34,
            reputationScore: 445
          },
          preferences: {
            showOnlineStatus: true,
            allowFriendRequests: true,
            showGameActivity: true,
            emailNotifications: true,
            pushNotifications: true
          },
          badges: [],
          joinedAt: new Date('2023-12-20'),
          lastActive: new Date(Date.now() - 10 * 60 * 1000)
        },
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
      },
      {
        id: 'event-3',
        serverId: serverId,
        creatorId: currentUserId,
        title: 'Community Movie Night',
        description: 'Join us for a fun community movie night! We\'ll be watching a popular gaming-themed movie together and chatting about it.',
        eventType: 'social',
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        location: 'discord',
        registrationRequired: false,
        prizes: [],
        requirements: {},
        rules: 'Keep chat respectful and on-topic. No spoilers!',
        status: 'upcoming',
        participants: [],
        spectators: [],
        creator: {
          id: currentUserId,
          userId: currentUserId,
          displayName: 'Alex Johnson',
          avatarUrl: '/api/placeholder/40/40',
          bannerUrl: '/api/placeholder/400/200',
          location: 'Seattle, WA',
          socialLinks: {},
          stats: {
            totalPlayTime: 145680,
            serversJoined: 12,
            friendsCount: 48,
            postsCount: 234,
            achievementsCount: 67,
            reputationScore: 892
          },
          preferences: {
            showOnlineStatus: true,
            allowFriendRequests: true,
            showGameActivity: true,
            emailNotifications: true,
            pushNotifications: true
          },
          badges: [],
          joinedAt: new Date('2023-08-15'),
          lastActive: new Date()
        },
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 72 * 60 * 60 * 1000)
      },
      {
        id: 'event-4',
        serverId: serverId,
        creatorId: 'user-4',
        title: 'Redstone Engineering Workshop',
        description: 'Learn advanced redstone techniques! This educational workshop covers complex circuits, automation, and innovative redstone contraptions.',
        eventType: 'educational',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        location: 'server',
        maxParticipants: 15,
        registrationRequired: true,
        registrationDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        prizes: [],
        requirements: {
          minLevel: '10',
          gameMode: 'Creative',
          equipment: ['Basic redstone knowledge helpful but not required']
        },
        rules: 'Come prepared to learn and ask questions. Bring a positive attitude!',
        status: 'registration_open',
        participants: [],
        spectators: [],
        creator: {
          id: 'user-4',
          userId: 'user-4',
          displayName: 'Redstone_Guru',
          avatarUrl: '/api/placeholder/40/40',
          bannerUrl: '/api/placeholder/400/200',
          location: 'Germany',
          socialLinks: {},
          stats: {
            totalPlayTime: 234560,
            serversJoined: 6,
            friendsCount: 52,
            postsCount: 123,
            achievementsCount: 89,
            reputationScore: 1156
          },
          preferences: {
            showOnlineStatus: true,
            allowFriendRequests: true,
            showGameActivity: true,
            emailNotifications: true,
            pushNotifications: true
          },
          badges: [],
          joinedAt: new Date('2023-09-12'),
          lastActive: new Date(Date.now() - 45 * 60 * 1000)
        },
        createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 96 * 60 * 60 * 1000)
      }
    ];

    // Mock user events (events the user is participating in)
    const mockUserEvents: EventParticipant[] = [
      {
        id: 'part-user-1',
        userId: currentUserId,
        eventId: 'event-1',
        status: 'registered',
        registeredAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ];

    setEvents(mockEvents);
    setUserEvents(mockUserEvents);
    setLoading(false);
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.description.trim() || !newEvent.startTime || !newEvent.endTime) {
      return;
    }

    const event: CommunityEvent = {
      id: `event-${Date.now()}`,
      serverId: serverId,
      creatorId: currentUserId,
      title: newEvent.title,
      description: newEvent.description,
      eventType: newEvent.eventType,
      startTime: new Date(newEvent.startTime),
      endTime: new Date(newEvent.endTime),
      location: newEvent.location,
      maxParticipants: newEvent.maxParticipants ? parseInt(newEvent.maxParticipants) : undefined,
      registrationRequired: newEvent.registrationRequired,
      registrationDeadline: newEvent.registrationDeadline ? new Date(newEvent.registrationDeadline) : undefined,
      prizes: newEvent.prizes,
      requirements: {
        minLevel: newEvent.requirements.minLevel ? parseInt(newEvent.requirements.minLevel) : undefined,
        gameMode: newEvent.requirements.gameMode || undefined,
        equipment: newEvent.requirements.equipment.filter(eq => eq.trim())
      },
      rules: newEvent.rules,
      status: 'upcoming',
      participants: [],
      spectators: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setEvents(prev => [event, ...prev]);
    setShowCreateEvent(false);
    resetEventForm();
  };

  const resetEventForm = () => {
    setNewEvent({
      title: '',
      description: '',
      eventType: 'community',
      startTime: '',
      endTime: '',
      location: 'server',
      maxParticipants: '',
      registrationRequired: false,
      registrationDeadline: '',
      prizes: [],
      requirements: {
        minLevel: '',
        gameMode: '',
        equipment: []
      },
      rules: ''
    });
  };

  const handleJoinEvent = async (eventId: string) => {
    console.log(`Joining event: ${eventId}`);
    
    const newParticipant: EventParticipant = {
      id: `part-${Date.now()}`,
      userId: currentUserId,
      eventId: eventId,
      status: 'registered',
      registeredAt: new Date()
    };

    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, participants: [...event.participants, newParticipant] }
        : event
    ));

    setUserEvents(prev => [...prev, newParticipant]);
  };

  const handleLeaveEvent = async (eventId: string) => {
    console.log(`Leaving event: ${eventId}`);
    
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, participants: event.participants.filter(p => p.userId !== currentUserId) }
        : event
    ));

    setUserEvents(prev => prev.filter(p => p.eventId !== eventId));
  };

  const formatEventDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'tournament': return <Trophy className="w-5 h-5" />;
      case 'building': return <Building className="w-5 h-5" />;
      case 'pvp': return <Sword className="w-5 h-5" />;
      case 'social': return <Users className="w-5 h-5" />;
      case 'educational': return <GraduationCap className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'tournament': return 'text-yellow-600 bg-yellow-100';
      case 'building': return 'text-green-600 bg-green-100';
      case 'pvp': return 'text-red-600 bg-red-100';
      case 'social': return 'text-blue-600 bg-blue-100';
      case 'educational': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'registration_open': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-orange-600 bg-orange-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'server': return <Server className="w-4 h-4" />;
      case 'discord': return <MessageCircle className="w-4 h-4" />;
      case 'external': return <ExternalLink className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const isUserRegistered = (eventId: string) => {
    return userEvents.some(ue => ue.eventId === eventId);
  };

  const canUserJoin = (event: CommunityEvent) => {
    if (isUserRegistered(event.id)) return false;
    if (event.status !== 'registration_open' && event.status !== 'upcoming') return false;
    if (event.registrationDeadline && new Date() > event.registrationDeadline) return false;
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) return false;
    return true;
  };

  const filteredEvents = events.filter(event => {
    if (filters.type !== 'all' && event.eventType !== filters.type) return false;
    if (filters.status !== 'all' && event.status !== filters.status) return false;
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !event.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    if (filters.timeframe !== 'all') {
      const now = new Date();
      const eventDate = event.startTime;
      
      switch (filters.timeframe) {
        case 'today':
          if (eventDate.toDateString() !== now.toDateString()) return false;
          break;
        case 'week':
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          if (eventDate > weekFromNow) return false;
          break;
        case 'month':
          const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          if (eventDate > monthFromNow) return false;
          break;
      }
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="relative">
                <Calendar className="w-8 h-8 text-indigo-600" />
                <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              Event System
            </h1>
            <p className="text-gray-600 mt-1">
              Organize and participate in community events for <span className="font-semibold">{serverName}</span>
            </p>
          </div>
          {(userRole === 'owner' || userRole === 'admin') && (
            <button
              onClick={() => setShowCreateEvent(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg shadow-sm mb-6">
          {[
            { id: 'events', label: 'All Events', icon: Calendar },
            { id: 'tournaments', label: 'Tournaments', icon: Trophy },
            { id: 'calendar', label: 'Calendar', icon: CalendarDays },
            { id: 'my-events', label: 'My Events', icon: User }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value as any})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="tournament">Tournaments</option>
            <option value="building">Building</option>
            <option value="pvp">PvP</option>
            <option value="social">Social</option>
            <option value="educational">Educational</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value as any})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="registration_open">Registration Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filters.timeframe}
            onChange={(e) => setFilters({...filters, timeframe: e.target.value as any})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button
            onClick={() => setFilters({ type: 'all', status: 'all', timeframe: 'all' })}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Create New Event</h2>
                <button
                  onClick={() => setShowCreateEvent(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter event title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Describe your event..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                    <select
                      value={newEvent.eventType}
                      onChange={(e) => setNewEvent({...newEvent, eventType: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="community">Community</option>
                      <option value="tournament">Tournament</option>
                      <option value="building">Building</option>
                      <option value="pvp">PvP</option>
                      <option value="social">Social</option>
                      <option value="educational">Educational</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <select
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="server">In-Game Server</option>
                      <option value="discord">Discord</option>
                      <option value="external">External Platform</option>
                    </select>
                  </div>
                </div>

                {/* Schedule & Registration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Schedule & Registration</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="datetime-local"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="datetime-local"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
                    <input
                      type="number"
                      value={newEvent.maxParticipants}
                      onChange={(e) => setNewEvent({...newEvent, maxParticipants: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="registrationRequired"
                      checked={newEvent.registrationRequired}
                      onChange={(e) => setNewEvent({...newEvent, registrationRequired: e.target.checked})}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="registrationRequired" className="text-sm font-medium text-gray-700">
                      Registration Required
                    </label>
                  </div>

                  {newEvent.registrationRequired && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Registration Deadline</label>
                      <input
                        type="datetime-local"
                        value={newEvent.registrationDeadline}
                        onChange={(e) => setNewEvent({...newEvent, registrationDeadline: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Rules */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rules & Guidelines</label>
                <textarea
                  value={newEvent.rules}
                  onChange={(e) => setNewEvent({...newEvent, rules: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Event rules and guidelines..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateEvent(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  disabled={!newEvent.title.trim() || !newEvent.description.trim() || !newEvent.startTime || !newEvent.endTime}
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getEventTypeColor(event.eventType)}`}>
                      {getEventTypeIcon(event.eventType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.eventType)}`}>
                          {event.eventType}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{event.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatEventDateTime(event.startTime).date} at {formatEventDateTime(event.startTime).time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getLocationIcon(event.location)}
                          <span className="capitalize">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>
                            {event.participants.length}
                            {event.maxParticipants && ` / ${event.maxParticipants}`} participants
                          </span>
                        </div>
                      </div>

                      {event.prizes.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-1 text-sm text-yellow-600 mb-1">
                            <Trophy className="w-4 h-4" />
                            <span className="font-medium">Prizes:</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {event.prizes.slice(0, 3).map((prize, index) => (
                              <span key={index}>
                                {index > 0 && ' • '}
                                #{prize.position}: {prize.reward}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {isUserRegistered(event.id) ? (
                      <button
                        onClick={() => handleLeaveEvent(event.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        <UserMinus className="w-4 h-4" />
                        Leave
                      </button>
                    ) : canUserJoin(event) ? (
                      <button
                        onClick={() => handleJoinEvent(event.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <UserPlus className="w-4 h-4" />
                        Join
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        Unavailable
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowEventDetails(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {event.registrationDeadline && event.status === 'registration_open' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Registration closes on {formatEventDateTime(event.registrationDeadline).date} at {formatEventDateTime(event.registrationDeadline).time}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">
                {searchQuery || filters.type !== 'all' || filters.status !== 'all' || filters.timeframe !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'No events have been created yet'}
              </p>
              {(userRole === 'owner' || userRole === 'admin') && !searchQuery && (
                <button
                  onClick={() => setShowCreateEvent(true)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create First Event
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Other tabs would be implemented here */}
      {activeTab === 'tournaments' && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Tournament System</h3>
          <p className="text-gray-600">Advanced tournament brackets and management coming soon...</p>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Calendar View</h3>
          <p className="text-gray-600">Interactive calendar view coming soon...</p>
        </div>
      )}

      {activeTab === 'my-events' && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">My Events</h3>
          <p className="text-gray-600">Personal event dashboard coming soon...</p>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Event Details</h2>
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Event Header */}
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getEventTypeColor(selectedEvent.eventType)}`}>
                    {getEventTypeIcon(selectedEvent.eventType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(selectedEvent.eventType)}`}>
                        {selectedEvent.eventType}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedEvent.status)}`}>
                        {selectedEvent.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 text-lg">{selectedEvent.description}</p>
                  </div>
                </div>

                {/* Event Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium text-gray-900">Schedule</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Start: {formatEventDateTime(selectedEvent.startTime).date} at {formatEventDateTime(selectedEvent.startTime).time}</div>
                      <div>End: {formatEventDateTime(selectedEvent.endTime).date} at {formatEventDateTime(selectedEvent.endTime).time}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getLocationIcon(selectedEvent.location)}
                      <span className="font-medium text-gray-900">Location</span>
                    </div>
                    <div className="text-sm text-gray-600 capitalize">{selectedEvent.location}</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">Participants</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedEvent.participants.length}
                      {selectedEvent.maxParticipants && ` / ${selectedEvent.maxParticipants}`} registered
                    </div>
                  </div>
                </div>

                {/* Prizes */}
                {selectedEvent.prizes.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      Prizes
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedEvent.prizes.map((prize) => (
                        <div key={prize.position} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Medal className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium text-gray-900">#{prize.position}</span>
                          </div>
                          <div className="text-sm text-gray-600">{prize.reward}</div>
                          <div className="text-xs text-gray-500 mt-1">{prize.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {(selectedEvent.requirements.minLevel || selectedEvent.requirements.gameMode || selectedEvent.requirements.equipment?.length) && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Requirements
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <div className="space-y-2 text-sm text-gray-700">
                        {selectedEvent.requirements.minLevel && (
                          <div>Minimum Level: {selectedEvent.requirements.minLevel}</div>
                        )}
                        {selectedEvent.requirements.gameMode && (
                          <div>Game Mode: {selectedEvent.requirements.gameMode}</div>
                        )}
                        {selectedEvent.requirements.equipment && selectedEvent.requirements.equipment.length > 0 && (
                          <div>
                            <div className="font-medium mb-1">Equipment Requirements:</div>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                              {selectedEvent.requirements.equipment.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Rules */}
                {selectedEvent.rules && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      Rules & Guidelines
                    </h4>
                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedEvent.rules}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowEventDetails(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Close
                  </button>
                  {isUserRegistered(selectedEvent.id) ? (
                    <button
                      onClick={() => {
                        handleLeaveEvent(selectedEvent.id);
                        setShowEventDetails(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <UserMinus className="w-4 h-4" />
                      Leave Event
                    </button>
                  ) : canUserJoin(selectedEvent) ? (
                    <button
                      onClick={() => {
                        handleJoinEvent(selectedEvent.id);
                        setShowEventDetails(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <UserPlus className="w-4 h-4" />
                      Join Event
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}