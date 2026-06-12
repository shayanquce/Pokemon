/**
 * Item definitions. Inventory in the save is { itemId: count }; anything
 * listed here renders in the Items menu. `heal` items are usable from the
 * pause menu and in battle (battle use consumes the turn).
 */
const ITEMS = {
  capture_orb: {
    id: 'capture_orb', name: 'Capture Orb', battleOnly: true,
    desc: 'A rune-bound orb that draws a weakened wild Luminary inside.',
  },
  ember_tonic: {
    id: 'ember_tonic', name: 'Ember Tonic', heal: 40,
    desc: 'Warm hearth-brew. Restores 40 HP to one Luminary.',
  },
  brine_salve: {
    id: 'brine_salve', name: 'Brine Salve', cures: true,
    desc: 'Stinging coastal remedy. Cures any one status condition.',
  },
  tide_tonic: {
    id: 'tide_tonic', name: 'Tide Tonic', heal: 80,
    desc: 'Cold deep-water draught. Restores 80 HP to one Luminary.',
  },
};
