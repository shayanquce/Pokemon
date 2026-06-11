# Project State — v0.5 "The Warden's Oath" checkpoint (2026-06-11)

> Paused after build-order step 7: Hollow Cave dungeon, cave trainers, and
> the first Warden battle with the Warden's Oath mechanic.
> All automated tests pass: 6 save-smoke, 120 engine checks, 59 live CDP
> playtest checks.

## What runs today

Everything from v0.4 (3 overworld maps, 17 species, trainer battles, Lyra
rival fight, shop, dex), plus:

- **Hollow Cave** (`hollow_cave`): first dungeon, entered from a cave mouth
  at the top of the North Road (22,0). New tile types: `C` cave rock (solid),
  `c` cave floor, `e` cave gravel (wild encounters — Gloombat #21 new
  Shadow/Wind species, Pebblump, Mirewisp at Lv 6–9, 16% rate)
- **Cave gauntlet**: Acolyte Vren (lower gallery) and Acolyte Sila (upper
  gallery) — optional trainer fights with their own flags and aftermath
  dialogue, then **Warden Thane** in the high chamber
- **Warden's Oath** (design-spec rule): when the Warden's LAST Luminary
  drops below 30% HP, it is fully restored once per battle, with its own
  animation. Implemented in `BattleScene.maybeWardenOath()`, driven by
  `wardenOath: true` on the trainer def
- Beating Thane: 600 Shards, `warden1_won` + `badge_lowlands` story flags
  (trainer defs can now carry `setFlags`), and aftermath dialogue that
  seeds Chapter 1 (Hollowed Chain on the coast, Lyra's father)
- 18 species total; encounter tiles generalized (`g` grass, `e` gravel)

## Verified tests (all passing at this commit)

```
npm run save-smoke     # 6 checks
npm run engine-test    # 120 checks — adds Warden party/Oath/badge checks,
                       # cave map integrity, 'C' in the solid-landing set
npm run playtest-game  # terminal 1: game with CDP port 9223
npm run playtest       # terminal 2: 59 live checks — v0.4 set plus cave warp,
                       # collision, deterministic Oath unit check (fires once,
                       # never twice), full Warden fight via dialogue with
                       # flag/badge/reward assertions (uses + deletes slot_3)
node scripts/screenshot-cdp.mjs  # PNG of the running game
```

Playtest scripting gotchas (don't regress):
- Wrap waitFor expressions in `Boolean(...)` — Phaser objects break CDP
  `returnByValue`
- Only act on the 5-item battle command menu; cancel submenus first
- Never blind-press Z while a ShopPanel may be open (it buys)
- Trainer fights are genuinely losable — test leads are set to Lv 20 (rival)
  and Lv 25 (Warden) to make wins deterministic; lower levels black out via
  counter-picks and the Oath heal (that was a real test failure, not a bug)

## Architecture

```
Renderer (Phaser 3, sandboxed, classic scripts — load order in src/index.html)
  ├─ data/starters.js   LUMINARY_SPECIES (18), MOVES, makeLuminary
  ├─ data/maps.js       4 maps {rows, exits, doors, npcs, encounters}
  ├─ data/items.js      ITEMS
  ├─ data/trainers.js   TRAINERS (lyra1, acolyte_vren, acolyte_sila,
  │                     warden_thane w/ wardenOath+setFlags) + buildTrainer
  ├─ systems/BattleEngine.js  pure battle math
  ├─ systems/PartyPanel.js    PartyPanel + ItemsPanel overlays
  ├─ systems/ShopPanel.js     ShopPanel + DexPanel overlays
  ├─ systems/DialogueBox.js   typewriter dialogue widget
  ├─ scenes/WorldScene.js     maps (incl. cave tiles), NPC battle/shop hooks
  ├─ scenes/BattleScene.js    wild + trainer battles, Oath, learn/evolve/bond
  └─ window.LuminaryNative  ← preload.cjs → main.js
```

### Save `data` fields

v0.4 fields. Story flags in play: `chapter`, `echo_awakened`, `met_lyra`,
`ceremony_complete`, `rival1_won`, `acolyte_vren_won`, `acolyte_sila_won`,
`warden1_won`, `badge_lowlands`.

## Implemented Luminary (18 of 180+)

Starter lines ×3 (2 stages), grove lines ×3 (2 stages), road wilds ×5,
Gloombat (cave). Dex numbers 1–21 with gaps reserved for third stages.

## Not built yet (do not assume exists)

- Echo Vault UI (capture with full party silently vaults)
- Status conditions; Echo Surge (Bond 10); bond from shrine rests
- Evolutions for road wilds + Gloombat; third-stage starter evolutions
- Keldrath Coast (Sigil unlocks it narratively; map doesn't exist)
- Building interiors, audio, packaging, full 18×18 type chart
- Healer NPC (blackout/shrine are the only full heals)

## Next session — plan (in priority order)

1. **Echo Vault UI** at Save Shrines: deposit/withdraw between party (≤6)
   and vault (≤300); reuse the PartyPanel pattern
2. **Keldrath Coast region opener** (build order step 11 pulled early as
   chapter momentum): `keldrath_gate` map east of the North Road,
   pass-warden NPC checks `badge_lowlands`, first coast town + 4–6 new
   Tide/Wind species toward 30
3. **Status conditions** in battle (burn/sleep + spec's Shattered/Echoed/
   Hollowed), then Echo Surge at Bond 10
4. Chapter 1 story beats: Elder Maren post-badge dialogue, Hollowed Chain
   scout encounter
5. Healer NPC in Ashfen Town (free rest at Bram's neighbor?)

## Dependencies

- electron ^42.4.0, electron-store ^11.0.2, phaser ^3.90.0
- electron-builder ^26.15.2 (dev, not configured yet)
