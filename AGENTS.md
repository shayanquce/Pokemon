# AGENTS.md — Resume instructions for Luminary

**Read this file first** when continuing work on this project (Cursor, Claude, or any AI coding assistant).

## Project

**Luminary: Echoes of the Forgotten Age** — offline Electron desktop monster-taming RPG (Pokémon-like, deeper story/combat). Local folder may be named `Pokemon`; the npm package is `luminary-game`.

## Current checkpoint — v0.23 "What the Orchard Keeps" (PAUSED)

**Build order steps 1–21 are DONE.** Do not rebuild them unless fixing bugs.
**Regions 1–5 are complete** (Ashfen Lowlands, Keldrath Coast, Mirewood,
Cinderpeaks, Verdant Sprawl); four Sigils won; story is at Chapter 5.

| Step | Status | Notes |
|------|--------|-------|
| 1. Electron + save system | ✅ | `main.js` SaveManager, 3 slots, SHA-256, rolling backups |
| 2. Title + new game flow | ✅ | Name, starter pick, slot pick (`starterId` saved) |
| 3. Basic map + movement | ✅ | Map-driven `WorldScene` |
| 4. Ashfen town + NPCs | ✅ | Warps, DialogueBox, story flags |
| 5. Encounters + battle | ✅ | Fight/Item/Switch/Capture/Run, learning, evolutions, bond |
| 6. North Road + species + rival + shop + dex | ✅ | Trainer battles, ShopPanel, DexPanel |
| 7. First dungeon + Warden | ✅ | Hollow Cave, 2 acolytes, Warden Thane, Warden's Oath, badge |
| 7.5 Graphics & feel overhaul (v0.6) | ✅ | Hi-res walk-cycle chars, EPX+shaded Luminary, smooth chained movement, ambient life, battle anims, flavor text |
| 8. Echo Vault UI + Keldrath opener (v0.7) | ✅ | VaultPanel at shrines, keldrath_gate + gate-NPC mechanic, keldrath_town, 5 coast species (23 total) |
| 9a. Status conditions + Echo Surge (v0.8) | ✅ | burn/sleep/Shattered/Echoed/Hollowed, move `inflicts`, Bond-10 surge |
| 9b. Chapter 1 story beats (v0.9) | ✅ | Maren post-badge counsel (`conditionalDialogue`), Chain scout (`showIfFlag`), chapter → 2 |
| 10a. Lowlands wild evolutions (v0.10) | ✅ | 6 second stages (dex 27–32, 29 species), Storm Coil + Umbral Rend, rAF-throttling fix in main.js |
| 10b. Keldrath Cliffs route (v0.11) | ✅ | Chapter 2 route, evolved wild spawns, Lyra rematch (`lyra2`, rival2_won), Wayfarer Oren blocks the high pass |
| 11a. Healer + status-cure items (v0.12) | ✅ | Dockside Maeve (`healer: true`), Tide Tonic + Brine Salve (`cures`), world + battle cure flows |
| 11b. Chapter 2 beats + Mirewood opener (v0.13) | ✅ | Oren gate (pass_cleared), mirewood_marsh + mire tile, 4 species (dex 33–36), Chain stalker, sanctum rumor |
| 12. Deep eaves + drowned sanctum (v0.14) | ✅ | `mirewood_deep` dungeon, Keeper Ilse, Warden Mira (badge_mirewood), Chapter 3 seeds |
| 13. Mirewood town (v0.15) | ✅ | `mirewood_town` Reedlight Village: Tamsin (healer), Hobb shop + Lantern Dew, Elder Wren postBadge counsel, per-merchant shop titles, playtest-mode setTimeout loop |
| 14. Chapter 3 beats (v0.16) | ✅ | Awakened-door mechanic, Sanctum Doors (`A` tile) → `sanctum_inner` hall, Echo of Solen (eight doors, Cinderpeaks), Lyra in Reedlight, chapter → 3 |
| 15. Coast/Mirewood evolutions (v0.17) | ✅ | 9 second stages (dex 37–45, 42 species), 4 new moves, rare evolved spawns in both Mirewood maps |
| 16. Cinderpeaks opener (v0.18) | ✅ | Snow-Guide Bryn gate (echo_answered → peak_pass_granted), `cinderpeaks_ascent` w/ snow tiles `n`/`h`, Frost attack row, 4 species (dex 46–49), Chain Digger, Edda names Warden Korr |
| 17. Forge-hall + Warden Korr (v0.19) | ✅ | Edda gate (chain_digger_beaten → forge_road_cleared), `cinderpeaks_forge` w/ lava tile `l`, Cindralisk + Magma Lash, Lyra3 race-rematch, Korr's Oath → badge_cinderpeaks |
| 18. Third stages + Ch3 closer (v0.20) | ✅ | Embralion/Runedeep/Grovemaw (dex 3/6/9, starter lines complete), Chain Envoy Vael on the ascent (refusal → chain_envoy_beaten + chapter 4) |
| 19. Fourth region opener + Ch4 reactions (v0.21) | ✅ | Verdant Sprawl "Dawnward Slopes": Dawn-Guide Sella gate (chain_envoy_beaten → slopes_pass_granted), `verdant_descent` map, 4 species (dex 51–54), **Hollow Vessel** (faceless chain_hollow), Lyra cameo, Ranger names Warden Alder; Maren/Wren react to chain_envoy_beaten |
| 20. Alder's Vale — Sprawl town (v0.22) | ✅ | Grafter Wick gate (chain_hollow_beaten → vale_road_cleared), `sprawl_vale` town, new `o` orchard tile, healer/shop/Orchard Cordial, Steward Yarrow + Lyra Ch4 beats, engine-test map invariants |
| 21. Orchard Road + Warden Alder (v0.23) | ✅ | `sprawl_orchard` dungeon, Pruner Hallow, **Warden Alder** + Oath + `badge_sprawl` + **chapter 5**, Orchardwarden (dex 55), Lyra joins the road north, engine-test reachability pass |
| 22. **Frostwall Tundra opener** | ⏭️ **NEXT** | Region 6 / Chapter 5 — gate north on `badge_sprawl`, tundra route, ~4 species (dex 56+), the Chain's new impersonal shape |
| 23–24 | ⏭️ | Sprawl second stages, playtest coverage for region 5, audio, packaging… |

