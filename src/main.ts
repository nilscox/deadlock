import paper from 'paper';

import { PaperControls } from './controls';
import { Game, GameEventType } from './game';
import { PaperRenderer } from './renderer';
import './styles.css';

const canvas = document.getElementById('game') as HTMLCanvasElement;
paper.setup(canvas);

const game = new Game();
const controls = new PaperControls();
const renderer = new PaperRenderer(game);

controls.addListener(game.handleEvent);

game.addListener(async (event) => {
  if (event.type == GameEventType.levelCompleted) {
    await renderer.animatePlayerPath();
    setTimeout(() => game.nextLevel(), 1000);
  }
});

paper.view.onFrame = () => {
  paper.view.update();
};
