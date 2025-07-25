'use client';

import { Game, DeploymentState } from '@/types/game';

interface SimpleGameCardProps {
  game: Game;
  onDeploy: (gameId: string) => void;
  deploymentState?: DeploymentState;
  className?: string;
}

export default function SimpleGameCard({ game, onDeploy, deploymentState, className = '' }: SimpleGameCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{game.title}</h3>
      <p className="text-gray-600 mb-4">{game.description}</p>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">Difficulty: {game.difficulty}</span>
        <span className="text-sm text-gray-500">Players: {game.recommendedPlayers}</span>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {game.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            {tag}
          </span>
        ))}
      </div>
      
      <button
        onClick={() => onDeploy(game.id)}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Deploy Server
      </button>
    </div>
  );
}