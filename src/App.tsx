import React, { useState, useEffect, useRef } from 'react';
import { use2048 } from './hooks/use2048';
import { GridSize } from './utils/types';
import { setMutedState, getMutedState } from './utils/audio';
import { Header } from './components/Header';
import { GameStats } from './components/GameStats';
import { GameBoard } from './components/GameBoard';
import { MenuOverlay } from './components/MenuOverlay';
import { HowToPlay } from './components/HowToPlay';

export const App: React.FC = () => {
  const [gridSize, setGridSize] = useState<GridSize>(4);
  const [isMuted, setIsMuted] = useState(() => {
    try {
      const saved = localStorage.getItem('2048-muted');
      const val = saved ? JSON.parse(saved) : false;
      setMutedState(val);
      return val;
    } catch {
      return false;
    }
  });

  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('2048-theme');
      if (saved) {
        return saved === 'dark';
      }
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isShaking, setIsShaking] = useState(false);

  // Core Game Logic Hook
  const {
    tiles,
    score,
    bestScore,
    gameOver,
    won,
    keepPlaying,
    moveCount,
    canUndo,
    move,
    restart,
    undo,
    changeGridSize,
    onKeepPlaying: handleKeepPlaying,
  } = use2048(gridSize);

  // Sync grid size to hook
  useEffect(() => {
    changeGridSize(gridSize);
  }, [gridSize, changeGridSize]);

  // Sync theme class to body
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

  // Handle Mute changes
  const toggleMute = () => {
    setIsMuted((prev: boolean) => {
      const next = !prev;
      setMutedState(next);
      localStorage.setItem('2048-muted', JSON.stringify(next));
      return next;
    });
  };

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Keep track of tiles length and score to trigger board shaking when an invalid move occurs
  const prevTilesCount = useRef(tiles.length);
  const prevScore = useRef(score);
  const prevPositions = useRef<string>('');

  useEffect(() => {
    // Helper to check if tile positions or values actually changed
    const currentPositions = tiles.map(t => `${t.id}:${t.row},${t.col}:${t.value}`).sort().join('|');
    
    // We update reference caches
    prevTilesCount.current = tiles.length;
    prevScore.current = score;
    prevPositions.current = currentPositions;
  }, [tiles, score]);

  // Handle movements & shake triggering
  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    // Capture state before move
    const currentPositions = tiles.map(t => `${t.id}:${t.row},${t.col}:${t.value}`).sort().join('|');

    // Perform move
    move(direction);

    // Check if state changes. If not, trigger shake animation to indicate blocked move
    setTimeout(() => {
      // Compare state positions after small tick to see if any movement took place
      const nextPositions = tiles.map(t => `${t.id}:${t.row},${t.col}:${t.value}`).sort().join('|');
      if (currentPositions === nextPositions && !gameOver) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 200);
      }
    }, 20);
  };

  // Desktop Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        handleMove('up');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        handleMove('down');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        handleMove('left');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        handleMove('right');
      } else if (e.code === 'KeyZ' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (canUndo) undo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tiles, gameOver, canUndo, undo]);

  // Touch Swipe Gesture Controls
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;

    const diffX = e.changedTouches[0].clientX - touchStart.current.x;
    const diffY = e.changedTouches[0].clientY - touchStart.current.y;
    const threshold = 35; // Minimum travel in px

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (diffX > threshold) {
        handleMove('right');
      } else if (diffX < -threshold) {
        handleMove('left');
      }
    } else {
      // Vertical swipe
      if (diffY > threshold) {
        handleMove('down');
      } else if (diffY < -threshold) {
        handleMove('up');
      }
    }

    touchStart.current = null;
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start py-8 px-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-indigo-400/10 dark:bg-indigo-600/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-pink-400/10 dark:bg-purple-600/5 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-lg flex flex-col items-center z-10">
        {/* Header Controls */}
        <Header
          gridSize={gridSize}
          onChangeSize={setGridSize}
          onRestart={restart}
          onUndo={undo}
          canUndo={canUndo}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* Stats Panel */}
        <GameStats
          score={score}
          bestScore={bestScore}
          moveCount={moveCount}
          gameOver={gameOver}
        />

        {/* Board Component wrapper */}
        <div className="w-full relative mb-6">
          <GameBoard
            tiles={tiles}
            gridSize={gridSize}
            isShaking={isShaking}
          />
          <MenuOverlay
            gameOver={gameOver}
            won={won}
            keepPlaying={keepPlaying}
            score={score}
            tiles={tiles}
            onRestart={restart}
            onKeepPlaying={handleKeepPlaying}
          />
        </div>

        {/* Instruction details */}
        <HowToPlay />
      </div>
    </div>
  );
};
