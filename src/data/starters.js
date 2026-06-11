/**
 * Luminary species + move data.
 *
 * Phase 1 ships the three starters using the FINAL schema — the remaining
 * 180+ species will be added to this same structure in later phases, so
 * nothing downstream has to change.
 */

/** Moves known by the starters, plus their Bond-unlocked signature moves. */
const MOVES = {
  cinder_snap: {
    id: 'cinder_snap', name: 'Cinder Snap', type: 'Flame', category: 'physical',
    power: 42, accuracy: 100, pp: 30,
    desc: 'A darting bite wreathed in embers.',
  },
  tail_glimmer: {
    id: 'tail_glimmer', name: 'Tail Glimmer', type: 'Light', category: 'support',
    power: 0, accuracy: 100, pp: 20, effect: 'raise_spa_1',
    desc: 'The tail-flame flares, sharpening the mind. Raises Sp. Attack.',
  },
  drip_lash: {
    id: 'drip_lash', name: 'Drip Lash', type: 'Tide', category: 'physical',
    power: 40, accuracy: 100, pp: 30,
    desc: 'A whip of pressurized brine.',
  },
  glowpulse: {
    id: 'glowpulse', name: 'Glowpulse', type: 'Psyche', category: 'special',
    power: 38, accuracy: 100, pp: 25,
    desc: 'A hypnotic ripple of bioluminescence.',
  },
  briar_swipe: {
    id: 'briar_swipe', name: 'Briar Swipe', type: 'Verdant', category: 'physical',
    power: 44, accuracy: 95, pp: 30,
    desc: 'A heavy paw studded with thorns.',
  },
  rootbrace: {
    id: 'rootbrace', name: 'Rootbrace', type: 'Verdant', category: 'support',
    power: 0, accuracy: 100, pp: 20, effect: 'raise_def_1',
    desc: 'Roots anchor the body to the earth. Raises Defense.',
  },
  // Mid-level moves learned by leveling (see each species' learnset).
  flame_burst: {
    id: 'flame_burst', name: 'Flame Burst', type: 'Flame', category: 'special',
    power: 55, accuracy: 100, pp: 15,
    desc: 'A blossom of fire that cracks the air.',
  },
  brine_jet: {
    id: 'brine_jet', name: 'Brine Jet', type: 'Tide', category: 'special',
    power: 52, accuracy: 100, pp: 15,
    desc: 'A needle-thin stream of deep-trench water.',
  },
  thorn_volley: {
    id: 'thorn_volley', name: 'Thorn Volley', type: 'Verdant', category: 'physical',
    power: 55, accuracy: 95, pp: 15,
    desc: 'A scattering of heartwood barbs.',
  },
  pebble_toss: {
    id: 'pebble_toss', name: 'Pebble Toss', type: 'Stone', category: 'physical',
    power: 40, accuracy: 100, pp: 25,
    desc: 'A hoarded stone, flung with surprising spite.',
  },
  // Early wild-Luminary moves (Whispergrove encounter table).
  leaf_dart: {
    id: 'leaf_dart', name: 'Leaf Dart', type: 'Verdant', category: 'physical',
    power: 35, accuracy: 100, pp: 30,
    desc: 'A flick of razor-edged leaves.',
  },
  gnaw: {
    id: 'gnaw', name: 'Gnaw', type: 'Beast', category: 'physical',
    power: 38, accuracy: 100, pp: 30,
    desc: 'Persistent, ill-tempered chewing.',
  },
  scrabble: {
    id: 'scrabble', name: 'Scrabble', type: 'Beast', category: 'support',
    power: 0, accuracy: 100, pp: 20, effect: 'raise_spe_1',
    desc: 'A frantic scurry that quickens the feet. Raises Speed.',
  },
  gust_flick: {
    id: 'gust_flick', name: 'Gust Flick', type: 'Wind', category: 'special',
    power: 36, accuracy: 100, pp: 30,
    desc: 'A snap of wing-pressed air.',
  },
  glimmer_dust: {
    id: 'glimmer_dust', name: 'Glimmer Dust', type: 'Light', category: 'special',
    power: 34, accuracy: 100, pp: 25,
    desc: 'Shed wing-scales that sting like sunlight.',
  },
  // North Road wild moves.
  spark_nip: {
    id: 'spark_nip', name: 'Spark Nip', type: 'Volt', category: 'physical',
    power: 40, accuracy: 100, pp: 30,
    desc: 'A static-charged bite that crackles on contact.',
  },
  wisp_flare: {
    id: 'wisp_flare', name: 'Wisp Flare', type: 'Spirit', category: 'special',
    power: 42, accuracy: 100, pp: 25,
    desc: 'A cold blue flame that passes through armor.',
  },
  hoof_rush: {
    id: 'hoof_rush', name: 'Hoof Rush', type: 'Beast', category: 'physical',
    power: 50, accuracy: 90, pp: 20,
    desc: 'A headlong charge with no plan B.',
  },
  stone_guard: {
    id: 'stone_guard', name: 'Stone Guard', type: 'Stone', category: 'support',
    power: 0, accuracy: 100, pp: 20, effect: 'raise_def_1',
    desc: 'Dust hardens into a granite shell. Raises Defense.',
  },
  zephyr_slice: {
    id: 'zephyr_slice', name: 'Zephyr Slice', type: 'Wind', category: 'special',
    power: 45, accuracy: 100, pp: 25,
    desc: 'A crescent of compressed air.',
  },
  gloom_fang: {
    id: 'gloom_fang', name: 'Gloom Fang', type: 'Shadow', category: 'physical',
    power: 45, accuracy: 100, pp: 25,
    desc: 'A bite from somewhere the light is not.',
  },
  // Signature moves — unlocked at high Bond, powered up at Bond 10 (Echo Surge).
  cindershroud: {
    id: 'cindershroud', name: 'Cindershroud', type: 'Flame', category: 'special',
    power: 70, accuracy: 100, pp: 8, signature: true,
    desc: 'A veil of living fire that scorches foes and shields its kin.',
  },
  lanternveil: {
    id: 'lanternveil', name: 'Lanternveil', type: 'Psyche', category: 'special',
    power: 65, accuracy: 100, pp: 8, signature: true,
    desc: 'Deep-sea light that bends thought and tide alike.',
  },
  bramblefort: {
    id: 'bramblefort', name: 'Bramblefort', type: 'Verdant', category: 'physical',
    power: 70, accuracy: 100, pp: 8, signature: true,
    desc: 'A crushing rampart of thorned heartwood.',
  },
};

