# Sorty

A first-person sorting game. Junk is spread across the floor; every item has exactly one category and every shelf has exactly one card. Put it away before the shift ends; cash buys upgrades between shifts.

Working notes for the next session: [`AGENTS.md`](./AGENTS.md)

## Run it

```bash
npm install
npm run dev        # http://localhost:7317
npm run build      # static build in dist/ (relative paths, itch.io ready)
npm run check      # typecheck with the native TypeScript 7 compiler
```

## Controls

| Input | Action |
|---|---|
| WASD / mouse | walk / look (click the canvas to capture the mouse) |
| Left click | pick up the item under the crosshair |
| Right click | place the held item on the targeted shelf slot |
| R | rotate the held item |
| Q / F / Space | Highlight / Tidy / Magnet (once bought) |
| Shift | Sprint (once bought) |
| Esc | pause |

## Notes

- Three shifts per run (5 / 6 / 7 categories), about 12 minutes. Shelves are cleared between shifts.
- Goal for a run: as much cash as possible. Misfiling only costs your streak.
- Dev shortcuts: `?shift=20&shop=5` shortens the shift and shop clocks.

## Layout

```
src/props/     primitive-based prop generator, no textures, no imported models
src/world/     room, shelves, slots, DOM shelf cards
src/player/    first-person controller, raycast interaction
src/game/      run state, scoring, abilities, shop, shift flow
src/ui/        HUD, overlays
src/audio/     procedural WebAudio one-shots
tools/         Playwright screenshot + scripted playtest harnesses
```
