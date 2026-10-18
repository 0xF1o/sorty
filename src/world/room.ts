import { BoxGeometry, CircleGeometry, Group, HemisphereLight, Mesh, MeshBasicMaterial, MeshLambertMaterial, PointLight, DirectionalLight, Scene } from 'three';
import { HALF, ROOM, WALL_H } from '../const';

export function buildRoom(scene: Scene): Group {
  const room = new Group();
  const floorMat = new MeshLambertMaterial({ color: '#5a3f2b' });
  const wallMat = new MeshLambertMaterial({ color: '#b4a48b' });
  const ceilMat = new MeshLambertMaterial({ color: '#6a5f52', emissive: '#221d19' });

  const add = (w: number, h: number, d: number, x: number, y: number, z: number, mat: MeshLambertMaterial) => {
    const m = new Mesh(new BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    room.add(m);
    return m;
  };

  add(ROOM, 0.1, ROOM, 0, -0.05, 0, floorMat);
  add(ROOM, WALL_H, 0.1, 0, WALL_H / 2, -HALF - 0.05, wallMat);
  add(ROOM, WALL_H, 0.1, 0, WALL_H / 2, HALF + 0.05, wallMat);
  add(0.1, WALL_H, ROOM, -HALF - 0.05, WALL_H / 2, 0, wallMat);
  add(0.1, WALL_H, ROOM, HALF + 0.05, WALL_H / 2, 0, wallMat);
  add(ROOM, 0.1, ROOM, 0, WALL_H, 0, ceilMat);

  // baseboards
  const baseMat = new MeshLambertMaterial({ color: '#6b4f37' });
  add(ROOM, 0.09, 0.05, 0, 0.045, -HALF + 0.025, baseMat);
  add(ROOM, 0.09, 0.05, 0, 0.045, HALF - 0.025, baseMat);
  add(0.05, 0.09, ROOM, -HALF + 0.025, 0.045, 0, baseMat);
  add(0.05, 0.09, ROOM, HALF - 0.025, 0.045, 0, baseMat);

  // rug
  add(2.8, 0.02, 2.2, 0, 0.011, 0.15, new MeshLambertMaterial({ color: '#34443f' }));
  add(2.45, 0.014, 1.85, 0, 0.019, 0.15, new MeshLambertMaterial({ color: '#3d504a' }));

  // ceiling lamps (visual)
  const lampMat = new MeshBasicMaterial({ color: '#ffe9bf' });
  for (const lz of [-1.3, 1.3]) {
    const lamp = new Mesh(new BoxGeometry(0.9, 0.03, 0.32), lampMat);
    lamp.position.set(0, WALL_H - 0.02, lz);
    room.add(lamp);
    const halo = new Mesh(new CircleGeometry(0.6, 16), new MeshBasicMaterial({ color: '#3a3128', transparent: true, opacity: 0.35 }));
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, WALL_H - 0.03, lz);
    room.add(halo);
  }

  const hemi = new HemisphereLight(0xfff2de, 0x554433, 0.85);
  const key = new DirectionalLight(0xffe9cc, 1.15);
  key.position.set(2.5, 4.5, 2);
  const fillA = new PointLight(0xffdcb0, 9, 10, 1.5);
  fillA.position.set(-1.4, 2.65, -1.3);
  const fillB = new PointLight(0xffdcb0, 9, 10, 1.5);
  fillB.position.set(1.4, 2.65, 1.4);

  scene.add(room, hemi, key, fillA, fillB);
  scene.background = null;
  return room;
}
