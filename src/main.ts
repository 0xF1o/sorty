import './style.css';
import { Game } from './game/game';

const canvas = document.createElement('canvas');
canvas.id = 'scene';
const app = document.getElementById('app');
if (!app) throw new Error('missing #app');
app.prepend(canvas);
const game = new Game(canvas);

// Debug handle used by tools/shot.mjs
Object.defineProperty(window, '__state', { get: () => game.debugState() });
(window as unknown as { __game: Game }).__game = game;
