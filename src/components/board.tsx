import * as React from "react";
import HoldingColumn from "./holdingColumn";
import boardAsset from "../assets/game-board-black.png";
import holdingAsset from "../assets/holding-column-short.png";
// Define props for TetrisBoard component
type TetrisBoardProps = {
  field: any[];
  gameOver: boolean;
  score: number;
  level: number;
  tiles: number[][][][];
  holdingTile: number;
  holdingHeight: number;
  holdingWidth: number;
};

// Create TetrisBoard component
const TetrisBoard: React.FC<TetrisBoardProps> = props => {
  // Create board rows
  let rows: any[] = [];

  props.field.forEach((row, index) => {
    // Create board columns
    const cols = row.map((column: any, index: number) => (
      <div className={`col-${column}`} key={index} />
    ));

    rows.push(
      <div className="tetris-board__row" key={index}>
        {cols}
      </div>
    );
  });

  let board = document.getElementById("tetris-board__board");
  let imgBoard = document.getElementById("tetris-board__img-board");
  let holdingColumn = document.getElementById(
    "tetris-board__img-holding-column"
  );
  if (board && imgBoard && holdingColumn) {
    const style = window.getComputedStyle(board);
    const wdt = style.getPropertyValue("width");
    const hght = style.getPropertyValue("height");
    imgBoard.style.width = wdt;
    imgBoard.style.height = hght;
    holdingColumn.style.height = hght;
  }

  return (
    <div className="tetris-board">
      {/* Game info */}
      <div className="tetris-board__info">
        <p className="tetris-board__text">Level: {props.level}</p>

        <p className="tetris-board__text">Score: {props.score}</p>

        {props.gameOver && (
          <p className="tetris-board__text">
            <strong>Game Over</strong>
          </p>
        )}
      </div>

      {/* Game board */}
      <div>
        <img
          id="tetris-board__img-board"
          className="tetris-board__img-board"
          src={boardAsset}
        />
        <div id="tetris-board__board" className="tetris-board__board">
          {rows}
        </div>
      </div>
      <div>
        <img
          id="tetris-board__img-holding-column"
          className="tetris-board__img-holding-column"
          src={holdingAsset}
        />
        <div className="tetris-board__holding-column">
          <HoldingColumn
            holdingTile={props.holdingTile}
            holdingHeight={props.holdingHeight}
            holdingWidth={props.holdingWidth}
            tiles={props.tiles}
          />
        </div>
      </div>
    </div>
  );
};

export default TetrisBoard;
