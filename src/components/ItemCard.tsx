import { ArrowLeftRight, CheckCircle, XCircle, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { MenuItemWithRestaurant } from '../types/database';
import { supabase } from '../lib/supabase';

interface ItemCardProps {
  item: MenuItemWithRestaurant;
  onClick: () => void;
  onVoteUpdate: () => void;
}

export default function ItemCard({ item, onClick, onVoteUpdate }: ItemCardProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [votedType, setVotedType] = useState<string | null>(null);
  const [isCheckingVote, setIsCheckingVote] = useState(true);
  const [latestUploadUrl, setLatestUploadUrl] = useState<string | null>(null);

  useEffect(() => {
    checkExistingVote();
    fetchLatestUpload();
  }, [item.id]);

  const checkExistingVote = async () => {
    const sessionId = getSessionId();
    const { data } = await supabase
      .from('item_votes')
      .select('vote_type')
      .eq('menu_item_id', item.id)
      .eq('voter_session', sessionId)
      .maybeSingle();

    if (data) {
      setHasVoted(true);
      setVotedType(data.vote_type);
    }
    setIsCheckingVote(false);
  };

  const fetchLatestUpload = async () => {
    const { data } = await supabase
      .from('uploads')
      .select('photo_url')
      .eq('menu_item_id', item.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setLatestUploadUrl(data.photo_url);
    }
  };

  const totalVotes = item.honest_votes + item.lie_votes;
  const honestPercent = totalVotes > 0 ? Math.round((item.honest_votes / totalVotes) * 100) : 0;

  const getVerdictLabel = (percent: number) => {
    if (percent >= 75) return 'Pretty Honest';
    if (percent >= 50) return 'Meh';
    if (percent >= 30) return 'Total Lie';
    return 'CRIMINAL';
  };

  const getVerdictColor = (percent: number) => {
    if (percent >= 75) return 'bg-green-100 text-green-700 border-green-300';
    if (percent >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (percent >= 30) return 'bg-red-100 text-red-700 border-red-300';
    return 'bg-red-200 text-red-900 border-red-400';
  };

  const handleVote = async (e: React.MouseEvent, voteType: 'honest' | 'lie') => {
    e.stopPropagation();

    if (hasVoted || isCheckingVote) return;

    const sessionId = getSessionId();

    await supabase.from('item_votes').insert({
      menu_item_id: item.id,
      vote_type: voteType,
      voter_session: sessionId
    });

    await supabase
      .from('menu_items')
      .update({
        honest_votes: voteType === 'honest' ? item.honest_votes + 1 : item.honest_votes,
        lie_votes: voteType === 'lie' ? item.lie_votes + 1 : item.lie_votes
      })
      .eq('id', item.id);

    const currentStreak = parseInt(localStorage.getItem('vote_streak') || '0', 10);
    localStorage.setItem('vote_streak', (currentStreak + 1).toString());
    window.dispatchEvent(new Event('voteStreakUpdated'));

    setHasVoted(true);
    setVotedType(voteType);
    onVoteUpdate();
  };

  const getSessionId = () => {
    let sessionId = localStorage.getItem('voter_session');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('voter_session', sessionId);
    }
    return sessionId;
  };

  const isCommunitySubmitted = (item as any).is_community_submitted;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl active:scale-98 transition-all duration-300 overflow-hidden w-full">
      <button
        onClick={onClick}
        className="w-full text-left active:opacity-90"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 flex">
          {isCommunitySubmitted && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg">
              <Users className="w-3 h-3" />
              <span>Community Added</span>
            </div>
          )}
          <div className="w-1/2 relative">
            <img
              src={item.official_photo_url}
              alt={`${item.name} - Ad`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              AD
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg">
            <ArrowLeftRight className="w-5 h-5 text-gray-700" />
          </div>

          <div className="w-1/2 relative">
            {latestUploadUrl ? (
              <img
                src={latestUploadUrl}
                alt={`${item.name} - Real`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center px-3 text-center">
                <p className="text-white text-xs font-semibold leading-snug">
                  Be the first to upload a real photo
                </p>
              </div>
            )}
            <div className="absolute top-2 right-2 bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded">
              REAL
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.restaurant.name}</p>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="text-green-600 font-semibold">✓ Honest</span>
              <span className="text-red-600 font-semibold">✗ Lie</span>
            </div>
            {totalVotes > 0 ? (
              <>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                  <div
                    className="bg-green-500 transition-all duration-500"
                    style={{ width: `${honestPercent}%` }}
                  />
                  <div
                    className="bg-red-500 transition-all duration-500"
                    style={{ width: `${100 - honestPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{honestPercent}%</span>
                  <span className="text-xs text-gray-500">{100 - honestPercent}%</span>
                </div>
              </>
            ) : (
              <>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden" />
                <div className="mt-1">
                  <span className="text-xs text-gray-400 w-full block text-center">No votes yet</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border-2 ${totalVotes > 0 ? getVerdictColor(honestPercent) : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
              {totalVotes > 0 ? getVerdictLabel(honestPercent) : 'No votes yet'}
            </span>
            <span className="text-xs text-gray-500">{totalVotes.toLocaleString()} votes</span>
          </div>
        </div>
      </button>

      <div className="px-4 pb-4 flex space-x-2">
        <button
          onClick={(e) => handleVote(e, 'honest')}
          disabled={hasVoted}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition-all active:scale-95 ${
            hasVoted
              ? votedType === 'honest'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">{hasVoted && votedType === 'honest' ? 'Voted!' : 'Honest'}</span>
        </button>

        <button
          onClick={(e) => handleVote(e, 'lie')}
          disabled={hasVoted}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition-all active:scale-95 ${
            hasVoted
              ? votedType === 'lie'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          <XCircle className="w-5 h-5" />
          <span className="text-sm">{hasVoted && votedType === 'lie' ? 'Voted!' : 'Lie'}</span>
        </button>
      </div>
    </div>
  );
}
