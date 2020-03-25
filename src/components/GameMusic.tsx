import Sound from "react-sound";
import React from "react";
import { MusicState } from "../types";

type GameMusicProps = {
  playStatus: MusicState;
  music: string;
  loop?: boolean;
  isRotate?: boolean;
  onFinishedPlaying?: () => void;
};
const GameMusic: React.FC<GameMusicProps> = ({
  music,
  playStatus,
  loop = false,
  isRotate = false,
  onFinishedPlaying
}) => {
  if (isRotate) {
    console.log("IN ROTATE MUSIC COMPONENT");
  }
  return (
    <Sound
      url={music}
      playStatus={playStatus}
      loop={loop}
      onFinishedPlaying={onFinishedPlaying}
    />
  );
};

export default GameMusic;
