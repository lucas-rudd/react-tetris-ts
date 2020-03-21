import * as React from "react";
import { merge } from "lodash";
import TetrisBoard from "./board";
import initalTileState from "../constants/defaultBoard.json";
import { TetrisState, TetrominoLocation } from "../types";

type TetrisProps = {
  boardWidth: number;
  boardHeight: number;
  holdingHeight: number;
  holdingWidth: number;
};

type ValidKeys =
  | "left"
  | "rotate"
  | "right"
  | "down"
  | "space"
  | "r"
  | "p"
  | "shift"
  | "n";

class Tetris extends React.Component<TetrisProps, TetrisState> {
  constructor(props: TetrisProps) {
    super(props);
    let field = [];
    for (let y = 0; y < props.boardHeight; y++) {
      let row = [];

      for (let x = 0; x < props.boardWidth; x++) {
        row.push(0);
      }
      field.push(row);
    }
    let xStart = Math.floor(props.boardWidth / 2);

    this.state = {
      activeTileX: xStart,
      activeTileY: 1,
      activeTile: 1,
      tileRotate: 0,
      score: 0,
      level: 1,
      tileCount: 0,
      gameOver: false,
      isPaused: false,
      field: field,
      timerId: undefined,
      tiles: initalTileState
    };
    const keyboard: { [key: number]: string } = {
      16: "shift",
      32: "space",
      37: "left",
      38: "rotate",
      39: "right",
      40: "down",
      78: "n",
      83: "s",
      82: "r",
      80: "p"
    };

    let keydownActive: ValidKeys | "";

    const boardKeys = Object.keys(keyboard).map(e => parseInt(e, 10));

    const keyDown = (e: KeyboardEvent) => {
      if (e.metaKey === true || boardKeys.indexOf(e.keyCode) === -1) {
        return;
      }
      const type = keyboard[e.keyCode] as ValidKeys;
      keydownActive = type;

      if (keydownActive === "n") {
        this.handleNewGameClick();
      } else if (keydownActive === "shift") {
        this.handleHoldPiece(this.state.activeTile);
      } else {
        this.handleBoardUpdate(keydownActive);
      }
    };

    const keyUp = (e: KeyboardEvent) => {
      if (e.metaKey === true || boardKeys.indexOf(e.keyCode) === -1) {
        return;
      }
      const type = keyboard[e.keyCode];
      if (type === keydownActive) {
        keydownActive = "";
        window.clearInterval(this.state.keyId);
      }
    };

    document.addEventListener("keydown", keyDown, true);
    document.addEventListener("keyup", keyUp, true);
  }

  setControlsWidth() {
    let board = document.getElementById("tetris-board__board");
    let controls = document.getElementById("tetris__game-controls");
    if (board && controls) {
      const style = window.getComputedStyle(board);
      const wdt = style.getPropertyValue("width");
      controls.style.width = wdt;
    }
  }

  /**
   * @description Sets timer after component mounts
   * Uses level (this.state.level) to determine the interval (game speed)
   * and executes handleBoardUpdate() set to 'down' method during each interval
   * @memberof Tetris
   */
  componentDidMount() {
    this.setControlsWidth();
    let timerId;
    timerId = window.setInterval(
      () => this.handleBoardUpdate("down"),
      1000 - (this.state.level * 10 > 600 ? 600 : this.state.level * 10)
    );

    this.setState({
      timerId
    });
  }

  /**
   * @description Resets the timer when component unmounts
   * @memberof Tetris
   */
  componentWillUnmount() {
    window.clearInterval(this.state.timerId);
  }

  handleHoldPiece(tile: number) {
    /**
     *  TODO: check that placement is valid before rendering,
     *  move it over accordingly until it is in a valid placement
     *  before moving he held piece into the game.
     * */
    const { holdingTile, tileRotate } = this.state;
    const { field, tiles, activeTileY: y, activeTileX: x } = this.state;
    // remove old tile
    field[y + tiles[tile][tileRotate][0][1]][
      x + tiles[tile][tileRotate][0][0]
    ] = 0;
    field[y + tiles[tile][tileRotate][1][1]][
      x + tiles[tile][tileRotate][1][0]
    ] = 0;
    field[y + tiles[tile][tileRotate][2][1]][
      x + tiles[tile][tileRotate][2][0]
    ] = 0;
    field[y + tiles[tile][tileRotate][3][1]][
      x + tiles[tile][tileRotate][3][0]
    ] = 0;
    if (holdingTile) {
      // render new tile
      field[y + tiles[holdingTile][tileRotate][0][1]][
        x + tiles[holdingTile][tileRotate][0][0]
      ] = holdingTile;
      field[y + tiles[holdingTile][tileRotate][1][1]][
        x + tiles[holdingTile][tileRotate][1][0]
      ] = holdingTile;
      field[y + tiles[holdingTile][tileRotate][2][1]][
        x + tiles[holdingTile][tileRotate][2][0]
      ] = holdingTile;
      field[y + tiles[holdingTile][tileRotate][3][1]][
        x + tiles[holdingTile][tileRotate][3][0]
      ] = holdingTile;
      this.setState({
        field,
        activeTile: holdingTile,
        holdingTile: tile
      });
    } else {
      this.setState({
        field,
        holdingTile: tile,
        activeTile: Math.floor(Math.random() * 7 + 1)
      });
    }
  }

