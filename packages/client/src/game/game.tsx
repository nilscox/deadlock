import { Game as GameClass, LevelDefinition } from '@deadlock/game';
import { CSSProperties, useEffect, useRef, useState } from 'react';

import { PlayerControls } from './player-controls';
import { GameRenderer } from './renderer';

export type OnGameLoaded = (game: GameClass, renderer: GameRenderer) => void;

type GameProps = {
  definition: LevelDefinition;
  onLoaded?: OnGameLoaded;
  styles?: CSSProperties;
};

export const Game = ({ definition, onLoaded, styles }: GameProps) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>();

  const controlsRef = useRef<PlayerControls>();
  const rendererRef = useRef<GameRenderer>();
  const gameRef = useRef<GameClass>();

  useEffect(() => {
    if (!canvas) {
      rendererRef.current?.clear();
      return;
    }

    const controls = new PlayerControls();
    const game = new GameClass(controls, definition);
    const renderer = new GameRenderer(canvas, game);

    controlsRef.current = controls;
    gameRef.current = game;
    rendererRef.current = renderer;

    onLoaded?.(game, renderer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas]);

  useEffect(() => {
    gameRef.current?.setLevel(definition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(definition)]);

  useEffect(() => {
    return () => controlsRef.current?.cleanup();
  }, []);

  return <canvas ref={setCanvas} style={{ margin: 'auto', width: 300, height: 300, ...styles }} />;
};
