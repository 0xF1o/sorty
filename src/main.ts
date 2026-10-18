import './style.css';
import { Game } from './game/game';

// Sorty creates no iframes, so any that appear were injected by the host.
// CSS hides them; this removes them (and their network activity) outright.
const stripForeignFrames = (): void => {
  for (const el of document.querySelectorAll('iframe, object, embed')) el.remove();
};
stripForeignFrames();
new MutationObserver(stripForeignFrames).observe(document.documentElement, { childList: true, subtree: true });

const canvas = document.createElement('canvas');
canvas.id = 'scene';
const app = document.getElementById('app');
if (!app) throw new Error('missing #app');
app.prepend(canvas);
const game = new Game(canvas);

// Debug handle used by tools/shot.mjs
Object.defineProperty(window, '__state', { get: () => game.debugState() });
(window as unknown as { __game: Game }).__game = game;
