'use client';

import { useState } from 'react';
import { Game, DeploymentState } from '@/types/game';
import { 
  Play, 
  Users, 
  Clock, 
  TrendingUp, 
  Heart, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Zap
} from 'lucide-react';

interface GameCardProps {
  game: Game;
  onDeploy: (gameId: string) => void;
  deploymentState?: DeploymentState;
  className?: string;
}

export default function GameCard({ game, onDeploy, deploymentState, className = '' }: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const isDeploying = deploymentState?.gameId === game.id && deploymentState?.status !== 'idle';
  const isDeploymentComplete = deploymentState?.gameId === game.id && deploymentState?.status === 'success';
  const hasDeploymentError = deploymentState?.gameId === game.id && deploymentState?.status === 'error';

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDeploymentIcon = () => {
    if (isDeploymentComplete) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (hasDeploymentError) return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (isDeploying) return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />;
    return <Play className="w-5 h-5 text-white" />;
  };

  const getButtonText = () => {
    if (isDeploymentComplete) return 'Server Running!';
    if (hasDeploymentError) return 'Retry Deploy';
    if (isDeploying) return deploymentState?.message || 'Deploying...';
    return 'Deploy Server';
  };

  const getButtonStyle = () => {
    if (isDeploymentComplete) return 'bg-green-600 hover:bg-green-700 ring-green-500';
    if (hasDeploymentError) return 'bg-red-600 hover:bg-red-700 ring-red-500';
    if (isDeploying) return 'bg-blue-600 cursor-not-allowed ring-blue-500';
    return 'bg-indigo-600 hover:bg-indigo-700 ring-indigo-500 hover:ring-2 hover:ring-offset-2';
  };

  return (
    <div 
      className={`relative group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
        {game.isTrending && (
          <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium border border-orange-200">
            <TrendingUp className="w-3 h-3" />
            Trending
          </div>
        )}
        {game.isPopularWithFriends && (
          <div className="flex items-center gap-1 bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs font-medium border border-pink-200">
            <Heart className="w-3 h-3" />
            Popular
          </div>
        )}
      </div>

      {/* Game Artwork */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl font-bold text-white/20 font-mono">
            {game.title.charAt(0)}
          </div>
        </div>
        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{game.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{game.description}</p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(game.difficulty)}`}>
            {game.difficulty}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
              <Users className="w-4 h-4" />
              <span>Players</span>
            </div>
            <div className="font-semibold text-gray-900">{game.recommendedPlayers}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
              <Clock className="w-4 h-4" />
              <span>Setup</span>
            </div>
            <div className="font-semibold text-gray-900">{game.setupTime}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
              <Zap className="w-4 h-4" />
              <span>Servers</span>
            </div>
            <div className="font-semibold text-gray-900">{game.communityServerCount.toLocaleString()}</div>
          </div>
        </div>

        {/* Deploy Button */}
        <button
          onClick={() => !isDeploying && onDeploy(game.id)}
          disabled={isDeploying}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonStyle()}`}
        >
          {getDeploymentIcon()}
          {getButtonText()}
        </button>

        {/* Progress Bar */}
        {isDeploying && deploymentState && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>{deploymentState.message}</span>
              <span>{deploymentState.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${deploymentState.progress}%` }}
              />
            </div>
            {deploymentState.estimatedTime && (
              <div className="text-xs text-gray-500 mt-1">
                Estimated time: {deploymentState.estimatedTime}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-4">
          {game.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
              {tag}
            </span>
          ))}
          {game.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
              +{game.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}