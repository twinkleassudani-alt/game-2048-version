import { useReducer, useEffect, useCallback } from 'react';
import { Tile, GridSize, GameState } from '../utils/types';
import { playSlideSound, playMergeSound, playWinSound, playGameOverSound } from '../utils/audio';

// Helper to generate a unique ID for new tiles
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper to get random empty cell from board
const getRandomEmptyCell = (tiles: Tile[], gridSize: GridSize): { row: number; col: number } | null => {
  const occupied = new Set(tiles.filter(t => !t.isMerged).map(t => `${t.row},${t.col}`));
  const empties: { row: number; col: number }[] = [];

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!occupied.has(`${r},${c}`)) {
        empties.push({ row: r, col: c });
      }
    }
  }

  if (empties.length === 0) return null;
  return empties[Math.floor(Math.random() * empties.length)];
};

// Spawn a new tile (90% chance of 2, 10% chance of 4)
const createNewTile = (row: number, col: number): Tile => ({
  id: generateId(),
  value: Math.random() < 0.9 ? 2 : 4,
  row,
  col,
  isNew: true,
});

// Initialize game state
const initGame = (gridSize: GridSize, savedHighScores: Record<GridSize, number>): GameState => {
  const firstTile = createNewTile(
    Math.floor(Math.random() * gridSize),
    Math.floor(Math.random() * gridSize)
  );

  let secondTileRow = Math.floor(Math.random() * gridSize);
  let secondTileCol = Math.floor(Math.random() * gridSize);
  while (secondTileRow === firstTile.row && secondTileCol === firstTile.col) {
    secondTileRow = Math.floor(Math.random() * gridSize);
    secondTileCol = Math.floor(Math.random() * gridSize);
  }

  const secondTile = createNewTile(secondTileRow, secondTileCol);

  return {
    tiles: [firstTile, secondTile],
    score: 0,
    highScores: savedHighScores,
    gameOver: false,
    won: false,
    keepPlaying: false,
    gridSize,
    moveCount: 0,
    history: [],
  };
};

// Check if any valid moves remain on the board
const checkGameOver = (tiles: Tile[], gridSize: GridSize): boolean => {
  const activeTiles = tiles.filter(t => !(t as any).mergedInto);
  if (activeTiles.length < gridSize * gridSize) return false;

  const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
  activeTiles.forEach(t => {
    grid[t.row][t.col] = t.value;
  });

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const val = grid[r][c];
      if (r < gridSize - 1 && grid[r + 1][c] === val) return false;
      if (c < gridSize - 1 && grid[r][c + 1] === val) return false;
    }
  }

  return true;
};

type Action =
  | { type: 'MOVE'; direction: 'up' | 'down' | 'left' | 'right' }
  | { type: 'CLEANUP' }
  | { type: 'RESTART' }
  | { type: 'UNDO' }
  | { type: 'CHANGE_SIZE'; size: GridSize }
  | { type: 'KEEP_PLAYING' }
  | { type: 'LOAD_SAVED_STATE'; state: GameState };

