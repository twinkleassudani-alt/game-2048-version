import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Star, Calendar } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  maxTile: number;
  date: number;
}

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Vercel routes `/api/leaderboard` locally under server or dev proxies
      const res = await fetch('/api/leaderboard');
      if (!res.ok) {
        throw new Error('Failed to load global scores');
      }
      const data = await res.json();
      setEntries(data);
    } catch (e: any) {
      setError(e.message || 'Error connecting to database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 0) return <Trophy className="w-4 h-4 text-yellow-500 animate-pulse" />;
    if (rank === 1) return <Trophy className="w-4 h-4 text-slate-400" />;
    if (rank === 2) return <Trophy className="w-4 h-4 text-amber-600" />;
    return <span className="text-xs font-bold text-slate-400">{rank + 1}</span>;
  };

  const getMaxTileColor = (val: number) => {
    if (val >= 2048) return 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/50 dark:border-purple-900/30';
    if (val >= 1024) return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200/50 dark:border-cyan-900/30';
    if (val >= 512) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-900/30';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border-slate-200/50 dark:border-slate-800/30';
  };

  return (
    <div className="w-full mt-4 flex flex-col bg-white/60 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/20 shadow-sm backdrop-blur-md">
      
      {/* Title Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4.5 h-4.5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            Global High Scores
          </h3>
        </div>
        <button
          onClick={fetchLeaderboard}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors duration-200 active:scale-95 disabled:opacity-50"
          title="Refresh Leaderboard"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content States */}
      {isLoading && entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] font-semibold text-slate-400">Syncing scores...</span>
        </div>
      ) : error && entries.length === 0 ? (
        <div className="text-center py-6 text-xs text-rose-500 font-medium">
          {error}
          <button
            onClick={fetchLeaderboard}
            className="block mx-auto mt-2 text-[10px] text-indigo-500 hover:underline font-bold"
          >
            Try Again
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400 font-semibold select-none">
          No records submitted yet. Be the first!
        </div>
      ) : (
        <div className="max-h-56 overflow-y-auto pr-0.5 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/40 dark:border-slate-800/30 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-1.5 w-10 text-center">Rank</th>
                <th className="py-1.5">Player</th>
                <th className="py-1.5 w-16 text-center">Max Tile</th>
                <th className="py-1.5 text-right w-20">Score</th>
                <th className="py-1.5 text-right w-14 pr-1"><Calendar className="w-3 h-3 inline ml-0.5 -mt-0.5 text-slate-400/70" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/30 dark:divide-slate-800/10">
              {entries.map((entry, index) => (
                <tr
                  key={entry.id}
                  className="text-xs hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors duration-150"
                >
                  {/* Rank */}
                  <td className="py-2 text-center flex items-center justify-center">
                    {getRankBadge(index)}
                  </td>
                  
                  {/* Player Name */}
                  <td className="py-2 font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                    {entry.name}
                  </td>
                  
                  {/* Max Tile */}
                  <td className="py-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold border ${getMaxTileColor(entry.maxTile)}`}>
                      {entry.maxTile}
                    </span>
                  </td>
                  
                  {/* Score */}
                  <td className="py-2 text-right font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                    {entry.score.toLocaleString()}
                  </td>
                  
                  {/* Date */}
                  <td className="py-2 text-right text-[10px] text-slate-400 dark:text-slate-500 tabular-nums pr-1">
                    {formatDate(entry.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
