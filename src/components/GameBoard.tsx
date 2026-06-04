import React from 'react';
import { Tile, GridSize } from '../utils/types';
import { TileCard } from './TileCard';

interface GameBoardProps {
  tiles: Tile[];
  gridSize: GridSize;
  isShaking: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  tiles,
  gridSize,
  isShaking,
}) => {
  // Mapping grid classes so Tailwind compiles them statically
  const gridColsClass = {
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  }[gridSize];

  // Number of cells to render for the background grid
  const cellCount = gridSize * gridSize;
  const cells = Array.from({ length: cellCount });

  // Custom inline style to bind grid sizes for child absolute calculations
  const boardStyle = {
    '--grid-size': gridSize,
  } as React.CSSProperties;

  return (
    <div
      style={boardStyle}
      className={`w-full max-w-lg aspect-square relative p-2 sm:p-3 rounded-3xl bg-slate-200/90 dark:bg-slate-900/90 border border-slate-300/30 dark:border-slate-800/40 shadow-xl shadow-slate-950/10 dark:shadow-slate-950/30 select-none overflow-hidden ${
        isShaking ? 'animate-shake' : ''
      }`}
    >
      {/* Grid of Background Slots */}
      <div className={`w-full h-full grid ${gridColsClass} gap-2.5 sm:gap-4.5`}>
        {cells.map((_, idx) => (
          <div
            key={`cell-${idx}`}
            className="w-full h-full rounded-2xl bg-slate-100/60 dark:bg-slate-950/40 border border-slate-200/20 dark:border-slate-800/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
          />
        ))}
      </div>

      {/* Grid of Active Sliding Tiles */}
      <div className="absolute inset-2 sm:inset-3 pointer-events-none tile-container">
        {tiles.map((tile) => (
          <TileCard
            key={tile.id}
            tile={tile}
            gridSize={gridSize}
          />
        ))}
      </div>
    </div>
  );
};
