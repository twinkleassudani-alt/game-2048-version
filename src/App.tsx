import React, { useState, useEffect, useRef } from 'react';
import { use2048 } from './hooks/use2048';
import { GridSize } from './utils/types';
import { setMutedState } from './utils/audio';
import { Header } from './components/Header';
import { GameStats } from './components/GameStats';
import { GameBoard } from './components/GameBoard';
import { MenuOverlay } from './components/MenuOverlay';
import { HowToPlay } from './components/HowToPlay';
import { LoginModal } from './components/LoginModal';
import { Leaderboard } from './components/Leaderboard';

export const App: React.FC = () => {
  const [gridSize, setGridSize] = useState<GridSize>(4);
  const [isPaused, setIsPaused] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [playerName, setPlayerName] = useState<string>(() => {
    try { return localStorage.getItem('2048-player-name') || ''; } catch { return ''; }
  });
  const [playerId, setPlayerId] = useState<string>(() => {
    try { return localStorage.getItem('2048-player-id') || ''; } catch { return ''; }
  });

  const [showLoginModal, setShowLoginModal] = useState<boolean>(() => {
    try { return !localStorage.getItem('2048-player-name'); } catch { return true; }
  });

  const isLoggedIn = Boolean(playerName);

  const [isMuted, setIsMuted] = useState(() => {
    try {
      const saved = localStorage.getItem('2048-muted');
      const val = saved ? JSON.parse(saved) : false;
      setMutedState(val);
      return val;
    } catch { return false; }
  });

  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('2048-theme');
      if (saved) return saved === 'dark';
    } catch { }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isShaking, setIsShaking] = useState(false);

  const {
    tiles, score, bestScore, gameOver, won, keepPlaying,
    moveCount, canUndo, move, restart, undo, changeGridSize,
    onKeepPlaying: handleKeepPlaying,
  } = use2048(gridSize);

  useEffect(() => { changeGridSize(gridSize); }, [gridSize, changeGridSize]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('2048-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('2048-theme', 'light');
    }
  }, [isDark]);

  const toggleMute = () => {
    setIsMuted((prev: boolean) => {
      const next = !prev;
      setMutedState(next);
      localStorage.setItem('2048-muted', JSON.stringify(next));
      return next;
    });
  };

  const toggleTheme = () => setIsDark((prev) => !prev);
  const togglePause = () => { if (!gameOver && !won) setIsPaused((p) => !p); };

  const handleLoginSave = (name: string, id: string) => {
    setPlayerName(name);
    setPlayerId(id);
    localStorage.setItem('2048-player-name', name);
    localStorage.setItem('2048-player-id', id);
    setShowLoginModal(false);
  };

  const prevPositions = useRef<string>('');

  useEffect(() => {
    prevPositions.current = tiles
      .map(t => `${t.id}:${t.row},${t.col}:${t.value}`).sort().join('|');
  }, [tiles, score]);

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver || isPaused || !isLoggedIn) return;
    const currentPositions = tiles
      .map(t => `${t.id}:${t.row},${t.col}:${t.value}`).sort().join('|');
    move(direction);
    setTimeout(() => {
      const nextPositions = tiles
        .map(t => `${t.id}:${t.row},${t.col}:${t.value}`).sort().join('|');
      if (currentPositions === nextPositions && !gameOver) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 200);
      }
    }, 20);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLoggedIn) return;
      if (e.code === 'Space') { e.preventDefault(); togglePause(); return; }
      if (isPaused) return;
      if (['ArrowUp', 'KeyW'].includes(e.code)) { e.preventDefault(); handleMove('up'); }
      else if (['ArrowDown', 'KeyS'].includes(e.code)) { e.preventDefault(); handleMove('down'); }
      else if (['ArrowLeft', 'KeyA'].includes(e.code)) { e.preventDefault(); handleMove('left'); }
      else if (['ArrowRight', 'KeyD'].includes(e.code)) { e.preventDefault(); handleMove('right'); }
      else if (e.code === 'KeyZ' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (canUndo) undo(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tiles, gameOver, canUndo, undo, isPaused, isLoggedIn]);

  // Touch handlers scoped to the game board only
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current || isPaused || !isLoggedIn) return;
    const diffX = e.changedTouches[0].clientX - touchStart.current.x;
    const diffY = e.changedTouches[0].clientY - touchStart.current.y;
    const threshold = 35;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > threshold) handleMove('right');
      else if (diffX < -threshold) handleMove('left');
    } else {
      if (diffY > threshold) handleMove('down');
      else if (diffY < -threshold) handleMove('up');
    }
    touchStart.current = null;
  };

  return (
    // Outer wrapper — NO touch handlers here so the page scrolls freely
    <div className="min-h-screen w-full flex flex-col items-center justify-start py-8 px-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative select-none">
      {/* Decorative orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-indigo-400/10 dark:bg-indigo-600/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-pink-400/10 dark:bg-purple-600/5 blur-3xl pointer-events-none" />

      {showLoginModal && (
        <LoginModal
          onSave={handleLoginSave}
          onClose={() => { if (isLoggedIn) setShowLoginModal(false); }}
          existingName={playerName}
        />
      )}

      {showLeaderboard && (
        <Leaderboard
          onClose={() => setShowLeaderboard(false)}
          gridSize={gridSize}
        />
      )}

      <div className="w-full max-w-lg flex flex-col items-center z-10">
        <Header
          gridSize={gridSize}
          onChangeSize={setGridSize}
          onRestart={restart}
          onUndo={undo}
          canUndo={canUndo && !isPaused}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          isPaused={isPaused}
          onTogglePause={togglePause}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          onShowLogin={() => setShowLoginModal(true)}
          playerName={playerName}
          gameOver={gameOver}
          won={won}
        />

        <GameStats
          score={score}
          bestScore={bestScore}
          moveCount={moveCount}
          gameOver={gameOver}
          isPaused={isPaused}
        />

        {/* game-board class applies touch-action: none only here */}
        <div
          className="w-full relative mb-6 game-board"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <GameBoard
            tiles={tiles}
            gridSize={gridSize}
            isShaking={isShaking}
          />

          {isPaused && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-slate-900/70 backdrop-blur-sm z-20">
              <div className="text-5xl mb-3">⏸</div>
              <p className="text-white font-bold text-xl tracking-wide">Paused</p>
              <p className="text-slate-300 text-sm mt-1">Press Space or tap Resume to continue</p>
            </div>
          )}

          <MenuOverlay
            gameOver={gameOver}
            won={won}
            keepPlaying={keepPlaying}
            score={score}
            tiles={tiles}
            onRestart={restart}
            onKeepPlaying={handleKeepPlaying}
            playerName={playerName}
            playerId={playerId}
            gridSize={gridSize}
          />
        </div>

        <HowToPlay />
      </div>
    </div>
  );
};
