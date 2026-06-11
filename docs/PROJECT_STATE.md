# Project State — v0.3 "Bonds & Bloom" checkpoint (2026-06-11)

> Paused after the post-step-5 systems pass: party/items menus, in-battle
> switch + item use, leveled move learning, evolutions, bond mechanics.
> All automated tests pass: 6 save-smoke, 78 engine checks, 31 live CDP
> playtest checks.

## What runs today

Everything from v0.2 (two maps, NPCs/dialogue, encounters, battles, capture),
plus:

- **Pause menu → Party** (`PartyPanel`, mode 'manage'): list with HP bars,
  per-mon submenu — Summary (full stats/moves/bond/EXP page), Move Up
  (reorder; first slot = battle lead)
- **Pause menu → Items** (`ItemsPanel`): heal items with descriptions; pick
  item → pick target (`PartyPanel` mode 'select') → heal + auto-save
- **Battle commands are now Fight / Item / Switch / Capture / Run:**
  - *Item*: Ember Tonic on the active mon, consumes the turn (wild gets a free move)
  - *Switch*: pick a healthy party member; does **NOT** spend the turn
    (per design spec, the incoming Luminary acts) — stat stages reset
- **Leveled learnsets:** `learnset` entries are `{ id, level }`;
  `makeLuminary` gives the last 4 known at that level. Mid-level moves added
  (Flame Burst / Brine Jet / Thorn Volley at Lv 9, Pebble Toss Lv 7, etc.)
- **Move learning on level-up:** auto-learn with a free slot; at 4 moves a
  modal asks which move to forget (or Skip)
- **Evolutions:** Embrik→Embrath 16, Tidalink→Tidarune 14,
  Thornpaw→Thorngrove 15, Sprigling→Spriggrove 18, Ashvole→Cindervole 17,
  Glimwing→Lumenmoth 19 — all 6 evolved species defined with stats + pixel
  art. Evolution plays after battle EXP (flash + burst), heals by the max-HP
  delta, updates dex
- **Bond mechanics:** ~40% chance of +1 bond after each won battle (cap 10);
  at **Bond 8** the species' signature move auto-learns when a slot is free
- Battle info panel correctly re-points on switch/evolution (`setPanelMon` —
  also fixed a v0.2 bug where the name went stale after a faint switch-in)

## Verified tests (all passing at this commit)

```
npm run save-smoke     # 6 checks — save write/read/corruption/backups
npm run engine-test    # 78 checks — data integrity, learnsets, damage,
                       # evolution, bond, capture, encounters, items
npm run playtest-game  # terminal 1: game with CDP port 9223
npm run playtest       # terminal 2: 31 live checks — everything from v0.2
                       # plus party panel, tonic heal, capture-to-party,
                       # in-battle switch keeping the turn
                       # (uses + deletes save slot_3)
```

## Architecture

```
Renderer (Phaser 3, sandboxed, classic scripts — load order in src/index.html)
  ├─ data/starters.js   LUMINARY_SPECIES (12), MOVES, makeLuminary (leveled learnsets)
  ├─ data/maps.js       MAPS {rows, exits, doors, npcs, encounters}, rollEncounter
  ├─ data/items.js      ITEMS (capture_orb, ember_tonic)
  ├─ systems/BattleEngine.js  pure math: TYPE_CHART, computeDamage, stages,
  │                           exp/levels, movesLearnedAt/learnMove,
  │                           evolutionFor/evolve, gainBond (SIGNATURE_BOND=8),
  │                           rollCapture, rollEscape
  ├─ systems/PartyPanel.js    PartyPanel (manage/select) + ItemsPanel overlays
  ├─ systems/DialogueBox.js   typewriter dialogue widget
  ├─ scenes/WorldScene.js     any MAPS entry; NPCs, warps, encounters,
  │                           pause menu (Resume/Party/Items/Quit×2)
  ├─ scenes/BattleScene.js    5-command turn loop, learning/evolution/bond flow
  └─ window.LuminaryNative  ← preload.cjs → main.js (SaveManager/SettingsManager)
```

- Widgets never scene-switch: PartyPanel/ItemsPanel are overlays so battle
  state (wild HP, stat stages) survives opening them.
- `window.GameSettings` = synchronous settings cache (game.js + SettingsScene).

### Save `data` fields (extend here for new features)

- `playerName`, `playtimeSeconds`, `currentMap`, `position` {x,y,facing}
- `party[]` (≤6) / `vault[]` — Luminary instances (speciesId mutates on evolution)
- `inventory` { capture_orb, ember_tonic }, `shards`
- `storyFlags` { chapter, echo_awakened, met_lyra?, ceremony_complete? }
- `npcStates` { <npcId>: { talked } }, `discoveredLocations[]`, `dex` {seen, caught}

## Implemented Luminary (12 of 180+)

| Line | Levels |
|------|--------|
| Embrik → Embrath (Lv16) | → Embralion Lv34 (not defined) |
| Tidalink → Tidarune (Lv14) | → Runedeep Lv32 (not defined) |
| Thornpaw → Thorngrove (Lv15) | → Grovemaw Lv33 (not defined) |
| Sprigling → Spriggrove (Lv18) | wild, Whispergrove |
| Ashvole → Cindervole (Lv17, Beast/Flame) | wild, Whispergrove |
| Glimwing → Lumenmoth (Lv19, Wind/Light) | wild, Whispergrove |

## Known issues / fixes applied

| Issue | Fix |
|-------|-----|
| `productName` with `:` crashed Electron on Windows | renamed (no colon) |
| Electron binary incomplete after install | `npm run fix-electron` |
| Phaser 4 installed initially | pinned to Phaser 3.90.0 |
| `const` doesn't escape `eval`/vm context in node | engine-test appends a `globalThis[n] = eval(n)` shim line |
| Playtest drain-presses could open the 2-item move menu, then `menu.index=3` crashed | playtest only acts on the 5-item command menu, cancels submenus first |
| Battle info panel name stale after switch-in | `setPanelMon()` re-points all panel texts |

## Not built yet (do not assume exists)

- Shop (Bram teases it), shards have no sink yet
- Building interiors (doors are flavor text only)
- Echo Surge at Bond 10; bond never decreases; no bond from shrine rests
- Status conditions in battle (slot exists, nothing applies them)
- Choosing replacement when capturing with a full party (auto-vaults)
- Manual switch prompt on faint (auto-sends next healthy)
- DialogueScene with branching choices, dex UI, Echo Vault UI
- Audio, final sprites, 7 remaining regions, 168+ Luminary
- electron-builder packaging, full 18×18 type chart
- Second-stage evolutions (Embralion, Runedeep, Grovemaw)

## Next session — plan (in priority order)

1. **Step 6 — first 30 Luminary:** new route north of Ashfen Town
   (`north_road` map) with 4–6 new wild lines + higher-level encounters;
   grow LUMINARY_SPECIES toward 30 with pixel maps
2. **Trainer battles:** Lyra rival battle on the north road (trainer battles
   = no capture/run; reuse BattleScene with a `trainer` flag)
3. **Shop:** Bram's cart arrives — buy orbs/tonics with shards (shards sink)
4. **Dex UI** (pause menu → Dex): seen/caught grid from `Save.state.dex`
5. Then step 7: first dungeon + Warden battle

## Dependencies

- electron ^42.4.0, electron-store ^11.0.2, phaser ^3.90.0
- electron-builder ^26.15.2 (dev, not configured yet)
