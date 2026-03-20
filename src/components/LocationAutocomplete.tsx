import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { loadGoogleMapsScript } from '../utils/loadGoogleMaps';

interface LocationAutocompleteProps {
  value: string;
  onChange: (address: string, placeDetails?: PlaceDetails) => void;
  placeholder?: string;
  className?: string;
}

export interface PlaceDetails {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Search for address...",
  className = ""
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        console.log('Google Maps API loaded successfully');
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error('Failed to load Google Maps API:', error);
        setLoadError(error.message);
      });
  }, []);

  useEffect(() => {
    if (inputRef.current && value !== undefined) {
      inputRef.current.value = value;
    }
  }, [value]);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        fields: ['formatted_address', 'geometry', 'place_id', 'name']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (place.geometry && place.geometry.location) {
          const placeDetails: PlaceDetails = {
            address: place.formatted_address || '',
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            placeId: place.place_id || ''
          };
          onChange(place.formatted_address || '', placeDetails);
        } else {
          onChange(place.formatted_address || place.name || '');
        }
      });

      autocompleteRef.current = autocomplete;
    } catch (error) {
      console.error('Error initializing Google Maps Autocomplete:', error);
    }
  }, [isLoaded, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <MapPin className="w-5 h-5" />
      </div>
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        onChange={handleInputChange}
        placeholder={loadError ? "Location search unavailable" : placeholder}
        disabled={!!loadError}
        className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${loadError ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
      />
      {!isLoaded && !loadError && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-red-600"></div>
        </div>
      )}
    </div>
  );
}
