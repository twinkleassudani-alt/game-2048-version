import React from 'react';
import { RotateCcw, Volume2, VolumeX, Sun, Moon, Sparkles, Grid, Pause, Play, Trophy, User } from 'lucide-react';
import { GridSize } from '../utils/types';

interface HeaderProps {
  gridSize: GridSize;
  onChangeSize: (size: GridSize) => void;
  onRestart: () => void;
  onUndo: () => void;
  canUndo: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onShowLeaderboard: () => void;
  onShowLogin: () => void;
  playerName: string;
  gameOver: boolean;
  won: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  gridSize, onChangeSize, onRestart, onUndo, canUndo,
  isMuted, onToggleMute, isDark, onToggleTheme,
  isPaused, onTogglePause, onShowLeaderboard, onShowLogin,
  playerName, gameOver, won,
}) => {
  const pauseDisabled = gameOver || won;

  return (
    <header className="w-full max-w-lg mb-4 flex flex-col gap-3">

      {/* ── Row 1: Brand left, icon buttons right ── */}
      <div className="flex items-start justify-between gap-2">
        {/* Brand */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent select-none">
              2048
            </h1>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/55 dark:border-indigo-800/40 whitespace-nowrap">
              <Sparkles className="w-2.5 h-2.5 animate-pulse" />
              PREMIUM
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
            Slide, merge, and conquer the grid
          </p>
        </div>

        {/* Icon buttons — player name + leaderboard + mute + theme */}
        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {/* Player name chip */}
          {playerName ? (
            <button
              onClick={onShowLogin}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 bg-white/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 border-slate-200/50 dark:border-slate-800/40 shadow-sm active:scale-95 max-w-[100px]"
              title="Change name"
            >
              <User className="w-3.5 h-3.5 flex-shrink-0 text-indigo-500" />
              <span className="truncate">{playerName}</span>
            </button>
          ) : (
            <button
              onClick={onShowLogin}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60 shadow-sm active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* Leaderboard */}
          <button
            onClick={onShowLeaderboard}
            className="p-2 rounded-xl transition-all duration-200 text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/50 dark:border-slate-800/40 shadow-sm active:scale-95"
            title="Leaderboard"
          >
            <Trophy className="w-4 h-4" />
          </button>

          {/* Mute */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl transition-all duration-200 text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/50 dark:border-slate-800/40 shadow-sm active:scale-95"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Theme */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl transition-all duration-200 text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/50 dark:border-slate-800/40 shadow-sm active:scale-95"
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Row 2: Grid size left, Pause + Undo + New Game right ── */}
      <div className="flex items-center justify-between gap-2 bg-white/50 dark:bg-slate-900/40 p-2 rounded-2xl border border-slate-200/40 dark:border-slate-800/20 shadow-sm">

        {/* Grid size selector */}
        <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl px-2.5 py-1.5 border border-slate-200/60 dark:border-slate-800/60 shadow-inner flex-shrink-0">
          <Grid className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
          <select
            value={gridSize}
            onChange={(e) => onChangeSize(Number(e.target.value) as GridSize)}
            className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-transparent outline-none cursor-pointer"
          >
            <option value="3" className="dark:bg-slate-950">3×3 (Tiny)</option>
            <option value="4" className="dark:bg-slate-950">4×4 (Classic)</option>
            <option value="5" className="dark:bg-slate-950">5×5 (Big)</option>
            <option value="6" className="dark:bg-slate-950">6×6 (Huge)</option>
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">

          {/* Pause / Resume */}
          <button
            onClick={onTogglePause}
            disabled={pauseDisabled}
            className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 shadow-sm active:scale-95 ${pauseDisabled
                ? 'text-slate-300 dark:text-slate-600 bg-white/40 dark:bg-slate-900/30 border-slate-200/30 dark:border-slate-800/20 cursor-not-allowed'
                : isPaused
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/40'
                  : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/40'
              }`}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Undo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${canUndo
                ? 'bg-indigo-50/80 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/60 cursor-pointer active:scale-95 shadow-sm'
                : 'bg-slate-100/50 text-slate-400 border-slate-200/50 dark:bg-slate-900/20 dark:text-slate-600 dark:border-slate-800/30 cursor-not-allowed'
              }`}
            title="Undo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          {/* New Game */}
          <button
            onClick={onRestart}
            className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md active:scale-95 whitespace-nowrap"
          >
            New Game
          </button>
        </div>
      </div>
    </header>
  );
};
