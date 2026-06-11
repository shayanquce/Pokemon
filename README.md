# Luminary: Echoes of the Forgotten Age

A monster-taming RPG for desktop — a spiritual successor to Pokémon set on the
fractured continent of Veranthis. Built with **Electron + Phaser 3**, fully
offline, with a checksum-validated save system that lives in the OS user-data
folder.

## Current build — v0.2 "Ashfen Stirs"

Build-order steps 1–5 are complete:

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
- 6 Luminary defined: 3 starters + 3 wilds (Sprigling, Ashvole, Glimwing)
- Settings (music/SFX volume, text speed) persisted instantly

## Getting started

Requires Node.js 18+.

```bash
npm install     # if dependencies are not already installed
npm start       # launch the game
npm run save-smoke   # headless self-test of the save system (no window)

# Automated gameplay test (two terminals):
npm run playtest-game   # terminal 1: launches the game with a CDP port
npm run playtest        # terminal 2: drives a full playthrough, 22 checks
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
5. ~~Wild encounter system + battle engine~~ ✅ (Fight/Capture/Run; party menu & items next)
6. First 30 Luminary
7. First dungeon + Warden battle
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
│   └── playtest-cdp.mjs Automated CDP playthrough test
└── src/
    ├── index.html
    ├── game.js          Phaser bootstrap
    ├── scenes/          TitleScene, NewGameScene, SettingsScene, WorldScene, BattleScene
    ├── data/            starters.js (species + moves), maps.js (maps/NPCs/encounters)
    └── systems/         SaveSystem, SaveSlotPanel, UiKit, PlaceholderArt,
                         DialogueBox, BattleEngine
```
