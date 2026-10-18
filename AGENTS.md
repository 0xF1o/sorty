# Sorty — notes for the next session

First-person sorting game in the browser. Junk lies on the floor; read the shelf cards and put it away before the clock runs out. Cash between shifts buys abilities. ~12 minutes per run.
(`concept.md` and `PLAN.md` were removed on purpose — the durable decisions live here.)

## Commands

```bash
npm install
npm run dev -- --port 7317    # dev server (port 7317)
npm run check                 # typecheck: TypeScript 7 native Go compiler via tsc
npm run build                 # dist/, relative paths, itch.io ready (~149 KB gz)
```

Dev URL params: `?shift=20&shop=5` shorten the clocks for fast iteration.

## Rules (v0.2, after tester feedback)

- **One category per item, one shelf per category.** Categories: `food, toys, tools, soft, kitchen, metal, paper`. A placement is legal only if the item's category equals the shelf card's.
- **Seven shelf positions**, all on the walls, three rows each (0.36 / 0.98 / 1.60 m). Every row is reachable — no tall cabinets, no ability needed. Six slots per shelf (2 columns × 3 rows).
- Three shifts: 5 / 6 / 7 categories, 20 / 28 / 36 items, 2:30 each, 45 s shop between them.
- The room is **wiped when a shift ends**, so the shop shows an empty floor and every shift starts clean.
- Items can be picked back **off a shelf** at any time; the slot frees up. Money is paid **once per item per shift** (`Prop.paid`), so shelf → hand → shelf cannot farm cash.
- Abilities: Backpack 1/2/4/6, Highlight, Tidy, Sprint, **Magnet** (replaced Jump — pulls a far item in, Space). $8 / $18 / $35.

## Stack rules

three.js + TypeScript + Vite. All UI is DOM/CSS (HUD, shop, screens, shelf cards projected to screen space).
No physics engine, no textures, no UVs, no imported models: props are generated at load from a small primitive grammar with vertex colours and one shared material. Keep files small and split by concern.

```
src/props/    primitive grammar + 44 item archetypes (id, name, cat, parts)
src/world/    room shell/lights, shelf units, slots, CELL + fitScale, DOM cards
src/player/   controller, dual raycast interaction, ghost preview
src/ui/       HUD, overlay, screen templates
src/game/     game.ts orchestrates phases; abilities, shifts, spawn are data/pure
src/audio/    procedural WebAudio one-shots
tools/        Playwright harnesses: shot, playtest, flow, shelfpickup, run, framecheck
```

## Not done yet

Pickup/place tweens; settings (sensitivity, volume, invert Y, mute); more room layouts; look-alike audit within a category; touch/mobile; itch.io page.

## Gotchas

- **Two raycasts in `player/interact.ts`, and this is load-bearing.** Props and shelf slots are cast separately. A single combined cast breaks in both directions: the invisible slot pick sits in front of a placed item (so you could never pick items off shelves — this was a real bug), and floor junk blocks placement onto the shelf behind it.
- **No coplanar faces in the shelf geometry.** Boards are inset (`BOARD_W`/`BOARD_D`) and the side panels stop 4 cm short of the top so no two faces share a plane — coincident, same-facing faces z-fight visibly at the joints. Look at `buildShelf` before changing any dimension.
- **The ability bar always lists all four keyed abilities.** Locked ones are dimmed, ready ones are green, cooling ones show seconds. Players learn the keys before buying.
- **Pointer lock requests must come from a click handler.** Esc unlocks → pause overlay; the shift clock only ticks while locked.
- **Camera matrices are one frame stale** inside the update loop (Raycaster reads `matrixWorld` from the last render). Harmless at 60 fps, but the harnesses must wait real animation frames, not wall-clock timeouts.
- **Always write source files as UTF-8 with `\n`.** A cp1252 round-trip once silently doubled every newline and corrupted the bundle; python `read_text()`/`write_text()` without `encoding=` on Windows is the trap.
- **Placed props must stay in `worldProps`** (they are pushed back in `placeOnSlot`). Anything removed from that array can no longer be raycast, hovered or picked up.
- **`window.__game` / `window.__state`** are debug hooks the harnesses drive (`debugAimProp`, `debugAimPlaced`, `debugAimSlot`, `debugStand`, `debugEndShift`). Keep them working.
- **Scaling:** props are authored at real-world size then multiplied by `PROP_SCALE` in `props/part.ts`. Hand size, contact shadow and slot fitting derive from `propSize()`/`propHeight()` and `CELL` in `world/shelf.ts`.
- **No frames, ever.** The game creates no iframes; Netlify injects some. `index.html` carries a `frame-src 'none'` CSP, `style.css` nukes `iframe/object/embed`, and `main.ts` removes injected ones with a MutationObserver. Verify with `node tools/framecheck.mjs`.
