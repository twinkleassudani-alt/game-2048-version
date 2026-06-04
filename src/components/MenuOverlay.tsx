import React, { useState } from 'react';
import { RotateCcw, Play, Award, Send, ChevronRight } from 'lucide-react';
import { Tile } from '../utils/types';
import { Leaderboard } from './Leaderboard';

interface MenuOverlayProps {
  gameOver: boolean;
  won: boolean;
  keepPlaying: boolean;
  score: number;
  tiles: Tile[];
  onRestart: () => void;
  onKeepPlaying: () => void;
}

export const MenuOverlay: React.FC<MenuOverlayProps> = ({
  gameOver,
  won,
  keepPlaying,
  score,
  tiles,
  onRestart,
  onKeepPlaying,
}) => {
  const showWin = won && !keepPlaying;
  const showLoss = gameOver;

  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem('2048-playername') || '';
    } catch {
      return '';
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [viewScoresDirectly, setViewScoresDirectly] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset local overlay states when restarting (when gameOver becomes false)
  React.useEffect(() => {
    if (!gameOver) {
      setIsSubmitted(false);
      setViewScoresDirectly(false);
      setSubmitError(null);
    }
  }, [gameOver]);

  if (!showWin && !showLoss) return null;

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const maxTile = Math.max(...tiles.map((t) => t.value), 2);
      
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          score,
          maxTile,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save score. Please try again.');
      }

      try {
        localStorage.setItem('2048-playername', name.trim());
      } catch {}
      
      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit highscore');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLeaderboardView = isSubmitted || viewScoresDirectly;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-900/80 dark:bg-slate-950/85 backdrop-blur-md animate-fade-in transition-all duration-300">
      
      {/* Game Over Screen */}
      {showLoss && (
        <div className="w-full max-w-sm flex flex-col items-center justify-center text-center animate-pop-in">
          
          {/* 1. Show Leaderboard view */}
          {showLeaderboardView ? (
            <div className="w-full flex flex-col items-center">
              <Leaderboard />
              
              <button
                onClick={onRestart}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 hover:from-indigo-600 hover:to-pink-700 transition-all duration-200 shadow-md active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Again</span>
              </button>
            </div>
          ) : (
            /* 2. Show Submission Input form */
            <div className="w-full flex flex-col items-center px-2">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 mb-3 shadow-lg shadow-rose-500/5">
                <RotateCcw className="w-6 h-6 animate-spin-reverse" />
              </div>
              
              <h2 className="text-2xl font-black bg-gradient-to-r from-red-400 via-rose-500 to-pink-500 bg-clip-text text-transparent mb-1 select-none">
                Game Over!
              </h2>
              
              <p className="text-xs font-semibold text-slate-400 mb-4 select-none">
                Your score: <strong className="text-white text-sm tabular-nums">{score.toLocaleString()}</strong>
              </p>

              {/* Submit High Score Form */}
              <form onSubmit={handleSubmitScore} className="w-full flex flex-col gap-2 mb-4 bg-white/5 border border-white/10 p-3.5 rounded-2xl shadow-inner">
                <label className="text-[10px] font-bold text-slate-400 text-left uppercase tracking-wider block mb-1">
                  Submit to Global Leaderboard
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={15}
                    placeholder="Enter player name"
                    className="flex-1 bg-slate-950/50 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim()}
                    className="px-3 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                
                {submitError && (
                  <span className="text-[10px] text-rose-400 font-semibold text-left mt-1 block">
                    {submitError}
                  </span>
                )}
              </form>

              {/* Actions below form */}
              <div className="w-full flex gap-3.5">
                <button
                  onClick={() => setViewScoresDirectly(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer bg-white/5 border border-white/5"
                >
                  <span>Skip to Leaderboard</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
                
                <button
                  onClick={onRestart}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Victory Screen */}
      {showWin && (
        <div className="flex flex-col items-center text-center max-w-xs animate-pop-in">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-4 shadow-lg shadow-amber-500/10 animate-bounce">
            <Award className="w-8 h-8" />
          </div>
          
          <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent mb-2 select-none">
            Victory!
          </h2>
          
          <p className="text-sm font-semibold text-slate-300 mb-6 leading-relaxed select-none">
            Amazing job! You successfully merged tiles to achieve the coveted <strong className="text-amber-400">2048</strong>.
          </p>

          {/* Stats Display */}
          <div className="w-full flex items-center justify-between p-3.5 mb-6 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Score</span>
            <span className="text-lg font-extrabold text-white tabular-nums">{score}</span>
          </div>

          <div className="w-full flex flex-col gap-3.5">
            <button
              onClick={onKeepPlaying}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-slate-800 bg-white hover:bg-slate-100 transition-all duration-200 shadow-lg active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Keep Playing</span>
            </button>
            
            <button
              onClick={onRestart}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-slate-400 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Game</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
