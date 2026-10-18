export class Input {
  private keys = new Set<string>();
  private pressed = new Set<string>();
  private dx = 0;
  private dy = 0;
  locked = false;
  onButton: (button: number) => void = () => {};
  onLockChange: (locked: boolean) => void = () => {};

  constructor(private canvas: HTMLCanvasElement) {
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === canvas;
      if (!this.locked) this.keys.clear();
      this.onLockChange(this.locked);
    });
    document.addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      this.dx += e.movementX;
      this.dy += e.movementY;
    });
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'Tab') e.preventDefault();
      if (!e.repeat) this.pressed.add(e.code);
      this.keys.add(e.code);
    });
    document.addEventListener('keyup', (e) => this.keys.delete(e.code));
    canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.onButton(e.button);
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('blur', () => this.keys.clear());
  }

  request(): void {
    if (this.locked) return;
    try { void this.canvas.requestPointerLock(); } catch { /* ignored */ }
  }

  release(): void {
    if (this.locked) document.exitPointerLock();
  }

  down(code: string): boolean { return this.keys.has(code) }
  take(code: string): boolean { const had = this.pressed.has(code); this.pressed.delete(code); return had }
  clearPressed(): void { this.pressed.clear() }
  takeMouse(): { dx: number; dy: number } {
    const r = { dx: this.dx, dy: this.dy };
    this.dx = 0;
    this.dy = 0;
    return r;
  }
}
