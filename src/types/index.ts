import * as React from "react";

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
  didTileFall: boolean;
  musicStatus: MusicState;
  isLineComplete: boolean;
  rotationSoundComponents: React.ReactElement[];
  isRotating: boolean;
};

export type MusicState = "PLAYING" | "STOPPED" | "PAUSED";

export const MusicState: { [state in MusicState]: MusicState } = {
  PLAYING: "PLAYING",
  STOPPED: "STOPPED",
  PAUSED: "PAUSED"
};

export type TetrominoLocation = Pick<
  TetrisState,
  "field" | "activeTileX" | "activeTileY" | "tileRotate" | "activeTile"
>;
