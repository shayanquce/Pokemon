# Luminary — Full Design Specification (reference)

Condensed from the original build brief. Use for creative/content decisions; implementation status in `PROJECT_STATE.md`.

## Tech stack

- Electron (desktop, offline)
- Phaser 3 (rendering + animations)
- JavaScript (classic scripts for now)
- electron-store (OS user-data saves)
- No external APIs at runtime

## Save system requirements

- Auto-save after: battle end, item pickup, map transition, dialogue completion, capture
- Manual save at Save Shrines with confirmation animation
- 3 slots with name, playtime, map+position, party, vault (300), inventory, shards, story flags, NPC states, locations, dex
- Checksum validation + 3 rolling backups (backup_1→2→3 round-robin)

## Story (8 chapters, 3 acts)

**World:** Veranthis. Ancient **Aethori** bonded with **Luminary**. Hero **Solen** fused with god-Luminary **Eranthis**, sealed a rift, vanished — world fractured.

**Player:** Kael (custom name), 17, Ashfen. Carries **Echo** (Solen soul fragment).

**Factions:** Hollowed Chain (hunt Echo), The Unmade (reopen rift via genocide), Aethori descendants (heal world).

**Rival:** Lyra — competitive → friend/love interest.

**Endings:** 3 distinct (Solen trapped in Eranthis — free or destroy).

## 8 regions

1. Ashfen Lowlands (starter)
2. Keldrath Coast
3. Mirewood
4. Cinderpeaks
5. Verdant Sprawl
6. Frostwall Tundra
7. Shattered Expanse
8. Aethori Sanctum (+ post-game 9th area)

Each: biome, 2–3 towns, dungeon, **Warden** (gym leader with story).

## Luminary

180+ creatures, 18 types: Flame, Tide, Stone, Wind, Volt, Frost, Verdant, Shadow, Light, Psyche, Venom, Iron, Echo, Void, Spirit, Beast, Arcane, Storm.

Balanced 18×18 type chart. Bond 1–10, signature move at high bond, Echo Surge at Bond 10.

## Battle (when built)

- Turn-based, 4 moves, PP, Resonance Discs (TMs)
- Bond meter, status (+ Shattered, Echoed, Hollowed)
- **Switch does NOT waste turn** — incoming Luminary acts
- Warden's Oath at 30% HP on last mon

## Progression

- Level cap 100, Shards currency, Capture Orbs tiers, Echo Vault at shrines
- 20+ hidden Luminary, day/night cycle, fast travel via shrine network

## Build order (authoritative)

1. ✅ Electron + save
2. ✅ Title + new game
3. ✅ Map + movement
4. ✅ Ashfen town + NPCs
5. ✅ Encounters + battle
6. ⏭️ First 30 Luminary (party/inventory menus + bond + evolutions first — see PROJECT_STATE.md)
7. First dungeon + Warden
8. Inventory + capture
9. Chapter 1 dialogue/choices
10. Echo Vault
11–15. Regions, dex, story acts 2–3, post-game, polish

## UI/UX

- Menus keyboard-navigable (arrows, Z/X)
- Battle: HP gradient bars, PP dots, bond visible, no turn order display
- Settings: music, SFX, text speed, window scale
- Dark fantasy UI: navy/slate, gold accents, runic borders

## Audio (future)

Region BGM, 3 battle tracks, SFX for hit/capture/level/menu/Echo Surge. Crossfade transitions.
