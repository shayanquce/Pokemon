# AGENTS.md — Resume instructions for Luminary

**Read this file first** when continuing work on this project (Cursor, Claude, or any AI coding assistant).

## Project

**Luminary: Echoes of the Forgotten Age** — offline Electron desktop monster-taming RPG (Pokémon-like, deeper story/combat). Local folder may be named `Pokemon`; the npm package is `luminary-game`.

## Current checkpoint — v0.19 "The Third Sigil" (PAUSED)

**Build order steps 1–17 are DONE.** Do not rebuild them unless fixing bugs.

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
| 9a. Status conditions + Echo Surge (v0.8) | ✅ | burn/sleep/Shattered/Echoed/Hollowed, move `inflicts`, Bond-10 surge |
| 9b. Chapter 1 story beats (v0.9) | ✅ | Maren post-badge counsel (`conditionalDialogue`), Chain scout (`showIfFlag`), chapter → 2 |
| 10a. Lowlands wild evolutions (v0.10) | ✅ | 6 second stages (dex 27–32, 29 species), Storm Coil + Umbral Rend, rAF-throttling fix in main.js |
| 10b. Keldrath Cliffs route (v0.11) | ✅ | Chapter 2 route, evolved wild spawns, Lyra rematch (`lyra2`, rival2_won), Wayfarer Oren blocks the high pass |
| 11a. Healer + status-cure items (v0.12) | ✅ | Dockside Maeve (`healer: true`), Tide Tonic + Brine Salve (`cures`), world + battle cure flows |
| 11b. Chapter 2 beats + Mirewood opener (v0.13) | ✅ | Oren gate (pass_cleared), mirewood_marsh + mire tile, 4 species (dex 33–36), Chain stalker, sanctum rumor |
| 12. Deep eaves + drowned sanctum (v0.14) | ✅ | `mirewood_deep` dungeon, Keeper Ilse, Warden Mira (badge_mirewood), Chapter 3 seeds |
| 13. Mirewood town (v0.15) | ✅ | `mirewood_town` Reedlight Village: Tamsin (healer), Hobb shop + Lantern Dew, Elder Wren postBadge counsel, per-merchant shop titles, playtest-mode setTimeout loop |
| 14. Chapter 3 beats (v0.16) | ✅ | Awakened-door mechanic, Sanctum Doors (`A` tile) → `sanctum_inner` hall, Echo of Solen (eight doors, Cinderpeaks), Lyra in Reedlight, chapter → 3 |
| 15. Coast/Mirewood evolutions (v0.17) | ✅ | 9 second stages (dex 37–45, 42 species), 4 new moves, rare evolved spawns in both Mirewood maps |
| 16. Cinderpeaks opener (v0.18) | ✅ | Snow-Guide Bryn gate (echo_answered → peak_pass_granted), `cinderpeaks_ascent` w/ snow tiles `n`/`h`, Frost attack row, 4 species (dex 46–49), Chain Digger, Edda names Warden Korr |
| 17. Forge-hall + Warden Korr (v0.19) | ✅ | Edda gate (chain_digger_beaten → forge_road_cleared), `cinderpeaks_forge` w/ lava tile `l`, Cindralisk + Magma Lash, Lyra3 race-rematch, Korr's Oath → badge_cinderpeaks |
| 18–20 | ⏭️ **NEXT** | Third-stage starters, Chapter 3 closer (the Chain's offer), fourth region, audio… |

## Exactly where we left off (2026-06-12, session 6, v0.19)

Steps 1–17 are all complete. Most recent: **v0.19 "The Third Sigil"** —
**Edda is a gate NPC** (requires `chain_digger_beaten`, grants
`forge_road_cleared`, ascent north exit (14,0)); **`cinderpeaks_forge`**
dungeon with solid **`l` lava tile** + ember-mote ambient; **Cindralisk**
(Flame/Stone, dex 50, **47 species**, new move Magma Lash) as 10% forge
spawn and Korr's ace; **Lyra3** race-rematch (Lumenmoth 29 / Brinehound 29
/ counter-pick 31, `rival3_won`, 800 shards — postWin foreshadows the
Chain's "real offer"); optional **Acolyte Brann**; **Warden Korr**
(Emberhoof 30 / Cragmaw 31 / Cindralisk 33, Oath, 1200 shards,
`warden3_won` + `badge_cinderpeaks`, fourth-Warden hook). **CRITICAL
playtest pattern**: scripted trainer wins must be one-shot decisive — the
digger/lyra3/Mira/Korr test leads are **Lv 80 with Storm Coil (neutral) as
their only move**; Flame leads at 42/50 and a Lv 50 Storm Coil lead vs
lyra3 all observably lost or coin-flipped (sleep/Hollowed procs, 2x Brine
Jet, type resists). Playtest count is 167, or 163 when capture RNG misses.

Verified end-to-end: save-smoke 6/6, engine-test 361/361, playtest 167/167
(twice consecutively).

Resume by:

1. `npm run save-smoke` and `npm run engine-test` — all must PASS
2. Optional live verification: `npm run playtest-game` (terminal 1), `npm run playtest` (terminal 2) — 167 checks (uses/deletes slot_3)
3. Start on **third-stage starters** (Embralion Flame/Light 34, Runedeep Tide/Psyche 32, Grovemaw Verdant/Stone 33 — the curve is 30+ now)
4. Then the **Chapter 3 closer** (the Chain's "real offer" after badge_cinderpeaks), fourth region, audio

**Gotchas:** battle flavor text can vary via `pick()` but keep per-turn
message flow compatible with the playtest drain loops (they tolerate the
status-proc messages; verified twice). NPC collision uses `npc.x/npc.y`
(runtime copy), not `def.x/def.y` — gate NPCs move. The vault enforces ≥1
party member AND ≥1 conscious one. Statuses live on `mon.status =
{ id, turns }` (already in the save schema; shrine/blackout clear them).
Playtest trainer leads are tuned: Lv 20 (lyra1), 25 (warden/scout),
**38 (lyra2** — at 30 her evolved counter-pick made the win a coin flip;
that flake actually happened, don't lower these).
**If the game ever freezes mid-battle (busy=true, tweens never fire):** the
window was occluded and Chromium throttled rAF — main.js now sets
`backgroundThrottling: false` + `disable-renderer-backgrounding` +
`disable-background-timer-throttling` + `disable-features=
CalculateNativeWinOcclusion`; do NOT remove those switches.

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
npm run engine-test  # headless battle/data tests (262 checks, no Electron)
npm run playtest-game  # terminal 1: game with CDP port 9223
npm run playtest       # terminal 2: automated playthrough (116 checks)
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
| `src/data/maps.js` | 9 maps: exits, doors, NPCs (battle/shop/hiddenIfFlag/showIfFlag/gate/healer/conditionalDialogue), encounters |
| `src/data/starters.js` | 18 species + move defs (schema for all 180+), leveled learnsets |
| `src/data/items.js` | Item definitions |
| `src/data/trainers.js` | TRAINERS (lyra1/2, acolyte_vren/sila, warden_thane, chain_scout/stalker, sanctum_keeper, warden_mira) + buildTrainer |
| `scripts/engine-test.mjs` | Headless engine tests (vm-based, no Electron) |
| `scripts/playtest-cdp.mjs` | Automated CDP playthrough test |
| `docs/PROJECT_STATE.md` | Full checkpoint + architecture |
| `docs/DESIGN_SPEC.md` | Original game design requirements |

## Save data location (NOT in repo)

- Windows: `%APPDATA%\luminary-game\luminary-saves.json`
- Settings: `%APPDATA%\luminary-game\luminary-settings.json`

## Story / design reference

Full creative spec (180+ Luminary, 8 regions, 8 chapters, battle rules) is in `docs/DESIGN_SPEC.md`. Starters: **Embrik** (Flame), **Tidalink** (Tide), **Thornpaw** (Verdant). Player default name: Kael. Rival **Lyra** is placed in Ashfen Town and her intro dialogue sets `storyFlags.met_lyra`.