## Exactly where we left off (2026-07-31, session 7, v0.23)

**READ THIS FIRST if you are picking the project up cold.** Steps 1–21 are
complete. This session built **all of region 5, the Verdant Sprawl**, across
three versions (v0.21 opener → v0.22 town → v0.23 dungeon+Warden). The
region is FINISHED; the story now sits at the start of **Chapter 5**.

**⚠️ THE NEXT STEP IS THE FROSTWALL TUNDRA (region 6, Chapter 5).** Warden
Alder's aftermath and Lyra both explicitly point north to it, and **nothing
north of the Sprawl exists** — no gate, no map, no fifth Warden. Build the
opener first (template: v0.21), then town + Warden (v0.22/v0.23). Per
DESIGN_SPEC the remaining regions are Frostwall Tundra → Shattered Expanse
→ Aethori Sanctum. Story beat to honor: the Chain no longer needs a keeper
to hollow things, so its Chapter-5 presence should feel impersonal and
environmental rather than a cloaked negotiator.

**v0.23 "What the Orchard Keeps"** (most recent) — the Sprawl **dungeon +
fourth Warden**. `sprawl_vale` south (13,16) → **`sprawl_orchard`** ("The
Orchard Road", terraced climb, tall-grass beds Lv 33–37, Save Shrine (9,7),
narrowing treewall funnel to Alder's terrace). **Pruner Hallow** (13,5,
optional, `vale_acolyte_won`), **Tam** (18,9, flavor), and **Warden Alder**
(14,14): Dawnfinch 34 / Thistlebuck 35 / **Orchardwarden 37** (new dex 55
ace, Verdant/Light, also a 6% rare spawn), `wardenOath: true`, 1500 shards,
sets `warden4_won` + **`badge_sprawl`** + **`chapter: 5`**. Lyra gains a
`badge_sprawl` branch in the vale and joins the road north. engine-test
gained a **reachability pass** over every map (flood-fill from real arrival
tiles; no NPC or exit may be walled off — gates count as passable, and exit
tiles may be solid since `tryStep` checks `exitAt()` before `isSolid()`).

**v0.22 "Alder's Vale"** — the Sprawl **town**. Past the
slopes, **Grafter Wick** (`verdant_descent` (28,11)) gates the grafted
treewall on `chain_hollow_beaten` → grants `vale_road_cleared`, opening
exit (29,11) → **`sprawl_vale`** ("Alder's Vale", (1,11)). The town has a
**new walkable tile `o`** (`tile_orchard` — tilled terrace rows; wired into
WorldScene `groundFor`, not solid, not an encounter tile), **Grafter Nell**
(healer), **Cellarman Dov** (shop + new **Orchard Cordial**, heal 200, 900
shards), **Steward Yarrow** (names Warden Alder; `conditionalDialogue` on
`chain_hollow_beaten`), **Lyra** (`showIfFlag: chain_hollow_beaten` — she
voices the Chapter-4 fear that the Chain collects the KEEPER, not the
Echo), and **Pip**. Ambient presets were added for both new maps.
engine-test also gained **map invariants that apply to every map**: NPCs
must stand on walkable tiles, gate aside tiles must be walkable, gate
requires/grants flags must differ, door defs must sit on `D` (or `A`).

