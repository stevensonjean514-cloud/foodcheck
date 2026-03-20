import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingDown, TrendingUp, Trophy, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MenuItemWithRestaurant } from '../types/database';

interface LeaderboardProps {
  onBack: () => void;
  onItemClick: (id: string) => void;
}

export default function Leaderboard({ onBack, onItemClick }: LeaderboardProps) {
  const [mostMisleading, setMostMisleading] = useState<MenuItemWithRestaurant[]>([]);
  const [mostAccurate, setMostAccurate] = useState<MenuItemWithRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'misleading' | 'accurate'>('misleading');

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    setLoading(true);

    const { data: allItems } = await supabase
      .from('menu_items')
      .select(`
        *,
        restaurant:restaurants(*),
        reality_photos(*)
      `);

    if (allItems) {
      const itemsWithPercent = (allItems as MenuItemWithRestaurant[]).map(item => {
        const total = item.honest_votes + item.lie_votes;
        const honestPercent = total > 0 ? (item.honest_votes / total) * 100 : 50;
        return { ...item, honestPercent };
      });

      const sortedByMisleading = [...itemsWithPercent].sort((a, b) => a.honestPercent - b.honestPercent);
      const sortedByAccurate = [...itemsWithPercent].sort((a, b) => b.honestPercent - a.honestPercent);

      setMostMisleading(sortedByMisleading.slice(0, 10));
      setMostAccurate(sortedByAccurate.slice(0, 10));
    }

    setLoading(false);
  };

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'bg-yellow-400 text-yellow-900';
    if (rank === 1) return 'bg-gray-300 text-gray-900';
    if (rank === 2) return 'bg-orange-400 text-orange-900';
    return 'bg-gray-100 text-gray-700';
  };

  const handleShareShame = () => {
    const top3 = mostMisleading.slice(0, 3);
    const shameList = top3.map((item, index) => {
      const total = item.honest_votes + item.lie_votes;
      const percent = total > 0 ? Math.round((item.honest_votes / total) * 100) : 50;
      return `${index + 1}. ${item.restaurant.name} ${item.name} - ${percent}% honest`;
    }).join('\n');

    const tweetText = `The Shame Wall on FoodCheck 💀\n\n${shameList}\n\nCheck out more dishonest ads: ${window.location.origin} #FoodCheck #AdVsReality`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const items = activeTab === 'misleading' ? mostMisleading : mostAccurate;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-700 hover:text-red-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold">Back</span>
      </button>

      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-2">
          The Leaderboards
        </h1>
        <p className="text-gray-600 text-lg">
          The best and worst offenders in fast food
        </p>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('misleading')}
          className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'misleading'
              ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
          }`}
        >
          <TrendingDown className="w-5 h-5" />
          <span>Shame Wall</span>
        </button>
        <button
          onClick={() => setActiveTab('accurate')}
          className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'accurate'
              ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>Heroes</span>
        </button>
      </div>

      {activeTab === 'misleading' && mostMisleading.length >= 3 && (
        <button
          onClick={handleShareShame}
          className="w-full mb-6 bg-black hover:bg-gray-800 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2"
        >
          <Share2 className="w-5 h-5" />
          <span>Share the Shame 💀</span>
        </button>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className="w-full bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-4 flex items-center space-x-4 text-left group"
            >
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-black text-2xl flex-shrink-0 ${getRankColor(index)}`}>
                {index < 3 ? <Trophy className="w-8 h-8" /> : `#${index + 1}`}
              </div>

              <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={item.official_photo_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <h3 className="font-bold text-lg text-gray-900 mb-1 break-words">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-2 break-words">{item.restaurant.name}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {(item.honest_votes + item.lie_votes).toLocaleString()} votes
                  </span>
                </div>
              </div>

              <div className={`text-2xl md:text-3xl font-black px-3 md:px-4 py-2 rounded-xl flex-shrink-0 ${
                (() => {
                  const total = item.honest_votes + item.lie_votes;
                  const percent = total > 0 ? Math.round((item.honest_votes / total) * 100) : 50;
                  return percent >= 70
                    ? 'bg-green-100 text-green-700'
                    : percent >= 50
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700';
                })()
              }`}>
                {(() => {
                  const total = item.honest_votes + item.lie_votes;
                  return total > 0 ? Math.round((item.honest_votes / total) * 100) : 50;
                })()}%
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
