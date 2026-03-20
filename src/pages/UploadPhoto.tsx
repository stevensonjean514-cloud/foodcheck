import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, Plus, Camera } from 'lucide-react';
import { Camera as CapCamera } from '@capacitor/camera';
import { CameraResultType, CameraSource } from '@capacitor/camera';
import { supabase } from '../lib/supabase';
import type { MenuItem, Restaurant } from '../types/database';
import AddRestaurant from '../components/AddRestaurant';
import AddMenuItem from '../components/AddMenuItem';
import LocationAutocomplete, { PlaceDetails } from '../components/LocationAutocomplete';

interface UploadPhotoProps {
  onBack: () => void;
}

export default function UploadPhoto({ onBack }: UploadPhotoProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [locationDetails, setLocationDetails] = useState<PlaceDetails | null>(null);
  const [comment, setComment] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [showAddMenuItem, setShowAddMenuItem] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      loadMenuItems(selectedRestaurant);
    } else {
      setMenuItems([]);
      setSelectedItem('');
    }
  }, [selectedRestaurant]);

  const loadRestaurants = async () => {
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .order('name');

    if (data) {
      setRestaurants(data);
    }
  };

  const loadMenuItems = async (restaurantId: string) => {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('name');

    if (data) {
      setMenuItems(data);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        setPhotoPreview(image.dataUrl);

        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setPhotoFile(file);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const handleChoosePhoto = async () => {
    try {
      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      if (image.dataUrl) {
        setPhotoPreview(image.dataUrl);

        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setPhotoFile(file);
      }
    } catch (error) {
      console.error('Error choosing photo:', error);
    }
  };

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

    if (!selectedItem || !photoFile || !username) return;

    setUploading(true);

    try {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${selectedItem}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('reality-photos')
        .upload(filePath, photoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('reality-photos')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('uploads').insert({
        menu_item_id: selectedItem,
        photo_url: publicUrl,
        username: username,
        location_address: location || null,
        location_lat: locationDetails?.lat || null,
        location_lng: locationDetails?.lng || null,
        location_place_id: locationDetails?.placeId || null,
        comment: comment.trim() || null
      });

      if (!dbError) {
        setSuccess(true);
        setTimeout(() => {
          onBack();
        }, 2000);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }

    setUploading(false);
  };

  const handleRestaurantAdded = async (restaurantId: string) => {
    setShowAddRestaurant(false);
    await loadRestaurants();
    setSelectedRestaurant(restaurantId);
  };

  const handleMenuItemAdded = async (itemId: string) => {
    setShowAddMenuItem(false);
    await loadMenuItems(selectedRestaurant);
    setSelectedItem(itemId);
  };

  const getSelectedRestaurantName = () => {
    const restaurant = restaurants.find(r => r.id === selectedRestaurant);
    return restaurant?.name || '';
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Upload Successful!</h2>
          <p className="text-gray-600 text-lg">Your reality check has been added to the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-700 hover:text-red-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold">Back</span>
      </button>

      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-2">
          Upload Reality Photo
        </h1>
        <p className="text-gray-600 text-lg">
          Show the world what you really got
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Restaurant
          </label>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none"
            required
          >
            <option value="">Select a restaurant...</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowAddRestaurant(true)}
            className="mt-2 flex items-center space-x-2 text-red-600 hover:text-red-700 font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add a new restaurant</span>
          </button>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Menu Item
          </label>
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none"
            required
            disabled={!selectedRestaurant}
          >
            <option value="">Select an item...</option>
            {menuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {selectedRestaurant && (
            <button
              type="button"
              onClick={() => setShowAddMenuItem(true)}
              className="mt-2 flex items-center space-x-2 text-red-600 hover:text-red-700 font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add new menu item</span>
            </button>
          )}
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
            Help others find this location by providing the specific address
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Your Username
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-4 rounded-l-xl border-2 border-r-0 border-gray-200 bg-gray-50 text-gray-600">
              @
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 px-4 py-3 rounded-r-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none"
              placeholder="username"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Photo
          </label>

          {!photoPreview ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleTakePhoto}
                className="w-full h-32 border-4 border-dashed border-gray-300 rounded-2xl hover:border-red-500 transition-colors flex flex-col items-center justify-center text-gray-500 hover:text-red-600 active:scale-95 transition-transform"
              >
                <Camera className="w-12 h-12 mb-2" />
                <p className="text-lg font-semibold">Take Photo</p>
              </button>

              <button
                type="button"
                onClick={handleChoosePhoto}
                className="w-full h-32 border-4 border-dashed border-gray-300 rounded-2xl hover:border-red-500 transition-colors flex flex-col items-center justify-center text-gray-500 hover:text-red-600 active:scale-95 transition-transform"
              >
                <Upload className="w-12 h-12 mb-2" />
                <p className="text-lg font-semibold">Choose from Gallery</p>
              </button>

              <label className="block w-full h-32 border-4 border-dashed border-gray-300 rounded-2xl hover:border-red-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <div className="h-full flex flex-col items-center justify-center text-gray-500 hover:text-red-600 transition-colors">
                  <Upload className="w-12 h-12 mb-2" />
                  <p className="text-lg font-semibold">Upload from Device</p>
                </div>
              </label>
            </div>
          ) : (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-2xl"
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoPreview(null);
                  setPhotoFile(null);
                }}
                className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Your Comment <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => {
              if (e.target.value.length <= 280) {
                setComment(e.target.value);
              }
            }}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none resize-none"
            placeholder="Tell us what you think... (e.g. 'The burger was completely flat and cold, nothing like the ad!')"
            rows={4}
            maxLength={280}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Share your honest thoughts about what you received
            </p>
            <p className={`text-xs font-semibold ${comment.length >= 280 ? 'text-red-600' : 'text-gray-500'}`}>
              {280 - comment.length} characters left
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading || !selectedItem || !photoPreview || !username}
          className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {uploading ? (
            <>
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Submit Reality Check</span>
            </>
          )}
        </button>
      </form>

      {showAddRestaurant && (
        <AddRestaurant
          onClose={() => setShowAddRestaurant(false)}
          onSuccess={handleRestaurantAdded}
        />
      )}

      {showAddMenuItem && (
        <AddMenuItem
          restaurantId={selectedRestaurant}
          restaurantName={getSelectedRestaurantName()}
          onClose={() => setShowAddMenuItem(false)}
          onSuccess={handleMenuItemAdded}
        />
      )}
    </div>
  );
}
