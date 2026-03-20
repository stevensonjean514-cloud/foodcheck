import { Menu, TrendingDown, Upload, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Page } from '../App';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [voteStreak, setVoteStreak] = useState(0);

  useEffect(() => {
    const streak = parseInt(localStorage.getItem('vote_streak') || '0', 10);
    setVoteStreak(streak);

    const handleVoteStreakUpdate = () => {
      const updatedStreak = parseInt(localStorage.getItem('vote_streak') || '0', 10);
      setVoteStreak(updatedStreak);
    };

    window.addEventListener('voteStreakUpdated', handleVoteStreakUpdate);
    return () => window.removeEventListener('voteStreakUpdated', handleVoteStreakUpdate);
  }, []);
  return (
    <header className="bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-lg sticky top-0 z-50 safe-top">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity active:scale-95"
            >
              <Menu className="w-6 h-6 sm:w-8 sm:h-8" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">FoodCheck</h1>
                <p className="text-xs text-red-100 hidden xs:block">Reality vs. Expectation</p>
              </div>
            </button>

            {voteStreak > 0 && (
              <div className="hidden lg:flex items-center space-x-1 bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <Flame className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-bold">You've rated {voteStreak} items</span>
              </div>
            )}
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => onNavigate('leaderboard')}
              className={`flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-lg transition-all active:scale-95 ${
                currentPage === 'leaderboard'
                  ? 'bg-white text-red-600 font-bold'
                  : 'hover:bg-red-700'
              }`}
            >
              <TrendingDown className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Shame Wall</span>
            </button>

            <button
              onClick={() => onNavigate('upload')}
              className={`flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-lg transition-all active:scale-95 ${
                currentPage === 'upload'
                  ? 'bg-white text-red-600 font-bold'
                  : 'hover:bg-red-700'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Upload</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
