# Luminary: Echoes of the Forgotten Age

A monster-taming RPG for desktop — a spiritual successor to Pokémon set on the
fractured continent of Veranthis. Built with **Electron + Phaser 3**, fully
offline, with a checksum-validated save system that lives in the OS user-data
folder.

## Current build — v0.4 "The North Road"

Build-order steps 1–6 (opening pass) are complete:

- **North Road**: third map with 5 new wild species (Voltail, Mirewisp,
  Bristleboar, Pebblump, Zephyrkit) at Lv 4–7 — 17 species total
- **Trainer battles**: multi-mon parties, no capture/run, Shard rewards —
  starting with the **Lyra rival fight** (she counter-picks your starter)
- **Bram's shop**: spend Shards on Capture Orbs and Ember Tonics
- **Dex screen**: every known species — caught, seen, or ???

From v0.3:

- **Party menu** (pause → Party): HP bars, full summary pages, reordering
- **Items menu** (pause → Items): Ember Tonics heal party members
- **Battle commands**: Fight / Item / Switch / Capture / Run — switching does
  not spend the turn (the incoming Luminary acts), items do
- **Move learning**: leveled learnsets with a forget-a-move prompt at 4 moves
- **Evolutions**: all 6 first-stage evolutions defined with art and reachable
  (Embrath, Tidarune, Thorngrove, Spriggrove, Cindervole, Lumenmoth)
- **Bond**: grows from shared victories; signature moves unlock at Bond 8

And from earlier checkpoints:

- Electron shell + game window
- **Save system**: 3 named slots, SHA-256 checksums, 3 rolling round-robin
  backups per slot, corruption detection + backup restoration, screenshot
  thumbnails, playtime tracking
- Title screen (New Game / Load Game / Settings / Quit)
- New-game flow: name entry → starter selection (Embrik / Tidalink / Thornpaw) → slot pick
- Two connected maps — **Ashfen Town** (3 buildings, doors, 4 NPCs) and
  **Whispergrove** (tall grass, Save Shrine) — with warps, discovery banners,
  grid movement and collision
- **Dialogue system**: typewriter text honoring the Text Speed setting,
  speaker nameplates, first-time vs. repeat dialogue, story flags
  (`met_lyra`, `ceremony_complete`), auto-save after every conversation
- **Wild encounters & battles**: encounter tables in tall grass, turn-based
  battles (Fight / Capture / Run), type chart, STAB, crits, stat stages,
  EXP + level-ups, Capture Orbs with shake animation, party/Echo Vault
  routing, blackout recovery at the shrine
- 17 Luminary defined across starter, grove, and road lines
- Settings (music/SFX volume, text speed) persisted instantly

## Getting started

Requires Node.js 18+.

```bash
npm install     # if dependencies are not already installed
npm start       # launch the game
npm run save-smoke   # headless self-test of the save system (no window)
npm run engine-test  # headless battle/data tests (113 checks, no Electron)

# Automated gameplay test (two terminals):
npm run playtest-game   # terminal 1: launches the game with a CDP port
npm run playtest        # terminal 2: drives a full playthrough, 46 checks
```

## Controls

| Key | Action |
| --- | --- |
| WASD / Arrow keys | Move / navigate menus |
| Z or Enter | Confirm / interact |
| X or Esc | Cancel / pause menu |
| F12 | Toggle dev console |

## Save data

Saves are written via `electron-store` to the OS user-data directory — never
wiped by browser or OS cleanup:

- Windows: `%APPDATA%\luminary-game\luminary-saves.json`
- macOS: `~/Library/Application Support/luminary-game/luminary-saves.json`

Every save also writes one of three rolling backups (round-robin), so the
three most recent saves per slot are always recoverable.

**Testing corruption recovery:** quit the game, open `luminary-saves.json`,
change any value inside a slot's `data` block (or a character of its
`checksum`), then relaunch → Load Game. The slot shows **SAVE DAMAGED** and
pressing Z offers the intact backups to restore.

Note: progress persists at Save Shrines and when quitting through the pause
menu. Closing the window abruptly loses anything after the last save.

## Roadmap (build order)

1. ~~Electron shell + save system~~ ✅
2. ~~Title screen + new game flow~~ ✅
3. ~~Basic map rendering + player movement~~ ✅
4. ~~First town (Ashfen) fully walkable with NPCs~~ ✅
5. ~~Wild encounter system + battle engine~~ ✅ (incl. party/items menus, switch, move learning, evolutions, bond)
6. ~~First wave toward 30 Luminary~~ ✅ (North Road, 17 species, Lyra rival battle, shop, dex)
7. First dungeon + Warden battle ← **next**
8. Inventory + healing + capture system
9. Story Chapter 1 (dialogue system with choices)
10. Echo Vault (storage)
11. Remaining 7 regions
12. Remaining 150+ Luminary
13. Story Acts 2 & 3
14. Post-game content
15. Polish: animations, audio, UI refinement

## Resume / AI continuation

If you're picking this project up after a break, read these files **in order**:

1. **`AGENTS.md`** — quick resume instructions for coding assistants
2. **`docs/PROJECT_STATE.md`** — what's built, architecture, next steps
3. **`docs/DESIGN_SPEC.md`** — full game design reference

GitHub: https://github.com/shayanquce/Pokemon

## File structure

```
├── main.js              Electron main process + SaveManager (slots/backups/checksums)
├── preload.cjs          IPC bridge exposed as window.LuminaryNative
├── AGENTS.md            Resume instructions for AI / future you
├── package.json
├── docs/
│   ├── PROJECT_STATE.md Checkpoint + architecture
│   └── DESIGN_SPEC.md   Full game design spec
├── scripts/
│   ├── engine-test.mjs  Headless battle/data tests
│   ├── playtest-cdp.mjs Automated CDP playthrough test
│   └── screenshot-cdp.mjs Screenshot helper for the running game
└── src/
    ├── index.html
    ├── game.js          Phaser bootstrap
    ├── scenes/          TitleScene, NewGameScene, SettingsScene, WorldScene, BattleScene
    ├── data/            starters.js, maps.js, items.js, trainers.js
    └── systems/         SaveSystem, SaveSlotPanel, UiKit, PlaceholderArt,
                         DialogueBox, BattleEngine, PartyPanel, ShopPanel
```
