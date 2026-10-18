import type { Mesh, Object3D, Vector3 } from 'three';
import type { PropSpec } from '../props/part';
import type { Tag } from '../palette';

export type Prop = { spec: PropSpec; mesh: Mesh; slot: Slot | null };

export type Slot = {
  id: number;
  pos: Vector3;
  occupied: Prop | null;
  pick: Mesh;
  high: boolean;
  shelf: Shelf;
};

export type Shelf = {
  id: number;
  filter: Tag;
  group: Object3D;
  slots: Slot[];
  card: HTMLDivElement;
  anchor: Vector3;
  aabb: Aabb;
};

export type Aabb = { minX: number; maxX: number; minZ: number; maxZ: number; halfX: number; halfZ: number; cx: number; cz: number };
