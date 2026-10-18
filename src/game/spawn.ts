import { Vector3 } from 'three';
import type { Tag } from '../palette';
import { CATALOG } from '../props/catalog';
import type { PropSpec } from '../props/part';
import { SHELF_SLOTS } from '../world/shelf';
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

/**
 * Items for a shift. Hard rule: never spawn more items of a category than its shelf has slots,
 * otherwise the shift cannot be finished no matter how well the player plays.
 * Counts are spread round-robin, so a category with a small catalogue cannot hog the quota.
 */
export function pickSpecs(filters: Tag[], count: number): PropSpec[] {
  const pools = new Map<Tag, PropSpec[]>();
  for (const f of filters) pools.set(f, CATALOG.filter((s) => s.cat === f));

  // capacity by category = shelf slots, but never more than two copies of each archetype
  const caps = new Map<Tag, number>();
  for (const f of filters) caps.set(f, Math.min(SHELF_SLOTS, (pools.get(f)?.length ?? 0) * 2));

  const order = shuffle([...filters]);
  const counts = new Map<Tag, number>(filters.map((f) => [f, 0]));
  let total = 0;
  let guard = 0;
  while (total < count && guard++ < 2000) {
    for (const f of order) {
      if (total >= count) break;
      const cur = counts.get(f) ?? 0;
      if (cur >= (caps.get(f) ?? 0)) continue;
      counts.set(f, cur + 1);
      total++;
    }
  }

  const out: PropSpec[] = [];
  for (const f of filters) {
    const pool = shuffle([...(pools.get(f) ?? [])]);
    const need = counts.get(f) ?? 0;
    for (let k = 0; k < need; k++) {
      const spec = pool[k % pool.length];
      if (spec) out.push(spec);
    }
  }
  return shuffle(out);
}
