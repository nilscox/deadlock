import paper from 'paper';

import { Game } from './game';
import './styles.css';
import { PaperControls } from './controls';

const canvas = document.getElementById('game') as HTMLCanvasElement;
paper.setup(canvas);

new Game(canvas, new PaperControls());

paper.view.onFrame = () => {
  paper.view.update();
};
