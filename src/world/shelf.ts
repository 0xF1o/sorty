import { BoxGeometry, Group, Mesh, MeshBasicMaterial, MeshLambertMaterial, Vector3 } from 'three';
import { TAG_COLOR, TAG_LABEL, type Tag } from '../palette';
import type { Shelf, Slot } from './types';

export type ShelfPlan = { x: number; z: number; yaw: number };

const W = 1.2;
const D = 0.46;
const PANEL = 0.035;
const ROWS = [0.36, 0.98, 1.6];
const COL_X = [-0.28, 0.28];

/** Usable space per slot. Placed props are scaled down to fit this box. */
export const CELL = { w: 0.52, d: 0.42, h: 0.58 };

const wood = new MeshLambertMaterial({ color: '#c08f5c' });
const woodDark = new MeshLambertMaterial({ color: '#9a6d41' });
const pickMat = new MeshBasicMaterial({ visible: false });
const pickGeo = new BoxGeometry(0.5, 0.4, 0.42);

/**
 * Seven shelf positions, one per category. Every row is reachable from the floor:
 * no tall cabinets, nothing that needs an ability to reach.
 */
export const PLANS: ShelfPlan[] = [
  { x: 0, z: -2.25, yaw: 0 },
  { x: -1.35, z: -2.25, yaw: 0 },
  { x: 1.35, z: -2.25, yaw: 0 },
  { x: -2.25, z: -0.9, yaw: Math.PI / 2 },
  { x: 2.25, z: -0.9, yaw: -Math.PI / 2 },
  { x: -2.25, z: 0.9, yaw: Math.PI / 2 },
  { x: 2.25, z: 0.9, yaw: -Math.PI / 2 },
];

let nextSlotId = 0;

/** Largest uniform scale (<=1) at which a prop still fits a slot when rotated by `yaw`. */
export function fitScale(size: { x: number; y: number; z: number }, yaw: number): number {
  const c = Math.abs(Math.cos(yaw));
  const s = Math.abs(Math.sin(yaw));
  const w = size.x * c + size.z * s;
  const d = size.x * s + size.z * c;
  const fit = Math.min(
    w > 0 ? CELL.w / w : 1,
    d > 0 ? CELL.d / d : 1,
    size.y > 0 ? CELL.h / size.y : 1,
    1,
  );
  return Math.max(0.55, fit);
}

export function buildShelf(plan: ShelfPlan, filter: Tag, id: number): Shelf {
  const group = new Group();
  group.position.set(plan.x, 0, plan.z);
  group.rotation.y = plan.yaw;

  const height = ROWS[ROWS.length - 1] + 0.62;

  const add = (w: number, h: number, d: number, x: number, y: number, z: number, mat: MeshLambertMaterial) => {
    const m = new Mesh(new BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    group.add(m);
  };

  for (const y of ROWS) add(W, 0.04, D, 0, y - 0.02, 0, wood);
  add(PANEL, height, D, -(W / 2 - PANEL / 2), height / 2, 0, woodDark);
  add(PANEL, height, D, W / 2 - PANEL / 2, height / 2, 0, woodDark);
  add(W, height, 0.02, 0, height / 2, -(D / 2 - 0.01), woodDark);
  add(W, 0.04, D, 0, height, 0, wood);

  const cos = Math.cos(plan.yaw);
  const sin = Math.sin(plan.yaw);
  const toWorld = (lx: number, ly: number, lz: number) => new Vector3(plan.x + lx * cos + lz * sin, ly, plan.z - lx * sin + lz * cos);
  const sideways = Math.abs(sin) > 0.5;
  const halfX = (sideways ? D : W) / 2;
  const halfZ = (sideways ? W : D) / 2;

  const card = document.createElement('div');
  card.className = 'card';
  document.getElementById('cards')?.appendChild(card);

  const shelf = {
    id,
    filter,
    group,
    slots: [] as Slot[],
    card,
    anchor: toWorld(0, height + 0.1, 0),
    aabb: {
      cx: plan.x,
      cz: plan.z,
      halfX,
      halfZ,
      minX: plan.x - halfX,
      maxX: plan.x + halfX,
      minZ: plan.z - halfZ,
      maxZ: plan.z + halfZ,
    },
  } as Shelf;

  for (const ry of ROWS) {
    for (const cx of COL_X) {
      const pick = new Mesh(pickGeo, pickMat);
      pick.position.set(cx, ry + 0.18, 0.02);
      group.add(pick);
      const slot: Slot = { id: nextSlotId++, pos: toWorld(cx, ry, 0.02), occupied: null, pick, shelf };
      pick.userData.slot = slot;
      shelf.slots.push(slot);
    }
  }

  paintCard(shelf);
  return shelf;
}

export function paintCard(shelf: Shelf): void {
  const free = shelf.slots.filter((s) => !s.occupied).length;
  shelf.card.textContent = `${TAG_LABEL[shelf.filter]}  ${free}/${shelf.slots.length}`;
  shelf.card.style.borderColor = TAG_COLOR[shelf.filter];
  shelf.card.style.color = TAG_COLOR[shelf.filter];
}

export function disposeShelves(shelves: Shelf[]): void {
  for (const s of shelves) {
    s.group.removeFromParent();
    s.card.remove();
    for (const slot of s.slots) slot.occupied = null;
  }
  shelves.length = 0;
}