  /**
   * @description Handles board updates
   * @param {string} command
   * @memberof Tetris
   */
  handleBoardUpdate(command: string) {
    if ((!this.state.gameOver && !this.state.isPaused) || command === "p") {
      let xAdd = 0;
      let yAdd = 0;
      let rotateAdd = 0;
      let tile = this.state.activeTile;

      switch (command) {
        case "left": {
          xAdd = -1;
          break;
        }
        case "right": {
          xAdd = 1;
          break;
        }
        case "rotate":
        case "r": {
          rotateAdd = 1;
          break;
        }
        case "down": {
          yAdd = 1;
          break;
        }
        case "p": {
          this.handlePauseClick();
          break;
        }
        case "space": {
          yAdd = 1;
          break;
        }
      }

      let field = this.state.field;
      let rotate = this.state.tileRotate;
      const tiles = this.state.tiles;
      let x = this.state.activeTileX;
      let y = this.state.activeTileY;
      field[y + tiles[tile][rotate][0][1]][x + tiles[tile][rotate][0][0]] = 0;
      field[y + tiles[tile][rotate][1][1]][x + tiles[tile][rotate][1][0]] = 0;
      field[y + tiles[tile][rotate][2][1]][x + tiles[tile][rotate][2][0]] = 0;
      field[y + tiles[tile][rotate][3][1]][x + tiles[tile][rotate][3][0]] = 0;
      let newY = y;
      let newLocation: TetrominoLocation = {
        field,
        activeTileX: x,
        activeTileY: newY,
        tileRotate: rotate,
        activeTile: tile
      };
      newLocation = merge({}, newLocation, this.moveX({ ...this.state, xAdd }));
      newLocation = this.rotate({
        ...this.state,
        ...newLocation,
        rotateAdd
      });

      if (command === "space") {
        do {
          newY++;
        } while (
          this.isValidFall({
            ...this.state,
            ...{ ...newLocation, activeTileY: newY },
            yAdd,
            index: 0
          }) &&
          this.isValidFall({
            ...this.state,
            ...{ ...newLocation, activeTileY: newY },
            yAdd,
            index: 1
          }) &&
          this.isValidFall({
            ...this.state,
            ...{ ...newLocation, activeTileY: newY },
            yAdd,
            index: 2
          }) &&
          this.isValidFall({
            ...this.state,
            ...{ ...newLocation, activeTileY: newY },
            yAdd,
            index: 3
          })
        );
        newLocation = merge(
          {},
          newLocation,
          this.moveY({
            ...this.state,
            ...newLocation,
            yAdd: newY - y
          })
        );
      } else {
        newLocation = merge(
          {},
          newLocation,
          this.moveY({
            ...this.state,
            ...{ ...newLocation, activeTileY: newY },
            yAdd
          })
        );
      }
      this.setState(newLocation);
    }
  }

  moveX = ({
    xAdd,
    field,
    activeTile: tile,
    tileRotate: rotate,
    tiles,
    activeTileX: x,
    activeTileY: y
  }: TetrisState & { xAdd: number }) => {
    field[y + tiles[tile][rotate][0][1]][x + tiles[tile][rotate][0][0]] = 0;
    field[y + tiles[tile][rotate][1][1]][x + tiles[tile][rotate][1][0]] = 0;
    field[y + tiles[tile][rotate][2][1]][x + tiles[tile][rotate][2][0]] = 0;
    field[y + tiles[tile][rotate][3][1]][x + tiles[tile][rotate][3][0]] = 0;

    let xAddIsValid = true;

    if (xAdd !== 0) {
      for (let i = 0; i <= 3; i++) {
        if (
          x + xAdd + tiles[tile][rotate][i][0] >= 0 &&
          x + xAdd + tiles[tile][rotate][i][0] < this.props.boardWidth
        ) {
          if (
            field[y + tiles[tile][rotate][i][1]][
              x + xAdd + tiles[tile][rotate][i][0]
            ] !== 0
          ) {
            // Prevent the move
            xAddIsValid = false;
          }
        } else {
          // Prevent the move
          xAddIsValid = false;
        }
      }
    }

    if (xAddIsValid) {
      x += xAdd;
    }
    return {
      field: field,
      activeTileX: x,
      activeTileY: y,
      tileRotate: rotate,
      activeTile: tile
    };
  };