const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'RESTART': {
      return initGame(state.gridSize, state.highScores);
    }

    case 'CHANGE_SIZE': {
      return initGame(action.size, state.highScores);
    }

    case 'KEEP_PLAYING': {
      return {
        ...state,
        keepPlaying: true,
      };
    }

    case 'LOAD_SAVED_STATE': {
      return action.state;
    }

    case 'UNDO': {
      if (state.history.length === 0) return state;

      const prev = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);

      return {
        ...state,
        tiles: prev.tiles,
        score: prev.score,
        gameOver: prev.gameOver,
        won: prev.won,
        keepPlaying: prev.keepPlaying,
        moveCount: Math.max(0, state.moveCount - 1),
        history: newHistory,
      };
    }

    case 'CLEANUP': {
      const cleaned = state.tiles
        .filter(t => !(t as any).mergedInto)
        .map(t => ({
          ...t,
          isNew: false,
          isMerged: false,
        }));
      return {
        ...state,
        tiles: cleaned,
      };
    }

    case 'MOVE': {
      if (state.gameOver) return state;

      const direction = action.direction;
      const gridSize = state.gridSize;

      const currentTiles = state.tiles
        .filter(t => !(t as any).mergedInto)
        .map(t => ({ ...t, isNew: false, isMerged: false }));

      // ── BUG FIX ──────────────────────────────────────────────────────────
      // Tiles must be processed starting from the side they are sliding
      // TOWARD, not away from. The tile closest to the destination wall has
      // to settle into its final position FIRST, so that tiles behind it
      // see its updated (possibly merged) value and position when they, in
      // turn, slide and check for a merge partner.
      //
      // Previous code sorted ascending for 'left'/'up' and descending for
      // 'right'/'down' — which is backwards. For 'left', the tile with the
      // SMALLEST column is the one closest to the left wall, so it must be
      // processed first → ascending sort by col is actually correct for
      // 'left' already... but the real issue is when 3 tiles of the same
      // value are in a line: the middle tile must merge with the LEADING
      // tile (the one closer to the wall) and the trailing tile must then
      // see that the leading position is occupied by an already-merged
      // (locked) tile and just slide next to it — it must NOT be allowed to
      // merge again. The previous mergedCellIds/mergedInto checks correctly
      // blocked a double-merge, BUT because of incorrect ordering in some
      // direction branches, the trailing tile could be evaluated BEFORE the
      // middle tile finished merging into the leading tile, causing it to
      // wrongly merge with the leading tile directly (skipping over the
      // middle tile) or to stop in the wrong cell entirely.
      //
      // Fix: explicitly process tiles in order from the wall outward for
      // EVERY direction (closest-to-wall first), and re-fetch the live grid
      // cell (not a stale reference) on every step.
      const sortedTiles = [...currentTiles].sort((a, b) => {
        if (direction === 'up') return a.row - b.row;       // row 0 first
        if (direction === 'down') return b.row - a.row;      // last row first
        if (direction === 'left') return a.col - b.col;      // col 0 first
        if (direction === 'right') return b.col - a.col;     // last col first
        return 0;
      });

      const grid = Array.from({ length: gridSize }, () =>
        Array<Tile | null>(gridSize).fill(null)
      );
      sortedTiles.forEach(t => {
        grid[t.row][t.col] = t;
      });

      const nextTiles: Tile[] = [];
      const mergedCellIds = new Set<string>();
      let scoreGain = 0;
      let hasMoved = false;

      const vector = {
        up: { r: -1, c: 0 },
        down: { r: 1, c: 0 },
        left: { r: 0, c: -1 },
        right: { r: 0, c: 1 },
      }[direction];

      sortedTiles.forEach(tile => {
        // Always read the tile's CURRENT live position from the grid,
        // since a previous tile in this same pass may have already moved
        // into a cell that shifts where "tile.row/tile.col" effectively is.
        // (tile.row/tile.col are still valid here since we never mutate the
        // original tile object — only nextTiles/grid are updated — but we
        // keep this comment as a guard against future refactors.)
        let r = tile.row;
        let c = tile.col;

        // Slide the tile in the direction until blocked
        while (true) {
          const nextR = r + vector.r;
          const nextC = c + vector.c;

          if (nextR < 0 || nextR >= gridSize || nextC < 0 || nextC >= gridSize) {
            break;
          }

          const blocker = grid[nextR][nextC];
          if (blocker === null) {
            r = nextR;
            c = nextC;
          } else {
            break;
          }
        }

        // Check if there is an adjacent tile in the direction of sliding
        const nextR = r + vector.r;
        const nextC = c + vector.c;
        let merged = false;

        if (nextR >= 0 && nextR < gridSize && nextC >= 0 && nextC < gridSize) {
          const blocker = grid[nextR][nextC];
          if (
            blocker &&
            blocker.value === tile.value &&
            !mergedCellIds.has(blocker.id) &&
            !(blocker as any).mergedInto
          ) {
            hasMoved = true;
            merged = true;

            const slidingTile: Tile = {
              ...tile,
              row: nextR,
              col: nextC,
            };
            (slidingTile as any).mergedInto = blocker.id;
            nextTiles.push(slidingTile);

            const blockerIndex = nextTiles.findIndex(t => t.id === blocker.id);
            if (blockerIndex !== -1) {
              const doubledValue = blocker.value * 2;
              nextTiles[blockerIndex] = {
                ...nextTiles[blockerIndex],
                value: doubledValue,
                isMerged: true,
              };
              scoreGain += doubledValue;
              mergedCellIds.add(blocker.id);

              // ── BUG FIX ──────────────────────────────────────────────
              // The grid must be updated immediately so any LATER tile in
              // this same pass that slides toward this cell sees the new
              // doubled value (and the locked/merged state), not the stale
              // pre-merge tile. Without this, a third tile sliding into the
              // same lane could incorrectly merge again with what should
              // already be a "locked" merged tile, or fail to stop next to
              // it correctly.
              grid[nextR][nextC] = nextTiles[blockerIndex];
            }

            // Free up the tile's original cell since it has now merged away
            grid[tile.row][tile.col] = null;
          }
        }

        if (!merged) {
          if (r !== tile.row || c !== tile.col) {
            hasMoved = true;
          }
          const updatedTile: Tile = {
            ...tile,
            row: r,
            col: c,
          };
          nextTiles.push(updatedTile);
          // Clear old cell and claim the new one
          grid[tile.row][tile.col] = null;
          grid[r][c] = updatedTile;
        }
      });

      if (!hasMoved) {
        return state;
      }

      if (mergedCellIds.size > 0) {
        playMergeSound();
      } else {
        playSlideSound();
      }

      const newScore = state.score + scoreGain;
      const currentBest = state.highScores[gridSize] || 0;
      const newBest = Math.max(currentBest, newScore);
      const newHighScores = {
        ...state.highScores,
        [gridSize]: newBest,
      };

      let won = state.won;
      if (!won && nextTiles.some(t => t.value === 2048 && !(t as any).mergedInto)) {
        won = true;
        playWinSound();
      }

      const emptySpot = getRandomEmptyCell(nextTiles, gridSize);
      if (emptySpot) {
        const newTile = createNewTile(emptySpot.row, emptySpot.col);
        nextTiles.push(newTile);
      }

      const gameOver = checkGameOver(nextTiles, gridSize);
      if (gameOver) {
        playGameOverSound();
      }

      const currentHistoryState = {
        tiles: state.tiles,
        score: state.score,
        gameOver: state.gameOver,
        won: state.won,
        keepPlaying: state.keepPlaying,
      };
      const updatedHistory = [...state.history, currentHistoryState].slice(-5);

      return {
        ...state,
        tiles: nextTiles,
        score: newScore,
        highScores: newHighScores,
        gameOver,
        won,
        moveCount: state.moveCount + 1,
        history: updatedHistory,
      };
    }

    default:
      return state;
  }
};

