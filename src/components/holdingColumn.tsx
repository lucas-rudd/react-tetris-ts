import * as React from "react";
import { TetrominoLocation } from "../types";
// Define props for TetrisBoard component
type HoldingColumnProps = {
  holdingTile: number;
  holdingHeight: number;
  holdingWidth: number;
  tiles: number[][][][];
};

// Create TetrisBoard component
const HoldingColumn: React.FC<HoldingColumnProps> = props => {
  let holdingRows: any[] = [];
  const field: number[][] = [];
  for (let y = 0; y < props.holdingHeight; y++) {
    let row = [];

    for (let x = 0; x < props.holdingWidth; x++) {
      row.push(0);
    }

    field.push(row);
  }

  const { holdingTile, tiles, holdingHeight, holdingWidth } = props;
  const verticallyCenterPiece = Math.floor(holdingHeight / 2) % 2 !== 0;
  const horizontallyCenterPiece = Math.floor(holdingWidth / 2) % 2 !== 0;
  const verticalCenterAdjustment = verticallyCenterPiece
    ? Math.floor(holdingHeight / 2) - 1
    : Math.floor(holdingHeight / 2);
  const horizontalCenterAdjustment = horizontallyCenterPiece
    ? Math.floor(holdingWidth / 2) - 1
    : Math.floor(holdingWidth / 2);

  field[verticalCenterAdjustment + tiles[holdingTile][0][0][1]][
    horizontalCenterAdjustment + tiles[holdingTile][0][0][0]
  ] = holdingTile;
  field[verticalCenterAdjustment + tiles[holdingTile][0][1][1]][
    horizontalCenterAdjustment + tiles[holdingTile][0][1][0]
  ] = holdingTile;
  field[verticalCenterAdjustment + tiles[holdingTile][0][2][1]][
    horizontalCenterAdjustment + tiles[holdingTile][0][2][0]
  ] = holdingTile;
  field[verticalCenterAdjustment + tiles[holdingTile][0][3][1]][
    horizontalCenterAdjustment + tiles[holdingTile][0][3][0]
  ] = holdingTile;

  field.forEach((row, index) => {
    // Create board columns
    const cols = row.map((column: any, index: number) => (
      <div className={`holding__col-${column}`} key={index} />
    ));

    holdingRows.push(
      <div className="tetris-board__holding-row" key={index}>
        {cols}
      </div>
    );
  });

  return (
    <div className="holding-column">
      {/* Game info */}
      <div className="holding-column__hold">{holdingRows}</div>
    </div>
  );
};

export default HoldingColumn;
