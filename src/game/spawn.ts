import { Vector3 } from 'three';
import type { Tag } from '../palette';
import { CATALOG } from '../props/catalog';
import type { PropSpec } from '../props/part';
import type { Shelf } from '../world/types';

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

/** Jittered grid across the floor, skipping shelf footprints and the player's spawn. */
export function scatterPositions(count: number, shelves: Shelf[]): Vector3[] {
  const pts: Vector3[] = [];
  for (let ix = 0; ix < 8; ix++) {
    for (let iz = 0; iz < 8; iz++) {
      const x = -1.9 + ix * 0.545 + (Math.random() - 0.5) * 0.2;
      const z = -1.9 + iz * 0.545 + (Math.random() - 0.5) * 0.2;
      if (Math.hypot(x, z - 1.6) < 0.85) continue;
      let blocked = false;
      for (const s of shelves) {
        const a = s.aabb;
        if (x > a.minX - 0.3 && x < a.maxX + 0.3 && z > a.minZ - 0.3 && z < a.maxZ + 0.3) { blocked = true; break }
      }
      if (!blocked) pts.push(new Vector3(x, 0, z));
    }
  }
  shuffle(pts);
  const out: Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const base = pts[i % Math.max(1, pts.length)] ?? new Vector3(0, 0, 0);
    const p = base.clone();
    if (i >= pts.length) { p.x += (Math.random() - 0.5) * 0.45; p.z += (Math.random() - 0.5) * 0.45 }
    out.push(p);
  }
  return out;
}

/** Items that are guaranteed at least one home among this shift's shelf filters. */
export function pickSpecs(filters: Tag[], count: number): PropSpec[] {
  const pool = CATALOG.filter((s) => filters.includes(s.cat));
  const out: PropSpec[] = [];
  const seen = new Map<string, number>();
  let guard = 0;
  while (out.length < count && guard++ < 500) {
    const s = pool[Math.floor(Math.random() * pool.length)];
    if (!s) break;
    const n = seen.get(s.id) ?? 0;
    if (n >= 2) continue;
    seen.set(s.id, n + 1);
    out.push(s);
  }
  return out;
}
