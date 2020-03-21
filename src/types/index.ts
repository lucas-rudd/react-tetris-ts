export type TetrisState = {
  activeTileX: number;
  activeTileY: number;
  activeTile: number;
  tileRotate: number;
  score: number;
  level: number;
  tileCount: number;
  gameOver: boolean;
  isPaused: boolean;
  field: any[];
  timerId?: number;
  keyId?: number;
  holdingTile?: number;
  tiles: number[][][][];
};

export type TetrominoLocation = Pick<
  TetrisState,
  "field" | "activeTileX" | "activeTileY" | "tileRotate" | "activeTile"
>;
