import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface LegalProps {
  onBack: () => void;
  initialTab?: 'privacy' | 'terms';
}

export default function Legal({ onBack, initialTab = 'privacy' }: LegalProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 pb-20">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-700 hover:text-red-600 mb-6 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back</span>
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 py-4 px-6 font-bold text-center transition-colors ${
                activeTab === 'privacy'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex-1 py-4 px-6 font-bold text-center transition-colors ${
                activeTab === 'terms'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
              }`}
            >
              Terms of Service
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'privacy' ? (
              <div className="prose prose-sm sm:prose max-w-none">
                <h1 className="text-3xl font-black text-gray-900 mb-2">PRIVACY POLICY</h1>
                <p className="text-gray-600 mb-6">Effective Date: March 17, 2026</p>

                <p className="text-gray-700 mb-6">
                  FoodCheck ("we", "us", "our") is operated by an independent developer based in Quebec, Canada.
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Information We Collect:</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                  <li>Vote data (anonymous, no account required)</li>
                  <li>Photos you voluntarily upload</li>
                  <li>Basic usage analytics</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">How We Use Your Information:</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                  <li>To display community votes and rankings</li>
                  <li>To show user-submitted reality photos</li>
                  <li>To improve the app experience</li>
                </ul>

                <p className="text-gray-700 mb-6">
                  We do not sell your data to third parties. We do not require you to create an account. All votes are tracked by anonymous session ID only.
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Third Party Services:</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                  <li>Supabase (database and storage)</li>
                  <li>Anthropic Claude API (AI analysis)</li>
                </ul>

                <p className="text-gray-700 mt-8">
                  <strong>Contact:</strong>{' '}
                  <a href="mailto:foodcheck.ca@gmail.com" className="text-red-600 hover:text-red-700 font-semibold">
                    foodcheck.ca@gmail.com
                  </a>
                </p>
              </div>
            ) : (
              <div className="prose prose-sm sm:prose max-w-none">
                <h1 className="text-3xl font-black text-gray-900 mb-2">TERMS OF SERVICE</h1>
                <p className="text-gray-600 mb-6">Effective Date: March 17, 2026</p>

                <p className="text-gray-700 mb-6">
                  By using FoodCheck you agree to the following:
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">User Content</h2>
                <p className="text-gray-700 mb-6">
                  By uploading photos you confirm you took the photo yourself and own the rights to it. You grant FoodCheck a non-exclusive license to display it.
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Acceptable Use</h2>
                <p className="text-gray-700 mb-6">
                  You agree not to upload offensive, inappropriate, or unrelated content. FoodCheck reserves the right to remove any content at any time.
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Restaurant Images</h2>
                <p className="text-gray-700 mb-6">
                  Ad images displayed on FoodCheck are sourced from official restaurant websites and are used purely for editorial comparison and consumer information purposes under fair use principles.
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Disclaimer</h2>
                <p className="text-gray-700 mb-6">
                  FoodCheck is an independent consumer platform not affiliated with any restaurant or food brand.
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Limitation of Liability</h2>
                <p className="text-gray-700 mb-6">
                  FoodCheck is provided as-is. We are not responsible for any damages arising from use of the app.
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Governing Law</h2>
                <p className="text-gray-700 mb-6">
                  These terms are governed by the laws of Quebec, Canada.
                </p>

                <p className="text-gray-700 mt-8">
                  <strong>Contact:</strong>{' '}
                  <a href="mailto:foodcheck.ca@gmail.com" className="text-red-600 hover:text-red-700 font-semibold">
                    foodcheck.ca@gmail.com
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
