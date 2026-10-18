import { BoxGeometry, Group, Mesh, MeshBasicMaterial, MeshLambertMaterial, Vector3 } from 'three';
import { TAG_COLOR, TAG_LABEL, type Tag } from '../palette';
import type { Shelf, Slot } from './types';

export type ShelfPlan = { x: number; z: number; yaw: number; tall: boolean };

const W = 1.2;
const D = 0.34;
const PANEL = 0.035;
const ROWS_SHORT = [0.36, 0.94, 1.52];
const ROWS_TALL = [0.36, 0.94, 1.52, 2.15];
const COL_X = [-0.28, 0.28];

const wood = new MeshLambertMaterial({ color: '#c08f5c' });
const woodDark = new MeshLambertMaterial({ color: '#9a6d41' });
const pickMat = new MeshBasicMaterial({ visible: false });
const pickGeo = new BoxGeometry(0.5, 0.34, 0.3);

/** Hand-placed shelf positions around the room walls. Order = the order they appear in as shifts grow. */
export const PLANS: ShelfPlan[] = [
  { x: 0, z: -2.31, yaw: 0, tall: false },
  { x: -1.35, z: -2.31, yaw: 0, tall: false },
  { x: 1.35, z: -2.31, yaw: 0, tall: false },
  { x: -2.31, z: -1.0, yaw: Math.PI / 2, tall: false },
  { x: 2.31, z: -1.0, yaw: -Math.PI / 2, tall: false },
  { x: -2.31, z: 1.0, yaw: Math.PI / 2, tall: false },
  { x: 2.31, z: 1.0, yaw: -Math.PI / 2, tall: true },
  { x: -1.35, z: 2.31, yaw: Math.PI, tall: true },
];

let nextSlotId = 0;

export function buildShelf(plan: ShelfPlan, filter: Tag, id: number): Shelf {
  const group = new Group();
  group.position.set(plan.x, 0, plan.z);
  group.rotation.y = plan.yaw;

  const rows = plan.tall ? ROWS_TALL : ROWS_SHORT;
  const height = rows[rows.length - 1] + 0.45;

  const add = (w: number, h: number, d: number, x: number, y: number, z: number, mat: MeshLambertMaterial) => {
    const m = new Mesh(new BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    group.add(m);
  };

  for (const y of rows) add(W, 0.04, D, 0, y - 0.02, 0, wood);
  add(PANEL, height, D, -(W / 2 - PANEL / 2), height / 2, 0, woodDark);
  add(PANEL, height, D, W / 2 - PANEL / 2, height / 2, 0, woodDark);
  add(W, height, 0.02, 0, height / 2, -(D / 2 - 0.01), woodDark);
  add(W, 0.04, D, 0, height, 0, wood);

  const cos = Math.cos(plan.yaw);
  const sin = Math.sin(plan.yaw);
  const toWorld = (lx: number, ly: number, lz: number) => new Vector3(plan.x + lx * cos + lz * sin, ly, plan.z - lx * sin + lz * cos);
  const sideways = Math.abs(sin) > 0.5;

  const card = document.createElement('div');
  card.className = 'card';
  document.getElementById('cards')?.appendChild(card);

  const shelf = {
    id,
    filter,
    group,
    slots: [] as Slot[],
    card,
    anchor: toWorld(0, height + 0.14, 0),
    aabb: {
      cx: plan.x,
      cz: plan.z,
      halfX: (sideways ? D : W) / 2,
      halfZ: (sideways ? W : D) / 2,
      minX: plan.x - (sideways ? D : W) / 2,
      maxX: plan.x + (sideways ? D : W) / 2,
      minZ: plan.z - (sideways ? W : D) / 2,
      maxZ: plan.z + (sideways ? W : D) / 2,
    },
  } as Shelf;

  for (const ry of rows) {
    for (const cx of COL_X) {
      const pick = new Mesh(pickGeo, pickMat);
      pick.position.set(cx, ry + 0.17, 0.02);
      group.add(pick);
      const slot: Slot = { id: nextSlotId++, pos: toWorld(cx, ry, 0.02), occupied: null, pick, high: ry > 1.9, shelf };
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

export function setFilter(shelf: Shelf, tag: Tag): void {
  shelf.filter = tag;
  paintCard(shelf);
}

export function disposeShelves(shelves: Shelf[]): void {
  for (const s of shelves) {
    s.group.removeFromParent();
    s.card.remove();
    for (const slot of s.slots) slot.occupied = null;
  }
  shelves.length = 0;
}
