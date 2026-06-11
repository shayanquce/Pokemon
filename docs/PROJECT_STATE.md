# Project State — v0.9 "The Chain Surfaces" checkpoint (2026-06-11)

> Paused after build-order step 9 complete: status conditions, Echo Surge,
> and the Chapter 1 story beats. All automated tests pass: 6 save-smoke,
> 180 engine checks, 84 live CDP playtest checks.

## What runs today

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
npm run engine-test    # 180 checks — maps/species/exits are auto-derived;
                       # status/surge multipliers are checked statistically
npm run playtest-game  # terminal 1: game with CDP port 9223
npm run playtest       # terminal 2: 84 live checks — v0.7 set plus Echo Vault
                       # rules, gate flow, coast town, chain-scout battle
                       # (chapter -> 2, despawn), Maren post-badge counsel
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
  ├─ data/maps.js       6 maps {rows, exits, doors, npcs, encounters}
  │                     (npc defs may carry gate:{requiresFlag,grantsFlag,…})
  ├─ data/items.js      ITEMS
  ├─ data/trainers.js   TRAINERS (lyra1, acolyte_vren, acolyte_sila,
  │                     warden_thane w/ wardenOath+setFlags) + buildTrainer
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
`warden1_won`, `badge_lowlands`, `coast_pass_granted`, `heard_chain_rumor`.

## Implemented Luminary (23 of 180+)

Starter lines ×3 (2 stages), grove lines ×3 (2 stages), road wilds ×5,
Gloombat (cave), coast wilds ×5. Dex numbers 1–26 with gaps reserved for
third stages.

## Not built yet (do not assume exists)

- Status-curing items; status infliction from wild AI tuning beyond move data
- Bond gain from shrine rests
- Evolutions for road/cave/coast wilds; third-stage starter evolutions
- Keldrath cliff road north (Pim mentions it; map doesn't exist)
- Building interiors, audio, packaging, full 18×18 type chart
- Healer NPC (blackout/shrine are the only full heals)
- Coast shop/noticeboard (Orla mentions a noticeboard; doesn't exist)

## Next session — plan (in priority order)

1. **Evolutions** for road/cave/coast wilds (Voltail, Bristleboar, Gloombat,
   Brinepup… — design stats + pixel maps)
2. **Keldrath cliff road** north (`keldrath_cliffs`): Chapter 2 route toward
   the second Warden, Lyra rematch on the way (Pim's dialogue seeds it)
3. Healer NPC in Ashfen Town or Keldrath (free rest); status-curing items
4. Chapter 2 beats: what the Chain wanted, Lyra's father's trail
5. Audio pass (region BGM + battle SFX) or packaging when content settles

## Dependencies

- electron ^42.4.0, electron-store ^11.0.2, phaser ^3.90.0
- electron-builder ^26.15.2 (dev, not configured yet)
