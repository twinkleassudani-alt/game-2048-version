import React from 'react';
import { Smartphone, Keyboard, Info } from 'lucide-react';

export const HowToPlay: React.FC = () => {
  return (
    <div className="w-full max-w-lg bg-white/70 dark:bg-slate-900/60 p-4.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-sm backdrop-blur-md">
      <div className="flex items-start gap-2.5">
        <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-2.5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            How to play
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            When two tiles with the <strong className="font-semibold text-slate-700 dark:text-slate-300">same number</strong> touch, they merge to form a single tile with <strong className="font-semibold text-slate-700 dark:text-slate-300">double the value!</strong> Merge tiles until you reach <strong className="font-semibold text-slate-700 dark:text-slate-300">2048</strong> and beyond.
          </p>

          <hr className="border-slate-200/50 dark:border-slate-800/50 my-1" />

          {/* Desktop Controls */}
          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              <Keyboard className="w-3.5 h-3.5 text-slate-400" />
              <span>Desktop:</span>
              <div className="flex gap-1">
                <kbd className="px-1.5 py-0.5 rounded-md text-[9px] font-black font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-sm">↑ ↓ ← →</kbd>
                <span className="text-slate-300 dark:text-slate-700">or</span>
                <kbd className="px-1.5 py-0.5 rounded-md text-[9px] font-black font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-sm">W A S D</kbd>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center gap-1.5 font-medium">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              <span>Mobile:</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">Swipe in direction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
