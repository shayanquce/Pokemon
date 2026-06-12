# Project State — v0.16 "The Doors Answer" checkpoint (2026-06-12)

> Paused after the Chapter 3 beats (build-order step 14).
> All automated tests pass: 6 save-smoke, 274 engine checks, 133 live CDP
> playtest checks.

## What runs today

### v0.16 The Doors Answer (step 14 — Chapter 3 beats)

- **Awakened-door mechanic** (data-driven, reusable): a door def may carry
  `awakened: { flag, pages, repeat, setFlags, warp }` — once
  `storyFlags[flag]` is set, interacting plays `pages` once (then `repeat`,
  seen-state in `npcStates[door.id].opened`), applies `setFlags`, auto-saves,
  and optionally warps through the door (`WorldScene.openDoor`)
- **The Sanctum Doors** (`mirewood_deep` (15,1), new solid tile **`A`**
  `tile_sanctum_door` — black stone, gold seam, rune pricks): sealed flavor
  until `badge_mirewood`, then the Echo answers — sets
  `sanctum_doors_opened` + **`chapter: 3`** and warps inside. Warden Mira
  moved to (14,2) so the door approach (15,2) is walkable
- **The Inner Hall** (`sanctum_inner`): pillared water-hall with the First
  Shrine (14,2). **Echo of Solen** (14,5): Chapter 3 exposition — Solen died
  sealing one of EIGHT doors, the Chain knows the eighth is failing, the
  next Sigil is in the Cinderpeaks; sets `echo_answered`
- **Lyra in Reedlight** (mirewood_town (16,10), `showIfFlag:
  badge_mirewood`): reacts to the second Sigil, names the Cinderpeaks race;
  sets `lyra_sigil_seen`

### v0.15 Reedlight Village (step 13)

- **Mirewood — Reedlight Village** (`mirewood_town`): town north of the
  marsh (new exit at marsh (14,0)). Stilt-houses, reed pools, mire accents,
  its own Save Shrine (12,8). No encounters
- **Reedkeeper Tamsin** (7,8, `healer: true`): free full heal, mirrors Maeve
- **Peatmonger Hobb** (8,6): shop — capture orb 200, tide tonic 300, brine
  salve 160, **Lantern Dew 500** (new item, heal 120)
- **Elder Wren** (16,6): sanctum lore; `conditionalDialogue` on
  `badge_mirewood` (stateKey `postBadge`) tells the Echo-bearer the doors
  want a VOICE, not a key — the Chapter 3 hook
- **Tilly** (20,12): reed-light flavor (the whole marsh lit gold)
- **ShopPanel title is now per-merchant** (`title` option; WorldScene passes
  `<NAME>'S WARES`)
- **Playtest-mode game loop fix** (`main.js` + `src/game.js`): when launched
  with `--remote-debugging-port`, index.html gets `?playtest=1` and Phaser
  runs `fps: { forceSetTimeOut: true }`. Newer Chromium throttles rAF to
  **1fps** in an unfocused/occluded window even with the v0.10 occlusion
  flags — every tween crawled and playtest waits timed out. setTimeout is
  exempt thanks to `backgroundThrottling: false`. Normal play still uses rAF

### v0.14 The Drowned Sanctum (step 12)

- **The Drowned Sanctum** (`mirewood_deep`): second dungeon, east of the
  marsh (new exit at marsh (29,9)). A water-ringed Aethori ruin built from
  cave tiles inside a `W` moat; gravel beds hold Lv 19–22 wilds (Murkfin,
  Gloombat, Bogstinger, Lanternreed at 16%)
- **Keeper Ilse** (optional gauntlet fight, Lanternreed 21 + Bogstinger 22,
  250 shards, `sanctum_keeper_won`)
- **Warden Mira** (15,2): Murkfin 22 / Lanternreed 23 / Mournlight 25 with
  the **Warden's Oath**, 900 shards, sets `warden2_won` + `badge_mirewood`.
  Aftermath seeds Chapter 3: the sanctum doors answer only the Echo, the
  Chain digs for another way in, the third Warden keeps the Cinderpeaks

