import { BoxGeometry, Mesh, MeshBasicMaterial, Raycaster, Vector2, type Camera, type Scene } from 'three';
import type { Prop, Slot } from '../world/types';

const OK = 0x7dff9b;
const BAD = 0xff6b5e;

export class Interact {
  hovered: Prop | null = null;
  targetSlot: Slot | null = null;
  private raycaster = new Raycaster();
  private ghostMat = new MeshBasicMaterial({ color: OK, transparent: true, opacity: 0.45, depthWrite: false });
  private ghost: Mesh = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), this.ghostMat);
  private heldId = '';

  constructor(private camera: Camera, scene: Scene) {
    this.ghost.visible = false;
    this.ghost.renderOrder = 5;
    scene.add(this.ghost);
  }

  update(worldProps: Prop[], slots: Slot[], held: Prop | null, isValid: (slot: Slot) => boolean): void {
    this.raycaster.setFromCamera(new Vector2(0, 0), this.camera);
    const objects = worldProps.map((p) => p.mesh).concat(slots.map((s) => s.pick));
    const hits = this.raycaster.intersectObjects(objects, false);
    this.hovered = null;
    this.targetSlot = null;
    for (const hit of hits) {
      const prop = hit.object.userData.prop as Prop | undefined;
      if (prop) { this.hovered = prop; break; }
      const slot = hit.object.userData.slot as Slot | undefined;
      if (slot) { this.targetSlot = slot; break; }
    }

    if (!held || !this.targetSlot) { this.ghost.visible = false; return; }
    const slot = this.targetSlot;
    if (this.heldId !== held.spec.id) { this.ghost.geometry = held.mesh.geometry; this.heldId = held.spec.id; }
    this.ghost.position.copy(slot.pos);
    this.ghost.rotation.y = slot.shelf.group.rotation.y;
    this.ghost.scale.setScalar(1);
    const ok = isValid(slot);
    this.ghostMat.color.setHex(ok ? OK : BAD);
    this.ghost.visible = true;
  }

  hideGhost(): void { this.ghost.visible = false }
}
