import * as React from "react";
import TetrisBoard from "./board";
import initalTileState from "../constants/defaultBoard.json";

type TetrisProps = {
  boardWidth: any;
  boardHeight: any;
};

type TetrisState = {
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
  tiles: number[][][][];
};

type ValidKeys = "left" | "rotate" | "right" | "down" | "space" | "r" | "p";

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
    let xStart = Math.floor(parseInt(props.boardWidth) / 2);

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
      37: "left",
      38: "rotate",
      39: "right",
      40: "down",
      32: "space",
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

      this.handleBoardUpdate(keydownActive);
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

  /**
   * @description Sets timer after component mounts
   * Uses level (this.state.level) to determine the interval (game speed)
   * and executes handleBoardUpdate() set to 'down' method during each interval
   * @memberof Tetris
   */
  componentDidMount() {
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
        case "n": {
          this.handleNewGameClick();
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
      x = this.moveX({ ...this.state, xAdd });
      rotate = this.rotate({ ...this.state, activeTileX: x, rotateAdd });
      let newY = y;
      if (command === "space") {
        do {
          newY++;
        } while (
          this.isValidFall({
            ...this.state,
            activeTileX: x,
            activeTileY: newY,
            tileRotate: rotate,
            yAdd,
            index: 0
          }) &&
          this.isValidFall({
            ...this.state,
            field,
            activeTileX: x,
            activeTileY: newY,
            tileRotate: rotate,
            yAdd,
            index: 1
          }) &&
          this.isValidFall({
            ...this.state,
            field,
            activeTileX: x,
            activeTileY: newY,
            tileRotate: rotate,
            yAdd,
            index: 2
          }) &&
          this.isValidFall({
            ...this.state,
            field,
            activeTileX: x,
            activeTileY: newY,
            tileRotate: rotate,
            yAdd,
            index: 3
          })
        );
        newY = this.moveY({
          ...this.state,
          activeTileX: x,
          activeTileY: newY,
          tileRotate: rotate,
          yAdd: newY - y
        });
      } else {
        newY = this.moveY({
          ...this.state,
          activeTileX: x,
          tileRotate: rotate,
          yAdd
        });
        //TODO: Manage state in only one location (here) instead of also in the `moveY` method
        this.setState({
          field: field,
          activeTileX: x,
          activeTileY: newY,
          tileRotate: rotate
        });
      }
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
    return x;
  };

  //TODO: return type of tetromino position to manage state in only one location
  moveY = ({
    yAdd,
    field,
    activeTile: tile,
    tileRotate: rotate,
    tiles,
    activeTileX: x,
    activeTileY: y
  }: TetrisState & { yAdd: number }) => {
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

      // TODO: I think the problem lies here
      // Create new tile
      tile = Math.floor(Math.random() * 7 + 1);
      x = parseInt(this.props.boardWidth) / 2;
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
    return y;
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
    return rotate;
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
        console.log("BLOCKED BY OTHER TILES?");
        // Prevent faster fall
        yAddIsValid = false;
      }
    } else {
      console.log("BLOCKED BY THE BOARD");
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
    let xStart = Math.floor(parseInt(this.props.boardWidth) / 2);

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
          rotate={this.state.tileRotate}
        />
        <div className="tetris__block-controls">
          <button
            className="btn"
            onClick={() => this.handleBoardUpdate("left")}
          >
            Left
          </button>
          <button
            className="btn"
            onClick={() => this.handleBoardUpdate("down")}
          >
            Down
          </button>
          <button
            className="btn"
            onClick={() => this.handleBoardUpdate("right")}
          >
            Right
          </button>
          <button
            className="btn"
            onClick={() => this.handleBoardUpdate("rotate")}
          >
            Rotate
          </button>
          <div className="tetris__game-controls">
            <button className="btn" onClick={() => this.handleNewGameClick()}>
              New Game
            </button>
            <button className="btn" onClick={() => this.handlePauseClick()}>
              {this.state.isPaused ? "Resume" : "Pause"}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Tetris;
