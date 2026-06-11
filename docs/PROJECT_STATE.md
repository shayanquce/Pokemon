# Project State — v0.2 "Ashfen Stirs" checkpoint (2026-06-11)

> Paused after build-order steps 4 AND 5 (town/NPCs/dialogue + encounters/battles).
> All automated tests pass: 6 save-smoke checks, 25 headless engine checks,
> 22 live CDP playtest checks.

## What runs today

- **Title screen:** New Game, Load Game (3 slots + thumbnails), Settings, Quit
- **New game:** name → starter (Embrik/Tidalink/Thornpaw) → slot → first save write
- **Two connected maps** (`src/data/maps.js`):
  - `ashfen_grove` (Whispergrove): tall grass with wild encounters, Save Shrine, Old Tomas NPC, north exit to town
  - `ashfen_town` (Ashfen Town): 3 buildings with door flavor text, 4 NPCs (Elder Maren, Lyra, Bram, Finn), south exit to grove
- **Map transitions:** exit tiles warp between maps with fade + auto-save; first visit shows a "Discovered" banner and records `discoveredLocations`
- **Dialogue:** `DialogueBox` typewriter (honors Text Speed setting via `window.GameSettings` cache), speaker nameplates, first-time vs repeat lines, `{player}` substitution, story flags (`met_lyra`, `ceremony_complete`), `npcStates.<id>.talked` persisted, auto-save after each conversation
- **Wild encounters:** 14% per tall-grass step in the grove; weighted table (Sprigling 40 / Ashvole 35 / Glimwing 25, Lv 2–4)
- **BattleScene:** turn-based Fight/Capture/Run. Speed decides order, type chart + STAB + crits + 85–100% damage roll, support moves raise stat stages, PP consumed, Struggle when empty. EXP + multi-level-ups with HP-delta heal. Capture Orbs (inventory-consuming, shake animation, low HP/status improves odds), caught mon → party (<6) else Echo Vault, dex seen/caught updated. Run uses speed + attempt count. Faint auto-sends next healthy mon; full wipe = blackout → party healed, respawn at grove shrine
- **Save Shrine:** interact (Z), heal party, confirmation animation, manual save + thumbnail
- **Pause menu / Settings / corrupted-save restore:** unchanged from v0.1

## Verified tests (all passing at this commit)

```
npm run save-smoke        # 6 checks — save write/read/corruption/backups
node %TEMP%\engine-test.js  # (ad-hoc) 25 checks — type chart, damage, exp, capture, encounters
npm run playtest-game     # terminal 1: game with CDP port 9223
npm run playtest          # terminal 2: 22 live checks — new game, warp, dialogue,
                          # flags, door text, battle win, exp gain, capture flow,
                          # on-disk save assertions (uses + deletes slot_3)
```

The engine test is generated ad hoc (concat starters.js + maps.js + BattleEngine.js
with assertions); consider promoting it to `scripts/engine-test.mjs` next session.

## Architecture

```
Renderer (Phaser 3, sandboxed, classic scripts — load order in src/index.html)
  ├─ data/starters.js   LUMINARY_SPECIES (6), MOVES, makeLuminary, calcStats
  ├─ data/maps.js       MAPS {rows, exits, doors, npcs, encounters}, rollEncounter
  ├─ systems/BattleEngine.js  TYPE_CHART (partial), computeDamage, stageMultiplier,
  │                           applySupportEffect, expToNext/expReward/grantExp,
  │                           rollCapture, rollEscape  (pure math, no rendering)
  ├─ systems/DialogueBox.js   typewriter dialogue widget
  ├─ scenes/WorldScene.js     renders any MAPS entry; NPCs, warps, encounters
  ├─ scenes/BattleScene.js    turn loop UI; scene.start handoff both ways
  └─ window.LuminaryNative  ← preload.cjs → main.js (SaveManager/SettingsManager)
```

- Scene handoff: WorldScene → `scene.start('BattleScene', { wild })`;
  BattleScene → `scene.start('WorldScene', { battleResult })` (world rebuilds
  from `Save.state`, so position/map persist).
- `window.GameSettings` is a synchronous settings cache set in game.js and
  kept fresh by SettingsScene.

### Save `data` fields (extend here for new features)

- `playerName`, `playtimeSeconds`, `currentMap`, `position` {x,y,facing}
- `party[]` (≤6) / `vault[]` — Luminary instances (speciesId, level, exp, bond, stats, moves, hp, status, evs)
- `inventory` { capture_orb, ember_tonic }, `shards`
- `storyFlags` { chapter, echo_awakened, met_lyra?, ceremony_complete? }
- `npcStates` { <npcId>: { talked } }, `discoveredLocations[]`, `dex` {seen, caught}

## Implemented Luminary (6 of 180+)

| Species | Type | Role | Capture rate |
|---------|------|------|--------------|
| Embrik / Tidalink / Thornpaw | Flame / Tide / Verdant | starters | 45 |
| Sprigling | Verdant | grove wild, Lv 2–4 | 200 |
| Ashvole | Beast | grove wild, Lv 2–4 | 220 |
| Glimwing | Wind/Light | grove wild, Lv 3–4 | 190 |

Evolutions for the wilds (Spriggrove/Cindervole/Lumenmoth) are named but not defined.

## Known issues / fixes applied

| Issue | Fix |
|-------|-----|
| `productName` with `:` crashed Electron on Windows | Renamed to `Luminary - Echoes of the Forgotten Age` |
| Electron binary incomplete after install | `npm run fix-electron` |
| Phaser 4 installed initially | Pinned to Phaser 3.90.0 |
| `const` doesn't escape `eval` in node -e | engine tests run from a concatenated temp file |

## Not built yet (do not assume exists)

- Party menu (manual switching in battle), item use in battle, shop (Bram teases it)
- Building interiors (doors are flavor text only)
- BondSystem mechanics (bond is stored but never changes), signature-move unlocks, Echo Surge
- Status conditions in battle (slot exists, nothing applies them)
- Move learning on level-up / evolutions
- DialogueScene with choices (DialogueBox is linear), MenuScene, Echo Vault UI, dex UI
- Audio, final sprites, 7 remaining regions, 174+ Luminary
- electron-builder packaging config
- Full 18×18 type chart (current TYPE_CHART is a partial covering implemented types)

## Next session — step 6+ plan (in priority order)

1. **Party & inventory menu** (pause menu entries): view party HP/levels, reorder, use Ember Tonic outside battle
2. **In-battle party switch + item use** (switch keeps the turn per design spec)
3. **Move learning on level-up + first evolutions** (Sprigling Lv18 etc. — needs evolved species defined)
4. **Bond mechanics**: +bond on battle wins/shrine rests, signature move unlock at high bond
5. Then step 6 proper: grow the dex toward 30 (Keldrath Coast wilds) and step 7 (first dungeon + Warden)

## Dependencies

- electron ^42.4.0, electron-store ^11.0.2, phaser ^3.90.0
- electron-builder ^26.15.2 (dev, not configured yet)
