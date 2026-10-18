export class Overlay {
  private el: HTMLElement;

  constructor() {
    const el = document.getElementById('overlay');
    if (!el) throw new Error('missing #overlay');
    this.el = el;
  }

  show(html: string): void {
    this.el.innerHTML = html;
    this.el.classList.add('on');
  }

  hide(): void {
    this.el.classList.remove('on');
    this.el.innerHTML = '';
  }

  get visible(): boolean { return this.el.classList.contains('on') }

  setText(sel: string, text: string): void {
    const e = this.el.querySelector(sel);
    if (e) e.textContent = text;
  }

  onClick(sel: string, fn: () => void): void {
    this.el.querySelector(sel)?.addEventListener('click', fn);
  }

  onBuy(fn: (id: string) => void): void {
    this.el.querySelectorAll<HTMLElement>('[data-buy]').forEach((b) => {
      b.addEventListener('click', () => { const id = b.dataset.buy; if (id) fn(id) });
    });
  }
}
