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
};

/** Resolve a trainer id into a battle-ready object with a fresh party. */
function buildTrainer(trainerId) {
  const def = TRAINERS[trainerId];
  if (!def) throw new Error(`Unknown trainer: ${trainerId}`);
  return { ...def, party: def.buildParty(Save.state) };
}
