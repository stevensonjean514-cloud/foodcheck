import { Eye, CheckCircle, Camera, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function WelcomeScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 p-4 animate-fadeIn">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 safe-top safe-right text-white/80 hover:text-white transition-colors p-2"
        aria-label="Close welcome screen"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
            FoodCheck
          </h1>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3 drop-shadow-md">
            Fast Food Ads vs. Reality
          </h2>
          <p className="text-xl md:text-2xl text-white/90 font-semibold drop-shadow">
            How honest is your favourite fast food?
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-1">See</h3>
                <p className="text-gray-600">
                  Compare the ad photo to what you really get
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Vote</h3>
                <p className="text-gray-600">
                  Tell us if it's honest or a total lie
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-500 to-red-500 rounded-2xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Expose</h3>
                <p className="text-gray-600">
                  Upload your own reality photos
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="w-full bg-white text-red-600 font-black text-2xl py-5 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 transition-all duration-200"
        >
          Start Judging 🍔
        </button>

        <p className="mt-6 text-white/80 text-sm">
          Join thousands of food critics exposing the truth
        </p>
      </div>
    </div>
  );
}
