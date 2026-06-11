# Project State — v0.1 checkpoint (2026-06-11)

> Paused after Phase 1. User verified save/load works.

## What runs today

- **Title screen:** New Game, Load Game (3 slots + thumbnails), Settings, Quit
- **New game:** name → starter (Embrik/Tidalink/Thornpaw) → slot → first save write
- **World:** `ashfen_grove` tile map, grid movement, collision, tall grass rustle FX
- **Save Shrine:** interact (Z), heal party, confirmation animation, manual save + thumbnail
- **Pause menu:** Resume, Quit to Title (auto-save), Quit Game (auto-save)
- **Settings:** music/SFX volume, text speed — persisted via electron-store
- **Load corrupted save:** slot shows SAVE DAMAGED → restore from rolling backup

## Verified tests

```
npm run save-smoke
# PASS — write + read round trip
# PASS — tampered save detected as corrupted
# PASS — intact backup offered after corruption
# PASS — backup restore succeeds
# PASS — rolling backups capped at 3
# PASS — round-robin keeps the newest saves
# RESULT: ALL PASS
```

Manual playtest: TitleScene → WorldScene → autosave on arrival → quit to title → load back in.

## Architecture

```
Renderer (Phaser 3, sandboxed)
  └─ window.LuminaryNative  ← preload.cjs
       └─ IPC → main.js
            ├─ SaveManager (electron-store: luminary-saves.json)
            └─ SettingsManager (luminary-settings.json)
```

### Save slot record shape

```js
{
  schemaVersion: 1,
  savedAt: timestamp,
  thumbnail: "data:image/jpeg;base64,...",
  meta: { playerName, playtimeSeconds, currentMap, leadName, leadLevel, chapter },
  data: { /* full game state */ },
  checksum: sha256(JSON.stringify(data))
}
```

Backups: `backups.{slotId}.{backup_1|backup_2|backup_3}` with round-robin cursor.

### Live save `data` fields (extend here for new features)

- `playerName`, `playtimeSeconds`, `currentMap`, `position` {x,y,facing}
- `party[]` — Luminary instances (speciesId, level, bond, stats, moves, hp, status, evs)
- `vault[]` — Echo Vault (max 300 later)
- `inventory`, `shards`, `storyFlags`, `npcStates`, `discoveredLocations`, `dex`

## Implemented Luminary (3 of 180+)

Defined in `src/data/starters.js` with `LUMINARY_SPECIES`, `MOVES`, `makeLuminary()`.

| Species | Type | Evolves |
|---------|------|---------|
| Embrik | Flame | Embrath Lv16 → Embralion Lv34 (Flame/Light) |
| Tidalink | Tide | Tidarune Lv14 → Runedeep Lv32 (Tide/Psyche) |
| Thornpaw | Verdant | Thorngrove Lv15 → Grovemaw Lv33 (Verdant/Stone) |

## Map data

`WorldScene.js` embeds `ASHFEN_GROVE` as ASCII tile rows (T=tree, W=water, S=shrine, G/g/F/P). Next: extract to `src/data/maps/` as Tiled JSON.

## Known issues / fixes applied

| Issue | Fix |
|-------|-----|
| `productName` with `:` crashed Electron on Windows | Renamed to `Luminary - Echoes of the Forgotten Age` |
| Electron binary incomplete after install | `npm run fix-electron` |
| Phaser 4 installed initially | Pinned to Phaser 3.90.0 |

## Not built yet (do not assume exists)

- BattleScene, DialogueScene, MenuScene (in spec file tree, not created)
- EncounterSystem, BattleEngine, CaptureSystem, BondSystem
- Wild encounters, capture orbs, inventory UI, Echo Vault UI
- NPCs, dialogue choices, story flags beyond `chapter: 1`
- Audio, final sprites, 7 remaining regions, 177+ Luminary
- electron-builder packaging config

## Next session — step 4 plan

1. Expand Ashfen into a proper town layout (buildings, paths, exit to route)
2. Add `DialogueScene.js` + simple NPC interaction (face NPC, press Z)
3. Place 3–5 NPCs with Chapter 1 teaser dialogue (Kael's bonding ceremony aftermath)
4. Auto-save after dialogue completion
5. Then step 5: grass encounters → `BattleScene` minimal turn-based loop

## Dependencies

- electron ^42.4.0
- electron-store ^11.0.2
- phaser ^3.90.0
- electron-builder ^26.15.2 (dev, not configured yet)
