import React from 'react';
import {
  RotateCcw, Volume2, VolumeX, Sun, Moon,
  Sparkles, Grid, Pause, Play, Trophy, User,
} from 'lucide-react';
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
}

export const Header: React.FC<HeaderProps> = ({
  gridSize, onChangeSize, onRestart, onUndo, canUndo,
  isMuted, onToggleMute, isDark, onToggleTheme,
  isPaused, onTogglePause, onShowLeaderboard, onShowLogin, playerName,
}) => {
  return (
    <header className="w-full max-w-lg mb-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent select-none">
              2048
            </h1>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/55 dark:border-indigo-800/40">
              <Sparkles className="w-2.5 h-2.5 animate-pulse" />
              PREMIUM
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Slide, merge, and conquer the grid
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onShowLogin}
            className="flex items-center gap-1.5 p-2.5 rounded-xl transition-all duration-200 text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/50 dark:border-slate-800/40 shadow-sm active:scale-95"
            title={playerName ? `Logged in as ${playerName}` : 'Login'}
          >
            <User className="w-4 h-4" />
            {playerName && (
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 max-w-[60px] truncate">
                {playerName}
              </span>
            )}
          </button>

          <button
            onClick={onShowLeaderboard}
            className="p-2.5 rounded-xl transition-all duration-200 text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/50 dark:border-slate-800/40 shadow-sm active:scale-95"
            title="View Leaderboard"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-xl transition-all duration-200 text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/50 dark:border-slate-800/40 shadow-sm active:scale-95"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl transition-all duration-200 text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/50 dark:border-slate-800/40 shadow-sm active:scale-95"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 bg-white/50 dark:bg-slate-900/40 p-2 rounded-2xl border border-slate-200/40 dark:border-slate-800/20 shadow-sm">
        <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-xl px-2.5 py-1.5 border border-slate-200/60 dark:border-slate-800/60 shadow-inner">
          <Grid className="w-3.5 h-3.5 text-slate-400 mr-2" />
          <select
            value={gridSize}
            onChange={(e) => onChangeSize(Number(e.target.value) as GridSize)}
            className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-transparent outline-none cursor-pointer pr-1"
          >
            <option value="3" className="dark:bg-slate-950">3x3 (Tiny)</option>
            <option value="4" className="dark:bg-slate-950">4x4 (Classic)</option>
            <option value="5" className="dark:bg-slate-950">5x5 (Big)</option>
            <option value="6" className="dark:bg-slate-950">6x6 (Huge)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePause}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 shadow-sm active:scale-95 cursor-pointer ${isPaused
                ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60'
                : 'bg-amber-50/80 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60'
              }`}
            title={isPaused ? 'Resume Game' : 'Pause Game'}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${canUndo
                ? 'bg-indigo-50/80 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/60 cursor-pointer active:scale-95 shadow-sm'
                : 'bg-slate-100/50 text-slate-400 border-slate-200/50 dark:bg-slate-900/20 dark:text-slate-600 dark:border-slate-800/30 cursor-not-allowed'
              }`}
            title="Undo Last Move"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo</span>
          </button>

          <button
            onClick={onRestart}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md active:scale-95 cursor-pointer"
          >
            New Game
          </button>
        </div>
      </div>
    </header>
  );
};