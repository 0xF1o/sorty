import { BoxGeometry, Mesh, MeshBasicMaterial, Raycaster, Vector2, type Camera, type Scene } from 'three';
import type { Prop, Slot } from '../world/types';

const OK = 0x7dff9b;
const BAD = 0xff6b5e;

export class Interact {
  hovered: Prop | null = null;
  targetSlot: Slot | null = null;
  private raycaster = new Raycaster();
  private ghostMat = new MeshBasicMaterial({ color: OK, transparent: true, opacity: 0.45, depthWrite: false });
  private ghost: Mesh;
  private heldId = '';

  constructor(private camera: Camera, scene: Scene) {
    this.ghost = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), this.ghostMat);
    this.ghost.visible = false;
    this.ghost.renderOrder = 5;
    scene.add(this.ghost);
  }

  update(worldProps: Prop[], slots: Slot[], held: Prop | null, isValid: (slot: Slot) => boolean): void {
    this.raycaster.setFromCamera(new Vector2(0, 0), this.camera);

    // Two separate casts on purpose: an item sitting in a slot must still be pickable,
    // and floor junk must not block placing onto the shelf behind it.
    const propHit = this.raycaster.intersectObjects(worldProps.map((p) => p.mesh), false)[0];
    this.hovered = (propHit?.object.userData.prop as Prop | undefined) ?? null;
    const slotHit = this.raycaster.intersectObjects(slots.map((s) => s.pick), false)[0];
    this.targetSlot = (slotHit?.object.userData.slot as Slot | undefined) ?? null;

    if (!held || !this.targetSlot) { this.ghost.visible = false; return }
    const slot = this.targetSlot;
    if (this.heldId !== held.spec.id) { this.ghost.geometry = held.mesh.geometry; this.heldId = held.spec.id }
    this.ghost.position.copy(slot.pos);
    this.ghost.rotation.y = slot.shelf.group.rotation.y;
    this.ghost.scale.setScalar(1);
    this.ghostMat.color.setHex(isValid(slot) ? OK : BAD);
    this.ghost.visible = true;
  }

  hideGhost(): void { this.ghost.visible = false }
}
