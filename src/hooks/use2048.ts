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

  // Create a grid map
  const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
  activeTiles.forEach(t => {
    grid[t.row][t.col] = t.value;
  });

  // Check horizontal and vertical adjacencies for matching values
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
      // Remove tiles that merged into others and clear flags
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

      // Filter out any sliding tiles that were in process of merging
      // and map remaining ones
      const currentTiles = state.tiles
        .filter(t => !(t as any).mergedInto)
        .map(t => ({ ...t, isNew: false, isMerged: false }));

      // Sort tiles based on move direction to prevent collision bugs
      const sortedTiles = [...currentTiles].sort((a, b) => {
        if (direction === 'up') return a.row - b.row;
        if (direction === 'down') return b.row - a.row;
        if (direction === 'left') return a.col - b.col;
        if (direction === 'right') return b.col - a.col;
        return 0;
      });

      // Prepare 2D grid structure to search cell availability
      const grid = Array.from({ length: gridSize }, () =>
        Array<Tile | null>(gridSize).fill(null)
      );
      sortedTiles.forEach(t => {
        grid[t.row][t.col] = t;
      });

      const nextTiles: Tile[] = [];
      const mergedCellIds = new Set<string>(); // Keep track of coordinates merged in this turn
      let scoreGain = 0;
      let hasMoved = false;

      // Vector representing direction offset
      const vector = {
        up: { r: -1, c: 0 },
        down: { r: 1, c: 0 },
        left: { r: 0, c: -1 },
        right: { r: 0, c: 1 },
      }[direction];

      sortedTiles.forEach(tile => {
        let r = tile.row;
        let c = tile.col;

        // Slide the tile in the direction until blocked
        while (true) {
          const nextR = r + vector.r;
          const nextC = c + vector.c;

          // Check boundary
          if (nextR < 0 || nextR >= gridSize || nextC < 0 || nextC >= gridSize) {
            break;
          }

          const blocker = grid[nextR][nextC];
          if (blocker === null) {
            // Cell is empty, slide further
            r = nextR;
            c = nextC;
          } else {
            // Blocked by a tile, check if we can merge
            break;
          }
        }

        // Check if there is an adjacent tile in the direction of sliding
        const nextR = r + vector.r;
        const nextC = c + vector.c;
        let merged = false;

        if (nextR >= 0 && nextR < gridSize && nextC >= 0 && nextC < gridSize) {
          const blocker = grid[nextR][nextC];
          // Can we merge?
          if (
            blocker &&
            blocker.value === tile.value &&
            !mergedCellIds.has(blocker.id) &&
            !(blocker as any).mergedInto
          ) {
            // Yes! Merge them
            hasMoved = true;
            merged = true;

            // Mark current tile as merging into the blocker
            const slidingTile: Tile = {
              ...tile,
              row: nextR,
              col: nextC,
            };
            (slidingTile as any).mergedInto = blocker.id;
            nextTiles.push(slidingTile);

            // Update the blocking tile with double value
            // We search for blocker in nextTiles because it has already been processed (due to sorting)
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
            }
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
          // Update the grid map reference to its new resting position
          grid[tile.row][tile.col] = null;
          grid[r][c] = updatedTile;
        }
      });

      if (!hasMoved) {
        return state;
      }

      // Play slide or merge sound
      if (mergedCellIds.size > 0) {
        playMergeSound();
      } else {
        playSlideSound();
      }

      // Determine new score and high scores
      const newScore = state.score + scoreGain;
      const currentBest = state.highScores[gridSize] || 0;
      const newBest = Math.max(currentBest, newScore);
      const newHighScores = {
        ...state.highScores,
        [gridSize]: newBest,
      };

      // Check if won (first time achieving 2048)
      let won = state.won;
      if (!won && nextTiles.some(t => t.value === 2048 && !(t as any).mergedInto)) {
        won = true;
        playWinSound();
      }

      // Add a random tile (2 or 4) to an empty spot
      const emptySpot = getRandomEmptyCell(nextTiles, gridSize);
      if (emptySpot) {
        const newTile = createNewTile(emptySpot.row, emptySpot.col);
        nextTiles.push(newTile);
      }

      // Check for Game Over
      const gameOver = checkGameOver(nextTiles, gridSize);
      if (gameOver) {
        playGameOverSound();
      }

      // Save previous state to history (limit to 5 steps for memory efficiency)
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
  // Load high scores from localStorage
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

  // Load highscores on initial load
  useEffect(() => {
    const highScores = getSavedHighScores();
    dispatch({
      type: 'LOAD_SAVED_STATE',
      state: initGame(gridSize, highScores),
    });
  }, [gridSize]);

  // Persist high scores to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('2048-highscores-premium', JSON.stringify(state.highScores));
    } catch (e) {
      console.warn("Could not write highscores to localStorage", e);
    }
  }, [state.highScores]);

  // Handle cleanup of merged tiles after slide transition
  useEffect(() => {
    const containsMerged = state.tiles.some(t => (t as any).mergedInto || t.isMerged || t.isNew);
    if (containsMerged) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEANUP' });
      }, 150); // Matches CSS transition sliding speed
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
