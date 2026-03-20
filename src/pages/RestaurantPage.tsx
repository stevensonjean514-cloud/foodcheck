import { useState, useEffect } from 'react';
import { ArrowLeft, Store } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Restaurant, MenuItemWithRestaurant } from '../types/database';
import ItemCard from '../components/ItemCard';

interface RestaurantPageProps {
  slug: string;
  onBack: () => void;
  onItemClick: (id: string) => void;
}

export default function RestaurantPage({ slug, onBack, onItemClick }: RestaurantPageProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [items, setItems] = useState<MenuItemWithRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurant();
  }, [slug]);

  const loadRestaurant = async () => {
    setLoading(true);

    const { data: restaurantData } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (restaurantData) {
      setRestaurant(restaurantData);

      const { data: itemsData } = await supabase
        .from('menu_items')
        .select(`
          *,
          restaurant:restaurants(*),
          reality_photos(*)
        `)
        .eq('restaurant_id', restaurantData.id)
        .order('accuracy_score', { ascending: true });

      if (itemsData) {
        setItems(itemsData as MenuItemWithRestaurant[]);
      }
    }

    setLoading(false);
  };

  if (loading || !restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  const avgScore = items.length > 0
    ? Math.round(items.reduce((acc, item) => {
        const total = item.honest_votes + item.lie_votes;
        const percent = total > 0 ? (item.honest_votes / total) * 100 : 50;
        return acc + percent;
      }, 0) / items.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-20">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-700 hover:text-red-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold">Back</span>
      </button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-red-600 to-yellow-500 p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <Store className="w-10 h-10" />
                <h1 className="text-4xl font-black">{restaurant.name}</h1>
              </div>
              <p className="text-red-100 text-lg">{restaurant.description}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
              <div className="text-4xl font-black">{avgScore}%</div>
              <div className="text-sm text-red-100 mt-1">Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Items Ranked by Accuracy
        </h2>
        <p className="text-gray-600">
          {items.length} items, sorted from most misleading to most accurate
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <p className="text-xl text-gray-600">No items yet for this restaurant</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => onItemClick(item.id)}
              onVoteUpdate={loadRestaurant}
            />
          ))}
        </div>
      )}
    </div>
  );
}