### v0.13 Mirewood opener + Chapter 2 beats (step 11b)

- **Wayfarer Oren is now a gate NPC**: requires `rival2_won` ("the storms
  turned"), grants `pass_cleared`, steps aside to (20,1); cliffs north gap
  (21,0) exits to Mirewood
- **Mirewood — Drowned Eaves** (`mirewood_marsh`): first Mirewood map. New
  walkable encounter tile **`m` mire** (`tile_mire`, bog water with scum +
  bubbles; teal rustle/dust). Map has a **Save Shrine** (14,7), water pools,
  mire beds
- **4 new species (33 total, dex 33–36)**: Mossling (Verdant/Beast),
  Bogstinger (Venom/Wind — first Venom, new move Venom Barb), Murkfin
  (Tide/Shadow), Lanternreed (Verdant/Light), Lv 18–22 in the mire beds
- **Chapter 2 beats**: Bog Hermit Sef sets `heard_sanctum_rumor` (the Chain
  went toward the **drowned sanctum** without lanterns); **Chain Stalker
  Morn** (Gloomshroud 20 / Murkfin 20 / Mournlight 21, 600 shards) sets
  `chain_stalker_beaten` — the sanctum + second Warden live past the deep
  eaves, east (future map)

### v0.12 healer + cure items (step 11a)

- **Dockside Maeve** (keldrath_town (10,11), `healer: true` on the NPC def):
  talking to her fully heals the party — HP, status, PP — free, with a
  sparkle + toast. Any future NPC can be a healer by adding the flag
- **Two new items**: Tide Tonic (heal 80) and Brine Salve (`cures: true` —
  removes any one status). Both in Bram's stock (300 / 160 shards).
  `cures` items work from the pause menu (target picker only lights up
  afflicted party members) and in battle (consumes the turn, like heals)
- **Playtest hardening**: the lyra2 rematch lead is Lv 38 — at 30 her
  evolved counter-pick (super-effective ~30/turn + Lumenmoth sleep procs)
  made the scripted win a coin flip (a real observed flake, not theory)

### v0.11 Keldrath Cliffs (step 10b)

- **Keldrath Cliffs** (`keldrath_cliffs`): Chapter 2 route north of
  Harborside (new exit at town (21,0)). Rock-walled switchback with the sea
  below the east cliffs; encounter grass holds Lv 13–17 wilds plus **rare
  evolved spawns** (Zephyrlynx/Stormtail 18–20, Gloomshroud 20–22, ~30%
  combined)
- **Lyra rematch** (`lyra2`, at (20,8)): Lumenmoth 16 + Brinepup 15 + her
  evolved counter-pick at 18 (Tidarune/Thorngrove/Embrath vs your starter).
  500 shards, sets `rival2_won`; her dialogue advances the Chapter 2 thread
  (her father climbed this road; the Chain was waiting)
- **Wayfarer Oren** blocks the north gap at (21,1) — the high pass to
  Mirewood/second Warden is "buried until the storms turn" (next region
  hook; he is a plain dialogue NPC, swap to a gate NPC when the region lands)

### v0.10 wild evolutions (step 10a)

- **Six Lowlands second stages (29 species total, dex 27–32)**: Voltail →
  **Stormtail** (Volt/Storm, 18), Mirewisp → **Mournlight** (Spirit/Light,
  19), Bristleboar → **Bristlehulk** (Beast/Stone, 18), Pebblump →
  **Cragmaw** (Stone, 20), Zephyrkit → **Zephyrlynx** (Wind, 18), Gloombat →
  **Gloomshroud** (Shadow/Wind, 20) — full stats, lore, pixel maps
- **Two new moves**: Storm Coil (Volt special 58) and Umbral Rend (Shadow
  physical 58, 10% Hollowed), in the second stages' learnsets
- **Engine-loop freeze fix** (`main.js`): `backgroundThrottling: false` +
  `disable-renderer-backgrounding` / `disable-background-timer-throttling` /
  `disable-features=CalculateNativeWinOcclusion`. Without these, Chromium
  throttles rAF to ZERO when the window is hidden/occluded, freezing Phaser
  tweens mid-await — battles softlock and the CDP playtest stalls. If a
  playtest ever hangs with `busy=true` and full HP bars, check occlusion
  first, not the battle code

### v0.9 Chapter 1 beats (step 9b)

- **Conditional NPC dialogue** (data-driven): `conditionalDialogue:
  [{ flag, stateKey, pages, repeat }]` on an NPC def — the first entry whose
  story flag is set overrides the default lines (pages once, then repeat);
  seen-state persists in `npcStates[id][stateKey]`. Elder Maren uses it for
  her post-badge counsel (warns about the Chain, points at Lyra's road)
- **`showIfFlag`** on NPC defs (counterpart to `hiddenIfFlag`): the NPC only
  spawns once a flag is set
- **Hollowed Chain scout** (Chapter 1 closer): hearing Orla's rumor
  (`heard_chain_rumor`) makes a Stranger appear on the Keldrath Gate shore
  (24,5). Beating Chain Scout Veyl (gloombat 11 + mirewisp 12, 400 shards)
  sets `chain_scout_beaten`, advances `storyFlags.chapter` to **2**, and he
  never respawns (hiddenIfFlag)

### v0.8 battle systems (step 9a)

- **Status conditions** (`BattleEngine.js` STATUSES): classic **burn**
  (1/12 max-HP chip end of turn, physical damage dealt x0.75) and **sleep**
  (skips 1–3 turns, then wakes), plus the spec's own three — **Shattered**
  (+30% physical damage taken), **Echoed** (+30% special damage taken),
  **Hollowed** (-30% damage dealt). One condition at a time
  (`tryInflictStatus`); shrine rest and blackout clear them. Sleep is gated
  in `statusCanAct`, burn chip in `statusEndOfTurn` (both ends of the turn,
  in `resolveTurn`). Panels show a colored tag (BRN/SLP/SHT/ECH/HLW)
- **Moves that inflict** (`inflicts: { id, chance }`): cinder_snap 10%/
  flame_burst 15% burn, glowpulse 15% sleep, pebble_toss 10% shattered,
  wisp_flare 15% echoed, gloom_fang 15% hollowed
- **Echo Surge** (Bond 10): the first signature-move use each battle blazes
  — x1.5 damage (`computeDamage` opts.surgeMult), gold burst + message,
  `this.surgeUsed` once per battle (mirrors the Warden's Oath pattern)

### v0.7 content (step 8)

- **Echo Vault UI** (`src/systems/VaultPanel.js`): Save Shrines now open a
  3-option menu (Rest & Record / Echo Vault / Leave — `WorldScene.openShrine`).
  The vault is a two-column overlay: party (≤6) left, vault (≤300, 9-per-page,
  Up/Down past the edge flips pages) right. Left/Right switch columns, Z
  transfers, X closes (auto-saves `vault`). Rules: party keeps ≥1 Luminary AND
  ≥1 conscious one; vault caps at 300
- **Keldrath Gate** (`keldrath_gate`): east of the North Road (row 9 east end
  opened). New walkable tile `s` sand (`tile_sand`). Gate wall splits grass
  west from shore east; **Pass-Warden Hale** stands in the gap at (19,9)
- **Gate NPC mechanic** (data-driven, reusable): `gate: { requiresFlag,
  grantsFlag, asideX/Y, deniedDialogue, grantedDialogue }` on an NPC def.
  Without `badge_lowlands` he refuses; with it he grants
  `coast_pass_granted` and **steps aside** (tween via `WorldScene.stepAside`;
  collision follows `npc.x/y`, which now shadows `def.x/y` — `npcAt` uses
  npc.x/y, and granted gate NPCs spawn at their aside spot on re-entry)
- **Keldrath Coast — Harborside** (`keldrath_town`): first coast town. NPCs:
  Dockmaster Orla (sets `heard_chain_rumor` — Hollowed Chain hook), sailor
  Pim (Lyra went north along the cliffs), kid Nina (Saltshell flavor). Two
  flavor doors. No encounters in town
- **5 new species (23 total, dex 22–26)**: Brinepup (Tide/Beast), Gullwisp
  (Wind/Spirit), Saltshell (Tide/Stone), Driftbloom (Verdant/Wind), Sparkfin
  (Volt/Tide) — all with pixel maps, in the gate-map encounter table (Lv 8–12)

### v0.6 presentation overhaul

Everything from v0.5 (4 maps, 18 species, trainers, rival, Warden's Oath,
badge, shop, dex), plus:

- **Hi-res character sprites**: player + every NPC rebuilt as 16x24 pixel
  maps (was 8x14) with auto-derived shading from the same 6-key palettes the
  map NPC defs already used (`charPalette` derives hair/skin/cloak shades),
  generated dark outline, and **3-frame walk cycles** for all 4 facings
  (`player_down_0..2`, `npc_<id>_side_1`, …). Side frames face right, flipX
  gives left. See `CHAR_BODY` / `CHAR_LEGS` in `PlaceholderArt.js`
- **Luminary sprite upgrade**: every species map is EPX/Scale2x-doubled
  TWICE (16x the pixels, staircase corners rounded), run through a volume
  shading pass (`shadeGrid`: lit top rims, dark undersides, vertical
  gradient) and outlined. Canvas is now ~66x50, so **all `lum_` call sites
  display at half their old scale** (battle 2/2.5, party 0.8, summary 1.5,
  dex 0.4, starter cards 2/2.25). Keep that rule for new UI
- **Movement feel**: tap-to-turn (a short press turns in place, holding
  walks), 140ms steps that chain with zero stutter (held key re-checked in
  the tween's onComplete), stride frames swap mid-step, drop shadows under
  characters, footstep dust tinted by ground tile
- **Living world**: per-map ambient particles (grove fireflies, town leaves,
  road seed fluff, cave motes), water tiles ripple between two glint frames,
  non-trainer NPCs idly glance around, NPCs hop and turn to face you when
  addressed, crisper tree tile (stepped-circle canopy)
- **Battle life**: both sides slide onto platforms, idle breathing tweens
  (scaleY so they never fight faint/shake tweens), attacker lunges on every
  move, varied flavor text via `pick()` (intro/miss/crit/effectiveness) —
  **message COUNT per turn is unchanged** (the CDP playtest drains a fixed
  number of messages; vary text, never add messages)
- **DialogueBox** pops in (fade + 6px rise; the page arrow is excluded — it
  has its own bob tween)

## Verified tests (all passing at this commit)

```
npm run save-smoke     # 6 checks
npm run engine-test    # 274 checks — maps/species/exits are auto-derived;
                       # status/surge multipliers are checked statistically
npm run playtest-game  # terminal 1: game with CDP port 9223 (playtest mode:
                       # Phaser loop on setTimeout, immune to rAF throttling)
npm run playtest       # terminal 2: 133 live checks — vault, both gates,
                       # coast town, healer + salve, scout/stalker fights,
                       # Maren counsel, cliffs rematch, Mirewood flags,
                       # Warden Mira (badge_mirewood), sanctum doors ->
                       # inner hall -> Solen (chapter 3), Reedlight Village
                       # (Tamsin heal, Hobb shop, Wren counsel, Lyra)
                       # (uses + deletes slot_3)
node scripts/screenshot-cdp.mjs   # PNG of the running game
node scripts/cdp-eval.mjs "expr"  # eval JS in the running game, print JSON
node scripts/cdp-press.mjs ArrowDown 700  # hold a REAL key (drives isDown —
                                  # the only way to test held movement)
node scripts/dump-texture.mjs lum_embrik 6  # save a generated texture as PNG
                                  # (visual sprite check without squinting)
```

v0.6 movement was verified with cdp-press: holding Down 700ms turned the
spawned player and chained 4 steps (y 11 -> 15); a 250ms Left tap turned +
stepped once with `player_side_0` applied.

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
  ├─ data/starters.js   LUMINARY_SPECIES (23), MOVES, makeLuminary
  ├─ data/maps.js       11 maps {rows, exits, doors, npcs, encounters}
  │                     (npc defs may carry gate:{requiresFlag,grantsFlag,…};
  │                     door defs may carry awakened:{flag,pages,warp,…})
  ├─ data/items.js      ITEMS
  ├─ data/trainers.js   TRAINERS (lyra1, lyra2, acolyte_vren, acolyte_sila,
  │                     warden_thane, chain_scout, chain_stalker,
  │                     sanctum_keeper, warden_mira — all w/ wardenOath/setFlags
  │                     where applicable) + buildTrainer
  ├─ systems/PlaceholderArt.js  ALL generated art: epxScale + shadeGrid +
  │                     gridTexture (outline) pipeline, CHAR_BODY/CHAR_LEGS
  │                     walk frames, charPalette shading, tiles (2 water
  │                     frames), STARTER_PIXELMAPS
  ├─ systems/BattleEngine.js  pure battle math
  ├─ systems/PartyPanel.js    PartyPanel + ItemsPanel overlays
  ├─ systems/VaultPanel.js    Echo Vault two-column overlay (shrine menu)
  ├─ systems/ShopPanel.js     ShopPanel + DexPanel overlays
  ├─ systems/DialogueBox.js   typewriter dialogue widget (pop-in)
  ├─ scenes/WorldScene.js     maps, walk cycle, ambient, NPC idle/hop,
  │                     battle/shop hooks
  ├─ scenes/BattleScene.js    wild + trainer battles, Oath, learn/evolve/bond,
  │                     breathing/lunge anims, pick() flavor text
  └─ window.LuminaryNative  ← preload.cjs → main.js
```

### Save `data` fields

v0.4 fields. Story flags in play: `chapter`, `echo_awakened`, `met_lyra`,
`ceremony_complete`, `rival1_won`, `acolyte_vren_won`, `acolyte_sila_won`,
`warden1_won`, `badge_lowlands`, `coast_pass_granted`, `heard_chain_rumor`,
`rival2_won`, `chain_scout_beaten`, `pass_cleared`, `heard_sanctum_rumor`,
`chain_stalker_beaten`, `sanctum_keeper_won`, `warden2_won`, `badge_mirewood`,
`sanctum_doors_opened`, `echo_answered`, `lyra_sigil_seen` (chapter now
reaches 3).

## Implemented Luminary (33 of 180+)

Starter lines ×3 (2 stages), grove lines ×3 (2 stages), road/cave wild
lines ×6 (2 stages), coast wilds ×5, Mirewood wilds ×4. Dex numbers 1–36
with gaps reserved for third stages.

## Not built yet (do not assume exists)

- Bond gain from shrine rests; status infliction from wild AI tuning
- Evolutions for coast/Mirewood wilds; third-stage starter evolutions
- Cinderpeaks / third Warden (Solen + Lyra both point there; nothing exists —
  Lyra says the pass is "snowed in", the future gate hook)
- The other seven doors / the failing eighth (Solen exposition only)
- Building interiors, audio, packaging, full 18×18 type chart
- Coast shop/noticeboard (Orla mentions a noticeboard; doesn't exist)

## Next session — plan (in priority order)

1. **Coast/Mirewood evolutions** as the level curve rises (Brinepup,
   Gullwisp, Saltshell, Driftbloom, Sparkfin, Mossling, Bogstinger,
   Murkfin, Lanternreed second stages)
2. **Cinderpeaks opener** (third region): mountain route off the cliffs'
   high pass or beyond Mirewood, third Warden seat, snow gate via Lyra hook
3. Audio pass (region BGM + battle SFX) or packaging when content settles

## Dependencies

- electron ^42.4.0, electron-store ^11.0.2, phaser ^3.90.0
- electron-builder ^26.15.2 (dev, not configured yet)
