import React, { useState, useEffect } from 'react';
import { RotateCcw, Play, Award, ChevronRight, Loader2 } from 'lucide-react';
import { Tile, GridSize } from '../utils/types';
import { supabase } from '../lib/supabase';

interface MenuOverlayProps {
  gameOver: boolean;
  won: boolean;
  keepPlaying: boolean;
  score: number;
  tiles: Tile[];
  onRestart: () => void;
  onKeepPlaying: () => void;
  playerName: string;
  playerId: string;
  gridSize: GridSize;
}

export const MenuOverlay: React.FC<MenuOverlayProps> = ({
  gameOver, won, keepPlaying, score, tiles,
  onRestart, onKeepPlaying, playerName, playerId, gridSize,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!gameOver || submitted || !playerName || !playerId || score === 0) return;

    const submitScore = async () => {
      setSubmitting(true);
      try {
        // Compute max tile from current tiles on the board
        const maxTile = tiles.length > 0
          ? Math.max(...tiles.map((t) => t.value))
          : 0;

        await supabase.from('leaderboard').insert({
          player_id: playerId,
          player_name: playerName,
          score,
          max_tile: maxTile,   // ← now included
          grid_size: gridSize,
        });
        setSubmitted(true);
      } catch (err) {
        console.error('Failed to submit score:', err);
      } finally {
        setSubmitting(false);
      }
    };

    submitScore();
  }, [gameOver]);

  useEffect(() => {
    if (!gameOver) setSubmitted(false);
  }, [gameOver]);

  const showWon = won && !keepPlaying;
  const showGameOver = gameOver && !won;
  if (!showWon && !showGameOver) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-slate-900/75 backdrop-blur-sm z-10">
      <div className="flex flex-col items-center gap-4 px-6 py-8 rounded-2xl bg-white/10 border border-white/20 shadow-xl max-w-xs w-full mx-4">

        {/* Win / Loss header */}
        {showWon ? (
          <>
            <div className="text-5xl">🎉</div>
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">You Won!</h2>
              <p className="text-slate-300 text-sm mt-1">Reached 2048 — amazing!</p>
            </div>
          </>
        ) : (
          <>
            <div className="text-5xl">😵</div>
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Game Over</h2>
              <p className="text-slate-300 text-sm mt-1">No more moves remaining</p>
            </div>
          </>
        )}

        {/* Score card */}
        <div className="flex items-center gap-2 bg-white/15 rounded-2xl px-5 py-3 border border-white/20">
          <Award className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Final Score</p>
            <p className="text-2xl font-extrabold text-white tabular-nums">{score.toLocaleString()}</p>
          </div>
        </div>

        {/* Submission status */}
        {playerName && (
          <div className="text-xs text-center">
            {submitting && (
              <span className="flex items-center gap-1.5 text-indigo-300">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving score to leaderboard…
              </span>
            )}
            {submitted && (
              <span className="text-emerald-400 font-semibold">✓ Score saved to leaderboard!</span>
            )}
          </div>
        )}

        {!playerName && (
          <p className="text-[11px] text-slate-400 text-center">
            Login with a name to save your score to the leaderboard.
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2 w-full">
          {showWon && (
            <button
              onClick={onKeepPlaying}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all active:scale-95 shadow-md"
            >
              <Play className="w-4 h-4" />
              Keep Playing
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-white/20 hover:bg-white/30 border border-white/30 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};
