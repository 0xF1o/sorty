import { BufferGeometry, MeshLambertMaterial, Vector3 } from 'three';
import { CATALOG } from './catalog';
import { buildGeometry, type PropSpec } from './part';

export const PROP_MAT = new MeshLambertMaterial({ vertexColors: true, flatShading: true });

const specs = new Map<string, PropSpec>(CATALOG.map((s) => [s.id, s]));
const geos = new Map<string, BufferGeometry>();
const heights = new Map<string, number>();
const sizes = new Map<string, Vector3>();

export function specById(id: string): PropSpec {
  const s = specs.get(id);
  if (!s) throw new Error(`unknown prop: ${id}`);
  return s;
}

export function propGeometry(id: string): BufferGeometry {
  let g = geos.get(id);
  if (!g) {
    g = buildGeometry(specById(id).parts);
    const bb = g.boundingBox;
    heights.set(id, bb ? bb.max.y - bb.min.y : 0.2);
    sizes.set(id, bb ? bb.max.clone().sub(bb.min) : new Vector3(0.2, 0.2, 0.2));
    geos.set(id, g);
  }
  return g;
}

/** Bounding size of the built geometry. */
export function propSize(id: string): Vector3 {
  propGeometry(id);
  return sizes.get(id) ?? new Vector3(0.2, 0.2, 0.2);
}

/** Height of the built geometry, used to centre props in hand and on slots. */
export function propHeight(id: string): number {
  propGeometry(id);
  return heights.get(id) ?? 0.2;
}
