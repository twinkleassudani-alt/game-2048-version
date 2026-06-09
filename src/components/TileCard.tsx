import React from 'react';
import { Tile, GridSize } from '../utils/types';

interface TileCardProps {
  tile: Tile;
  gridSize: GridSize;
}

const getFontSizeClass = (value: number, gridSize: GridSize) => {
  const len = value.toString().length;

  if (gridSize === 3) {
    if (len <= 2) return 'text-4xl sm:text-5xl font-black';
    if (len === 3) return 'text-3xl sm:text-4xl font-extrabold';
    return 'text-2xl sm:text-3xl font-bold';
  }
  if (gridSize === 4) {
    if (len <= 2) return 'text-3xl sm:text-4xl font-black';
    if (len === 3) return 'text-2xl sm:text-3xl font-extrabold';
    return 'text-lg sm:text-2xl font-bold';
  }
  if (gridSize === 5) {
    if (len <= 2) return 'text-xl sm:text-2xl font-black';
    if (len === 3) return 'text-base sm:text-lg font-extrabold';
    if (len === 4) return 'text-sm sm:text-base font-bold';
    return 'text-xs sm:text-sm font-bold';
  }
  // 6x6 — tiles are small, keep text tight so numbers never overflow
  if (len <= 2) return 'text-base sm:text-lg font-extrabold';
  if (len === 3) return 'text-xs sm:text-sm font-bold';
  // FIX: text-xxs is NOT a real Tailwind class — replaced with text-[10px]
  return 'text-[10px] sm:text-xs font-semibold';
};

const getTileStyles = (value: number): { bgClass: string; textClass: string; glowClass: string } => {
  const styles: Record<number, { bgClass: string; textClass: string; glowClass: string }> = {
    2: {
      bgClass: 'bg-slate-100 dark:bg-slate-800 border border-slate-200/20 dark:border-slate-700/20 shadow-sm',
      textClass: 'text-slate-800 dark:text-slate-100',
      glowClass: '',
    },
    4: {
      bgClass: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200/20 dark:border-amber-900/10 shadow-sm',
      textClass: 'text-amber-900 dark:text-amber-200',
      glowClass: '',
    },
    8: {
      bgClass: 'bg-gradient-to-br from-orange-400 to-amber-500 shadow-md shadow-orange-500/10',
      textClass: 'text-white font-extrabold',
      glowClass: '',
    },
    16: {
      bgClass: 'bg-gradient-to-br from-orange-500 to-red-500 shadow-md shadow-orange-600/15',
      textClass: 'text-white font-extrabold',
      glowClass: '',
    },
    32: {
      bgClass: 'bg-gradient-to-br from-red-500 to-pink-500 shadow-md shadow-red-500/15',
      textClass: 'text-white font-extrabold',
      glowClass: '',
    },
    64: {
      bgClass: 'bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/20',
      textClass: 'text-white font-extrabold',
      glowClass: '',
    },
    128: {
      bgClass: 'bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 shadow-lg shadow-yellow-500/20',
      textClass: 'text-white font-extrabold',
      glowClass: 'tile-glow-2048',
    },
    256: {
      bgClass: 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 shadow-lg shadow-yellow-400/25',
      textClass: 'text-white font-extrabold',
      glowClass: 'tile-glow-2048',
    },
    512: {
      bgClass: 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20',
      textClass: 'text-white font-extrabold',
      glowClass: 'tile-glow-2048',
    },
    1024: {
      bgClass: 'bg-gradient-to-br from-cyan-400 to-indigo-600 shadow-xl shadow-cyan-500/20',
      textClass: 'text-white font-extrabold',
      glowClass: 'tile-glow-4096',
    },
    2048: {
      bgClass: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-purple-500/30',
      textClass: 'text-white font-black',
      glowClass: 'tile-glow-2048',
    },
    4096: {
      bgClass: 'bg-gradient-to-br from-pink-500 via-rose-500 to-red-600 shadow-2xl shadow-rose-500/40',
      textClass: 'text-white font-black',
      glowClass: 'tile-glow-4096',
    },
  };

  if (value >= 8192) {
    return {
      bgClass: 'bg-gradient-to-br from-violet-600 via-indigo-950 to-slate-900 text-white border border-violet-500/35 shadow-2xl shadow-violet-500/50',
      textClass: 'text-white font-black animate-pulse',
      glowClass: 'tile-glow-higher',
    };
  }

  return styles[value] || styles[2];
};

export const TileCard: React.FC<TileCardProps> = ({ tile, gridSize }) => {
  const { bgClass, textClass, glowClass } = getTileStyles(tile.value);
  const fontSize = getFontSizeClass(tile.value, gridSize);

  const style = {
    '--col': tile.col,
    '--row': tile.row,
  } as React.CSSProperties;

  return (
    <div
      className="tile p-1.5 select-none"
      style={style}
    >
      <div
        className={`w-full h-full rounded-2xl flex items-center justify-center transition-all duration-300 font-sans overflow-hidden ${bgClass} ${glowClass} ${tile.isNew ? 'animate-pop-in' : ''
          } ${tile.isMerged ? 'animate-merge-bounce' : ''}`}
      >
        <span
          className={`${fontSize} ${textClass} tracking-tight select-none leading-none`}
          style={{ maxWidth: '100%' }}
        >
          {tile.value}
        </span>
      </div>
    </div>
  );
};
