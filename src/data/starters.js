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
    evolution: { to: 'Embrath', level: 16, note: 'Embrath evolves into Embralion (Flame/Light) at Lv 34.' },
    captureRate: 45, baseExp: 62,
    tagline: 'A hearth-fox. Quick, loyal, and brave to a fault.',
    lore: 'Embrik kindle from the last coal of a hearth kept burning for a hundred years. Its ember-tipped fur flares brightest when its bonded human is afraid — a small promise that it will not run.',
    signatureMove: 'cindershroud',
    learnset: ['cinder_snap', 'tail_glimmer'],
  },
  tidalink: {
    id: 'tidalink', dexNo: 4, name: 'Tidalink', types: ['Tide'],
    baseStats: { hp: 50, atk: 40, def: 48, spa: 58, spd: 52, spe: 38 },
    evolution: { to: 'Tidarune', level: 14, note: 'Tidarune evolves into Runedeep (Tide/Psyche) at Lv 32.' },
    captureRate: 45, baseExp: 62,
    tagline: 'A glowing sea-slug. Patient, strange, and wise.',
    lore: 'Tidalink drift up from trenches no light has ever reached, carrying their own. Sailors of Keldrath say one lantern-slug on the prow is worth two lighthouses and one good prayer.',
    signatureMove: 'lanternveil',
    learnset: ['drip_lash', 'glowpulse'],
  },
  thornpaw: {
    id: 'thornpaw', dexNo: 7, name: 'Thornpaw', types: ['Verdant'],
    baseStats: { hp: 58, atk: 56, def: 54, spa: 34, spd: 46, spe: 36 },
    evolution: { to: 'Thorngrove', level: 15, note: 'Thorngrove evolves into Grovemaw (Verdant/Stone) at Lv 33.' },
    captureRate: 45, baseExp: 62,
    tagline: 'A bramble-cub. Stubborn, gentle, and immovable.',
    lore: 'Thornpaw are born where a forest refuses to die, vines knotting themselves into the shape of a cub. It hugs what it loves, thorns and all, and learns gentleness one scratch at a time.',
    signatureMove: 'bramblefort',
    learnset: ['briar_swipe', 'rootbrace'],
  },
  // --- Whispergrove wilds (the first capturable Luminary) ---
  sprigling: {
    id: 'sprigling', dexNo: 10, name: 'Sprigling', types: ['Verdant'],
    baseStats: { hp: 42, atk: 48, def: 44, spa: 30, spd: 38, spe: 44 },
    evolution: { to: 'Spriggrove', level: 18, note: 'Spriggrove is defined in a later phase.' },
    tagline: 'A walking sapling with a temper.',
    lore: 'Sprigling sprout where Whispergrove trees drop their last seed. They guard their birth-spot fiercely, jabbing at anything that lingers — which the children of Ashfen consider a game.',
    captureRate: 200, baseExp: 52,
    learnset: ['leaf_dart', 'rootbrace'],
  },
  ashvole: {
    id: 'ashvole', dexNo: 11, name: 'Ashvole', types: ['Beast'],
    baseStats: { hp: 50, atk: 46, def: 40, spa: 28, spd: 36, spe: 50 },
    evolution: { to: 'Cindervole', level: 17, note: 'Cindervole is defined in a later phase.' },
    tagline: 'An ash-grey vole that hoards warm stones.',
    lore: 'Ashvole line their burrows with sun-warmed pebbles and defend the collection with their lives. Travelers who leave a heated stone by a burrow mouth earn a small, fierce escort through the grove.',
    captureRate: 220, baseExp: 50,
    learnset: ['gnaw', 'scrabble'],
  },
  glimwing: {
    id: 'glimwing', dexNo: 12, name: 'Glimwing', types: ['Wind', 'Light'],
    baseStats: { hp: 38, atk: 32, def: 34, spa: 50, spd: 44, spe: 56 },
    evolution: { to: 'Lumenmoth', level: 19, note: 'Lumenmoth is defined in a later phase.' },
    tagline: 'A dusk-moth that drinks starlight.',
    lore: 'Glimwing wings hold the last light they touched. A swarm roosting in the grove canopy can keep a clearing in soft daylight until dawn — which is why Ashfen never hangs lanterns.',
    captureRate: 190, baseExp: 55,
    learnset: ['gust_flick', 'glimmer_dust'],
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
    moves: species.learnset.map((id) => ({ id, pp: MOVES[id].pp, maxPp: MOVES[id].pp })),
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  };
}
