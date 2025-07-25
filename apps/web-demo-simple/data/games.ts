import { Game } from '@/types/game';

export const SUPPORTED_GAMES: Game[] = [
  {
    id: 'valheim',
    title: 'Valheim',
    description: 'Viking survival adventure with friends in a procedurally generated world',
    artwork: '/images/games/valheim.jpg',
    difficulty: 'Easy',
    maxPlayers: 10,
    recommendedPlayers: '2-6',
    setupTime: '< 5 min',
    popularityScore: 95,
    communityServerCount: 2847,
    isTrending: true,
    isPopularWithFriends: true,
    tags: ['Survival', 'Co-op', 'Viking', 'Building'],
    steamId: '892970',
    requirements: {
      ram: '2GB',
      storage: '2GB',
      network: '10 Mbps'
    }
  },
  {
    id: 'motortown',
    title: 'MotorTown',
    description: 'Behind the Wheel racing simulation with dynamic weather and realistic physics',
    artwork: '/images/games/motortown.jpg',
    difficulty: 'Medium',
    maxPlayers: 32,
    recommendedPlayers: '4-12',
    setupTime: '< 8 min',
    popularityScore: 87,
    communityServerCount: 1234,
    isTrending: true,
    isPopularWithFriends: false,
    tags: ['Racing', 'Simulation', 'Multiplayer', 'Realistic'],
    steamId: '1405780',
    requirements: {
      ram: '4GB',
      storage: '8GB',
      network: '15 Mbps'
    }
  },
  {
    id: 'cs2',
    title: 'Counter-Strike 2',
    description: 'The legendary tactical shooter rebuilt from the ground up',
    artwork: '/images/games/cs2.jpg',
    difficulty: 'Hard',
    maxPlayers: 64,
    recommendedPlayers: '10-20',
    setupTime: '< 12 min',
    popularityScore: 98,
    communityServerCount: 15743,
    isTrending: false,
    isPopularWithFriends: true,
    tags: ['FPS', 'Tactical', 'Competitive', 'Esports'],
    steamId: '730',
    requirements: {
      ram: '8GB',
      storage: '25GB',
      network: '25 Mbps'
    }
  },
  {
    id: 'rust',
    title: 'Rust',
    description: 'Multiplayer survival game where you fight to survive in a harsh open world',
    artwork: '/images/games/rust.jpg',
    difficulty: 'Hard',
    maxPlayers: 200,
    recommendedPlayers: '20-50',
    setupTime: '< 15 min',
    popularityScore: 92,
    communityServerCount: 8921,
    isTrending: false,
    isPopularWithFriends: false,
    tags: ['Survival', 'PvP', 'Crafting', 'Open World'],
    steamId: '252490',
    requirements: {
      ram: '16GB',
      storage: '30GB',
      network: '50 Mbps'
    }
  },
  {
    id: 'seven-days',
    title: '7 Days to Die',
    description: 'Survival horde crafting game set in a post-apocalyptic zombie world',
    artwork: '/images/games/7days.jpg',
    difficulty: 'Medium',
    maxPlayers: 8,
    recommendedPlayers: '2-4',
    setupTime: '< 7 min',
    popularityScore: 83,
    communityServerCount: 1567,
    isTrending: false,
    isPopularWithFriends: false,
    tags: ['Survival', 'Zombies', 'Crafting', 'Co-op'],
    steamId: '251570',
    requirements: {
      ram: '8GB',
      storage: '15GB',
      network: '20 Mbps'
    }
  }
];

export const GAME_CATEGORIES = {
  trending: SUPPORTED_GAMES.filter(game => game.isTrending),
  popularWithFriends: SUPPORTED_GAMES.filter(game => game.isPopularWithFriends),
  easyToSetup: SUPPORTED_GAMES.filter(game => game.difficulty === 'Easy'),
  survival: SUPPORTED_GAMES.filter(game => game.tags.includes('Survival')),
  competitive: SUPPORTED_GAMES.filter(game => game.tags.includes('Competitive') || game.tags.includes('FPS'))
};