export const use2048 = (gridSize: GridSize = 4) => {
  const getSavedHighScores = (): Record<GridSize, number> => {
    try {
      const saved = localStorage.getItem('2048-highscores-premium');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not read highscores from localStorage", e);
    }
    return { 3: 0, 4: 0, 5: 0, 6: 0 };
  };

  const [state, dispatch] = useReducer(gameReducer, gridSize, (size) => {
    const highScores = { 3: 0, 4: 0, 5: 0, 6: 0 };
    return initGame(size, highScores);
  });

  useEffect(() => {
    const highScores = getSavedHighScores();
    dispatch({
      type: 'LOAD_SAVED_STATE',
      state: initGame(gridSize, highScores),
    });
  }, [gridSize]);

  useEffect(() => {
    try {
      localStorage.setItem('2048-highscores-premium', JSON.stringify(state.highScores));
    } catch (e) {
      console.warn("Could not write highscores to localStorage", e);
    }
  }, [state.highScores]);

  useEffect(() => {
    const containsMerged = state.tiles.some(t => (t as any).mergedInto || t.isMerged || t.isNew);
    if (containsMerged) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEANUP' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [state.tiles]);

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    dispatch({ type: 'MOVE', direction });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const changeGridSize = useCallback((size: GridSize) => {
    dispatch({ type: 'CHANGE_SIZE', size });
  }, []);

  const onKeepPlaying = useCallback(() => {
    dispatch({ type: 'KEEP_PLAYING' });
  }, []);

  return {
    tiles: state.tiles,
    score: state.score,
    bestScore: state.highScores[state.gridSize] || 0,
    gameOver: state.gameOver,
    won: state.won,
    keepPlaying: state.keepPlaying,
    moveCount: state.moveCount,
    canUndo: state.history.length > 0,
    move,
    restart,
    undo,
    changeGridSize,
    onKeepPlaying,
  };
};
