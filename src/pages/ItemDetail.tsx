import { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Sparkles, Copy, Check, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MenuItemWithRestaurant, Upload } from '../types/database';
import ImageSlider from '../components/ImageSlider';

interface ItemDetailProps {
  itemId: string;
  onBack: () => void;
}

interface AIAnalysis {
  honestyScore: number;
  worstOffense: string;
  redeemingQuality: string;
  adTactics: string[];
}

export default function ItemDetail({ itemId, onBack }: ItemDetailProps) {
  const [item, setItem] = useState<MenuItemWithRestaurant | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadItem();

    const channel = supabase
      .channel(`item_${itemId}_changes`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'menu_items',
          filter: `id=eq.${itemId}`
        },
        () => {
          loadItem();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId]);

  const loadItem = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('menu_items')
      .select(`
        *,
        restaurant:restaurants(*),
        reality_photos(*)
      `)
      .eq('id', itemId)
      .single();

    if (data) {
      setItem(data as MenuItemWithRestaurant);
    }

    const { data: uploadsData } = await supabase
      .from('uploads')
      .select('*')
      .eq('menu_item_id', itemId)
      .order('created_at', { ascending: false });

    if (uploadsData) {
      setUploads(uploadsData);
    }

    setLoading(false);
  };

  const handleAnalyze = async () => {
    if (!item || analyzing) return;

    setAnalyzing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-item`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            itemName: item.name,
            restaurantName: item.restaurant.name,
            description: item.description,
            honestPercent: (item.honest_votes + item.lie_votes) > 0
                ? Math.round((item.honest_votes / (item.honest_votes + item.lie_votes)) * 100)
                : 0
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleShareTwitter = () => {
    if (!item) return;

    const totalVotes = item.honest_votes + item.lie_votes;
    const honestPercent = totalVotes > 0 ? Math.round((item.honest_votes / totalVotes) * 100) : 50;

    const verdict = honestPercent >= 75 ? '👍' : honestPercent >= 50 ? '🤷' : honestPercent >= 30 ? '😱' : '🚨💀';

    const tweetText = `${item.restaurant.name}'s ${item.name} is only ${honestPercent}% honest according to FoodCheck ${verdict} Check it out: ${window.location.href} #FoodCheck #AdVsReality`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading || !item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  const latestUpload = uploads[0] ?? null;
  const totalVotes = item.honest_votes + item.lie_votes;
  const honestPercent = totalVotes > 0 ? Math.round((item.honest_votes / totalVotes) * 100) : 0;

  const getVerdictLabel = (percent: number) => {
    if (percent >= 75) return 'Pretty Honest';
    if (percent >= 50) return 'Meh';
    if (percent >= 30) return 'Total Lie';
    return 'CRIMINAL';
  };

  const getVerdictColor = (percent: number) => {
    if (percent >= 75) return 'bg-green-500';
    if (percent >= 50) return 'bg-yellow-500';
    if (percent >= 30) return 'bg-red-500';
    return 'bg-red-700';
  };

  const getScoreEmoji = (percent: number) => {
    if (percent >= 75) return '👍';
    if (percent >= 50) return '🤷';
    if (percent >= 30) return '😱';
    return '🚨';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-700 hover:text-red-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold">Back</span>
      </button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-red-600 to-yellow-500 p-6 text-white">
          <h1 className="text-3xl font-black mb-2">{item.name}</h1>
          <p className="text-red-100 text-lg">{item.restaurant.name}</p>
          <p className="text-sm text-red-100 mt-2">{item.description}</p>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">
                Honesty Rating {totalVotes > 0 ? getScoreEmoji(honestPercent) : ''}
              </h2>
              <p className="text-gray-600">
                {totalVotes > 0
                  ? `Based on ${totalVotes.toLocaleString()} community votes`
                  : 'No votes yet — be the first!'}
              </p>
            </div>
            {totalVotes > 0 ? (
              <div className={`text-5xl font-black text-white ${getVerdictColor(honestPercent)} rounded-2xl px-6 py-3 shadow-lg`}>
                {honestPercent}%
              </div>
            ) : (
              <div className="text-base font-bold text-gray-400 bg-gray-100 rounded-2xl px-4 py-3 shadow-lg">
                No votes
              </div>
            )}
          </div>

          <div className="mb-6">
            {totalVotes > 0 ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-green-600">✓ Honest ({item.honest_votes})</span>
                  <span className="text-sm font-semibold text-red-600">✗ Lie ({item.lie_votes})</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
                  <div
                    className="bg-green-500 transition-all duration-500"
                    style={{ width: `${honestPercent}%` }}
                  />
                  <div
                    className="bg-red-500 transition-all duration-500"
                    style={{ width: `${100 - honestPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-center mt-3">
                  <span className={`text-sm font-bold px-4 py-2 rounded-full border-2 ${
                    honestPercent >= 75 ? 'bg-green-100 text-green-700 border-green-300' :
                    honestPercent >= 50 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                    honestPercent >= 30 ? 'bg-red-100 text-red-700 border-red-300' :
                    'bg-red-200 text-red-900 border-red-400'
                  }`}>
                    Verdict: {getVerdictLabel(honestPercent)}
                  </span>
                </div>
              </>
            ) : (
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3" />
            )}
          </div>

          <ImageSlider
            adImage={item.official_photo_url}
            realityImage={latestUpload?.photo_url ?? null}
            itemName={item.name}
          />

          <div className="mt-6 space-y-3">
            <div className="flex space-x-3">
              <button
                onClick={handleShareTwitter}
                className="flex-1 flex items-center justify-center space-x-2 bg-black hover:bg-gray-800 text-white py-4 rounded-xl font-bold transition-all"
              >
                <Share2 className="w-5 h-5" />
                <span>Share Your Verdict</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-4 rounded-xl font-bold transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>AI Analysis</span>
                </>
              )}
            </button>
          </div>

          {analysis && (
            <div className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-black text-gray-900">AI Analysis</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-gray-600 mb-1">Honesty Score</h4>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${analysis.honestyScore >= 70 ? 'bg-green-500' : analysis.honestyScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${analysis.honestyScore}%` }}
                      />
                    </div>
                    <span className="font-bold text-lg">{analysis.honestyScore}%</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-gray-600 mb-1">Worst Ad Offense</h4>
                  <p className="text-gray-800">{analysis.worstOffense}</p>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-gray-600 mb-1">Redeeming Quality</h4>
                  <p className="text-gray-800">{analysis.redeemingQuality}</p>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-gray-600 mb-1">Ad Tactics Used</h4>
                  <ul className="space-y-1">
                    {analysis.adTactics.map((tactic, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-purple-600 font-bold">•</span>
                        <span className="text-gray-800">{tactic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {uploads.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-red-600 p-6 text-white">
            <h2 className="text-2xl font-black">Community Reality Checks</h2>
            <p className="text-yellow-100">Real photos from real customers</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {uploads.map((upload) => (
                <div key={upload.id} className="bg-gray-50 rounded-2xl overflow-hidden border-2 border-gray-200">
                  <img
                    src={upload.photo_url}
                    alt={`Reality check by @${upload.username}`}
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">@{upload.username}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(upload.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {upload.comment && (
                      <div className="mb-3 text-sm text-gray-700 italic bg-white rounded-lg p-3 border border-gray-200">
                        "{upload.comment}"
                      </div>
                    )}
                    {upload.location_address && (
                      <div className="flex items-start space-x-2 text-sm text-gray-600 bg-white rounded-lg p-2 border border-gray-200">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" />
                        <span className="break-words">{upload.location_address}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
