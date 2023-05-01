import paper from 'paper';

import { PaperControls } from './controls';
import { Game } from './game';
import { PaperRenderer } from './renderer';
import './styles.css';

const canvas = document.getElementById('game') as HTMLCanvasElement;
paper.setup(canvas);

new Game(new PaperRenderer(), new PaperControls());

paper.view.translate([1, 1]);

paper.view.onFrame = () => {
  paper.view.update();
};
