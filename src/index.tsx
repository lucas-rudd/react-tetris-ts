import React from "react";
import ReactDOM from "react-dom";
import Tetris from "./components/tetris";
import title from "./assets/Title.png";
import "./styles/styles.css";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
  <div className="container">
    <div className="image-container">
      <img className="tetris-title" src={title} />
    </div>
    <Tetris
      boardWidth={14}
      boardHeight={20}
      holdingHeight={5}
      holdingWidth={5}
    />
  </div>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
