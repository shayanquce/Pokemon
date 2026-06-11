/**
 * Map data — every walkable area lives here as ASCII tile rows plus its
 * exits (warp triggers), NPC placements, door flavor text and wild-encounter
 * table. WorldScene renders whatever map id it is handed.
 *
 * Tile legend:
 *   T tree (solid)      W water (solid)     S Save Shrine (solid, interact)
 *   R roof (solid)      B wall (solid)      D door (solid, interact)
 *   C cave rock (solid) c cave floor        e cave gravel (wild encounters)
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
      'TGGPPPPPPPPPPPPPPPPPPPPPPPPPPP', // 9  <- main street; east gate to North Road at (29,9)
      'TGGGGGFGGGGGGGPGGGGGGGFGGGGGGT', // 10
      'TGTGGGGGGGGGGGPGGGGGGGGGGGTGGT', // 11
      'TGGGGGGGGGGGGGPGGGGGGGGGGFGGGT', // 12
      'TGGFGGGGGTGGGGPGGGGGGGGGGGGGGT', // 13
      'TGGGGGGGGGGGGGPGGGGTGGGGGGGGGT', // 14
      'TGGGGGGGGGGGGGPGGGGGGGGGGGGGGT', // 15
      'TTTTTTTTTTTTTTPTTTTTTTTTTTTTTT', // 16 <- south exit to Whispergrove at (14,16)
    ],
    exits: [
      { x: 14, y: 16, to: 'ashfen_grove', toX: 14, toY: 1, facing: 'down' },
      { x: 29, y: 9, to: 'north_road', toX: 1, toY: 9, facing: 'right' },
    ],
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
        hiddenIfFlag: 'rival1_won', // she leaves for the coast after losing the road battle
        palette: { h: '#a03a4a', f: '#e8c39a', e: '#20203a', c: '#2a4a3a', g: '#d4af37', b: '#241d18' },
        dialogue: [
          "There you are. I watched the ceremony fire — it practically jumped at you. Mine, it just... considered.",
          "Doesn't matter. I'll out-train you by the time we reach Keldrath Coast. That's a promise, not a guess.",
          'Catch a few wild Luminary in the grove grass before you follow me north. You will need more than one friend out there.',
        ],
        repeatDialogue: ["Still here? I'm waiting out on the North Road, east gate. Come find me when you stop stalling, rival."],
        setFlags: { met_lyra: true },
      },
      {
        id: 'merchant_bram',
        name: 'Bram',
        x: 5, y: 10, facing: 'right',
        dialogue: [
          'Capture Orbs, tonics, rope, regrets — Bram stocks it all, and my cart finally rolled in from Keldrath this morning!',
          'Weaken a wild Luminary first, then throw an orb. And keep a tonic on you — the North Road is rougher than it looks.',
        ],
        repeatDialogue: ['Welcome back, friend. Browse away — shards spend the same everywhere.'],
        palette: { h: '#5a3a22', f: '#d8a878', e: '#20203a', c: '#8a5a2a', g: '#8a93a0', b: '#241d18' },
        shop: [
          { itemId: 'capture_orb', price: 200 },
          { itemId: 'ember_tonic', price: 150 },
        ],
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

  north_road: {
    id: 'north_road',
    name: 'Ashfen Lowlands — North Road',
    //       012345678901234567890123456789
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTPTTTTTTT', // 0  <- Hollow Cave mouth at (22,0)
      'TGGGGGTGGGGGGFGGGGGGGGPGGGGGGT', // 1
      'TGggggGGGGggggggGGGGggggGGGGGT', // 2
      'TGggggGGGGggggggGGGGggggGGFGGT', // 3
      'TGggggGGGGggggggGGGGggggGGGGGT', // 4
      'TGGGGGGTGGGGGGGGGGGGGGGGGTGGGT', // 5
      'TGFGGGGGGGGGGGGGGGGGGGGGGGGGGT', // 6
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGGGT', // 7
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGGGT', // 8  <- Lyra camps at (16,8)
      'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPT', // 9  <- west exit at (0,9); east blocked (Keldrath later)
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGGGT', // 10
      'TGGggggggGGGGTGGGGGggggggGGGGT', // 11
      'TGGggggggGGGGGGFGGGGggggggGGGT', // 12
      'TGGggggggGGGGGGGGGGGggggggGGGT', // 13
      'TGGGGTGGGGGGGGGGGGGGGGGGGGGGGT', // 14
      'TGGGGGGGGGGGFGGGGGGGGGGGGTGGGT', // 15
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 16
    ],
    exits: [
      { x: 0, y: 9, to: 'ashfen_town', toX: 28, toY: 9, facing: 'left' },
      { x: 22, y: 0, to: 'hollow_cave', toX: 22, toY: 15, facing: 'up' },
    ],
    doors: [],
    npcs: [
      {
        id: 'lyra_road',
        name: 'Lyra',
        x: 16, y: 8, facing: 'down',
        palette: { h: '#a03a4a', f: '#e8c39a', e: '#20203a', c: '#2a4a3a', g: '#d4af37', b: '#241d18' },
        dialogue: [
          'Took you long enough. The Keldrath gate-warden won\'t open the pass for unproven trainers — so prove something.',
          'You and me, {player}. Right here on the road. Show me the ceremony fire wasn\'t just being dramatic.',
        ],
        battle: { trainerId: 'lyra1', flag: 'rival1_won' },
        postWinDialogue: [
          'Okay. OKAY. That was— fine, that was real.',
          'I\'m heading for Keldrath Coast tonight. Train up, catch the pass-warden\'s eye, and don\'t you dare fall behind me.',
        ],
        repeatDialogue: ['Rematch later, rival. The coast is waiting for both of us.'],
      },
    ],
    encounters: {
      rate: 0.14,
      table: [
        { speciesId: 'voltail', weight: 25, min: 4, max: 6 },
        { speciesId: 'bristleboar', weight: 25, min: 4, max: 7 },
        { speciesId: 'zephyrkit', weight: 20, min: 4, max: 6 },
        { speciesId: 'pebblump', weight: 18, min: 5, max: 7 },
        { speciesId: 'mirewisp', weight: 12, min: 5, max: 7 },
      ],
    },
  },

  hollow_cave: {
    id: 'hollow_cave',
    name: 'Hollow Cave',
    //       012345678901234567890123456789
    rows: [
      'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCC', // 0
      'CCCCCCCCCCCcccccccCCCCCCCCCCCC', // 1  <- Warden chamber
      'CCCCCCCCCCCcccccccCCCCCCCCCCCC', // 2  <- Warden Thane at (14,2)
      'CCCCCCCCCCCcccccccCCCCCCCCCCCC', // 3
      'CCCCCCCCCCCCCCcCCCCCCCCCCCCCCC', // 4  <- neck
      'CCCCeeeeccccccccccccceeeeCCCCC', // 5
      'CCCCeeeeccccccccccccceeeeCCCCC', // 6  <- Acolyte Sila at (10,6)
      'CCCCcccccccccccccccccccccCCCCC', // 7
      'CCCCcCCCCCCCCCCCCCCCCCCCcCCCCC', // 8  <- twin necks (4,8) and (24,8)
      'CCCCcccccccccccccccccccccCCCCC', // 9
      'CCCCCCCCCCCCcCCCCCCCCCCCCCCCCC', // 10 <- neck
      'CCCCCCCCCeecccceeCCCCCCCCCCCCC', // 11
      'CCCCCCCCCcccccccCCCCCCCCCCCCCC', // 12 <- Acolyte Vren at (12,12)
      'CCCCCCcccccccccccccccccCCCCCCC', // 13
      'CCCCCCCCCCCCCCCCCCCCCCcCCCCCCC', // 14
      'CCCCCCCCCCCCCCCCCCCCCCcCCCCCCC', // 15
      'CCCCCCCCCCCCCCCCCCCCCCcCCCCCCC', // 16 <- mouth back to the road at (22,16)
    ],
    exits: [{ x: 22, y: 16, to: 'north_road', toX: 22, toY: 1, facing: 'down' }],
    doors: [],
    npcs: [
      {
        id: 'acolyte_vren',
        name: 'Acolyte Vren',
        x: 12, y: 12, facing: 'down',
        palette: { h: '#3a4a66', f: '#d8a878', e: '#20203a', c: '#39404f', g: '#9a8a66', b: '#241d18' },
        dialogue: [
          'Halt. The Warden takes no visitors while the deep stones are restless.',
          'You want the Sigil? Then show me the Lowlands taught you something.',
        ],
        battle: { trainerId: 'acolyte_vren', flag: 'acolyte_vren_won' },
        postWinDialogue: ['Hm. The stones did not warn me about you. Go on — Sila guards the upper gallery.'],
        repeatDialogue: ['The Warden is past the upper gallery. Mind the gravel beds — things nest in them.'],
      },
      {
        id: 'acolyte_sila',
        name: 'Acolyte Sila',
        x: 10, y: 6, facing: 'down',
        palette: { h: '#c8c2b4', f: '#e0bc94', e: '#20203a', c: '#39404f', g: '#9a8a66', b: '#241d18' },
        dialogue: [
          'Vren let you through? Then you have earned one honest fight, traveler.',
          'The Warden bends for no one who could not bend me.',
        ],
        battle: { trainerId: 'acolyte_sila', flag: 'acolyte_sila_won' },
        postWinDialogue: ['Well bent. The Warden waits in the high chamber. Speak plainly — he respects little else.'],
        repeatDialogue: ['Straight up the neck of stone. He already knows you are coming.'],
      },
      {
        id: 'warden_thane',
        name: 'Warden Thane',
        x: 14, y: 2, facing: 'down',
        palette: { h: '#8a93a0', f: '#caa07a', e: '#20203a', c: '#5e564c', g: '#d4af37', b: '#241d18' },
        dialogue: [
          'So. The one the ceremony fire leapt for. My acolytes speak well of your knuckles, {player}.',
          'I am Thane, Warden of the Lowlands. This cave holds the first Sigil — and I hold this cave.',
          'When my last stone stands bloodied, I invoke the Oath. Endure that, and the Sigil is yours.',
        ],
        battle: { trainerId: 'warden_thane', flag: 'warden1_won' },
        postWinDialogue: [
          'The Oath broke against you. That has not happened since Lyra\'s father stood where you stand.',
          'Take the Lowlands Sigil, {player}. The pass-warden at Keldrath will open the coast road for its bearer.',
          'One more thing. The Hollowed Chain was seen on the coast asking after an "echo". Walk carefully.',
        ],
        repeatDialogue: ['The Sigil is yours, bearer. The coast road past Keldrath is open to you — when the next region is built.'],
      },
    ],
    encounters: {
      rate: 0.16,
      table: [
        { speciesId: 'gloombat', weight: 45, min: 6, max: 9 },
        { speciesId: 'pebblump', weight: 35, min: 6, max: 9 },
        { speciesId: 'mirewisp', weight: 20, min: 7, max: 9 },
      ],
    },
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
