import { TetrominoLocation } from "../types";

export const isValidXMove = ({
  activeTileX: x,
  activeTileY: y,
  xAdd,
  activeTile: tile,
  tileRotate: rotate,
  index,
  tiles,
  field,
  boardWidth
}: TetrominoLocation & {
  xAdd: number;
  index: number;
  tiles: number[][][][];
  boardWidth: number;
}) => {
  if (
    x + xAdd + tiles[tile][rotate][index][0] >= 0 &&
    x + xAdd + tiles[tile][rotate][index][0] < boardWidth
  ) {
    if (
      field[y + tiles[tile][rotate][index][1]][
        x + xAdd + tiles[tile][rotate][index][0]
      ] !== 0
    ) {
      // Prevent the move
      return false;
    } else {
      return true;
    }
  } else {
    // Prevent the move
    return false;
  }
};

// TODO: maybe use this moving forward
// export const isXOutsideBoard = ({
//   activeTileX: x,
//   tileRotate: rotate,
//   activeTile: tile,
//   xAdd,
//   tiles,
//   index,
//   boardWidth
// }: TetrominoLocation & {
//   xAdd: number;
//   tiles: number[][][][];
//   index: number;
//   boardWidth: number;
// }) => {
//   return x + xAdd + tiles[tile][rotate][index][0] > boardWidth;
// };
