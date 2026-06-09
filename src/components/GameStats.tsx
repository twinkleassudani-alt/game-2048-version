import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Timer, Swords, Hash } from 'lucide-react';

interface GameStatsProps {
  score: number;
  bestScore: number;
  moveCount: number;
  gameOver: boolean;
  isPaused: boolean;
}

interface ScoreGain {
  id: string;
  amount: number;
}

export const GameStats: React.FC<GameStatsProps> = ({
  score, bestScore, moveCount, gameOver, isPaused,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [scoreGains, setScoreGains] = useState<ScoreGain[]>([]);
  const prevScoreRef = useRef(score);

  useEffect(() => {
    if (moveCount === 0) { setSeconds(0); return; }
    if (gameOver || isPaused) return;
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [moveCount, gameOver, isPaused]);

  useEffect(() => {
    if (moveCount === 0) setSeconds(0);
  }, [moveCount]);

  useEffect(() => {
    const prevScore = prevScoreRef.current;
    if (score > prevScore) {
      const diff = score - prevScore;
      const newGain = { id: Math.random().toString(36).substring(2, 9), amount: diff };
      setScoreGains((prev) => [...prev, newGain]);
      setTimeout(() => {
        setScoreGains((prev) => prev.filter((g) => g.id !== newGain.id));
      }, 750);
    }
    prevScoreRef.current = score;
  }, [score]);

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    if (hrs > 0) return `${hrs}:${pad(mins)}:${pad(s)}`;
    return `${pad(mins)}:${pad(s)}`;
  };

  return (
    <div className="w-full max-w-lg grid grid-cols-4 gap-2.5 mb-6">
      <div className="relative flex flex-col items-center justify-center p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 shadow-sm backdrop-blur-md overflow-visible">
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <Hash className="w-3 h-3" />
          <span>Score</span>
        </div>
        <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 select-none tabular-nums">
          {score}
        </div>
        {scoreGains.map((gain) => (
          <div key={gain.id} className="absolute -top-4 left-1/2 -translate-x-1/2 text-sm font-black text-emerald-500 dark:text-emerald-400 select-none animate-float-fade pointer-events-none">
            +{gain.amount}
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500/80 dark:text-amber-500/60 uppercase tracking-wider">
          <Trophy className="w-3 h-3" />
          <span>Best</span>
        </div>
        <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 select-none tabular-nums">
          {bestScore}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-500/80 dark:text-indigo-400/60 uppercase tracking-wider">
          <Swords className="w-3 h-3" />
          <span>Moves</span>
        </div>
        <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 select-none tabular-nums">
          {moveCount}
        </div>
      </div>

      <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border shadow-sm backdrop-blur-md transition-colors duration-200 ${isPaused
          ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/40'
          : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/50 dark:border-slate-800/40'
        }`}>
        <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500/80 dark:text-rose-500/60 uppercase tracking-wider">
          <Timer className="w-3 h-3" />
          <span>Time</span>
        </div>
        <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 select-none tabular-nums">
          {isPaused ? '⏸' : formatTime(seconds)}
        </div>
      </div>
    </div>
  );
};