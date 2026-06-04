export interface Tile {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

export type GridSize = 3 | 4 | 5 | 6;

export interface GameState {
  tiles: Tile[];
  score: number;
  highScores: Record<GridSize, number>;
  gameOver: boolean;
  won: boolean;
  keepPlaying: boolean;
  gridSize: GridSize;
  moveCount: number;
  history: {
    tiles: Tile[];
    score: number;
    gameOver: boolean;
    won: boolean;
    keepPlaying: boolean;
  }[];
}

export interface GameStatsType {
  moves: number;
  startTime: number | null;
  elapsedTime: number; // in seconds
}
