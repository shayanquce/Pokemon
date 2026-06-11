# Project State — v0.6 "A Living World" checkpoint (2026-06-11)

> Paused after the graphics/feel overhaul (between build-order steps 7 and 8).
> All automated tests pass: 6 save-smoke, 120 engine checks, 59 live CDP
> playtest checks, plus visual verification via screenshot/texture dumps.

## What runs today

Everything from v0.5 (4 maps, 18 species, trainers, rival, Warden's Oath,
badge, shop, dex), plus the v0.6 presentation overhaul:

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
npm run engine-test    # 120 checks — adds Warden party/Oath/badge checks,
                       # cave map integrity, 'C' in the solid-landing set
npm run playtest-game  # terminal 1: game with CDP port 9223
npm run playtest       # terminal 2: 59 live checks — v0.4 set plus cave warp,
                       # collision, deterministic Oath unit check (fires once,
                       # never twice), full Warden fight via dialogue with
                       # flag/badge/reward assertions (uses + deletes slot_3)
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
  ├─ data/starters.js   LUMINARY_SPECIES (18), MOVES, makeLuminary
  ├─ data/maps.js       4 maps {rows, exits, doors, npcs, encounters}
  ├─ data/items.js      ITEMS
  ├─ data/trainers.js   TRAINERS (lyra1, acolyte_vren, acolyte_sila,
  │                     warden_thane w/ wardenOath+setFlags) + buildTrainer
  ├─ systems/PlaceholderArt.js  ALL generated art: epxScale + shadeGrid +
  │                     gridTexture (outline) pipeline, CHAR_BODY/CHAR_LEGS
  │                     walk frames, charPalette shading, tiles (2 water
  │                     frames), STARTER_PIXELMAPS
  ├─ systems/BattleEngine.js  pure battle math
  ├─ systems/PartyPanel.js    PartyPanel + ItemsPanel overlays
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
