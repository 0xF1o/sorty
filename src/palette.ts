export type Tag = 'metal' | 'red' | 'toys' | 'food' | 'small' | 'tools' | 'soft';

export const TAGS: Tag[] = ['food', 'metal', 'toys', 'small', 'tools', 'red', 'soft'];

export const TAG_LABEL: Record<Tag, string> = {
  metal: 'METAL',
  red: 'RED THINGS',
  toys: 'TOYS',
  food: 'FOOD',
  small: 'SMALL',
  tools: 'TOOLS',
  soft: 'SOFT',
};

export const TAG_COLOR: Record<Tag, string> = {
  metal: '#9fb6cc',
  red: '#e2604c',
  toys: '#e0a63c',
  food: '#8fbf5a',
  small: '#7aa7d8',
  tools: '#b48bd6',
  soft: '#e08fae',
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
