import { CircleGeometry, Euler, MathUtils, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { ABILITY_PRICES, MAX_DT, shiftSeconds, shopSeconds } from '../const';
import { Sfx } from '../audio/sfx';
import { Outlines } from '../fx/outlines';
import { Input } from '../input';
import { TAG_LABEL, type Tag } from '../palette';
import { PROP_MAT, propGeometry, propHeight, propSize } from '../props/factory';
import type { PropSpec } from '../props/part';
import { Interact } from '../player/interact';
import { Player } from '../player/player';
import { Hud } from '../ui/hud';
import { Overlay } from '../ui/overlay';
import { pauseHtml, resultsHtml, shopHtml, titleHtml } from '../ui/screens';
import { buildRoom } from '../world/room';
import { buildShelf, disposeShelves, fitScale, paintCard, PLANS } from '../world/shelf';
import type { Aabb, Prop, Shelf, Slot } from '../world/types';
import { capacity, highlightCfg, magnetCd, magnetRange, newLevels, sprintMul, tidyCd, type AbilityId, type Levels } from './abilities';
import { SHIFTS } from './shifts';
import { pickSpecs, scatterPositions } from './spawn';

type Phase = 'title' | 'shift' | 'shop' | 'results';
const BEST_KEY = 'sorty.best';
const SHADOW_GEO = new CircleGeometry(1, 14);
const SHADOW_MAT = new MeshBasicMaterial({ color: 0x1d1208, transparent: true, opacity: 0.32, depthWrite: false });

function makeProp(spec: PropSpec): Prop {
  const mesh = new Mesh(propGeometry(spec.id), PROP_MAT);
  const size = propSize(spec.id);
  const shadow = new Mesh(SHADOW_GEO, SHADOW_MAT);
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.setScalar(Math.max(size.x, size.z) * 0.58);
  shadow.position.y = 0.006;
  mesh.add(shadow);
  mesh.userData.shadow = shadow;
  const prop: Prop = { spec, mesh, slot: null, paid: false };
  mesh.userData.prop = prop;
  return prop;
}

function setShadow(p: Prop, on: boolean): void {
  const sh = p.mesh.userData.shadow as Mesh | undefined;
  if (sh) sh.visible = on;
}

export class Game {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera: PerspectiveCamera;
  private player = new Player();
  private input: Input;
  private interact: Interact;
  private outlines: Outlines;
  private hud = new Hud();
  private sfx = new Sfx();
  private overlay = new Overlay();
  private holder = new Object3D();

  private shelves: Shelf[] = [];
  private slots: Slot[] = [];
  private worldProps: Prop[] = [];
  private bag: Prop[] = [];
  private colliders: Aabb[] = [];

  private levels: Levels = newLevels();
  private money = 0;
  private streak = 0;
  private placed = 0;
  private wrong = 0;
  private shift = 0;
  private timeLeft = 0;
  private shopLeft = 0;
  private phase: Phase = 'title';
  private highlightEnd = 0;
  private highlightCdEnd = 0;
  private tidyCdEnd = 0;
  private magnetCdEnd = 0;
  private runStart = 0;
  private last = 0;
  private dbg = '';

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 60);
    this.scene.add(this.camera);
    this.camera.add(this.holder);
    this.holder.position.set(0.34, -0.30, -0.72);
    buildRoom(this.scene);

    this.input = new Input(canvas);
    this.interact = new Interact(this.camera, this.scene);
    this.outlines = new Outlines(this.scene);
    this.input.onButton = (b) => this.onButton(b);
    this.input.onLockChange = (locked) => this.onLockChange(locked);
    window.addEventListener('resize', () => this.resize());

    this.syncCamera();
    this.showTitle();
    this.last = performance.now();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  private frame(): void {
    const now = performance.now();
    const dt = Math.min((now - this.last) / 1000, MAX_DT);
    this.last = now;
    this.update(dt, now / 1000);
    this.renderer.render(this.scene, this.camera);
  }

  private update(dt: number, now: number): void {
    if (this.phase === 'shift') this.shiftUpdate(dt, now);
    else if (this.phase === 'shop' && this.overlay.visible) {
      this.shopLeft -= dt;
      this.overlay.setText('#shop-timer', String(Math.max(0, Math.ceil(this.shopLeft))));
      if (this.shopLeft <= 0) this.nextShift();
    }
    if (this.phase !== 'shift') { this.hud.hideCards(this.shelves); return }
    this.hud.placeCards(this.shelves, this.camera, window.innerWidth, window.innerHeight);
  }

  private shiftUpdate(dt: number, now: number): void {
    if (this.input.locked) {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) { this.endShift(); return }
    }
    this.player.update(dt, this.input, this.colliders, !this.input.locked);
    this.syncCamera();
    this.abilityInput(now);
    this.interaction(now);
    this.hud.setClock(this.timeLeft);
    this.hud.setLeft(this.worldProps.filter((p) => p.slot === null).length);
    this.hud.setMoney(this.money);
    this.hud.setStreak(this.streak, this.mult());
    this.hud.setAbilities(this.abilityLine(now));
    this.hud.tick(now * 1000);
    this.holder.position.y = -0.30 + Math.sin(now * 2.1) * 0.006;
  }

  private syncCamera(): void {
    this.player.eye(this.camera.position);
    this.camera.rotation.set(this.player.pitch, this.player.yaw, 0, 'YXZ');
  }

  // ---------------------------------------------------------------- interaction

  private interaction(now: number): void {
    const held = this.bag[0] ?? null;
    this.interact.update(this.worldProps, this.slots, held, (slot) => this.isValid(slot, held));
    const hover = this.interact.hovered;
    this.outlines.set(hover ? [hover.mesh] : [], this.highlightList(now));

    this.hud.setHover(hover ? hover.spec.name : null, hover ? hover.spec.cat : null);
    const slot = this.interact.targetSlot;
    if (slot && held) this.hud.setCrosshair(this.isValid(slot, held) ? 'ok' : 'bad');
    else if (hover) this.hud.setCrosshair('ok');
    else this.hud.setCrosshair('idle');
  }

  private isValid(slot: Slot, held: Prop | null): boolean {
    if (!held || slot.occupied) return false;
    if (!this.player.canReach(slot.pos)) return false;
    return held.spec.cat === slot.shelf.filter;
  }

  private highlightList(now: number): Object3D[] {
    const lvl = this.levels.highlight;
    if (lvl === 0) return [];
    if (lvl < 3 && now >= this.highlightEnd) return [];
    const cats = new Set<Tag>(this.bag.map((p) => p.spec.cat));
    return this.worldProps.filter((p) => cats.size === 0 || cats.has(p.spec.cat)).map((p) => p.mesh);
  }

  private onButton(button: number): void {
    this.sfx.init();
    if (!this.input.locked) { if (this.phase === 'shift') this.input.request(); return }
    if (this.phase !== 'shift') return;
    if (button === 0) this.pickup();
    else if (button === 2) this.place();
  }

  private pickup(): void {
    const p = this.interact.hovered;
    if (!p) { this.dbg = 'pickup:no-hover'; this.hud.toast('Nothing under the crosshair'); return }
    if (!this.player.canReach(p.mesh.position)) {
      this.dbg = `pickup:far ${p.spec.id}`;
      this.hud.toast('Too far away - Magnet can reach it');
      this.sfx.reject();
      return;
    }
    this.pickUp(p);
  }

  /** Works from the floor and from a shelf; frees the slot and repaints the card. */
  private pickUp(p: Prop): void {
    if (this.bag.length >= capacity(this.levels.backpack)) {
      this.dbg = 'pickup:full';
      this.hud.toast('Backpack full');
      this.sfx.reject();
      return;
    }
    if (p.slot) { p.slot.occupied = null; paintCard(p.slot.shelf); p.slot = null }
    this.worldProps = this.worldProps.filter((x) => x !== p);
    p.mesh.removeFromParent();
    p.mesh.scale.setScalar(1);
    p.mesh.rotation.set(0.12, 0.55, -0.3);
    this.bag.push(p);
    this.dbg = `pickup:ok ${p.spec.id}`;
    this.refreshBag();
    this.sfx.pickup();
  }

  private place(): void {
    const held = this.bag[0];
    if (!held) return;
    const slot = this.interact.targetSlot;
    if (!slot) { this.dropOnFloor(held); return }
    if (!this.player.canReach(slot.pos)) {
      this.dbg = 'place:far';
      this.hud.toast('Too far away');
      this.sfx.reject();
      return;
    }
    if (slot.occupied) {
      this.dbg = 'place:taken';
      this.hud.toast('That spot is taken - pick it up first');
      this.sfx.reject();
      return;
    }
    if (held.spec.cat !== slot.shelf.filter) {
      this.award(false);
      this.hud.toast(`No: this shelf is ${TAG_LABEL[slot.shelf.filter]}`);
      return;
    }
    this.placeOnSlot(held, slot);
  }

  private placeOnSlot(held: Prop, slot: Slot): void {
    const yaw = slot.shelf.group.rotation.y + held.mesh.rotation.y;
    this.bag = this.bag.filter((x) => x !== held);
    slot.occupied = held;
    held.slot = slot;
    held.mesh.scale.setScalar(fitScale(propSize(held.spec.id), yaw));
    setShadow(held, true);
    held.mesh.position.copy(slot.pos);
    held.mesh.rotation.set(0, yaw, 0);
    this.scene.add(held.mesh);
    this.worldProps.push(held);
    paintCard(slot.shelf);
    if (!held.paid) { held.paid = true; this.award(true) } else { this.dbg = `place:repl ${held.spec.id}`; this.sfx.place() }
    this.refreshBag();
  }

  private dropOnFloor(held: Prop): void {
    const dir = new Vector3(0, 0, -1).applyEuler(new Euler(this.player.pitch, this.player.yaw, 0, 'YXZ'));
    if (dir.y > -0.08) { this.hud.toast('Aim at the floor to drop it'); return }
    const t = -this.camera.position.y / dir.y;
    if (t > 2.5) { this.hud.toast('Too far away'); return }
    const p = this.camera.position.clone().addScaledVector(dir, t);
    this.bag = this.bag.filter((x) => x !== held);
    held.mesh.scale.setScalar(1);
    setShadow(held, true);
    held.mesh.position.set(MathUtils.clamp(p.x, -2.3, 2.3), 0, MathUtils.clamp(p.z, -2.3, 2.3));
    held.mesh.rotation.set(0, this.player.yaw + Math.PI / 2, 0);
    this.scene.add(held.mesh);
    this.worldProps.push(held);
    this.refreshBag();
    this.sfx.place();
  }

  private refreshBag(): void {
    for (const p of this.bag) { p.mesh.removeFromParent(); setShadow(p, false) }
    const held = this.bag[0];
    if (held) {
      const size = propSize(held.spec.id);
      const maxDim = Math.max(size.x, size.y, size.z);
      const s = MathUtils.clamp(0.17 / maxDim, 0.5, 1.4);
      held.mesh.scale.setScalar(s);
      held.mesh.position.set(0, -size.y * s * 0.5 + 0.02, 0);
      this.holder.add(held.mesh);
    }
    this.hud.setBag(this.bag, capacity(this.levels.backpack));
  }

  // ---------------------------------------------------------------- abilities

  private abilityInput(now: number): void {
    if (this.input.take('KeyQ')) this.doHighlight(now);
    if (this.input.take('KeyF')) this.doTidy(now);
    if (this.input.take('Space')) this.doMagnet(now);
    if (this.input.take('KeyR') && this.bag[0]) this.bag[0].mesh.rotation.y += Math.PI / 2;
    const sprinting = this.input.down('ShiftLeft') || this.input.down('ShiftRight');
    this.player.sprintMul = sprinting ? sprintMul(this.levels.sprint) : 1;
  }

  private doHighlight(now: number): void {
    const lvl = this.levels.highlight;
    if (lvl === 0) { this.hud.toast('Buy Highlight in the shop'); return }
    if (now < this.highlightCdEnd) { this.hud.toast(`Highlight ready in ${Math.ceil(this.highlightCdEnd - now)}s`); return }
    const cfg = highlightCfg(lvl);
    this.highlightEnd = now + cfg.dur;
    this.highlightCdEnd = now + cfg.cd;
    this.sfx.chime();
  }

  private doTidy(now: number): void {
    const lvl = this.levels.tidy;
    if (lvl === 0) { this.hud.toast('Buy Tidy in the shop'); return }
    if (now < this.tidyCdEnd) { this.hud.toast(`Tidy ready in ${Math.ceil(this.tidyCdEnd - now)}s`); return }
    if (this.bag.length === 0) { this.hud.toast('Nothing in the backpack'); return }
    let count = 0;
    for (const item of [...this.bag]) {
      const slot = lvl >= 3 ? this.findSlotFor(item) : this.validTargetSlot(item);
      if (!slot) continue;
      this.placeOnSlot(item, slot);
      count++;
    }
    if (count === 0) { this.hud.toast('No free matching shelf in reach'); this.sfx.reject(); return }
    this.tidyCdEnd = now + tidyCd(lvl);
    this.sfx.tidy();
  }

  private doMagnet(now: number): void {
    const lvl = this.levels.magnet;
    if (lvl === 0) { this.hud.toast('Buy Magnet in the shop'); return }
    if (now < this.magnetCdEnd) { this.hud.toast(`Magnet ready in ${Math.ceil(this.magnetCdEnd - now)}s`); return }
    const target = this.interact.hovered;
    if (!target) { this.hud.toast('Aim at an item first'); return }
    const range = magnetRange(lvl);
    if (target.mesh.position.distanceTo(this.player.eye()) > range) { this.hud.toast(`Out of range (${range}m)`); return }
    if (this.bag.length >= capacity(this.levels.backpack)) { this.hud.toast('Backpack full'); return }
    this.magnetCdEnd = now + magnetCd(lvl);
    this.sfx.chime();
    this.pickUp(target);
  }

  private validTargetSlot(item: Prop): Slot | null {
    const slot = this.interact.targetSlot;
    return slot && this.isValid(slot, item) ? slot : null;
  }

  private findSlotFor(item: Prop): Slot | null {
    let best: Slot | null = null;
    let bestD = Infinity;
    for (const shelf of this.shelves) {
      if (item.spec.cat !== shelf.filter) continue;
      for (const slot of shelf.slots) {
        if (slot.occupied) continue;
        const d = slot.pos.distanceToSquared(this.player.pos);
        if (d < bestD) { bestD = d; best = slot }
      }
    }
    return best;
  }

  private abilityLine(now: number): string[] {
    const out: string[] = [];
    const chip = (key: string, name: string, left: number) =>
      `<span class="ability ${left > 0 ? 'cool' : 'ready'}"><b>${key}</b> ${name}${left > 0 ? ` ${Math.ceil(left)}s` : ''}</span>`;
    if (this.levels.highlight > 0) out.push(chip('Q', 'Highlight', this.highlightCdEnd - now));
    if (this.levels.tidy > 0) out.push(chip('F', 'Tidy', this.tidyCdEnd - now));
    if (this.levels.magnet > 0) out.push(chip('Space', 'Magnet', this.magnetCdEnd - now));
    if (this.levels.sprint > 0) out.push(chip('Shift', 'Sprint', 0));
    return out;
  }

  private mult(): number {
    if (this.streak >= 10) return 3;
    if (this.streak >= 5) return 2;
    return 1;
  }

  private award(valid: boolean): void {
    if (!valid) { this.streak = 0; this.wrong += 1; this.sfx.reject(); return }
    this.streak += 1;
    const m = this.mult();
    this.money += m;
    this.placed += 1;
    this.sfx.place();
    if (this.streak % 5 === 0) this.sfx.chime();
    this.hud.toast(`+$${m}`);
  }

  // ---------------------------------------------------------------- flow

  private onLockChange(locked: boolean): void {
    if (this.phase !== 'shift') return;
    if (locked) { this.overlay.hide(); this.input.clearPressed(); return }
    this.overlay.show(pauseHtml());
    this.overlay.onClick('#resume', () => this.input.request());
  }

  private showTitle(): void {
    this.phase = 'title';
    this.hud.hide();
    this.overlay.show(titleHtml());
    this.overlay.onClick('#start', () => this.beginRun());
  }

  private beginRun(): void {
    this.sfx.init();
    this.money = 0;
    this.streak = 0;
    this.placed = 0;
    this.wrong = 0;
    this.levels = newLevels();
    this.applyLevels();
    this.runStart = performance.now();
    this.startShift(0);
  }

  private startShift(i: number): void {
    this.disposeWorld();
    const cfg = SHIFTS[i];
    if (!cfg) { this.showResults(); return }
    this.shift = i;
    this.shelves = cfg.filters.map((f, k) => buildShelf(PLANS[k] ?? PLANS[0], f, k));
    for (const s of this.shelves) this.scene.add(s.group);
    this.slots = this.shelves.flatMap((s) => s.slots);
    this.colliders = this.shelves.map((s) => s.aabb);

    const specs = pickSpecs(cfg.filters, cfg.items);
    const spots = scatterPositions(cfg.items, this.shelves);
    this.worldProps = specs.map((spec, k) => {
      const p = makeProp(spec);
      p.mesh.position.copy(spots[k] ?? new Vector3(0, 0, 0));
      p.mesh.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(p.mesh);
      return p;
    });

    this.bag = [];
    this.refreshBag();
    this.timeLeft = shiftSeconds(i);
    this.highlightEnd = 0;
    this.highlightCdEnd = 0;
    this.tidyCdEnd = 0;
    this.magnetCdEnd = 0;
    this.player.pos.set(0, 0, 1.6);
    this.player.vel.set(0, 0, 0);
    this.player.yaw = 0;
    this.player.pitch = -0.22;
    this.phase = 'shift';
    this.hud.show();
    this.hud.setMoney(this.money);
    this.hud.setStreak(0, 1);
    this.overlay.hide();
    this.input.clearPressed();
    this.input.request();
  }

  private endShift(): void {
    this.input.release();
    this.disposeWorld();
    this.hud.hide();
    if (this.shift < SHIFTS.length - 1) {
      this.phase = 'shop';
      this.shopLeft = shopSeconds();
      this.showShop();
    } else {
      this.showResults();
    }
  }

  private showShop(): void {
    this.overlay.show(shopHtml(this.levels, this.money, this.shopLeft));
    this.overlay.onBuy((id) => this.buy(id as AbilityId));
    this.overlay.onClick('#next-shift', () => this.nextShift());
  }

  private buy(id: AbilityId): void {
    const lvl = this.levels[id];
    if (lvl >= 3) return;
    const price = ABILITY_PRICES[lvl] ?? 0;
    if (this.money < price) { this.sfx.reject(); return }
    this.money -= price;
    this.levels[id] = lvl + 1;
    this.applyLevels();
    this.sfx.coin();
    this.showShop();
  }

  private applyLevels(): void {
    this.player.sprintMul = sprintMul(this.levels.sprint);
    this.refreshBag();
  }

  private nextShift(): void {
    if (this.phase !== 'shop') return;
    this.startShift(this.shift + 1);
  }

  private showResults(): void {
    this.phase = 'results';
    this.input.release();
    this.hud.hide();
    this.disposeWorld();
    const prevBest = Number(localStorage.getItem(BEST_KEY) ?? '0') || 0;
    localStorage.setItem(BEST_KEY, String(Math.max(prevBest, this.money)));
    const secs = Math.round((performance.now() - this.runStart) / 1000);
    const time = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    this.overlay.show(resultsHtml(this.money, prevBest, this.placed, this.wrong, time));
    this.overlay.onClick('#restart', () => this.beginRun());
  }

  /** Wipes the room. Called when a shift ends, so every shift starts on a clean floor and clean shelves. */
  private disposeWorld(): void {
    disposeShelves(this.shelves);
    for (const p of this.worldProps) p.mesh.removeFromParent();
    for (const p of this.bag) p.mesh.removeFromParent();
    this.worldProps = [];
    this.bag = [];
    this.slots = [];
    this.colliders = [];
  }

  // ---------------------------------------------------------------- debug hooks (tools/*.mjs)

  aimAt(target: Vector3): void {
    const eye = this.player.eye();
    const dx = target.x - eye.x;
    const dy = target.y - eye.y;
    const dz = target.z - eye.z;
    this.player.yaw = Math.atan2(-dx, -dz);
    this.player.pitch = Math.atan2(dy, Math.hypot(dx, dz));
    this.syncCamera();
  }

  private aimProp(p: Prop): string {
    const target = p.mesh.position.clone();
    target.y += propHeight(p.spec.id) * 0.35;
    const away = new Vector3(-target.x, 0, -target.z);
    if (away.lengthSq() < 0.01) away.set(0, 0, 1);
    away.normalize().multiplyScalar(1.05);
    this.player.pos.set(target.x + away.x, 0, target.z + away.z);
    this.player.settle(this.colliders);
    this.aimAt(target);
    return p.spec.id;
  }

  debugAimProp(): string | null {
    let best: Prop | null = null;
    let bd = Infinity;
    for (const p of this.worldProps) {
      if (p.slot) continue;
      const d = p.mesh.position.distanceToSquared(this.player.pos);
      if (d < bd) { bd = d; best = p }
    }
    return best ? this.aimProp(best) : null;
  }

  debugAimPropByCat(cat: Tag): string | null {
    const p = this.worldProps.find((x) => x.spec.cat === cat && !x.slot);
    return p ? this.aimProp(p) : null;
  }

  /** Aim at an item that is currently sitting on a shelf. */
  debugAimPlaced(): string | null {
    const p = this.worldProps.find((x) => x.slot !== null);
    return p ? this.aimProp(p) : null;
  }

  debugAimSlot(): boolean {
    const held = this.bag[0];
    if (!held) return false;
    let best: Slot | null = null;
    let bd = Infinity;
    for (const s of this.slots) {
      if (s.occupied || held.spec.cat !== s.shelf.filter) continue;
      const d = s.pos.distanceToSquared(this.player.pos);
      if (d < bd) { bd = d; best = s }
    }
    if (!best) return false;
    const sp = best.shelf.group.position;
    const away = new Vector3(-sp.x, 0, -sp.z).normalize().multiplyScalar(0.95);
    this.player.pos.set(sp.x + away.x, 0, sp.z + away.z);
    this.player.settle(this.colliders);
    this.aimAt(best.pos.clone().add(new Vector3(0, 0.18, 0)));
    return true;
  }

  debugEndShift(): void { this.timeLeft = 0.0001 }

  debugStand(x: number, z: number, lx: number, ly: number, lz: number): void {
    this.player.pos.set(x, 0, z);
    this.aimAt(new Vector3(lx, ly, lz));
  }

  debugMoney(n: number): void { this.money = n }

  debugState(): Record<string, unknown> {
    return {
      phase: this.phase, shift: this.shift, money: this.money, timeLeft: Math.round(this.timeLeft),
      bag: this.bag.map((p) => p.spec.id), props: this.worldProps.length, shelves: this.shelves.length,
      locked: this.input.locked, slots: this.slots.length,
      filled: this.slots.filter((s) => s.occupied).length, streak: this.streak,
      levels: { ...this.levels }, highlightActive: this.highlightEnd > 0,
      hover: this.interact.hovered?.spec.id ?? null, toast: this.hud.lastToast, dbg: this.dbg,
      target: this.interact.targetSlot?.id ?? null,
      pos: [Number(this.player.pos.x.toFixed(2)), Number(this.player.pos.z.toFixed(2))],
      yaw: Number(this.player.yaw.toFixed(2)), pitch: Number(this.player.pitch.toFixed(2)),
    };
  }

  private resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
