import { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LocationAutocomplete, { PlaceDetails } from './LocationAutocomplete';

interface AddRestaurantProps {
  onClose: () => void;
  onSuccess: (restaurantId: string) => void;
}

const CUISINE_TYPES = [
  'Fast Food',
  'Pizza',
  'Burger',
  'Chicken',
  'Mexican',
  'Asian',
  'Sandwich',
  'Coffee',
  'Dessert',
  'Other'
];

export default function AddRestaurant({ onClose, onSuccess }: AddRestaurantProps) {
  const [restaurantName, setRestaurantName] = useState('');
  const [cuisineType, setCuisineType] = useState('Fast Food');
  const [logoUrl, setLogoUrl] = useState('');
  const [location, setLocation] = useState('');
  const [locationDetails, setLocationDetails] = useState<PlaceDetails | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLocationChange = (address: string, details?: PlaceDetails) => {
    setLocation(address);
    if (details) {
      setLocationDetails(details);
    } else {
      setLocationDetails(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const slug = restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    let description = `User-submitted ${cuisineType} restaurant`;
    if (location) {
      description += ` - ${location}`;
    }

    const { data, error: insertError } = await supabase
      .from('restaurants')
      .insert({
        name: restaurantName,
        slug,
        cuisine_type: cuisineType,
        logo_url: logoUrl || null,
        description: description,
        is_community_submitted: true
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
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Add Restaurant</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Restaurant Name *
            </label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none"
              placeholder="e.g., Burger King"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Cuisine Type *
            </label>
            <select
              value={cuisineType}
              onChange={(e) => setCuisineType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none"
              required
            >
              {CUISINE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Location
            </label>
            <LocationAutocomplete
              value={location}
              onChange={handleLocationChange}
              placeholder="Enter restaurant address (e.g., 1234 Rue Sainte-Catherine, Montreal, QC)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide the address of this restaurant location
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Logo URL (optional)
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none"
              placeholder="https://example.com/logo.png"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank if you don't have a logo URL
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
              {submitting ? 'Adding...' : 'Add Restaurant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