**v0.21 "The Dawnward Slopes"** — the region **opener** (Verdant Sprawl,
region 5, Chapter 4). Descend
the Cinderpeaks ascent's new **east gate** — **Dawn-Guide Sella** (28,9),
`gate.requiresFlag: chain_envoy_beaten`, `grantsFlag: slopes_pass_granted`,
opens exit (29,9) → new map **`verdant_descent`** ("Dawnward Slopes",
snow→grass gradient, Save Shrine (15,14), tree-wall east = v0.22 hook).
**4 new species (54 total, dex 51–54)**: Fernkit (Verdant/Beast), Dawnfinch
(Wind/Light), Thistlebuck (Verdant/Stone), Hollowmoth (Spirit/Shadow), Lv
30–35, + moves **Bramble Rush** (Verdant phys 58) and **Hollow Gaze**
(Shadow spec 56, 15% Hollowed). **Hollow Vessel** (`chain_hollow` at
(14,8), `hiddenIfFlag: chain_hollow_beaten`) is the **faceless** Chapter-4
enemy the envoy promised — gloomshroud 33 / murkmaw 34 / hollowmoth 35,
1100 shards, sets `chain_hollow_beaten` (no chapter change; already 4).
**Lyra cameo** (`lyra_slopes`) reacts to the race + the refusal, with a
`chain_hollow_beaten` follow-up branch; **Sprawl Ranger Tibb** names
**Warden Alder** and the vale further east. **Chapter-4 reaction pass**:
Elder Maren + Elder Wren now have a `chain_envoy_beaten` conditionalDialogue
entry ordered FIRST (before their badge entries — `.find` picks first match).

**v0.20**: starter third stages, Chain Envoy Vael. **CRITICAL playtest
pattern** (still holds): scripted trainer wins must be one-shot decisive —
the digger/lyra3/Mira/Korr/envoy test leads are **Lv 80 with Storm Coil
(neutral) as their only move**; a new `chain_hollow` playtest lead should
follow the same rule (Lv 80 Storm Coil). Playtest count was 176; the new
Hollow Vessel fight is not yet scripted into playtest-cdp.mjs.

Verified this session: **engine-test 599/599 PASS**. save-smoke + playtest
were NOT run here (no `node_modules`/Electron binary in this environment —
run `npm install` then `npm run fix-electron` to restore them). Nothing in
this session touched battle/save code — it is all data, art and tests — so
those two suites are expected to still pass unchanged.

Resume by:

1. `npm install` (this checkout has no `node_modules`), then `npm run save-smoke` and `npm run engine-test` — all must PASS
2. Optional live verification: `npm run playtest-game` (terminal 1), `npm run playtest` (terminal 2); region 5 is not covered yet — add steps and re-baseline the count
3. **Build the Frostwall Tundra opener** (see the ⚠️ above and PROJECT_STATE "Next session"): gate north on `badge_sprawl`, a tundra route map, ~4 species from dex 56, and the Chapter-5 threat beat. Template: v0.21
4. Then Sprawl second stages, region-5 playtest coverage, audio, packaging