const LUMINARY_SPECIES = {
  embrik: {
    id: 'embrik', dexNo: 1, name: 'Embrik', types: ['Flame'],
    baseStats: { hp: 44, atk: 56, def: 40, spa: 52, spd: 42, spe: 58 },
    evolution: { toId: 'embrath', to: 'Embrath', level: 16, note: 'Embrath evolves into Embralion (Flame/Light) at Lv 34.' },
    captureRate: 45, baseExp: 62,
    tagline: 'A hearth-fox. Quick, loyal, and brave to a fault.',
    lore: 'Embrik kindle from the last coal of a hearth kept burning for a hundred years. Its ember-tipped fur flares brightest when its bonded human is afraid — a small promise that it will not run.',
    signatureMove: 'cindershroud',
    learnset: [{ id: 'cinder_snap', level: 1 }, { id: 'tail_glimmer', level: 1 }, { id: 'flame_burst', level: 9 }],
  },
  tidalink: {
    id: 'tidalink', dexNo: 4, name: 'Tidalink', types: ['Tide'],
    baseStats: { hp: 50, atk: 40, def: 48, spa: 58, spd: 52, spe: 38 },
    evolution: { toId: 'tidarune', to: 'Tidarune', level: 14, note: 'Tidarune evolves into Runedeep (Tide/Psyche) at Lv 32.' },
    captureRate: 45, baseExp: 62,
    tagline: 'A glowing sea-slug. Patient, strange, and wise.',
    lore: 'Tidalink drift up from trenches no light has ever reached, carrying their own. Sailors of Keldrath say one lantern-slug on the prow is worth two lighthouses and one good prayer.',
    signatureMove: 'lanternveil',
    learnset: [{ id: 'drip_lash', level: 1 }, { id: 'glowpulse', level: 1 }, { id: 'brine_jet', level: 9 }],
  },
  thornpaw: {
    id: 'thornpaw', dexNo: 7, name: 'Thornpaw', types: ['Verdant'],
    baseStats: { hp: 58, atk: 56, def: 54, spa: 34, spd: 46, spe: 36 },
    evolution: { toId: 'thorngrove', to: 'Thorngrove', level: 15, note: 'Thorngrove evolves into Grovemaw (Verdant/Stone) at Lv 33.' },
    captureRate: 45, baseExp: 62,
    tagline: 'A bramble-cub. Stubborn, gentle, and immovable.',
    lore: 'Thornpaw are born where a forest refuses to die, vines knotting themselves into the shape of a cub. It hugs what it loves, thorns and all, and learns gentleness one scratch at a time.',
    signatureMove: 'bramblefort',
    learnset: [{ id: 'briar_swipe', level: 1 }, { id: 'rootbrace', level: 1 }, { id: 'thorn_volley', level: 9 }],
  },
  // --- Whispergrove wilds (the first capturable Luminary) ---
  sprigling: {
    id: 'sprigling', dexNo: 10, name: 'Sprigling', types: ['Verdant'],
    baseStats: { hp: 42, atk: 48, def: 44, spa: 30, spd: 38, spe: 44 },
    evolution: { toId: 'spriggrove', to: 'Spriggrove', level: 18 },
    tagline: 'A walking sapling with a temper.',
    lore: 'Sprigling sprout where Whispergrove trees drop their last seed. They guard their birth-spot fiercely, jabbing at anything that lingers — which the children of Ashfen consider a game.',
    captureRate: 200, baseExp: 52,
    learnset: [{ id: 'leaf_dart', level: 1 }, { id: 'rootbrace', level: 1 }, { id: 'briar_swipe', level: 8 }],
  },
  ashvole: {
    id: 'ashvole', dexNo: 12, name: 'Ashvole', types: ['Beast'],
    baseStats: { hp: 50, atk: 46, def: 40, spa: 28, spd: 36, spe: 50 },
    evolution: { toId: 'cindervole', to: 'Cindervole', level: 17 },
    tagline: 'An ash-grey vole that hoards warm stones.',
    lore: 'Ashvole line their burrows with sun-warmed pebbles and defend the collection with their lives. Travelers who leave a heated stone by a burrow mouth earn a small, fierce escort through the grove.',
    captureRate: 220, baseExp: 50,
    learnset: [{ id: 'gnaw', level: 1 }, { id: 'scrabble', level: 1 }, { id: 'pebble_toss', level: 7 }],
  },
  glimwing: {
    id: 'glimwing', dexNo: 14, name: 'Glimwing', types: ['Wind', 'Light'],
    baseStats: { hp: 38, atk: 32, def: 34, spa: 50, spd: 44, spe: 56 },
    evolution: { toId: 'lumenmoth', to: 'Lumenmoth', level: 19 },
    tagline: 'A dusk-moth that drinks starlight.',
    lore: 'Glimwing wings hold the last light they touched. A swarm roosting in the grove canopy can keep a clearing in soft daylight until dawn — which is why Ashfen never hangs lanterns.',
    captureRate: 190, baseExp: 55,
    learnset: [{ id: 'gust_flick', level: 1 }, { id: 'glimmer_dust', level: 1 }, { id: 'glowpulse', level: 9 }],
  },

  // --- First-stage evolutions (reachable in the Ashfen Lowlands) ---
  embrath: {
    id: 'embrath', dexNo: 2, name: 'Embrath', types: ['Flame'],
    baseStats: { hp: 58, atk: 72, def: 54, spa: 68, spd: 56, spe: 74 },
    evolution: { to: 'Embralion', level: 34, note: 'Embralion (Flame/Light) is defined in a later phase.' },
    tagline: 'The hearth-fox grown lean and bright.',
    lore: 'When an Embrik first shields its bonded human from real harm, its ember-fur ignites into a steady mane of flame. An Embrath never lets that fire gutter — it would mean the promise broke.',
    captureRate: 45, baseExp: 142,
    signatureMove: 'cindershroud',
    learnset: [{ id: 'cinder_snap', level: 1 }, { id: 'tail_glimmer', level: 1 }, { id: 'flame_burst', level: 9 }],
  },
  tidarune: {
    id: 'tidarune', dexNo: 5, name: 'Tidarune', types: ['Tide'],
    baseStats: { hp: 66, atk: 50, def: 62, spa: 76, spd: 68, spe: 46 },
    evolution: { to: 'Runedeep', level: 32, note: 'Runedeep (Tide/Psyche) is defined in a later phase.' },
    tagline: 'A lantern-slug etched with living glyphs.',
    lore: 'The light inside a Tidarune has begun to spell things. Sailors swear the glyphs on its mantle match the old Aethori tide-charts, and that a Tidarune dims when a ship should not sail.',
    captureRate: 45, baseExp: 142,
    signatureMove: 'lanternveil',
    learnset: [{ id: 'drip_lash', level: 1 }, { id: 'glowpulse', level: 1 }, { id: 'brine_jet', level: 9 }],
  },
  thorngrove: {
    id: 'thorngrove', dexNo: 8, name: 'Thorngrove', types: ['Verdant'],
    baseStats: { hp: 78, atk: 72, def: 70, spa: 42, spd: 58, spe: 42 },
    evolution: { to: 'Grovemaw', level: 33, note: 'Grovemaw (Verdant/Stone) is defined in a later phase.' },
    tagline: 'The bramble-cub stood up and kept growing.',
    lore: 'A Thorngrove walks on legs of knotted root and carries a young canopy on its back. Birds nest in it. It is extremely careful in doorways, and devastating everywhere else.',
    captureRate: 45, baseExp: 142,
    signatureMove: 'bramblefort',
    learnset: [{ id: 'briar_swipe', level: 1 }, { id: 'rootbrace', level: 1 }, { id: 'thorn_volley', level: 9 }],
  },
  spriggrove: {
    id: 'spriggrove', dexNo: 11, name: 'Spriggrove', types: ['Verdant'],
    baseStats: { hp: 60, atk: 68, def: 62, spa: 40, spd: 52, spe: 56 },
    tagline: 'The sapling that survived its own temper.',
    lore: 'A Sprigling that holds its ground long enough takes root in itself. Spriggrove patrol the grove edge in slow circuits, re-planting torn seedlings with absurd gentleness.',
    captureRate: 120, baseExp: 118,
    learnset: [{ id: 'leaf_dart', level: 1 }, { id: 'rootbrace', level: 1 }, { id: 'briar_swipe', level: 8 }, { id: 'thorn_volley', level: 18 }],
  },
  cindervole: {
    id: 'cindervole', dexNo: 13, name: 'Cindervole', types: ['Beast', 'Flame'],
    baseStats: { hp: 68, atk: 64, def: 54, spa: 44, spd: 50, spe: 68 },
    tagline: 'Its hoard finally caught fire. It is thrilled.',
    lore: 'Sometimes an Ashvole hoards one stone too warm. Cindervole carry their smoldering treasure in a chest-pouch of fireproof fur and have never once been cold.',
    captureRate: 120, baseExp: 116,
    learnset: [{ id: 'gnaw', level: 1 }, { id: 'scrabble', level: 1 }, { id: 'pebble_toss', level: 7 }, { id: 'cinder_snap', level: 17 }],
  },
  lumenmoth: {
    id: 'lumenmoth', dexNo: 15, name: 'Lumenmoth', types: ['Wind', 'Light'],
    baseStats: { hp: 54, atk: 40, def: 46, spa: 74, spd: 62, spe: 76 },
    tagline: 'A cathedral window that learned to fly.',
    lore: 'Lumenmoth wings are panes of hardened light, and moonless nights belong to them. The oldest ones are said to carry a sliver of the dawn Solen never came back to.',
    captureRate: 110, baseExp: 124,
    learnset: [{ id: 'gust_flick', level: 1 }, { id: 'glimmer_dust', level: 1 }, { id: 'glowpulse', level: 9 }],
  },

  // --- North Road wilds (Ashfen Lowlands, Lv 4–7) ---
  voltail: {
    id: 'voltail', dexNo: 16, name: 'Voltail', types: ['Volt'],
    baseStats: { hp: 44, atk: 50, def: 38, spa: 52, spd: 40, spe: 66 },
    tagline: 'A storm-squirrel with a lightning-rod tail.',
    lore: 'Voltail climb the tallest tree on the road before a storm and dare it to strike. The scorch-marks down their tails are kept like trophies, compared at length, and exaggerated.',
    captureRate: 180, baseExp: 62,
    learnset: [{ id: 'spark_nip', level: 1 }, { id: 'scrabble', level: 1 }, { id: 'zephyr_slice', level: 11 }],
  },
  mirewisp: {
    id: 'mirewisp', dexNo: 17, name: 'Mirewisp', types: ['Spirit'],
    baseStats: { hp: 40, atk: 30, def: 42, spa: 58, spd: 56, spe: 48 },
    tagline: 'A lantern that went looking for its keeper.',
    lore: 'Mirewisp gather where travelers last lost their way, burning softly over the safe path. Whether they are guiding you or collecting you is a subject Ashfen does not discuss after dark.',
    captureRate: 150, baseExp: 68,
    learnset: [{ id: 'wisp_flare', level: 1 }, { id: 'glimmer_dust', level: 5 }],
  },
  bristleboar: {
    id: 'bristleboar', dexNo: 18, name: 'Bristleboar', types: ['Beast'],
    baseStats: { hp: 62, atk: 60, def: 50, spa: 28, spd: 38, spe: 44 },
    tagline: 'A wall of quills with opinions about fences.',
    lore: 'Bristleboar plough the road-banks for roots and consider every fence a personal insult. Farmers along the North Road rebuild in spring and have learned to plant extra.',
    captureRate: 160, baseExp: 70,
    learnset: [{ id: 'gnaw', level: 1 }, { id: 'hoof_rush', level: 6 }, { id: 'stone_guard', level: 10 }],
  },
  pebblump: {
    id: 'pebblump', dexNo: 19, name: 'Pebblump', types: ['Stone'],
    baseStats: { hp: 56, atk: 48, def: 68, spa: 26, spd: 48, spe: 22 },
    tagline: 'A boulder that blinks if you stare long enough.',
    lore: 'Pebblump sleep for years in the road-cut and wake mid-rockslide, mildly apologetic. Carters leave the biggest stones alone on principle.',
    captureRate: 170, baseExp: 66,
    learnset: [{ id: 'pebble_toss', level: 1 }, { id: 'stone_guard', level: 1 }],
  },
  zephyrkit: {
    id: 'zephyrkit', dexNo: 20, name: 'Zephyrkit', types: ['Wind'],
    baseStats: { hp: 42, atk: 44, def: 36, spa: 48, spd: 42, spe: 70 },
    tagline: 'A cat made mostly of running away.',
    lore: 'Zephyrkit outrun everything, including their own meals, which they then have to track back down. The fastest ones learn to stop showing off. Eventually.',
    captureRate: 180, baseExp: 60,
    learnset: [{ id: 'zephyr_slice', level: 1 }, { id: 'scrabble', level: 1 }, { id: 'gust_flick', level: 5 }],
  },

  // --- Keldrath Coast wilds (gate + shore, Lv 8–12) ---
  brinepup: {
    id: 'brinepup', dexNo: 22, name: 'Brinepup', types: ['Tide', 'Beast'],
    baseStats: { hp: 54, atk: 56, def: 44, spa: 38, spd: 42, spe: 52 },
    tagline: 'A salt-crusted pup that herds the tide.',
    lore: 'Brinepup run the wave-line at dawn, barking the sea back into place. Keldrath fisherfolk swear the tide comes in twenty minutes late on mornings the pups oversleep.',
    captureRate: 170, baseExp: 74,
    learnset: [{ id: 'drip_lash', level: 1 }, { id: 'gnaw', level: 1 }, { id: 'brine_jet', level: 12 }],
  },
  gullwisp: {
    id: 'gullwisp', dexNo: 23, name: 'Gullwisp', types: ['Wind', 'Spirit'],
    baseStats: { hp: 44, atk: 36, def: 38, spa: 56, spd: 50, spe: 64 },
    tagline: 'The gull that never came ashore.',
    lore: 'Gullwisp ride the storm-edge where drowned sailors last saw land. They scream at ships that sail toward bad water — Keldrath harbor pays them in fish guts and gratitude.',
    captureRate: 150, baseExp: 76,
    learnset: [{ id: 'gust_flick', level: 1 }, { id: 'wisp_flare', level: 4 }, { id: 'zephyr_slice', level: 11 }],
  },
  saltshell: {
    id: 'saltshell', dexNo: 24, name: 'Saltshell', types: ['Tide', 'Stone'],
    baseStats: { hp: 60, atk: 50, def: 72, spa: 30, spd: 52, spe: 24 },
    tagline: 'A fist-sized fortress with opinions about waves.',
    lore: 'Saltshell armor themselves in whatever the sea regrets losing — coins, cleats, one famous tax ledger. Prying one off a dock piling takes two sailors and costs three friendships.',
    captureRate: 160, baseExp: 78,
    learnset: [{ id: 'pebble_toss', level: 1 }, { id: 'stone_guard', level: 1 }, { id: 'drip_lash', level: 8 }],
  },
  driftbloom: {
    id: 'driftbloom', dexNo: 25, name: 'Driftbloom', types: ['Verdant', 'Wind'],
    baseStats: { hp: 46, atk: 34, def: 40, spa: 58, spd: 54, spe: 58 },
    tagline: 'A flower that mistook the wind for soil.',
    lore: 'Driftbloom seeds root in the air itself, trailing petals like a slow comet. Where one finally settles, the coast grows a garden by spring — so children chase them with flowerpots.',
    captureRate: 150, baseExp: 75,
    learnset: [{ id: 'leaf_dart', level: 1 }, { id: 'gust_flick', level: 1 }, { id: 'glimmer_dust', level: 9 }],
  },
  sparkfin: {
    id: 'sparkfin', dexNo: 26, name: 'Sparkfin', types: ['Volt', 'Tide'],
    baseStats: { hp: 48, atk: 44, def: 38, spa: 60, spd: 44, spe: 68 },
    tagline: 'A storm in a puddle, and proud of it.',
    lore: 'Sparkfin school under thunderheads to drink the charge off the water. A netted Sparkfin will short every lantern on the boat, which is why Keldrath nets are wax-dipped and prayers are short.',
    captureRate: 150, baseExp: 77,
    learnset: [{ id: 'spark_nip', level: 1 }, { id: 'drip_lash', level: 5 }, { id: 'brine_jet', level: 13 }],
  },

  // --- Hollow Cave wild ---
  gloombat: {
    id: 'gloombat', dexNo: 21, name: 'Gloombat', types: ['Shadow', 'Wind'],
    baseStats: { hp: 46, atk: 52, def: 38, spa: 44, spd: 40, spe: 62 },
    tagline: 'It hangs where the cave forgets the sun.',
    lore: 'Gloombat drink the dark itself, and a colony can dim a torch from across the gallery. Miners pay them in fruit to leave one lantern alone.',
    captureRate: 150, baseExp: 72,
    learnset: [{ id: 'gloom_fang', level: 1 }, { id: 'gust_flick', level: 1 }, { id: 'zephyr_slice', level: 12 }],
  },
};

