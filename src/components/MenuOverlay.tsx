import React from 'react';
import { RotateCcw, Play, Award, HelpCircle } from 'lucide-react';

interface MenuOverlayProps {
  gameOver: boolean;
  won: boolean;
  keepPlaying: boolean;
  score: number;
  onRestart: () => void;
  onKeepPlaying: () => void;
}

export const MenuOverlay: React.FC<MenuOverlayProps> = ({
  gameOver,
  won,
  keepPlaying,
  score,
  onRestart,
  onKeepPlaying,
}) => {
  const showWin = won && !keepPlaying;
  const showLoss = gameOver;

  if (!showWin && !showLoss) return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-900/75 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in transition-all duration-300">
      
      {/* Game Over Screen */}
      {showLoss && (
        <div className="flex flex-col items-center text-center max-w-xs animate-pop-in">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 mb-4 shadow-lg shadow-rose-500/10">
            <RotateCcw className="w-8 h-8 animate-spin-reverse" />
          </div>
          
          <h2 className="text-3xl font-black bg-gradient-to-r from-red-400 via-rose-500 to-pink-500 bg-clip-text text-transparent mb-2 select-none">
            Game Over!
          </h2>
          
          <p className="text-sm font-semibold text-slate-300 mb-6 leading-relaxed select-none">
            No empty spaces or adjacent matching tiles left.
          </p>

          {/* Stats Display */}
          <div className="w-full flex items-center justify-between p-3.5 mb-6 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Final Score</span>
            <span className="text-lg font-extrabold text-white tabular-nums">{score}</span>
          </div>

          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 hover:from-indigo-600 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
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