**Gotchas:** battle flavor text can vary via `pick()` but keep per-turn
message flow compatible with the playtest drain loops (they tolerate the
status-proc messages; verified twice). NPC collision uses `npc.x/npc.y`
(runtime copy), not `def.x/def.y` — gate NPCs move. The vault enforces ≥1
party member AND ≥1 conscious one. Statuses live on `mon.status =
{ id, turns }` (already in the save schema; shrine/blackout clear them).
Playtest trainer leads are tuned: Lv 20 (lyra1), 25 (warden/scout),
**38 (lyra2** — at 30 her evolved counter-pick made the win a coin flip;
that flake actually happened, don't lower these).
**If the game ever freezes mid-battle (busy=true, tweens never fire):** the
window was occluded and Chromium throttled rAF — main.js now sets
`backgroundThrottling: false` + `disable-renderer-backgrounding` +
`disable-background-timer-throttling` + `disable-features=
CalculateNativeWinOcclusion`; do NOT remove those switches.

**Playtest scripting gotchas** (see PROJECT_STATE.md "Verified tests"): wrap
waitFor expressions in `Boolean(...)` (Phaser objects break CDP serialization);
never blind-press Z while a ShopPanel might be open (it buys); trainer fights
are losable — keep the test leads at Lv 20/25 or wins are nondeterministic.
`keyboard.emit('keydown-X')` does NOT set isDown — use `scripts/cdp-press.mjs`
to test held movement with real key events.

## Commands

```bash
npm install          # first clone only
npm run fix-electron # if electron.exe missing after install
npm start            # launch game
npm run save-smoke   # headless save tests (6 checks, must all PASS)
npm run engine-test  # headless battle/data tests (262 checks, no Electron)
npm run playtest-game  # terminal 1: game with CDP port 9223
npm run playtest       # terminal 2: automated playthrough (116 checks)
node scripts/screenshot-cdp.mjs  # PNG of the running game → %TEMP%/luminary-shot.png
node scripts/cdp-eval.mjs "expr"          # eval JS in the running game
node scripts/cdp-press.mjs ArrowDown 700  # hold a real key (tests held movement)
node scripts/dump-texture.mjs lum_embrik 6  # generated texture → upscaled PNG
```

## Critical conventions

1. **Save system first** — any new gameplay state must be added to the save schema in `SaveSystem.js` (`newGame`) and validated in `main.js` (`isShapedLikeASave`). Auto-save after: battle end, item pickup, map transition, dialogue completion, capture. (All of these are wired except item pickup — no items exist in the world yet.)
2. **No internet at runtime** — no external APIs.
3. **Stack:** Electron + Phaser 3 (not 4) + electron-store + classic script tags (no bundler). New files must be added to `src/index.html` in dependency order.
4. **Windows productName:** must NOT contain `:` — crashes Electron userData path.
5. **IPC:** renderer uses `window.LuminaryNative` from `preload.cjs` only — never enable `nodeIntegration`.
6. **UI:** dark fantasy — navy/slate bg, gold accents. Keyboard: arrows/WASD, Z/Enter confirm, X/Esc cancel.
7. **Scene handoff:** WorldScene ↔ BattleScene via `scene.start` both ways; world position/map always live in `Save.state`, so rebuilding WorldScene is safe.
8. **Settings:** read synchronously from `window.GameSettings` (cached in `game.js`, kept fresh by SettingsScene).
9. **Do not commit** `node_modules/`, `.electron-cache/`, or player save files.

## Key files

| File | Role |
|------|------|
| `main.js` | Electron main, SaveManager, SettingsManager, IPC, `--save-smoke` |
| `preload.cjs` | `window.LuminaryNative` bridge |
| `src/systems/SaveSystem.js` | Live game state + auto-save |
| `src/systems/BattleEngine.js` | Pure battle math: type chart, damage, exp, learning, evolution, bond, capture |
| `src/systems/PartyPanel.js` | PartyPanel (manage/select) + ItemsPanel overlay widgets |
| `src/systems/VaultPanel.js` | Echo Vault deposit/withdraw overlay (shrine menu) |
| `src/systems/ShopPanel.js` | ShopPanel + DexPanel overlay widgets |
| `src/systems/DialogueBox.js` | Typewriter dialogue widget |
| `src/scenes/WorldScene.js` | Overworld — maps, NPC battle/shop hooks, pause menu |
| `src/scenes/BattleScene.js` | Wild + trainer battles, learn/evolve/bond flow |
| `src/data/maps.js` | 16 maps: exits, doors, NPCs (battle/shop/hiddenIfFlag/showIfFlag/gate/healer/conditionalDialogue), encounters |
| `src/data/starters.js` | 55 species + move defs (schema for all 180+), leveled learnsets |
| `src/data/items.js` | Item definitions |
| `src/data/trainers.js` | TRAINERS (lyra1/2, acolyte_vren/sila, warden_thane, chain_scout/stalker, sanctum_keeper, warden_mira) + buildTrainer |
| `scripts/engine-test.mjs` | Headless engine tests (vm-based, no Electron) |
| `scripts/playtest-cdp.mjs` | Automated CDP playthrough test |
| `docs/PROJECT_STATE.md` | Full checkpoint + architecture |
| `docs/DESIGN_SPEC.md` | Original game design requirements |

## Save data location (NOT in repo)

- Windows: `%APPDATA%\luminary-game\luminary-saves.json`
- Settings: `%APPDATA%\luminary-game\luminary-settings.json`

## Story / design reference

Full creative spec (180+ Luminary, 8 regions, 8 chapters, battle rules) is in `docs/DESIGN_SPEC.md`. Starters: **Embrik** (Flame), **Tidalink** (Tide), **Thornpaw** (Verdant). Player default name: Kael. Rival **Lyra** is placed in Ashfen Town and her intro dialogue sets `storyFlags.met_lyra`.
