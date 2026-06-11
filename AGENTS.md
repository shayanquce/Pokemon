# AGENTS.md — Resume instructions for Luminary

**Read this file first** when continuing work on this project (Cursor, Claude, or any AI coding assistant).

## Project

**Luminary: Echoes of the Forgotten Age** — offline Electron desktop monster-taming RPG (Pokémon-like, deeper story/combat). Local folder may be named `Pokemon`; the npm package is `luminary-game`.

## Current checkpoint — v0.3 "Bonds & Bloom" (PAUSED)

**Build order steps 1–5 plus the party/bond/evolution systems pass are DONE.**
Do not rebuild them unless fixing bugs.

| Step | Status | Notes |
|------|--------|-------|
| 1. Electron + save system | ✅ | `main.js` SaveManager, 3 slots, SHA-256, rolling backups |
| 2. Title + new game flow | ✅ | Name, starter pick, slot pick |
| 3. Basic map + movement | ✅ | Map-driven `WorldScene` |
| 4. Ashfen town + NPCs | ✅ | 2 maps, warps, DialogueBox, 5 NPCs, story flags |
| 5. Encounters + battle | ✅ | Fight/Item/Switch/Capture/Run, exp, capture |
| 5b. Party & items menus, switch, learning, evolutions, bond | ✅ | PartyPanel/ItemsPanel, 6 evolved species, signature at Bond 8 |
| 6. First 30 Luminary + north road | ⏭️ **NEXT** | See "Next session" in `docs/PROJECT_STATE.md` |
| 7–15 | pending | First dungeon + Warden, dex UI, regions… |

## Exactly where we left off (2026-06-11, session 3)

The last session ended after the v0.3 systems pass was verified end-to-end
(save-smoke 6/6, `npm run engine-test` 78/78, live playtest 31/31). Resume by:

1. `npm run save-smoke` and `npm run engine-test` — all must PASS
2. Optional live verification: `npm run playtest-game` in one terminal, `npm run playtest` in another — 31 checks (uses and then deletes save slot_3)
3. Start on **step 6**: a `north_road` map (exit from Ashfen Town's east or a new north gate), 4–6 new wild Luminary lines with pixel maps in `starters.js`/`PlaceholderArt.js`, higher-level encounter table
4. Then the **Lyra rival battle** on that road (BattleScene with a `trainer` flag: no capture/run), then **Bram's shop** (shards sink), then a **Dex UI**

## Commands

```bash
npm install          # first clone only
npm run fix-electron # if electron.exe missing after install
npm start            # launch game
npm run save-smoke   # headless save tests (6 checks, must all PASS)
npm run engine-test  # headless battle/data tests (78 checks, no Electron)
npm run playtest-game  # terminal 1: game with CDP port 9223
npm run playtest       # terminal 2: automated playthrough (31 checks)
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
| `src/systems/DialogueBox.js` | Typewriter dialogue widget |
| `src/scenes/WorldScene.js` | Overworld — renders any entry in `src/data/maps.js` |
| `src/scenes/BattleScene.js` | 5-command battle UI + learn/evolve/bond flow |
| `src/data/maps.js` | Maps, exits, doors, NPCs + dialogue, encounter tables |
| `src/data/starters.js` | 12 species + move defs (schema for all 180+), leveled learnsets |
| `src/data/items.js` | Item definitions |
| `scripts/engine-test.mjs` | Headless engine tests (vm-based, no Electron) |
| `scripts/playtest-cdp.mjs` | Automated CDP playthrough test |
| `docs/PROJECT_STATE.md` | Full checkpoint + architecture |
| `docs/DESIGN_SPEC.md` | Original game design requirements |

## Save data location (NOT in repo)

- Windows: `%APPDATA%\luminary-game\luminary-saves.json`
- Settings: `%APPDATA%\luminary-game\luminary-settings.json`

## Story / design reference

Full creative spec (180+ Luminary, 8 regions, 8 chapters, battle rules) is in `docs/DESIGN_SPEC.md`. Starters: **Embrik** (Flame), **Tidalink** (Tide), **Thornpaw** (Verdant). Player default name: Kael. Rival **Lyra** is placed in Ashfen Town and her intro dialogue sets `storyFlags.met_lyra`.
