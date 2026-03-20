import { useState, useEffect } from 'react';
import { Search, Store, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MenuItemWithRestaurant, Restaurant } from '../types/database';
import ItemCard from '../components/ItemCard';

interface HomeProps {
  onItemClick: (id: string) => void;
  onRestaurantClick: (slug: string) => void;
}

type SortOption = 'votes' | 'honest' | 'lies';

export default function Home({ onItemClick, onRestaurantClick }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<MenuItemWithRestaurant[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('votes');
  const [featuredItem, setFeaturedItem] = useState<MenuItemWithRestaurant | null>(null);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('menu_items_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'menu_items'
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [itemsResult, restaurantsResult] = await Promise.all([
      supabase
        .from('menu_items')
        .select(`
          *,
          restaurant:restaurants(*),
          reality_photos(*)
        `)
        .order('total_votes', { ascending: false })
        .limit(20),
      supabase.from('restaurants').select('*').order('name')
    ]);

    if (itemsResult.data) {
      setItems(itemsResult.data as MenuItemWithRestaurant[]);
      selectFeaturedItem(itemsResult.data as MenuItemWithRestaurant[]);
    }
    if (restaurantsResult.data) {
      setRestaurants(restaurantsResult.data);
    }
    setLoading(false);
  };

  const selectFeaturedItem = (allItems: MenuItemWithRestaurant[]) => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('featured_date');
    const storedItemId = localStorage.getItem('featured_item_id');

    if (storedDate === today && storedItemId) {
      const featured = allItems.find(item => item.id === storedItemId);
      if (featured) {
        setFeaturedItem(featured);
        return;
      }
    }

    if (allItems.length > 0) {
      const seed = new Date().getDate() + new Date().getMonth() * 31;
      const randomIndex = seed % allItems.length;
      const selected = allItems[randomIndex];

      setFeaturedItem(selected);
      localStorage.setItem('featured_date', today);
      localStorage.setItem('featured_item_id', selected.id);
    }
  };

  const filteredItems = items
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const totalVotesA = a.honest_votes + a.lie_votes;
      const totalVotesB = b.honest_votes + b.lie_votes;
      const honestPercentA = totalVotesA > 0 ? (a.honest_votes / totalVotesA) * 100 : 50;
      const honestPercentB = totalVotesB > 0 ? (b.honest_votes / totalVotesB) * 100 : 50;

      if (sortBy === 'votes') {
        return totalVotesB - totalVotesA;
      } else if (sortBy === 'honest') {
        return honestPercentB - honestPercentA;
      } else {
        return honestPercentA - honestPercentB;
      }
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-20">
      {featuredItem && (
        <div
          onClick={() => onItemClick(featuredItem.id)}
          className="mb-8 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-3xl p-6 shadow-xl cursor-pointer hover:shadow-2xl transition-all"
        >
          <div className="flex items-center space-x-3 mb-3">
            <Trophy className="w-8 h-8 text-gray-900" />
            <h3 className="text-2xl font-black text-gray-900">Most Talked About Today</h3>
          </div>
          <div className="bg-white rounded-2xl p-4 flex items-center space-x-4">
            <img
              src={featuredItem.official_photo_url}
              alt={featuredItem.name}
              className="w-24 h-24 object-cover rounded-xl"
            />
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900">{featuredItem.name}</h4>
              <p className="text-gray-600">{featuredItem.restaurant.name}</p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-700">
                  {(() => {
                    const total = featuredItem.honest_votes + featuredItem.lie_votes;
                    return total > 0
                      ? `${Math.round((featuredItem.honest_votes / total) * 100)}% Honest`
                      : 'No votes yet';
                  })()}
                </span>
                <span className="text-sm text-gray-500">
                  • {(featuredItem.honest_votes + featuredItem.lie_votes).toLocaleString()} votes
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 mb-2">
          Ads vs. Reality
        </h2>
        <p className="text-gray-600 text-lg">
          See how your favorite fast food really looks
        </p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search for an item or restaurant..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-red-500 focus:outline-none text-lg shadow-sm"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {restaurants.map((restaurant) => (
          <button
            key={restaurant.id}
            onClick={() => onRestaurantClick(restaurant.slug)}
            className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all shadow-sm"
          >
            <Store className="w-4 h-4 text-red-600" />
            <span className="font-semibold text-gray-800">{restaurant.name}</span>
          </button>
        ))}
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Sort by:</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setSortBy('votes')}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              sortBy === 'votes'
                ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            Most Votes
          </button>
          <button
            onClick={() => setSortBy('honest')}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              sortBy === 'honest'
                ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            Most Honest
          </button>
          <button
            onClick={() => setSortBy('lies')}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              sortBy === 'lies'
                ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            Biggest Lies
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading food fails...</p>
        </div>
      ) : (
        <>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No items found. Try a different search!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={() => onItemClick(item.id)}
                  onVoteUpdate={loadData}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
