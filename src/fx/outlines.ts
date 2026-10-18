import { BackSide, BufferGeometry, Group, Mesh, MeshBasicMaterial, type Object3D } from 'three';

class Pool {
  private meshes: Mesh[] = [];
  private used = 0;
  constructor(private parent: Group, private mat: MeshBasicMaterial) {}

  begin(): void { this.used = 0 }

  add(geo: BufferGeometry, src: Object3D, scale = 1.055): void {
    let m = this.meshes[this.used];
    if (!m) {
      m = new Mesh(geo, this.mat);
      this.parent.add(m);
      this.meshes.push(m);
    }
    m.geometry = geo;
    m.position.copy(src.position);
    m.rotation.copy(src.rotation);
    m.scale.copy(src.scale).multiplyScalar(scale);
    m.visible = true;
    this.used++;
  }

  end(): void { for (let i = this.used; i < this.meshes.length; i++) this.meshes[i].visible = false }
}

/** Inverted-hull outlines, used for hover feedback and for the Highlight ability. */
export class Outlines {
  private group = new Group();
  private hoverPool: Pool;
  private glowPool: Pool;

  constructor(parent: Object3D) {
    parent.add(this.group);
    const hoverMat = new MeshBasicMaterial({ color: 0xfff3b0, side: BackSide, depthWrite: false });
    const glowMat = new MeshBasicMaterial({ color: 0x8fe3ff, side: BackSide, depthWrite: false });
    this.hoverPool = new Pool(this.group, hoverMat);
    this.glowPool = new Pool(this.group, glowMat);
  }

  /** Draw outlines for a set of meshes. Pass empty arrays to clear. */
  set(hover: Object3D[], glow: Object3D[]): void {
    this.hoverPool.begin();
    for (const m of hover) this.hoverPool.add((m as Mesh).geometry, m);
    this.hoverPool.end();
    this.glowPool.begin();
    for (const m of glow) this.glowPool.add((m as Mesh).geometry, m, 1.09);
    this.glowPool.end();
  }
}
