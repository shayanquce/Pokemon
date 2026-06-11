# AGENTS.md — Resume instructions for Luminary

**Read this file first** when continuing work on this project (Cursor, Claude, or any AI coding assistant).

## Project

**Luminary: Echoes of the Forgotten Age** — offline Electron desktop monster-taming RPG (Pokémon-like, deeper story/combat). Local folder may be named `Pokemon`; the npm package is `luminary-game`.

## Current checkpoint — v0.7 "The Coast Road" (PAUSED)

**Build order steps 1–8 are DONE, plus a full graphics/feel overhaul.**
Do not rebuild them unless fixing bugs.

| Step | Status | Notes |
|------|--------|-------|
| 1. Electron + save system | ✅ | `main.js` SaveManager, 3 slots, SHA-256, rolling backups |
| 2. Title + new game flow | ✅ | Name, starter pick, slot pick (`starterId` saved) |
| 3. Basic map + movement | ✅ | Map-driven `WorldScene` |
| 4. Ashfen town + NPCs | ✅ | Warps, DialogueBox, story flags |
| 5. Encounters + battle | ✅ | Fight/Item/Switch/Capture/Run, learning, evolutions, bond |
| 6. North Road + species + rival + shop + dex | ✅ | Trainer battles, ShopPanel, DexPanel |
| 7. First dungeon + Warden | ✅ | Hollow Cave, 2 acolytes, Warden Thane, Warden's Oath, badge |
| 7.5 Graphics & feel overhaul (v0.6) | ✅ | Hi-res walk-cycle chars, EPX+shaded Luminary, smooth chained movement, ambient life, battle anims, flavor text |
| 8. Echo Vault UI + Keldrath opener (v0.7) | ✅ | VaultPanel at shrines, keldrath_gate + gate-NPC mechanic, keldrath_town, 5 coast species (23 total) |
| 9. Status conditions + Chapter 1 beats | ⏭️ **NEXT** | See "Next session" in `docs/PROJECT_STATE.md` |
| 10–15 | pending | Wild evolutions, cliff road, regions, story acts… |

## Exactly where we left off (2026-06-11, session 4, v0.7)

This session shipped **v0.6** (presentation overhaul: hi-res walk-cycle
characters, EPX+shaded Luminary sprites — all `lum_` call sites display at
HALF their old scale, keep that for new UI — tap-to-turn chained movement,
ambient life, battle animations, flavor text via `pick()`) and **v0.7**
(step 8: Echo Vault UI + Keldrath Coast opener — shrine menu, VaultPanel,
`keldrath_gate`/`keldrath_town` maps, sand tile `s`, data-driven gate-NPC
mechanic, 5 new coast species, dex 22–26). Verified end-to-end:
save-smoke 6/6, engine-test 162/162, live playtest 74/74.

Resume by:

