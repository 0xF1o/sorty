export type AbilityId = 'backpack' | 'highlight' | 'tidy' | 'sprint' | 'magnet';

export const ABILITY_ORDER: AbilityId[] = ['backpack', 'highlight', 'tidy', 'sprint', 'magnet'];

export const ABILITY_INFO: Record<AbilityId, { name: string; key: string; tiers: string[] }> = {
  backpack: { name: 'Backpack', key: '', tiers: ['Carry 2 items.', 'Carry 4 items.', 'Carry 6 items.'] },
  highlight: { name: 'Highlight', key: 'Q', tiers: ['Matching items glow for 4s. 20s cooldown.', '6s, 12s cooldown.', 'Always faint glow; 8s strong pulse.'] },
  tidy: { name: 'Tidy', key: 'F', tiers: ['Place all carried items on the shelf you face. 30s cooldown.', 'Same, 20s cooldown.', 'Carried items fly to their shelf. 45s cooldown.'] },
  sprint: { name: 'Sprint', key: 'SHIFT', tiers: ['Hold Shift to run at x1.4.', 'x1.6.', 'x1.8.'] },
  magnet: { name: 'Magnet', key: 'SPACE', tiers: ['Pull the item you aim at into your bag from 3m. 25s cooldown.', '4.5m, 15s cooldown.', '7m, 8s cooldown.'] },
};

export type Levels = Record<AbilityId, number>;

export const newLevels = (): Levels => ({ backpack: 0, highlight: 0, tidy: 0, sprint: 0, magnet: 0 });

const at = (arr: number[], i: number, fallback: number): number => arr[i] ?? fallback;
const atc = (arr: { dur: number; cd: number }[], i: number): { dur: number; cd: number } => arr[i] ?? { dur: 0, cd: 0 };

export const capacity = (lvl: number): number => at([1, 2, 4, 6], lvl, 1);
export const sprintMul = (lvl: number): number => at([1, 1.4, 1.6, 1.8], lvl, 1);
export const magnetRange = (lvl: number): number => at([0, 3, 4.5, 7], lvl, 0);
export const magnetCd = (lvl: number): number => at([0, 25, 15, 8], lvl, 0);
export const highlightCfg = (lvl: number): { dur: number; cd: number } =>
  atc([{ dur: 0, cd: 0 }, { dur: 4, cd: 20 }, { dur: 6, cd: 12 }, { dur: 8, cd: 8 }], lvl);
export const tidyCd = (lvl: number): number => at([0, 30, 20, 45], lvl, 0);