  moveY = ({
    yAdd,
    field,
    activeTile: tile,
    tileRotate: rotate,
    tiles,
    activeTileX: x,
    activeTileY: y
  }: TetrisState & { yAdd: number }): TetrominoLocation => {
    let yAddIsValid = true;

    // Test if tile should fall faster
    if (yAdd !== 0) {
      for (let i = 0; i <= 3; i++) {
        // Test if tile can fall faster without getting outside the board
        if (
          !this.isValidFall({
            yAdd,
            field,
            activeTile: tile,
            tileRotate: rotate,
            activeTileX: x,
            activeTileY: y,
            tiles,
            index: i
          })
        ) {
          // Prevent faster fall
          yAddIsValid = false;
        }
      }
    }

    // If speeding up the fall is valid (move the tile down faster)
    if (yAddIsValid) {
      y += yAdd;
    }

    // Render the tile at new position
    field[y + tiles[tile][rotate][0][1]][x + tiles[tile][rotate][0][0]] = tile;
    field[y + tiles[tile][rotate][1][1]][x + tiles[tile][rotate][1][0]] = tile;
    field[y + tiles[tile][rotate][2][1]][x + tiles[tile][rotate][2][0]] = tile;
    field[y + tiles[tile][rotate][3][1]][x + tiles[tile][rotate][3][0]] = tile;

    // If moving down is not possible, remove completed rows add score
    // and find next tile and check if game is over
    if (!yAddIsValid) {
      for (let row = this.props.boardHeight - 1; row >= 0; row--) {
        let isLineComplete = true;

        // Check if row is completed
        for (let col = 0; col < this.props.boardWidth; col++) {
          if (field[row][col] === 0) {
            isLineComplete = false;
          }
        }

        // Remove completed rows
        if (isLineComplete) {
          for (let yRowSrc = row; row > 0; row--) {
            for (let col = 0; col < this.props.boardWidth; col++) {
              field[row][col] = field[row - 1][col];
            }
          }

          // Check if the row is the last
          row = this.props.boardHeight;
        }
      }

      // Update state - update score, update number of tiles, change level
      this.setState(prev => ({
        score: prev.score + 1 * prev.level,
        tileCount: prev.tileCount + 1,
        level: 1 + Math.floor(prev.tileCount / 10)
      }));

      // Prepare new timer
      let timerId;

      // Reset the timer
      window.clearInterval(this.state.timerId);

      // Update new timer
      timerId = window.setInterval(
        () => this.handleBoardUpdate("down"),
        1000 - (this.state.level * 10 > 600 ? 600 : this.state.level * 10)
      );

      // Use new timer
      this.setState({
        timerId
      });

      // Create new tile
      tile = Math.floor(Math.random() * 7 + 1);
      x = this.props.boardWidth / 2;
      y = 1;
      rotate = 0;

      // Test if game is over - test if new tile can't be placed in field
      if (
        field[y + tiles[tile][rotate][0][1]][x + tiles[tile][rotate][0][0]] !==
          0 ||
        field[y + tiles[tile][rotate][1][1]][x + tiles[tile][rotate][1][0]] !==
          0 ||
        field[y + tiles[tile][rotate][2][1]][x + tiles[tile][rotate][2][0]] !==
          0 ||
        field[y + tiles[tile][rotate][3][1]][x + tiles[tile][rotate][3][0]] !==
          0
      ) {
        // Stop the game
        this.setState({
          gameOver: true
        });
      } else {
        // Otherwise, render new tile and continue
        field[y + tiles[tile][rotate][0][1]][
          x + tiles[tile][rotate][0][0]
        ] = tile;
        field[y + tiles[tile][rotate][1][1]][
          x + tiles[tile][rotate][1][0]
        ] = tile;
        field[y + tiles[tile][rotate][2][1]][
          x + tiles[tile][rotate][2][0]
        ] = tile;
        field[y + tiles[tile][rotate][3][1]][
          x + tiles[tile][rotate][3][0]
        ] = tile;
      }
      this.setState({
        field: field,
        activeTileX: x,
        activeTileY: y,
        tileRotate: rotate,
        activeTile: tile
      });
    }
    return {
      field,
      activeTileX: x,
      activeTileY: y,
      tileRotate: rotate,
      activeTile: tile
    };
  };

