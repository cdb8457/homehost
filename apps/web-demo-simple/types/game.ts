export interface Game {
  id: string;
  title: string;
  description: string;
  artwork: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  maxPlayers: number;
  recommendedPlayers: string;
  setupTime: string;
  popularityScore: number;
  communityServerCount: number;
  isTrending: boolean;
  isPopularWithFriends: boolean;
  tags: string[];
  steamId?: string;
  requirements: {
    ram: string;
    storage: string;
    network: string;
  };
}

export interface GameFilter {
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  playerCount?: 'Small' | 'Medium' | 'Large';
  sortBy?: 'popularity' | 'difficulty' | 'trending' | 'alphabetical';
  searchTerm?: string;
}

export interface DeploymentState {
  gameId: string;
  status: 'idle' | 'preparing' | 'downloading' | 'configuring' | 'starting' | 'success' | 'error';
  progress: number;
  message: string;
  estimatedTime?: string;
}