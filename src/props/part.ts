import { BufferGeometry, Color, ConeGeometry, CylinderGeometry, Euler, Float32BufferAttribute, Matrix4, Quaternion, SphereGeometry, TorusGeometry, Vector3 } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Tag } from '../palette';

export type Vec3 = [number, number, number];

export type Part = {
  k: 'box' | 'cyl' | 'sph' | 'cone' | 'torus';
  c: string;
  s?: Vec3;
  p?: Vec3;
  r?: Vec3;
  a?: number[];
};

export type PropSpec = { id: string; name: string; cat: Tag; parts: Part[] };

const DEG = Math.PI / 180;
/** Everything authored at real-world size looked too small in first person. */
export const PROP_SCALE = 1.7;

const box = (s: Vec3, p: Vec3, c: string, r?: Vec3): Part => ({ k: 'box', s, p, c, r });
const cyl = (a: number[], p: Vec3, c: string, r?: Vec3): Part => ({ k: 'cyl', a, p, c, r });
const sph = (r: number, p: Vec3, c: string, seg = 10): Part => ({ k: 'sph', a: [r, seg], p, c });
const cone = (r: number, h: number, p: Vec3, c: string, seg = 10, rot?: Vec3): Part => ({ k: 'cone', a: [r, h, seg], p, c, r: rot });
const torus = (a: [number, number], p: Vec3, c: string, r?: Vec3): Part => ({ k: 'torus', a: [a[0], a[1], 6, 12], p, c, r });

export const P = { box, cyl, sph, cone, torus };

function geometryOf(part: Part): BufferGeometry {
  const a = part.a ?? [];
  switch (part.k) {
    case 'box': {
      const [x, y, z] = part.s ?? [0.1, 0.1, 0.1];
      return new RoundedBoxGeometry(x, y, z, 2, Math.min(0.018, Math.min(x, y, z) * 0.25));
    }
    case 'cyl':
      return new CylinderGeometry(a[0] ?? 0.05, a[1] ?? 0.05, a[2] ?? 0.1, a[3] ?? 14);
    case 'sph':
      return new SphereGeometry(a[0] ?? 0.05, a[1] ?? 10, a[1] ?? 8);
    case 'cone':
      return new ConeGeometry(a[0] ?? 0.05, a[1] ?? 0.1, a[2] ?? 10);
    case 'torus':
      return new TorusGeometry(a[0] ?? 0.05, a[1] ?? 0.01, a[2] ?? 6, a[3] ?? 12);
  }
}

/** Bake every part into one vertex-colored, non-indexed geometry. Origin sits at the prop's base centre. */
export function buildGeometry(parts: Part[]): BufferGeometry {
  const merged: BufferGeometry[] = [];
  for (const part of parts) {
    let g = geometryOf(part);
    const p = part.p ?? [0, 0, 0];
    const r = part.r ?? [0, 0, 0];
    const rot = new Quaternion().setFromEuler(new Euler(r[0] * DEG, r[1] * DEG, r[2] * DEG));
    g.applyMatrix4(new Matrix4().compose(new Vector3(p[0], p[1], p[2]), rot, new Vector3(1, 1, 1)));
    if (g.index) { const flat = g.toNonIndexed(); g.dispose(); g = flat; }
    for (const key of Object.keys(g.attributes)) if (key !== 'position' && key !== 'normal') g.deleteAttribute(key);
    const col = new Color(part.c);
    const count = g.attributes.position.count;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { arr[i * 3] = col.r; arr[i * 3 + 1] = col.g; arr[i * 3 + 2] = col.b; }
    g.setAttribute('color', new Float32BufferAttribute(arr, 3));
    merged.push(g);
  }
  const out = mergeGeometries(merged, false) as BufferGeometry;
  for (const g of merged) g.dispose();
  out.scale(PROP_SCALE, PROP_SCALE, PROP_SCALE);
  out.computeBoundingBox();
  out.computeVertexNormals();
  return out;
}