1. `npm run save-smoke` and `npm run engine-test` — all must PASS
2. Optional live verification: `npm run playtest-game` in one terminal, `npm run playtest` in another — 74 checks (uses and then deletes save slot_3)
3. Start on **status conditions** (burn/sleep + spec's Shattered/Echoed/Hollowed) in `BattleEngine.js` + `BattleScene.js`, then Echo Surge at Bond 10
4. Then **Chapter 1 story beats**: Elder Maren post-badge dialogue, first Hollowed Chain scout encounter on the coast (hooks off `heard_chain_rumor`)
5. Then wild evolutions (road/cave/coast) and the `keldrath_cliffs` route north (Lyra rematch on the way)

**v0.7 gotchas:** battle messages must keep their per-turn COUNT (vary text
with `pick()`, never add `say()` calls — the playtest drains a fixed number).
NPC collision uses `npc.x/npc.y` (runtime copy), not `def.x/def.y` — gate
NPCs move. The vault enforces ≥1 party member AND ≥1 conscious one.

**Playtest scripting gotchas** (see PROJECT_STATE.md "Verified tests"): wrap
waitFor expressions in `Boolean(...)` (Phaser objects break CDP serialization);
never blind-press Z while a ShopPanel might be open (it buys); trainer fights
are losable — keep the test leads at Lv 20/25 or wins are nondeterministic.
`keyboard.emit('keydown-X')` does NOT set isDown — use `scripts/cdp-press.mjs`
to test held movement with real key events.

## Commands

```bash
npm install          # first clone only
npm run fix-electron # if electron.exe missing after install
npm start            # launch game
npm run save-smoke   # headless save tests (6 checks, must all PASS)
npm run engine-test  # headless battle/data tests (120 checks, no Electron)
npm run playtest-game  # terminal 1: game with CDP port 9223
npm run playtest       # terminal 2: automated playthrough (59 checks)
node scripts/screenshot-cdp.mjs  # PNG of the running game → %TEMP%/luminary-shot.png
node scripts/cdp-eval.mjs "expr"          # eval JS in the running game
node scripts/cdp-press.mjs ArrowDown 700  # hold a real key (tests held movement)
node scripts/dump-texture.mjs lum_embrik 6  # generated texture → upscaled PNG
```

## Critical conventions

1. **Save system first** — any new gameplay state must be added to the save schema in `SaveSystem.js` (`newGame`) and validated in `main.js` (`isShapedLikeASave`). Auto-save after: battle end, item pickup, map transition, dialogue completion, capture. (All of these are wired except item pickup — no items exist in the world yet.)
2. **No internet at runtime** — no external APIs.
3. **Stack:** Electron + Phaser 3 (not 4) + electron-store + classic script tags (no bundler). New files must be added to `src/index.html` in dependency order.
4. **Windows productName:** must NOT contain `:` — crashes Electron userData path.
5. **IPC:** renderer uses `window.LuminaryNative` from `preload.cjs` only — never enable `nodeIntegration`.
6. **UI:** dark fantasy — navy/slate bg, gold accents. Keyboard: arrows/WASD, Z/Enter confirm, X/Esc cancel.
7. **Scene handoff:** WorldScene ↔ BattleScene via `scene.start` both ways; world position/map always live in `Save.state`, so rebuilding WorldScene is safe.
8. **Settings:** read synchronously from `window.GameSettings` (cached in `game.js`, kept fresh by SettingsScene).
9. **Do not commit** `node_modules/`, `.electron-cache/`, or player save files.

## Key files

| File | Role |
|------|------|
| `main.js` | Electron main, SaveManager, SettingsManager, IPC, `--save-smoke` |
| `preload.cjs` | `window.LuminaryNative` bridge |
| `src/systems/SaveSystem.js` | Live game state + auto-save |
| `src/systems/BattleEngine.js` | Pure battle math: type chart, damage, exp, learning, evolution, bond, capture |
| `src/systems/PartyPanel.js` | PartyPanel (manage/select) + ItemsPanel overlay widgets |
| `src/systems/VaultPanel.js` | Echo Vault deposit/withdraw overlay (shrine menu) |
| `src/systems/ShopPanel.js` | ShopPanel + DexPanel overlay widgets |
| `src/systems/DialogueBox.js` | Typewriter dialogue widget |
| `src/scenes/WorldScene.js` | Overworld — maps, NPC battle/shop hooks, pause menu |
| `src/scenes/BattleScene.js` | Wild + trainer battles, learn/evolve/bond flow |
| `src/data/maps.js` | 4 maps: exits, doors, NPCs (battle/shop/hiddenIfFlag), encounters |
| `src/data/starters.js` | 18 species + move defs (schema for all 180+), leveled learnsets |
| `src/data/items.js` | Item definitions |
| `src/data/trainers.js` | TRAINERS + buildTrainer (Lyra counter-pick, Warden's Oath/setFlags) |
| `scripts/engine-test.mjs` | Headless engine tests (vm-based, no Electron) |
| `scripts/playtest-cdp.mjs` | Automated CDP playthrough test |
| `docs/PROJECT_STATE.md` | Full checkpoint + architecture |
| `docs/DESIGN_SPEC.md` | Original game design requirements |

## Save data location (NOT in repo)

- Windows: `%APPDATA%\luminary-game\luminary-saves.json`
- Settings: `%APPDATA%\luminary-game\luminary-settings.json`

## Story / design reference

Full creative spec (180+ Luminary, 8 regions, 8 chapters, battle rules) is in `docs/DESIGN_SPEC.md`. Starters: **Embrik** (Flame), **Tidalink** (Tide), **Thornpaw** (Verdant). Player default name: Kael. Rival **Lyra** is placed in Ashfen Town and her intro dialogue sets `storyFlags.met_lyra`.
