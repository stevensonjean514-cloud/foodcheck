import { useState } from 'react';
import { X, UtensilsCrossed } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AddMenuItemProps {
  restaurantId: string;
  restaurantName: string;
  onClose: () => void;
  onSuccess: (itemId: string) => void;
}

const CATEGORIES = [
  'burgers',
  'chicken',
  'pizza',
  'tacos',
  'sandwiches',
  'sides',
  'desserts',
  'drinks',
  'breakfast',
  'other'
];

export default function AddMenuItem({ restaurantId, restaurantName, onClose, onSuccess }: AddMenuItemProps) {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('burgers');
  const [officialPhotoUrl, setOfficialPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const slug = itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { data, error: insertError } = await supabase
      .from('menu_items')
      .insert({
        restaurant_id: restaurantId,
        name: itemName,
        slug,
        category,
        official_photo_url: officialPhotoUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        description: `User-submitted ${category} item from ${restaurantName}`,
        is_community_submitted: true,
        accuracy_score: 50,
        total_votes: 0,
        honest_votes: 0,
        lie_votes: 0
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    if (data) {
      onSuccess(data.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-red-600 to-yellow-500 p-3 rounded-2xl">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Add Menu Item</h2>
            <p className="text-sm text-gray-600">{restaurantName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none"
              placeholder="e.g., Whopper"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none"
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Official Ad Photo URL (optional)
            </label>
            <input
              type="url"
              value={officialPhotoUrl}
              onChange={(e) => setOfficialPhotoUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none"
              placeholder="https://example.com/photo.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to use a default placeholder
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-red-600 to-yellow-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
