export const ROOM = 5;
export const HALF = ROOM / 2;
export const WALL_H = 3;

export const EYE = 1.6;
export const PLAYER_R = 0.28;

export const WALK = 3.1;
export const REACH = 1.95;
export const REACH_UP = 0.45;

export const GRAVITY = 18;
export const JUMP_H = [0, 1.0, 1.2, 1.45];

export const SHIFT_SEC = [150, 150, 150];
export const SHOP_SEC = 45;

export const ABILITY_PRICES = [8, 18, 35];
export const MAX_DT = 0.05;

/** URL overrides for fast iteration: ?shift=20&shop=5 */
function param(name: string, fallback: number): number {
  const v = new URLSearchParams(location.search).get(name);
  const n = v === null ? NaN : Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
export const DEV = { shiftSec: param('shift', 0), shopSec: param('shop', 0) };
export const shiftSeconds = (i: number) => DEV.shiftSec || (SHIFT_SEC[i] ?? 150);
export const shopSeconds = () => DEV.shopSec || SHOP_SEC;
