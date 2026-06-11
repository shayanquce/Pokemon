# Project State — v0.4 "The North Road" checkpoint (2026-06-11)

> Paused after the step-6 opening pass: North Road map, 5 new wild species,
> trainer battles (Lyra rival fight), Bram's shop, and the Dex screen.
> All automated tests pass: 6 save-smoke, 113 engine checks, 46 live CDP
> playtest checks.

## What runs today

Everything from v0.3 (party/items menus, battle switch/items, move learning,
evolutions, bond), plus:

- **North Road** (`north_road`): third map, east gate from Ashfen Town's main
  street. Tall-grass fields with a Lv 4–7 encounter table of 5 new species:
  Voltail (Volt), Mirewisp (Spirit), Bristleboar (Beast), Pebblump (Stone),
  Zephyrkit (Wind) — 17 species total now
- **Trainer battles**: `BattleScene` accepts `{ trainer, flag }` from
  `buildTrainer()` (src/data/trainers.js). Trainers field multi-mon parties
  sent in sequence, forbid Capture and Run, pay a Shard reward, and set a
  story flag on defeat. The blackout path shows the trainer's loseText
- **Lyra rival fight** (`lyra_road` NPC on the North Road): counter-picks the
  player's starter (embrik→tidalink→thornpaw→embrik) + Glimwing Lv 5; reward
  300 Shards, sets `rival1_won`. Until beaten she repeats her challenge; after,
  one-time aftermath dialogue (tracked via `npcStates.lyra_road.postWin`),
  then repeat lines. Town Lyra has `hiddenIfFlag: 'rival1_won'` and despawns
- **Bram's shop**: talking to Bram now ends in `ShopPanel` — Capture Orb 200,
  Ember Tonic 150 Shards; Z buys one, balance shown, auto-save on close
- **Dex screen** (pause menu → Dex): all species by dexNo in two columns —
  caught (gold + mini sprite), seen (parchment), or ??? (dim), with counters
- `Save.state.starterId` recorded at new game (old saves fall back to
  `dex.caught[0]`)
- NPC schema additions: `battle: { trainerId, flag }`, `shop: [{itemId,
  price}]`, `postWinDialogue`, `hiddenIfFlag`

## Verified tests (all passing at this commit)

```
npm run save-smoke     # 6 checks
npm run engine-test    # 113 checks — adds trainer counter-picks, shop stock
                       # refs, map row dimensions, exit-landing walkability
npm run playtest-game  # terminal 1: game with CDP port 9223
npm run playtest       # terminal 2: 46 live checks — v0.3 set plus north road
                       # warp, Lyra trainer battle (flag + 300-shard reward),
                       # town Lyra despawn, shop purchase, dex open/close
                       # (uses + deletes save slot_3)
node scripts/screenshot-cdp.mjs  # PNG of the running game (SCREENSHOT_SETUP env opt.)
```

Playtest scripting gotchas (already handled, don't regress):
- `waitFor` expressions must return JSON-serializable values — wrap in
  `Boolean(...)`; Phaser objects fail CDP `returnByValue`
- Only act on the 5-item battle command menu (submenus have fewer items);
  blind Z-press drains can buy from an open ShopPanel — poll for the panel
  instead of pressing a fixed count

## Architecture

```
Renderer (Phaser 3, sandboxed, classic scripts — load order in src/index.html)
  ├─ data/starters.js   LUMINARY_SPECIES (17), MOVES, makeLuminary
  ├─ data/maps.js       3 maps {rows, exits, doors, npcs, encounters}
  ├─ data/items.js      ITEMS
  ├─ data/trainers.js   TRAINERS + buildTrainer(id) (party built per save state)
  ├─ systems/BattleEngine.js  pure battle math (see v0.3 notes)
  ├─ systems/PartyPanel.js    PartyPanel + ItemsPanel overlays
  ├─ systems/ShopPanel.js     ShopPanel + DexPanel overlays
  ├─ systems/DialogueBox.js   typewriter dialogue widget
  ├─ scenes/WorldScene.js     maps, NPCs (battle/shop hooks), warps, pause menu
  │                           (Resume/Party/Items/Dex/Quit×2)
  ├─ scenes/BattleScene.js    wild + trainer battles, learn/evolve/bond flow
  └─ window.LuminaryNative  ← preload.cjs → main.js
```

### Save `data` fields

v0.3 fields plus `starterId`. Story flags in play: `chapter`,
`echo_awakened`, `met_lyra`, `ceremony_complete`, `rival1_won`.
`npcStates.<id>` = `{ talked, postWin? }`.

## Implemented Luminary (17 of 180+)

- 3 starter lines (2 stages each, third stage named but undefined)
- 3 Whispergrove wild lines (2 stages each)
- 5 North Road wilds, single-stage: Voltail #16, Mirewisp #17,
  Bristleboar #18, Pebblump #19, Zephyrkit #20

## Known issues / fixes applied

Everything from v0.3, plus the playtest gotchas listed above.

## Not built yet (do not assume exists)

- Evolutions for the 5 North Road wilds; second-stage evolutions (Embralion etc.)
- Status conditions, Echo Surge (Bond 10), bond from shrine rests
- Building interiors, more trainers besides Lyra, gym/Warden
- Echo Vault UI (capture with full party silently vaults)
- Audio, packaging, full 18×18 type chart
- Keldrath Coast (the road's east end is walled off pending the next region)

## Next session — plan (in priority order)

1. **First dungeon + Warden** (build order step 7): a cave/dungeon map off
   the North Road (e.g. `hollow_cave` via a new entrance tile), 2–3 trainer
   battles inside, Warden boss with the "Warden's Oath at 30% HP" rule from
   the design spec, badge/story flag
2. **Echo Vault UI** at the Save Shrine (deposit/withdraw between party and vault)
3. **Evolutions for North Road wilds** + a few more species toward 30
4. **Status conditions** (burn/sleep/etc. + Shattered/Echoed/Hollowed from spec)
5. Chapter 1 story beats: Elder Maren follow-up after `rival1_won`, Hollowed
   Chain teaser NPC

## Dependencies

- electron ^42.4.0, electron-store ^11.0.2, phaser ^3.90.0
- electron-builder ^26.15.2 (dev, not configured yet)
