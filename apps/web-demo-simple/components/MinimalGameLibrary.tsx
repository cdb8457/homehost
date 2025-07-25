'use client';

import { useState, useEffect } from 'react';

interface SimpleGame {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

export default function MinimalGameLibrary() {
  const [games, setGames] = useState<SimpleGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set mock data
    const mockGames: SimpleGame[] = [
      {
        id: 'valheim',
        title: 'Valheim',
        description: 'Viking survival game',
        difficulty: 'Easy'
      },
      {
        id: 'rust',
        title: 'Rust',
        description: 'Survival multiplayer game',
        difficulty: 'Hard'
      }
    ];
    
    setGames(mockGames);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-8">Loading games...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-8">Game Library</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div key={game.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-2">{game.title}</h3>
            <p className="text-gray-600 mb-4">{game.description}</p>
            <p className="text-sm text-gray-500 mb-4">Difficulty: {game.difficulty}</p>
            <button 
              onClick={() => alert(`Deploying ${game.title}!`)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Deploy Server
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}