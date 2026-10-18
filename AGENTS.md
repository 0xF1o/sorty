# Sorty — notes for the next session

First-person sorting game in the browser. Junk lies on the floor; read the shelf cards and put it away before the clock runs out. Cash between shifts buys abilities. ~12 minutes per run.
(`concept.md` and `PLAN.md` were removed on purpose — the durable decisions live here.)

## Commands

```bash
npm install
npm run dev -- --port 7317    # dev server (port 7317)
npm run check                 # typecheck: TypeScript 7 native Go compiler via tsc
npm run build                 # dist/, relative paths, itch.io ready (~148 KB gz)
```

Dev URL params: `?shift=20&shop=5` shorten the clocks for fast iteration.

## Stack rules

three.js + TypeScript + Vite. All UI is DOM/CSS (HUD, shop, screens, shelf cards projected to screen space).
No physics engine, no textures, no UVs, no imported models: props are generated at load from a small primitive grammar with vertex colours and one shared material. Keep files small and split by concern.

```
src/props/    primitive grammar + 26 item archetypes (id, tags, parts)
src/world/    room shell/lights, shelf units, slots, DOM cards
src/player/   controller, dual raycast interaction, ghost preview
src/ui/       HUD, overlay, screen templates
src/game/     game.ts orchestrates phases; abilities, shifts, spawn are data/pure
src/audio/    procedural WebAudio one-shots
tools/        Playwright harnesses: shot.mjs, playtest.mjs, flow.mjs
```

## Current state (v0.1)

Playable end to end: 3 shifts (18/24/30 items) -> 2 shops -> results, best-run score in `localStorage`.
8 hand-placed shelves (2 tall, need Jump), 6 slots each, 2 columns × 3 rows. 5 abilities × 3 tiers at $8/$18/$35.
Tags: metal, red, toys, food, small, tools, soft. A placement is legal if item tags intersect the shelf card.

Not done: pickup/place tweens, settings/mute, 40 archetypes, extra room layouts, touch/mobile, itch.io page, item look-alike audit.

## Next steps, in order

1. Playtest feedback -> tune reach (1.95 m), starting bag size (1), shift length (2:30), prices.
2. Carry/place tween + small FOV kick + card pulse.
3. Settings: sensitivity, volume, invert Y, mute.
4. More prop archetypes and a look-alike audit within each tag.
5. itch.io page.

## Gotchas

- **Two raycasts, on purpose.** `player/interact.ts` casts props and shelf slots separately. Never merge them: floor junk must not block placing onto the shelf behind it.
- **Pointer lock requests must come from a click handler.** Esc unlocks -> pause overlay; the shift clock only ticks while locked.
- **Camera matrices are one frame stale** inside the update loop (Raycaster reads `matrixWorld` from the last render). Harmless at 60 fps, but the harnesses must wait real animation frames, not wall-clock timeouts.
- **Always write source files as UTF-8 explicitly.** A cp1252 round-trip corrupts the bundle with "stream did not contain valid UTF-8". Keep string literals ASCII where possible.
- **`window.__game` / `window.__state`** are debug hooks the Playwright harnesses drive (`debugAimProp`, `debugAimSlot`, `debugStand`, `debugEndShift`). Keep them working.
- **Scaling:** everything is authored at real-world size then multiplied by `PROP_SCALE` in `props/part.ts`. Hand size, contact shadow, and reach checks derive from `propSize()`/`propHeight()`.
