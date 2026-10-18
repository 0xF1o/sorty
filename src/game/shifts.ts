import type { Tag } from '../palette';

export type ShiftCfg = { filters: Tag[]; items: number; midSwap: boolean };

export const SHIFTS: ShiftCfg[] = [
  { filters: ['food', 'metal', 'toys', 'small', 'tools'], items: 18, midSwap: false },
  { filters: ['food', 'metal', 'toys', 'small', 'tools', 'red', 'soft'], items: 24, midSwap: false },
  { filters: ['food', 'metal', 'toys', 'small', 'tools', 'red', 'soft', 'small'], items: 30, midSwap: true },
];
