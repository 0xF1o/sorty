import { MathUtils, Vector3 } from 'three';
import { EYE, GRAVITY, HALF, PLAYER_R, REACH, REACH_UP, WALK } from '../const';
import type { Input } from '../input';
import type { Aabb } from '../world/types';

export class Player {
  pos = new Vector3(0, 0, 1.5);
  vel = new Vector3();
  yaw = 0;
  pitch = 0;
  onGround = true;
  sprintMul = 1;
  private bobT = 0;
  private bobY = 0;

  eye(out = new Vector3()): Vector3 {
    return out.set(this.pos.x, this.pos.y + EYE + this.bobY, this.pos.z);
  }

  canReach(p: Vector3): boolean {
    const e = this.eye();
    if (p.y - e.y > REACH_UP) return false;
    const dx = p.x - e.x;
    const dz = p.z - e.z;
    return dx * dx + dz * dz <= REACH * REACH;
  }

  update(dt: number, input: Input, colliders: Aabb[], frozen: boolean): void {
    const m = input.takeMouse();
    if (input.locked && !frozen) {
      this.yaw -= m.dx * 0.0022;
      this.pitch = MathUtils.clamp(this.pitch - m.dy * 0.0022, -1.45, 1.45);
    }

    let fx = 0;
    let fz = 0;
    if (!frozen) {
      if (input.down('KeyW')) fz += 1;
      if (input.down('KeyS')) fz -= 1;
      if (input.down('KeyD')) fx += 1;
      if (input.down('KeyA')) fx -= 1;
    }
    const len = Math.hypot(fx, fz) || 1;
    fx /= len;
    fz /= len;

    const speed = WALK * this.sprintMul;
    const fwdX = -Math.sin(this.yaw);
    const fwdZ = -Math.cos(this.yaw);
    const rightX = Math.cos(this.yaw);
    const rightZ = -Math.sin(this.yaw);
    const wishX = (fwdX * fz + rightX * fx) * speed;
    const wishZ = (fwdZ * fz + rightZ * fx) * speed;
    const k = 1 - Math.exp(-14 * dt);
    this.vel.x += (wishX - this.vel.x) * k;
    this.vel.z += (wishZ - this.vel.z) * k;

    this.vel.y -= GRAVITY * dt;
    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;
    this.pos.y += this.vel.y * dt;

    if (this.pos.y <= 0) { this.pos.y = 0; this.vel.y = 0; this.onGround = true; }
    else { this.onGround = false; if (this.pos.y > 1.1) { this.pos.y = 1.1; this.vel.y = 0; } }

    this.collide(colliders);
    const lim = HALF - 0.06 - PLAYER_R;
    this.pos.x = MathUtils.clamp(this.pos.x, -lim, lim);
    this.pos.z = MathUtils.clamp(this.pos.z, -lim, lim);

    const moving = Math.hypot(this.vel.x, this.vel.z);
    this.bobT += dt * (moving > 0.4 ? 8 + moving : 0);
    this.bobY = this.onGround ? Math.sin(this.bobT) * 0.012 * Math.min(1, moving / 2) : 0;
  }

  /** Test hook: resolve collisions after a teleport so aim calculations are not stale. */
  settle(colliders: Aabb[]): void {
    this.collide(colliders);
    const lim = HALF - 0.06 - PLAYER_R;
    this.pos.x = MathUtils.clamp(this.pos.x, -lim, lim);
    this.pos.z = MathUtils.clamp(this.pos.z, -lim, lim);
  }

  private collide(colliders: Aabb[]): void {
    for (const c of colliders) {
      const nx = MathUtils.clamp(this.pos.x, c.minX, c.maxX);
      const nz = MathUtils.clamp(this.pos.z, c.minZ, c.maxZ);
      const dx = this.pos.x - nx;
      const dz = this.pos.z - nz;
      const d2 = dx * dx + dz * dz;
      if (d2 >= PLAYER_R * PLAYER_R) continue;
      if (d2 > 1e-6) {
        const d = Math.sqrt(d2);
        const push = (PLAYER_R - d) / d;
        this.pos.x += dx * push;
        this.pos.z += dz * push;
      } else {
        const toX = Math.min(this.pos.x - c.minX, c.maxX - this.pos.x);
        const toZ = Math.min(this.pos.z - c.minZ, c.maxZ - this.pos.z);
        if (toX < toZ) this.pos.x += (this.pos.x < c.cx ? -1 : 1) * (toX + PLAYER_R);
        else this.pos.z += (this.pos.z < c.cz ? -1 : 1) * (toZ + PLAYER_R);
      }
    }
  }
}