/** Order shown on the starter-selection screen. */
const STARTER_IDS = ['embrik', 'tidalink', 'thornpaw'];

/** Level-scaled stats (IVs/EVs hook in here in a later phase). */
function calcStats(species, level) {
  const b = species.baseStats;
  const stat = (base) => Math.floor((2 * base * level) / 100) + 5;
  return {
    hp: Math.floor((2 * b.hp * level) / 100) + level + 10,
    atk: stat(b.atk),
    def: stat(b.def),
    spa: stat(b.spa),
    spd: stat(b.spd),
    spe: stat(b.spe),
  };
}

/** Create a fresh Luminary instance (what actually lives in party/save data). */
function makeLuminary(speciesId, level) {
  const species = LUMINARY_SPECIES[speciesId];
  if (!species) throw new Error(`Unknown Luminary species: ${speciesId}`);
  const stats = calcStats(species, level);
  // Last 4 learnset moves available at this level.
  const known = species.learnset.filter((e) => e.level <= level).slice(-4);
  return {
    speciesId,
    name: species.name,
    nickname: null,
    level,
    exp: 0,
    bond: 1,
    stats,
    currentHp: stats.hp,
    status: null,
    moves: known.map((e) => ({ id: e.id, pp: MOVES[e.id].pp, maxPp: MOVES[e.id].pp })),
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  };
}
