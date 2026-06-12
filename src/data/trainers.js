/**
 * Trainer battle definitions. `party` is built at battle time so it can
 * react to the player's run (Lyra counter-picks the player's starter).
 */
const TRAINERS = {
  lyra1: {
    id: 'lyra1',
    name: 'Rival Lyra',
    introText: "Lyra sent out her Luminary. 'No holding back, {player}!'",
    winText: 'You defeated Rival Lyra!',
    loseText: "Lyra helped you up. 'Train harder. I need a rival worth chasing.'",
    reward: 300,
    buildParty(state) {
      // Counter-pick: her starter beats the player's ceremony choice.
      const counter = { embrik: 'tidalink', tidalink: 'thornpaw', thornpaw: 'embrik' };
      const starterId = state.starterId ?? state.dex?.caught?.[0] ?? 'embrik';
      return [makeLuminary(counter[starterId] ?? 'tidalink', 7), makeLuminary('glimwing', 5)];
    },
  },

  // --- Hollow Cave (first dungeon) ---
  acolyte_vren: {
    id: 'acolyte_vren',
    name: 'Acolyte Vren',
    introText: "Vren rapped his staff on the stone. 'The cave judges you now.'",
    winText: 'You defeated Acolyte Vren!',
    loseText: "Vren shook his head. 'The stones were not wrong about you yet.'",
    reward: 150,
    buildParty() {
      return [makeLuminary('pebblump', 6), makeLuminary('voltail', 6)];
    },
  },
  acolyte_sila: {
    id: 'acolyte_sila',
    name: 'Acolyte Sila',
    introText: "Sila bowed once. 'One honest fight, as promised.'",
    winText: 'You defeated Acolyte Sila!',
    loseText: "Sila helped you up. 'Honest enough. Come back stronger.'",
    reward: 150,
    buildParty() {
      return [makeLuminary('mirewisp', 7), makeLuminary('sprigling', 6)];
    },
  },
  warden_thane: {
    id: 'warden_thane',
    name: 'Warden Thane',
    introText: "Thane set his feet like a landslide. 'The Lowlands stand behind me, {player}.'",
    winText: 'You defeated Warden Thane and earned the LOWLANDS SIGIL!',
    loseText: "Thane steadied you with one hand. 'The Oath holds. Return when you can break it.'",
    reward: 600,
    wardenOath: true, // one-time full heal when his last mon falls below 30% HP
    setFlags: { badge_lowlands: true },
    buildParty() {
      return [makeLuminary('pebblump', 8), makeLuminary('bristleboar', 9), makeLuminary('thorngrove', 11)];
    },
  },

  // --- Keldrath cliffs: the rematch she promised ---
  lyra2: {
    id: 'lyra2',
    name: 'Rival Lyra',
    introText: "Lyra grinned over the wind. 'The coast taught me things, {player}. Keep up!'",
    winText: 'You defeated Rival Lyra — again!',
    loseText: "Lyra hauled you back from the cliff edge. 'Sloppy. The Chain won't be this gentle.'",
    reward: 500,
    buildParty(state) {
      // Her counter-pick has evolved alongside her.
      const counter = { embrik: 'tidarune', tidalink: 'thorngrove', thornpaw: 'embrath' };
      const starterId = state.starterId ?? state.dex?.caught?.[0] ?? 'embrik';
      return [makeLuminary('lumenmoth', 16), makeLuminary('brinepup', 15), makeLuminary(counter[starterId] ?? 'tidarune', 18)];
    },
  },

  // --- Chapter 1 closer: the Hollowed Chain reaches the coast ---
  chain_scout: {
    id: 'chain_scout',
    name: 'Chain Scout Veyl',
    introText: "The stranger's smile never moved. 'The echo, child. The Chain always collects.'",
    winText: 'You drove off the Hollowed Chain scout!',
    loseText: "Veyl turned away, unhurried. 'Keep it warm for us. We know the roads you sleep on.'",
    reward: 400,
    setFlags: { chapter: 2 },
    buildParty() {
      return [makeLuminary('gloombat', 11), makeLuminary('mirewisp', 12)];
    },
  },
};

/** Resolve a trainer id into a battle-ready object with a fresh party. */
function buildTrainer(trainerId) {
  const def = TRAINERS[trainerId];
  if (!def) throw new Error(`Unknown trainer: ${trainerId}`);
  return { ...def, party: def.buildParty(Save.state) };
}