  rotate = ({
    rotateAdd,
    field,
    activeTile: tile,
    tileRotate: rotate,
    tiles,
    activeTileX: x,
    activeTileY: y
  }: TetrisState & { rotateAdd: number }) => {
    let newRotate = rotate + rotateAdd > 3 ? 0 : rotate + rotateAdd;
    let rotateIsValid = true;

    // Test if tile should rotate
    if (rotateAdd !== 0) {
      for (let i = 0; i <= 3; i++) {
        // Test if tile can be rotated without getting outside the board
        if (
          x + tiles[tile][newRotate][i][0] >= 0 &&
          x + tiles[tile][newRotate][i][0] < this.props.boardWidth &&
          y + tiles[tile][newRotate][i][1] >= 0 &&
          y + tiles[tile][newRotate][i][1] < this.props.boardHeight
        ) {
          // Test of tile rotation is not blocked by other tiles
          if (
            field[y + tiles[tile][newRotate][i][1]][
              x + tiles[tile][newRotate][i][0]
            ] !== 0
          ) {
            // Prevent rotation
            rotateIsValid = false;
          }
        } else {
          // Prevent rotation
          rotateIsValid = false;
        }
      }
    }

    // If rotation is valid update rotate variable (rotate the tile)
    if (rotateIsValid) {
      rotate = newRotate;
    }
    return {
      field,
      activeTileX: x,
      activeTileY: y,
      tileRotate: rotate,
      activeTile: tile
    };
  };

  isValidFall = ({
    yAdd,
    field,
    activeTile: tile,
    tileRotate: rotate,
    tiles,
    activeTileX: x,
    activeTileY: y,
    index
  }: Pick<
    TetrisState,
    | "tileRotate"
    | "activeTile"
    | "tiles"
    | "activeTileX"
    | "activeTileY"
    | "field"
  > & { yAdd: number; index: number }) => {
    let yAddIsValid = true;
    if (
      y + yAdd + tiles[tile][rotate][index][1] >= 0 &&
      y + yAdd + tiles[tile][rotate][index][1] < this.props.boardHeight
    ) {
      // Test if faster fall is not blocked by other tiles
      if (
        field[y + yAdd + tiles[tile][rotate][index][1]][
          x + tiles[tile][rotate][index][0]
        ] !== 0
      ) {
        // Prevent faster fall
        yAddIsValid = false;
      }
    } else {
      // Prevent faster fall
      yAddIsValid = false;
    }
    return yAddIsValid;
  };

  handlePauseClick = () => {
    this.setState(prev => ({
      isPaused: !prev.isPaused
    }));
  };

  handleNewGameClick = () => {
    let field: any[] = [];
    for (let y = 0; y < this.props.boardHeight; y++) {
      let row = [];

      for (let x = 0; x < this.props.boardWidth; x++) {
        row.push(0);
      }

      field.push(row);
    }

    // Set starting column to center
    let xStart = Math.floor(this.props.boardWidth / 2);

    // Initialize state with starting conditions
    this.setState({
      activeTileX: xStart,
      activeTileY: 1,
      activeTile: 2,
      tileRotate: 0,
      score: 0,
      level: 1,
      tileCount: 0,
      gameOver: false,
      field: field
    });
  };

  render() {
    return (
      <div className="tetris">
        <TetrisBoard
          field={this.state.field}
          gameOver={this.state.gameOver}
          score={this.state.score}
          level={this.state.level}
          tiles={this.state.tiles}
          holdingWidth={this.props.holdingWidth}
          holdingHeight={this.props.holdingHeight}
          holdingTile={this.state.holdingTile || 0}
        />
        <div id="tetris__game-controls" className="tetris__game-controls">
          <button className="btn" onClick={() => this.handleNewGameClick()}>
            New Game
          </button>
          <button className="btn" onClick={() => this.handlePauseClick()}>
            {this.state.isPaused ? "Resume" : "Pause"}
          </button>
        </div>
      </div>
    );
  }
}

export default Tetris;
