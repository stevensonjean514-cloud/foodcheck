let scriptLoadingPromise: Promise<void> | null = null;

export function loadGoogleMapsScript(): Promise<void> {
  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  if (window.google?.maps?.places) {
    return Promise.resolve();
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      reject(new Error('Google Maps API key not configured'));
      return;
    }

    (window as any).initGoogleMaps = () => {
      resolve();
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.onerror = () => {
      scriptLoadingPromise = null;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}
