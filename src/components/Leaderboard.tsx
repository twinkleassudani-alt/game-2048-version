import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { GridSize } from '../utils/types';

interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  max_tile: number;       // ← added
  grid_size: number;
  created_at: string;
}

interface LeaderboardProps {
  onClose: () => void;
  gridSize: GridSize;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onClose, gridSize }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSize, setActiveSize] = useState<GridSize>(gridSize);
  const sizes: GridSize[] = [3, 4, 5, 6];

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from('leaderboard')
        .select('id, player_name, score, max_tile, grid_size, created_at') // ← max_tile added
        .eq('grid_size', activeSize)
        .order('score', { ascending: false })
        .limit(10);

      if (sbError) throw sbError;
      setEntries(data || []);
    } catch (e: any) {
      setError(e.message || 'Error connecting to database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [activeSize]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  // Medal icons exactly matching screenshot 2
  const getRankBadge = (rank: number) => {
    if (rank === 0) return <span className="text-base leading-none">🥇</span>;
    if (rank === 1) return <span className="text-base leading-none">🥈</span>;
    if (rank === 2) return <span className="text-base leading-none">🥉</span>;
    return <span className="text-xs font-bold text-slate-400">#{rank + 1}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div
        className="w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid rgba(99,102,241,0.2)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h2 className="text-base font-extrabold text-white tracking-tight">Top Scores</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grid size tabs */}
        <div className="flex gap-1.5 px-5 mb-4">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSize(s)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${activeSize === s
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
            >
              {s}×{s}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-white/8 mb-1" />

        {/* Score list */}
        <div className="px-3 pb-2 max-h-72 overflow-y-auto">
          {isLoading && entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] text-slate-400 font-semibold">Loading scores…</span>
            </div>
          ) : error && entries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-rose-400 font-medium mb-2">{error}</p>
              <button onClick={fetchLeaderboard} className="text-[11px] text-indigo-400 hover:underline font-bold">
                Try Again
              </button>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500 font-semibold select-none">
              No records yet for {activeSize}×{activeSize}.<br />Be the first!
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-white/5">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 px-2 py-3 rounded-xl transition-colors ${index < 3 ? 'bg-amber-500/5' : 'hover:bg-white/5'
                    }`}
                >
                  {/* Rank */}
                  <div className="w-7 flex items-center justify-center flex-shrink-0">
                    {getRankBadge(index)}
                  </div>

                  {/* Name + date + max tile — matches screenshot 2 layout */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate leading-tight">
                      {entry.player_name}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      {formatDate(entry.created_at)}
                      {entry.max_tile > 0 && (
                        <> · <span className="text-slate-400">max tile: {entry.max_tile}</span></>
                      )}
                    </p>
                  </div>

                  {/* Score */}
                  <span className="text-sm font-extrabold text-white tabular-nums flex-shrink-0">
                    {entry.score.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refresh + Close footer */}
        <div className="px-5 py-4 flex gap-2 border-t border-white/5">
          <button
            onClick={fetchLeaderboard}
            disabled={isLoading}
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/40 transition-colors disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white/80 hover:text-white bg-white/8 hover:bg-white/12 transition-all duration-200 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
