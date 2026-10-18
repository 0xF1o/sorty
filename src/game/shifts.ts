import type { Tag } from '../palette';

export type ShiftCfg = { filters: Tag[]; items: number };

/**
 * One shelf per category, so a shift's shelf count equals its category count.
 * Difficulty comes from more categories, more items and less spare shelf space.
 */
export const SHIFTS: ShiftCfg[] = [
  { filters: ['food', 'toys', 'tools', 'soft', 'kitchen'], items: 20 },
  { filters: ['food', 'toys', 'tools', 'soft', 'kitchen', 'metal'], items: 28 },
  { filters: ['food', 'toys', 'tools', 'soft', 'kitchen', 'metal', 'paper'], items: 36 },
];
