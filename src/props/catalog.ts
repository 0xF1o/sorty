import { C } from '../palette';
import { P, type PropSpec } from './part';

/** 26 hand-authored archetypes. Every prop's origin is its base centre, so it stands on y=0. */
export const CATALOG: PropSpec[] = [
  { id: 'mug', name: 'Mug', tags: ['food'], parts: [
    P.cyl([0.052, 0.046, 0.10, 14], [0, 0.05, 0], C.cream),
    P.torus([0.032, 0.011], [0.058, 0.058, 0], C.cream),
  ]},
  { id: 'plate', name: 'Plate', tags: ['food', 'small'], parts: [
    P.cyl([0.095, 0.085, 0.018, 18], [0, 0.009, 0], C.white),
    P.cyl([0.062, 0.062, 0.022, 14], [0, 0.011, 0], C.cream),
  ]},
  { id: 'banana', name: 'Banana', tags: ['food'], parts: [
    P.sph(0.035, [-0.045, 0.032, 0], C.yellow),
    P.sph(0.038, [0, 0.042, 0], C.yellow),
    P.sph(0.034, [0.045, 0.032, 0], C.yellow),
    P.sph(0.012, [-0.082, 0.038, 0], C.brown, 6),
  ]},
  { id: 'can', name: 'Tin can', tags: ['metal', 'food'], parts: [
    P.cyl([0.036, 0.036, 0.11, 12], [0, 0.055, 0], C.metal),
    P.cyl([0.037, 0.037, 0.03, 12], [0, 0.055, 0], C.red),
    P.cyl([0.038, 0.038, 0.008, 12], [0, 0.112, 0], C.grey),
  ]},
  { id: 'bottle', name: 'Bottle', tags: ['food', 'small'], parts: [
    P.cyl([0.032, 0.042, 0.14, 10], [0, 0.07, 0], C.green),
    P.cyl([0.016, 0.03, 0.04, 8], [0, 0.16, 0], C.green),
    P.cyl([0.018, 0.018, 0.022, 8], [0, 0.19, 0], C.brown),
  ]},
  { id: 'cheese', name: 'Cheese', tags: ['food'], parts: [
    P.box([0.11, 0.055, 0.085], [0, 0.028, 0], C.yellow, [0, 22, 0]),
    P.sph(0.014, [0.02, 0.052, 0.01], C.orange, 6),
    P.sph(0.01, [-0.03, 0.048, -0.02], C.orange, 6),
  ]},
  { id: 'hammer', name: 'Hammer', tags: ['tools', 'metal'], parts: [
    P.box([0.028, 0.26, 0.028], [0, 0.13, 0], C.wood),
    P.box([0.15, 0.05, 0.048], [0, 0.255, 0], C.grey),
    P.box([0.03, 0.05, 0.048], [-0.078, 0.255, 0], C.metal),
  ]},
  { id: 'wrench', name: 'Wrench', tags: ['tools', 'metal'], parts: [
    P.box([0.035, 0.28, 0.022], [0, 0.14, 0], C.metal),
    P.box([0.09, 0.075, 0.026], [0, 0.29, 0], C.metal),
    P.box([0.024, 0.05, 0.028], [0, 0.325, 0], C.dark),
  ]},
  { id: 'screwdriver', name: 'Screwdriver', tags: ['tools', 'small'], parts: [
    P.cyl([0.021, 0.026, 0.09, 8], [0, 0.045, 0], C.red),
    P.cyl([0.007, 0.007, 0.13, 6], [0, 0.15, 0], C.metal),
  ]},
  { id: 'toolbox', name: 'Toolbox', tags: ['tools', 'metal'], parts: [
    P.box([0.3, 0.14, 0.17], [0, 0.07, 0], C.red),
    P.box([0.31, 0.03, 0.18], [0, 0.15, 0], C.dark),
    P.torus([0.045, 0.012], [0, 0.19, 0], C.grey),
  ]},
  { id: 'bolt', name: 'Bolt', tags: ['metal', 'small'], parts: [
    P.cyl([0.022, 0.022, 0.055, 6], [0, 0.025, 0], C.metal, [90, 0, 0]),
    P.cyl([0.038, 0.038, 0.022, 6], [0.035, 0.025, 0], C.grey, [90, 0, 0]),
  ]},
  { id: 'gear', name: 'Gear', tags: ['metal'], parts: [
    P.cyl([0.07, 0.07, 0.028, 9], [0, 0.014, 0], C.metal),
    P.cyl([0.022, 0.022, 0.036, 8], [0, 0.014, 0], C.dark),
    P.box([0.03, 0.03, 0.026], [0.075, 0.014, 0], C.metal),
    P.box([0.03, 0.03, 0.026], [-0.075, 0.014, 0], C.metal),
    P.box([0.026, 0.03, 0.03], [0, 0.014, 0.075], C.metal),
    P.box([0.026, 0.03, 0.03], [0, 0.014, -0.075], C.metal),
  ]},
  { id: 'pipe', name: 'Pipe', tags: ['metal', 'tools'], parts: [
    P.cyl([0.021, 0.021, 0.3, 8], [0, 0.022, 0], C.metal, [0, 0, 90]),
    P.cyl([0.021, 0.021, 0.09, 8], [0.15, 0.055, 0], C.metal),
    P.cyl([0.026, 0.026, 0.03, 8], [-0.15, 0.022, 0], C.grey, [0, 0, 90]),
  ]},
  { id: 'ball', name: 'Ball', tags: ['toys', 'red'], parts: [
    P.sph(0.072, [0, 0.072, 0], C.red, 12),
    P.torus([0.072, 0.008], [0, 0.072, 0], C.cream),
  ]},
  { id: 'teddy', name: 'Teddy', tags: ['toys', 'soft'], parts: [
    P.sph(0.072, [0, 0.075, 0], C.brown, 10),
    P.sph(0.058, [0, 0.165, 0], C.brown, 10),
    P.sph(0.023, [-0.045, 0.205, 0], C.brown, 7),
    P.sph(0.023, [0.045, 0.205, 0], C.brown, 7),
    P.sph(0.03, [0, 0.152, 0.05], C.cream, 7),
    P.sph(0.032, [-0.075, 0.09, 0], C.brown, 8),
    P.sph(0.032, [0.075, 0.09, 0], C.brown, 8),
  ]},
  { id: 'block', name: 'Block', tags: ['toys', 'small'], parts: [
    P.box([0.095, 0.095, 0.095], [0, 0.048, 0], C.blue),
    P.box([0.05, 0.05, 0.1], [0, 0.048, 0], C.cream),
  ]},
  { id: 'car', name: 'Toy car', tags: ['toys', 'red', 'small'], parts: [
    P.box([0.17, 0.06, 0.095], [0, 0.062, 0], C.red),
    P.box([0.085, 0.055, 0.088], [0, 0.115, 0], C.blue),
    P.cyl([0.03, 0.03, 0.022, 8], [0.05, 0.03, 0.05], C.dark, [90, 0, 0]),
    P.cyl([0.03, 0.03, 0.022, 8], [-0.05, 0.03, 0.05], C.dark, [90, 0, 0]),
    P.cyl([0.03, 0.03, 0.022, 8], [0.05, 0.03, -0.05], C.dark, [90, 0, 0]),
    P.cyl([0.03, 0.03, 0.022, 8], [-0.05, 0.03, -0.05], C.dark, [90, 0, 0]),
  ]},
  { id: 'dice', name: 'Dice', tags: ['toys', 'small'], parts: [
    P.box([0.07, 0.07, 0.07], [0, 0.035, 0], C.white),
    P.sph(0.009, [0.015, 0.072, 0.015], C.dark, 5),
    P.sph(0.009, [-0.015, 0.072, -0.015], C.dark, 5),
  ]},
  { id: 'rocket', name: 'Rocket', tags: ['toys', 'red'], parts: [
    P.cyl([0.028, 0.042, 0.17, 10], [0, 0.085, 0], C.red),
    P.cone(0.028, 0.06, [0, 0.2, 0], C.cream),
    P.box([0.075, 0.045, 0.012], [0, 0.035, 0], C.cream),
    P.box([0.012, 0.045, 0.075], [0, 0.035, 0], C.cream),
  ]},
  { id: 'pillow', name: 'Pillow', tags: ['soft'], parts: [
    P.box([0.28, 0.09, 0.21], [0, 0.046, 0], C.cream),
    P.box([0.29, 0.075, 0.1], [0, 0.046, 0], C.white),
  ]},
  { id: 'towel', name: 'Towel', tags: ['soft', 'red'], parts: [
    P.box([0.25, 0.055, 0.17], [0, 0.028, 0], C.red),
    P.box([0.252, 0.058, 0.04], [0, 0.028, 0.03], C.cream),
    P.box([0.252, 0.058, 0.025], [0, 0.028, -0.05], C.cream),
  ]},
  { id: 'sock', name: 'Sock', tags: ['soft', 'small'], parts: [
    P.box([0.07, 0.13, 0.065], [0, 0.065, 0], C.teal),
    P.box([0.07, 0.045, 0.13], [0, 0.023, 0.045], C.teal),
    P.box([0.072, 0.03, 0.067], [0, 0.115, 0], C.cream),
  ]},
  { id: 'scissors', name: 'Scissors', tags: ['tools', 'metal', 'small'], parts: [
    P.box([0.018, 0.17, 0.008], [0.012, 0.09, 0], C.metal, [0, 0, 8]),
    P.box([0.018, 0.17, 0.008], [-0.012, 0.09, 0], C.metal, [0, 0, -8]),
    P.torus([0.024, 0.008], [0.032, 0.022, 0], C.dark),
    P.torus([0.024, 0.008], [-0.032, 0.022, 0], C.dark),
  ]},
  { id: 'book', name: 'Book', tags: ['small'], parts: [
    P.box([0.17, 0.045, 0.24], [0, 0.023, 0], C.purple),
    P.box([0.15, 0.038, 0.22], [0.012, 0.023, 0], C.cream),
  ]},
  { id: 'apple', name: 'Apple', tags: ['food', 'red'], parts: [
    P.sph(0.062, [0, 0.062, 0], C.red, 10),
    P.cyl([0.008, 0.008, 0.05, 5], [0, 0.13, 0], C.brown),
    P.box([0.04, 0.008, 0.025], [0.022, 0.135, 0], C.green, [0, 20, 15]),
  ]},
  { id: 'carton', name: 'Carton', tags: ['small'], parts: [
    P.box([0.2, 0.16, 0.17], [0, 0.08, 0], C.wood),
    P.box([0.05, 0.012, 0.18], [0, 0.165, 0], C.cream),
  ]},
];
