/**
 * Map data — every walkable area lives here as ASCII tile rows plus its
 * exits (warp triggers), NPC placements, door flavor text and wild-encounter
 * table. WorldScene renders whatever map id it is handed.
 *
 * Tile legend:
 *   T tree (solid)      W water (solid)     S Save Shrine (solid, interact)
 *   R roof (solid)      B wall (solid)      D door (solid, interact)
 *   G grass             g tall grass (wild encounters)
 *   P path              F flowers
 */
const MAPS = {
  ashfen_grove: {
    id: 'ashfen_grove',
    name: 'Ashfen — Whispergrove',
    //       012345678901234567890123456789
    rows: [
      'TTTTTTTTTTTTTTPTTTTTTTTTTTTTTT', // 0  <- north exit to town at (14,0)
      'TGGGGGGGGGGFGGPGGGGGGGGWWWWWWT', // 1
      'TGGGFGGGGGGGGGPGGTGGGGWWWWWWWT', // 2
      'TGGGGGGGGGGGGGPGGGGGGGWWWWWWGT', // 3
      'TGGTGGGGGGGGGGPGGGGGGGGWWWWGGT', // 4
      'TGGGGGGGGGGPPPPPPPPPGGGGWWGGGT', // 5
      'TGGGGGGFGGPGGGGGGGPGGGGGGGGGGT', // 6
      'TGggGGGGGGPGGSGGGGPGGGGFGGGGGT', // 7  <- Save Shrine at (13,7)
      'TGggggGGGGPGGGGGGGPGGGGGGGTGGT', // 8
      'TGggggGGGGPPPPPPPPPGGGGGGGGGGT', // 9
      'TGGggGGGGGGGGGPGGGGGGggggGGGGT', // 10
      'TGGGGGGTGGGGGGPGGGGGGggggggGGT', // 11
      'TGGGGGGGGGGGGGPGGGGGGGggggGGGT', // 12
      'TGFGGGGGGGGGGGPGGGGGGGGGGGGGGT', // 13
      'TGGGGGGGGGGGGGPGGGGTGGGGGFGGGT', // 14
      'TGGGGGGGGGGGGGPGGGGGGGGGGGGGGT', // 15
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 16
    ],
    exits: [{ x: 14, y: 0, to: 'ashfen_town', toX: 14, toY: 15, facing: 'up' }],
    doors: [],
    npcs: [
      {
        id: 'old_tomas',
        name: 'Old Tomas',
        x: 12, y: 8, facing: 'down',
        palette: { h: '#c8c2b4', f: '#d8b08a', e: '#20203a', c: '#5a4a3a', g: '#8a93a0', b: '#241d18' },
        dialogue: [
          'They say a Save Shrine remembers everything it sees. Every traveler, every storm, every goodbye.',
          'A hundred years ago the hero Solen passed this very grove, they say. Bonded to a god and gone by morning.',
          'You carry yourself like someone the shrines will remember, child. Rest here whenever the road turns dark.',
        ],
        repeatDialogue: ['The shrine remembers, child. Make sure it has something worth remembering.'],
      },
    ],
    encounters: {
      rate: 0.14,
      table: [
        { speciesId: 'sprigling', weight: 40, min: 2, max: 4 },
        { speciesId: 'ashvole', weight: 35, min: 2, max: 4 },
        { speciesId: 'glimwing', weight: 25, min: 3, max: 4 },
      ],
    },
  },

  ashfen_town: {
    id: 'ashfen_town',
    name: 'Ashfen Town',
    //       012345678901234567890123456789
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 0
      'TGGFGGGGGGGGRRRRRRGGGGGGGFGGGT', // 1  <- Elder Hall roof
      'TGGGGGGGGGGGRRRRRRGGGGGGGGGGGT', // 2
      'TGGGGGGGGGGGBBDBBBGGGGGGGGGGGT', // 3  <- Elder Hall door at (14,3)
      'TGGGGGGGGGGGGGPGGGGGGGGGGGGGGT', // 4
      'TGGGRRRRGGGGGGPGGGGGGRRRRGGGGT', // 5  <- west + east house roofs
      'TGGGRRRRGGGGGGPGGGGGGRRRRGGGGT', // 6
      'TGGGBBDBGGGGGGPGGGGGGBDBBGGGGT', // 7  <- doors at (6,7) and (22,7)
      'TGGGGGPGGGGGGGPGGGGGGGPGGGGGGT', // 8
      'TGGPPPPPPPPPPPPPPPPPPPPPPPGGGT', // 9  <- main street
      'TGGGGGFGGGGGGGPGGGGGGGFGGGGGGT', // 10
      'TGTGGGGGGGGGGGPGGGGGGGGGGGTGGT', // 11
      'TGGGGGGGGGGGGGPGGGGGGGGGGFGGGT', // 12
      'TGGFGGGGGTGGGGPGGGGGGGGGGGGGGT', // 13
      'TGGGGGGGGGGGGGPGGGGTGGGGGGGGGT', // 14
      'TGGGGGGGGGGGGGPGGGGGGGGGGGGGGT', // 15
      'TTTTTTTTTTTTTTPTTTTTTTTTTTTTTT', // 16 <- south exit to Whispergrove at (14,16)
    ],
    exits: [{ x: 14, y: 16, to: 'ashfen_grove', toX: 14, toY: 1, facing: 'down' }],
    doors: [
      { x: 14, y: 3, text: 'The Elder Hall. The doors are barred while the bonding-ceremony embers cool.' },
      { x: 6, y: 7, text: "Bram's house. A note on the door reads: \"Out front — mind the crates.\"" },
      { x: 22, y: 7, text: "Lyra's family home. It is quiet inside, as it has been since her father left." },
    ],
    npcs: [
      {
        id: 'elder_maren',
        name: 'Elder Maren',
        x: 16, y: 5, facing: 'down',
        palette: { h: '#d8d2c4', f: '#e0bc94', e: '#20203a', c: '#6a5a8a', g: '#d4af37', b: '#241d18' },
        dialogue: [
          'So the embers settle, and Ashfen has one more bonded soul. The ceremony fire chose well, {player}.',
          'Your Luminary is young, as you are. Bond grows in shared danger and shared rest — never in a vault.',
          'One more thing. The fragment you carry... the Echo. Keep it close, and tell no stranger of it. The Hollowed Chain has ears even this far south.',
        ],
        repeatDialogue: ['Rest at the shrine in Whispergrove before you take the north road, {player}. Veranthis is patient. Be patient back.'],
        setFlags: { ceremony_complete: true },
      },
      {
        id: 'lyra',
        name: 'Lyra',
        x: 12, y: 10, facing: 'down',
        palette: { h: '#a03a4a', f: '#e8c39a', e: '#20203a', c: '#2a4a3a', g: '#d4af37', b: '#241d18' },
        dialogue: [
          "There you are. I watched the ceremony fire — it practically jumped at you. Mine, it just... considered.",
          "Doesn't matter. I'll out-train you by the time we reach Keldrath Coast. That's a promise, not a guess.",
          'Catch a few wild Luminary in the grove grass before you follow me north. You will need more than one friend out there.',
        ],
        repeatDialogue: ["Still here? I'm leaving for the north road at first light. Try to keep up, rival."],
        setFlags: { met_lyra: true },
      },
      {
        id: 'merchant_bram',
        name: 'Bram',
        x: 5, y: 10, facing: 'right',
        dialogue: [
          'Capture Orbs, tonics, rope, regrets — Bram stocks it all. Well. Once my cart arrives from Keldrath, anyway.',
          'You were given five Capture Orbs at the ceremony, eh? Weaken a wild Luminary first, then throw. Orbs are not free, friend.',
        ],
        repeatDialogue: ['When my cart arrives, the shop opens. Until then, those five orbs are your whole purse — aim well.'],
        palette: { h: '#5a3a22', f: '#d8a878', e: '#20203a', c: '#8a5a2a', g: '#8a93a0', b: '#241d18' },
      },
      {
        id: 'kid_finn',
        name: 'Finn',
        x: 20, y: 13, facing: 'left',
        palette: { h: '#e8c84a', f: '#e8c39a', e: '#20203a', c: '#3f7fd0', g: '#8a93a0', b: '#241d18' },
        dialogue: [
          'Psst! The tall grass in Whispergrove RUSTLES at night. Ma says wild Luminary nest in it.',
          'A Sprigling chased me out of there yesterday! It had thorns! You have a Luminary — you go look!',
        ],
        repeatDialogue: ['Did you find the Sprigling?! Was it angry?! I bet it was angry.'],
      },
    ],
    encounters: null,
  },
};

/** Map a weighted encounter table entry to a concrete wild Luminary spec. */
function rollEncounter(encounters, rng = Math.random) {
  const total = encounters.table.reduce((s, e) => s + e.weight, 0);
  let roll = rng() * total;
  for (const entry of encounters.table) {
    roll -= entry.weight;
    if (roll <= 0) {
      const level = entry.min + Math.floor(rng() * (entry.max - entry.min + 1));
      return { speciesId: entry.speciesId, level };
    }
  }
  const last = encounters.table[encounters.table.length - 1];
  return { speciesId: last.speciesId, level: last.min };
}
