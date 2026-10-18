import { MathUtils, Vector3, type Camera } from 'three';


import { TAG_COLOR, TAG_LABEL } from '../palette';


import type { Prop, Shelf } from '../world/types';





const q = <T extends HTMLElement>(sel: string): T => {


  const el = document.querySelector<T>(sel);


  if (!el) throw new Error(`missing ${sel}`);


  return el;


};





export class Hud {


  private root = q('#hud');


  private moneyEl = q('#money');


  private streakEl = q('#streak');


  private leftEl = q('#left');


  private clockEl = q('#clock');


  private bagEl = q('#bag');


  private abilityEl = q('#abilities');


  private crosshairEl = q('#crosshair');


  private hoverEl = q('#hoverinfo');


  private toastEl = q('#toast');


  private toastUntil = 0;


  private v = new Vector3();





  show(): void { this.root.classList.remove('hidden') }


  hide(): void { this.root.classList.add('hidden') }





  setMoney(v: number): void { this.moneyEl.textContent = `$${v}` }





  setStreak(streak: number, mult: number): void {


    this.streakEl.textContent = streak > 0 ? `x${mult}  (${streak} in a row)` : '';


    this.streakEl.style.opacity = mult > 1 ? '1' : '0.45';


  }





  setLeft(n: number): void {


    this.leftEl.textContent = n === 0 ? 'Room clear, go home' : `${n} left on the floor`;


    this.leftEl.style.color = n === 0 ? '#7dff9b' : '';


  }





  setClock(sec: number): void {


    const s = Math.max(0, Math.ceil(sec));


    this.clockEl.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;


    this.clockEl.style.color = s <= 20 ? '#ff8f7d' : '';


  }





  setBag(items: Prop[], cap: number): void {


    const chips = items.map((p) => {


      const dots = p.spec.tags.map((t) => `<i style="background:${TAG_COLOR[t]}"></i>`).join('');


      return `<span class="chip" style="border-color:${TAG_COLOR[p.spec.tags[0]]}">${dots}${p.spec.name}</span>`;


    });


    for (let i = items.length; i < cap; i++) chips.push('<span class="chip empty"></span>');


    this.bagEl.innerHTML = chips.join('');


  }





  setHover(name: string | null, tags: string[]): void {


    if (!name) { this.hoverEl.innerHTML = ''; this.hoverEl.classList.remove('on'); return }


    const dots = tags.map((t) => `<span class="tag" style="color:${TAG_COLOR[t as keyof typeof TAG_COLOR]}">${TAG_LABEL[t as keyof typeof TAG_LABEL]}</span>`).join('');


    this.hoverEl.innerHTML = `<span class="hname">${name}</span>${dots}`;


    this.hoverEl.classList.add('on');


  }





  setAbilities(parts: string[]): void { this.abilityEl.innerHTML = parts.join('') }





  setCrosshair(state: 'idle' | 'ok' | 'bad'): void {


    this.crosshairEl.className = state === 'idle' ? '' : state;


  }





  lastToast = '';





  toast(text: string): void {


    this.lastToast = text;


    this.toastEl.textContent = text;


    this.toastEl.classList.add('on');


    this.toastUntil = performance.now() + 1400;


  }





  tick(now: number): void {


    if (this.toastUntil && now > this.toastUntil) { this.toastEl.classList.remove('on'); this.toastUntil = 0 }


  }





  /** Project each shelf's card anchor to screen space. */


  placeCards(shelves: Shelf[], camera: Camera, w: number, h: number): void {


    for (const s of shelves) {


      this.v.copy(s.anchor).project(camera);


      if (this.v.z > 1) { s.card.style.display = 'none'; continue }


      s.card.style.display = 'block';


      const x = (this.v.x * 0.5 + 0.5) * w;


      const y = (-this.v.y * 0.5 + 0.5) * h;


      s.card.style.transform = `translate(-50%,-50%) translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;


      const d = camera.position.distanceTo(s.anchor);


      s.card.style.opacity = String(MathUtils.clamp(1.25 - d / 9, 0.3, 1));


      s.card.style.zIndex = String(1000 - Math.round(d * 100));


    }


  }





  hideCards(shelves: Shelf[]): void { for (const s of shelves) s.card.style.display = 'none' }


}


