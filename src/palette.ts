export type Tag = 'food' | 'toys' | 'tools' | 'soft' | 'kitchen' | 'metal' | 'paper';

/** Order matters: shift 1 uses the first five, shift 2 adds one, shift 3 all seven. */
export const TAGS: Tag[] = ['food', 'toys', 'tools', 'soft', 'kitchen', 'metal', 'paper'];

export const TAG_LABEL: Record<Tag, string> = {
  food: 'FOOD',
  toys: 'TOYS',
  tools: 'TOOLS',
  soft: 'SOFT THINGS',
  kitchen: 'KITCHEN',
  metal: 'METAL',
  paper: 'PAPER',
};

export const TAG_COLOR: Record<Tag, string> = {
  food: '#8fbf5a',
  toys: '#e0a63c',
  tools: '#b48bd6',
  soft: '#e08fae',
  kitchen: '#4fb3a8',
  metal: '#9fb6cc',
  paper: '#d8c9a3',
};

/** Flat low-poly palette. Keep it small; every prop uses 2-3 of these. */
export const C = {
  red: '#c9472f',
  orange: '#d9822b',
  yellow: '#e0b83f',
  green: '#5f9e4a',
  teal: '#3f8f8c',
  blue: '#3f6fa8',
  purple: '#7d5fa3',
  pink: '#c9798f',
  brown: '#7d5237',
  wood: '#a97b4e',
  cream: '#ddd2b8',
  white: '#ece9df',
  grey: '#8b9298',
  dark: '#33383b',
  metal: '#a8b3bd',
  gold: '#c9a54a',
} as const;
