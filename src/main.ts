import paper from 'paper';

import { Game } from './game';
import './styles.css';

const canvas = document.getElementById('game') as HTMLCanvasElement;
paper.setup(canvas);

new Game(canvas);

paper.view.onFrame = () => {
  paper.view.update();
};
