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
        // Once the Lowlands Sigil is won, Maren's counsel changes.
        conditionalDialogue: [
          {
            flag: 'badge_lowlands',
            stateKey: 'postBadge',
            pages: [
              'The Lowlands Sigil. Thane does not part with that stone for charm, {player}. So it begins.',
              'Listen well. If strangers ask after your Echo, they have already found you. Do not let them choose the ground.',
              "Lyra went to the coast chasing her father's shadow. Watch over her when your roads cross — promises weigh more out there.",
            ],
            repeat: ['The Echo grows louder around you, child. Let it. Solen chose its keeper well.'],
          },
        ],
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
          { itemId: 'tide_tonic', price: 300 },
          { itemId: 'brine_salve', price: 160 },
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
      'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPP', // 9  <- west exit at (0,9); east exit to Keldrath gate at (29,9)
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
      { x: 29, y: 9, to: 'keldrath_gate', toX: 1, toY: 9, facing: 'right' },
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
  keldrath_gate: {
    id: 'keldrath_gate',
    name: 'Keldrath Gate',
    //       012345678901234567890123456789
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 0
      'TGGGGGGTGGGGGGGGGGGBssssssWWWT', // 1
      'TGggggGGGGGGFGGGGGGBssssssWWWT', // 2  <- west grass: coast wilds
      'TGggggGGGGGGGGGGGGGBsssssWWWWT', // 3
      'TGggggGGGGGGGGGGGGGBssssWWWWWT', // 4
      'TGGGGGGGGGGTGGGGGGGBssssssWWWT', // 5
      'TGGGGGGGGGGGGGGGGGGBsssssssWWT', // 6
      'TGGFGGGGGGGGGGGGGGGBssssssssWT', // 7
      'TGGGGGGGGGGGGGGGGGGBsssssssssT', // 8  <- warden steps aside to (18,8)
      'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPP', // 9  <- gate gap at (19,9); exits (0,9) and (29,9)
      'TGGGGGGGGGGGGGGGGGGBsssssssssT', // 10
      'TGGGGGGGTGGGGGGGGGGBssssssssWT', // 11
      'TGGggggGGGGGGGGGGGGBsssssssWWT', // 12
      'TGGggggGGGGGGGGGGGGBssssssWWWT', // 13
      'TGGggggGGGGGGGGGGGGBsssssWWWWT', // 14
      'TGGGGGFGGGGGGGGGGGGBssssWWWWWT', // 15
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 16
    ],
    exits: [
      { x: 0, y: 9, to: 'north_road', toX: 28, toY: 9, facing: 'left' },
      { x: 29, y: 9, to: 'keldrath_town', toX: 1, toY: 9, facing: 'right' },
    ],
    doors: [],
    npcs: [
      {
        id: 'pass_warden_hale',
        name: 'Pass-Warden Hale',
        x: 19, y: 9, facing: 'left',
        palette: { h: '#4a5a6e', f: '#caa07a', e: '#20203a', c: '#5e564c', g: '#d4af37', b: '#241d18' },
        gate: {
          requiresFlag: 'badge_lowlands',
          grantsFlag: 'coast_pass_granted',
          asideX: 18, asideY: 8,
          deniedDialogue: [
            'Hold there, traveler. The coast road is closed to the unproven — Hollowed Chain trouble past the dunes.',
            'Warden Thane holds the Lowlands Sigil in his cave on the North Road. Bring me his stone and I will stand aside.',
          ],
          grantedDialogue: [
            'That weight on your belt — the Lowlands Sigil? So the Oath finally broke against someone.',
            'The coast is yours to walk, {player}. Mind the surf-grass, and mind who asks your business in Keldrath. Not everyone selling rope is a sailor.',
          ],
        },
        repeatDialogue: ['The gate stands open for the Sigil-bearer. Keldrath is east along the shore.'],
      },
      {
        // Appears on the shore once the harbor rumor is heard; driven off for
        // good (hiddenIfFlag) when the battle is won — Chapter 1's closer.
        id: 'chain_scout',
        name: 'Stranger',
        x: 24, y: 5, facing: 'down',
        showIfFlag: 'heard_chain_rumor',
        hiddenIfFlag: 'chain_scout_beaten',
        palette: { h: '#2c2c38', f: '#cfae96', e: '#4a1c28', c: '#43355e', g: '#8a93a0', b: '#1c1620' },
        dialogue: [
          'A traveler. With a Sigil. With... ah. There it is — the hum behind your heartbeat.',
          'The Hollowed Chain pays well for echoes, child. And it pays other ways, too.',
        ],
        battle: { trainerId: 'chain_scout', flag: 'chain_scout_beaten' },
      },
    ],
    encounters: {
      rate: 0.14,
      table: [
        { speciesId: 'brinepup', weight: 26, min: 8, max: 11 },
        { speciesId: 'gullwisp', weight: 22, min: 8, max: 12 },
        { speciesId: 'driftbloom', weight: 22, min: 8, max: 11 },
        { speciesId: 'sparkfin', weight: 16, min: 9, max: 12 },
        { speciesId: 'saltshell', weight: 14, min: 9, max: 12 },
      ],
    },
  },

  keldrath_town: {
    id: 'keldrath_town',
    name: 'Keldrath Coast — Harborside',
    //       012345678901234567890123456789
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTPTTTTTTTT', // 0  <- north exit to the cliff road at (21,0)
      'TGGGGGRRRRGGGGGGGRRRRGGGsssWWT', // 1
      'TGGGGGRRRRGGGGGGGRRRRGGssssWWT', // 2
      'TGGGGGBBDBGGGGGGGBDBBGGsssWWWT', // 3  <- doors at (8,3) and (18,3)
      'TGGGGGGGPGGGGGGGGGPGGGGssssWWT', // 4
      'TFGGGGGGPGGGGGGGGGPGGGGsssWWWT', // 5
      'TGGGGGGGPGGGGGGGGGPGGGGssssWWT', // 6
      'TGGGGGGGPPPPPPPPPPPGGGGsssWWWT', // 7
      'TGGGGGGGPGGGGGGGGGGGGGGssssWWT', // 8
      'PPPPPPPPPGGGGSGGGGGGGGGsssWWWT', // 9  <- west exit (0,9); shrine at (13,9)
      'TGGGGGGGPGGGGGGGGGGGGGGssssWWT', // 10
      'TGGGGGGGPGGGGGGGGGGGGPPPPPWWWT', // 11 <- pier path onto the sand
      'TGGGGGGGPGGGGGGGGGGGGGGssssWWT', // 12
      'TGGFGGGGPGGGGGGGGGGGGGGsssWWWT', // 13
      'TGGGGGGGGGGGGGGGTGGGGGGssssWWT', // 14
      'TGGGGGGGGGGGGGGGGGGGGGGsssWWWT', // 15
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 16
    ],
    exits: [
      { x: 0, y: 9, to: 'keldrath_gate', toX: 28, toY: 9, facing: 'left' },
      { x: 21, y: 0, to: 'keldrath_cliffs', toX: 21, toY: 15, facing: 'up' },
    ],
    doors: [
      { x: 8, y: 3, text: 'The harbormaster\'s office. A slate reads: "No berths. No exceptions. Stop asking, Pim."' },
      { x: 18, y: 3, text: 'A chandlery smelling of tar and oranges. The shutters are drawn against the wind.' },
    ],
    npcs: [
      {
        id: 'dockmaster_orla',
        name: 'Dockmaster Orla',
        x: 12, y: 7, facing: 'down',
        palette: { h: '#3a3430', f: '#b88a64', e: '#20203a', c: '#6e3a2e', g: '#d4af37', b: '#241d18' },
        dialogue: [
          'New face. Sigil on the belt. You will want the noticeboard, the shrine, and to stay out of the chandlery after dark — in that order.',
          'Strangers came through last week asking after an "echo". Paid in old coin, smiled too much. The harbor did not like them, and the harbor is never wrong.',
        ],
        repeatDialogue: ['Keep your echo quiet and your knots tight, Sigil-bearer.'],
        setFlags: { heard_chain_rumor: true },
      },
      {
        id: 'sailor_pim',
        name: 'Pim',
        x: 21, y: 11, facing: 'left',
        palette: { h: '#e8c84a', f: '#d8a878', e: '#20203a', c: '#3f7fd0', g: '#8a93a0', b: '#241d18' },
        dialogue: [
          'A red-haired trainer blew through yesterday — beat two deckhands and the cook, then asked which road runs north along the cliffs.',
          'Said her name like a challenge. Lyra? Lyra. If you know her, my advice is: train.',
        ],
        repeatDialogue: ['The cliff road north is past the dunes. The cook still will not talk about it.'],
      },
      {
        // Free full heal — Keldrath's answer to the missing healer house.
        id: 'dockside_maeve',
        name: 'Maeve',
        x: 10, y: 11, facing: 'right',
        healer: true,
        palette: { h: '#6a8a5a', f: '#e0bc94', e: '#20203a', c: '#8a5a7a', g: '#d4af37', b: '#241d18' },
        dialogue: [
          "Sit. You look like the cliffs won. I mend Luminary faster than the shrine, and I don't ask the sea's permission.",
          'There — rested, mended, and not a shard owed. Keldrath looks after its walkers.',
        ],
        repeatDialogue: ['Back on my bench already? Good. Better here than the bottom of the cliffs.'],
      },
      {
        id: 'shell_nina',
        name: 'Nina',
        x: 24, y: 9, facing: 'down',
        palette: { h: '#a03a4a', f: '#e8c39a', e: '#20203a', c: '#c97ba0', g: '#8a93a0', b: '#241d18' },
        dialogue: [
          'Shh — there is a Saltshell on the third piling and it has my hairpin IN ITS ARMOR.',
          'Papa says if I weaken it with a Luminary first, an orb might hold it. Papa also says my hairpin is "gone to the sea now". The sea can give it BACK.',
        ],
        repeatDialogue: ['The Saltshell is still down there. I can hear it being smug.'],
      },
    ],
    encounters: null,
  },
  keldrath_cliffs: {
    id: 'keldrath_cliffs',
    name: 'Keldrath Cliffs',
    //       012345678901234567890123456789
    rows: [
      'CCCCCCCCCCCCCCCCCCCCCPCCCCCCCC', // 0  <- north gap (future region; wayfarer blocks at (21,1))
      'CGGGGGGGGGCGGGGGGGGGGPGGGCCWWC', // 1
      'CGggggGGGGGGGGggggGGGPGGGCWWWC', // 2
      'CGggggGGGGGGGGggggGGGPGGGCWWWC', // 3
      'CGggggGGGGCGGGggggGGGPGGGGCWWC', // 4
      'CGGGGGGGGGGGGGGGGGGGGPGGGGCWWC', // 5
      'CCGGGGGGCCCGGGGGGGGGGPGGGGGCWC', // 6
      'CGGFGGGGGGGGGGGGGGGGGPGGGGGCWC', // 7
      'CGGGGGGGGGGGGGGGGGGGGPGGGGGCWC', // 8  <- Lyra waits at (20,8)
      'CGGGGGGGGGCGGGGGGGGGGPGGGGGCWC', // 9
      'CGggggGGGGGGGGGGggggGPGGGGGCWC', // 10
      'CGggggGGGGGGGGGGggggGPGGGGCWWC', // 11
      'CGggggGGGGCGGGGGggggGPGGGGCWWC', // 12
      'CGGGGGGGGGGGGGGGGGGGGPGGGCWWWC', // 13
      'CGGGGGGCGGGGGGGGGGGGGPGGGCWWWC', // 14
      'CGGGGGGGGGGGGGGGGGGGGPGGGCCWWC', // 15
      'CCCCCCCCCCCCCCCCCCCCCPCCCCCCCC', // 16 <- south exit back to Harborside at (21,16)
    ],
    exits: [
      { x: 21, y: 16, to: 'keldrath_town', toX: 21, toY: 1, facing: 'down' },
      { x: 21, y: 0, to: 'mirewood_marsh', toX: 21, toY: 15, facing: 'up' },
    ],
    doors: [],
    npcs: [
      {
        id: 'lyra_cliffs',
        name: 'Lyra',
        x: 20, y: 8, facing: 'down',
        palette: { h: '#a03a4a', f: '#e8c39a', e: '#20203a', c: '#2a4a3a', g: '#d4af37', b: '#241d18' },
        dialogue: [
          'Knew it. Sigil on your belt, sea in your boots — and STILL slower than me up a cliff.',
          "Father climbed this road once. The Chain was waiting at the top. So before either of us goes higher — show me you've grown, {player}.",
        ],
        battle: { trainerId: 'lyra2', flag: 'rival2_won' },
        postWinDialogue: [
          'Hah. There it is. That fire the ceremony saw first.',
          "The wayfarer says the high pass is shut until the storms turn. When it opens, the second Warden — and whatever the Chain left up there — is mine first. Race you.",
        ],
        repeatDialogue: ['Train in the cliff grass. The wilds up here have grown into themselves — so should we.'],
      },
      {
        id: 'wayfarer_oren',
        name: 'Wayfarer Oren',
        x: 21, y: 1, facing: 'down',
        palette: { h: '#c8c2b4', f: '#caa07a', e: '#20203a', c: '#5e564c', g: '#9a8a66', b: '#241d18' },
        gate: {
          requiresFlag: 'rival2_won',
          grantsFlag: 'pass_cleared',
          asideX: 20, asideY: 1,
          deniedDialogue: [
            'Turn back, friend. The high pass is buried — storm after storm, like the sky is guarding something.',
            'The red-haired one on the road below says she is waiting for someone worth racing. Settle that first; the mountain respects finished business.',
          ],
          grantedDialogue: [
            'The storms turned last night — first time in a season. And here you stand. Hm.',
            'The pass runs down into Mirewood, {player}. Keep to the lanternreeds, pay the mire its silence, and mind any stranger who smiles too easily.',
          ],
        },
        repeatDialogue: ['The pass holds for now. Mirewood is down and north — follow the reeds that stay lit.'],
      },
    ],
    encounters: {
      rate: 0.15,
      table: [
        { speciesId: 'voltail', weight: 20, min: 13, max: 16 },
        { speciesId: 'zephyrkit', weight: 20, min: 13, max: 16 },
        { speciesId: 'gullwisp', weight: 18, min: 13, max: 17 },
        { speciesId: 'sparkfin', weight: 12, min: 14, max: 17 },
        { speciesId: 'zephyrlynx', weight: 11, min: 18, max: 20 },
        { speciesId: 'stormtail', weight: 10, min: 18, max: 20 },
        { speciesId: 'gloomshroud', weight: 9, min: 20, max: 22 },
      ],
    },
  },
  mirewood_marsh: {
    id: 'mirewood_marsh',
    name: 'Mirewood — Drowned Eaves',
    //       012345678901234567890123456789
    rows: [
      'TTTTTTTTTTTTTTPTTTTTTTTTTTTTTT', // 0  <- north exit to Reedlight Village at (14,0)
      'TGGmmmGGGGTGGGGGGGGGGGGmmmGGGT', // 1
      'TGGmmmGGGGGGGGmmmmGGGGGmmmGGGT', // 2
      'TGGmmmGGGGGGGGmmmmGGGGGGGGGGGT', // 3
      'TGGGGGGGTGGGGGmmmmGGGTGGGGGGGT', // 4
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGGGT', // 5  <- Chain stalker lurks at (8,5)
      'TGGGGGWWWGGGGGGGGGGGGGWWWGGGGT', // 6
      'TGGGGWWWWWGGGGSGGGGGGWWWWWGGGT', // 7  <- Save Shrine at (14,7)
      'TGGGGGWWWGGGGGGGGGGGGGWWWGGGGT', // 8
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGGGG', // 9  <- Bog Hermit at (25,9); east exit to the sanctum at (29,9)
      'TGGmmmmGGGGTGGGGGGGGGGGGGGGGGT', // 10
      'TGGmmmmGGGGGGGGGmmmmGGGGTGGGGT', // 11
      'TGGmmmmGGGGGGGGGmmmmGGGGGGGGGT', // 12
      'TGGGGGGGGGGGGGGGmmmmGGGGGGGGGT', // 13
      'TGGGGGGTGGGGGGGGGGGGGGGGTGGGGT', // 14
      'TGGGGGGGGGGGGGGGGGGGGPGGGGGGGT', // 15
      'TTTTTTTTTTTTTTTTTTTTTPTTTTTTTT', // 16 <- south exit back to the cliffs at (21,16)
    ],
    exits: [
      { x: 21, y: 16, to: 'keldrath_cliffs', toX: 21, toY: 1, facing: 'down' },
      { x: 29, y: 9, to: 'mirewood_deep', toX: 1, toY: 9, facing: 'right' },
      { x: 14, y: 0, to: 'mirewood_town', toX: 14, toY: 15, facing: 'up' },
    ],
    doors: [],
    npcs: [
      {
        id: 'bog_hermit',
        name: 'Bog Hermit Sef',
        x: 25, y: 9, facing: 'left',
        palette: { h: '#5a6a4a', f: '#caa07a', e: '#20203a', c: '#3a4434', g: '#9a8a66', b: '#241d18' },
        dialogue: [
          'Visitors. The reeds lit up an hour before you came — they like you. They did NOT like the last lot.',
          'Grey cloaks, old coin, smiles like hooks. Asked the way to the drowned sanctum, then went WITHOUT a lantern. The mire will not give them back, and nobody is asking it to.',
          'The second Warden keeps her seat past the deep eaves, east. The water there remembers the Aethori. Walk like a guest, {player}.',
        ],
        repeatDialogue: ['Keep to the lit reeds. The mire counts its visitors, and it is bad at letting go.'],
        setFlags: { heard_sanctum_rumor: true },
      },
      {
        // Chapter 2 beat: the Chain pushed past the mire's warnings.
        id: 'chain_stalker',
        name: 'Grey Cloak',
        x: 8, y: 5, facing: 'down',
        palette: { h: '#3a3a44', f: '#cfae96', e: '#4a1c28', c: '#43355e', g: '#8a93a0', b: '#1c1620' },
        dialogue: [
          'The scout failed, then. No matter. The Chain is patient the way the mire is patient.',
          'The drowned sanctum will open for the echo you carry — and you WILL carry it there for us, child. Now, or after you tire.',
        ],
        battle: { trainerId: 'chain_stalker', flag: 'chain_stalker_beaten' },
        postWinDialogue: [
          'Enough. The mire can have the sanctum road — for now.',
          'Keep the echo warm, child. The Chain collects on its own schedule.',
        ],
        repeatDialogue: ['The Grey Cloak watches the trees and says nothing more.'],
      },
    ],
    encounters: {
      rate: 0.15,
      table: [
        { speciesId: 'mossling', weight: 26, min: 18, max: 21 },
        { speciesId: 'bogstinger', weight: 24, min: 18, max: 22 },
        { speciesId: 'murkfin', weight: 22, min: 19, max: 22 },
        { speciesId: 'lanternreed', weight: 20, min: 18, max: 21 },
        { speciesId: 'mossbruin', weight: 4, min: 25, max: 27 },
        { speciesId: 'mirehornet', weight: 4, min: 24, max: 26 },
      ],
    },
  },
  mirewood_deep: {
    id: 'mirewood_deep',
    name: 'The Drowned Sanctum',
    //       012345678901234567890123456789
    rows: [
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // 0
      'WWCCCCCCCCCCCccAccCCCCCCCCCWWW', // 1  <- the sanctum doors at (15,1)
      'WWCCCCCCCCCCCcccccCCCCCCCCCWWW', // 2  <- Warden Mira at (14,2)
      'WWCCCCCCCCCCCcccccCCCCCCCCCWWW', // 3
      'WWCCCCCCCCCCCCCcCCCCCCCCCCCWWW', // 4  <- neck (15,4)
      'WWCCeeeeccccccccccccccceeeCWWW', // 5
      'WWCCeeeecccccccccccccccCCeCWWW', // 6  <- Keeper Ilse at (10,6)
      'WWCCccccccccccccccccccccceCWWW', // 7
      'WWCCcCCCCCCCCCCCCCCCCCCCCcCWWW', // 8
      'CccccCCCCCCCCCCCCCCCCCCCCcCWWW', // 9  <- west mouth back to the marsh at (0,9)
      'WWCCcccccccccccCccccccccccCWWW', // 10
      'WWCCCCCCCCcCCCCCCCCcCCCCCCCWWW', // 11
      'WWCCeeeeccccccccccccceeeeCCWWW', // 12
      'WWCCeeeeccccccccccccceeeeCCWWW', // 13
      'WWCCCCCCCCCCCCCCCCCCCCCCCCCWWW', // 14
      'WWWCCCCCCCCCCCCCCCCCCCCCCCWWWW', // 15
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // 16
    ],
    exits: [{ x: 0, y: 9, to: 'mirewood_marsh', toX: 28, toY: 9, facing: 'left' }],
    doors: [
      {
        // Chapter 3 turn: once the Mirewood Sigil is won, the doors answer
        // the Echo and carry the player into the inner sanctum.
        id: 'sanctum_doors',
        x: 15, y: 1,
        text: 'Doors of black stone, older than the mire. A hundred years of silence presses back against your palm.',
        awakened: {
          flag: 'badge_mirewood',
          pages: [
            'You lay a palm on the black stone. Behind your heartbeat the Echo rises — not a hum now. A VOICE.',
            'It sings one long note in a language the water drowned a hundred years ago. The runes answer first. Then the gold seam splits, floor to lintel.',
            'The Doors of the Drowned Sanctum remember Solen — and they open for the Echo he left behind.',
          ],
          repeat: ["The doors drift apart at the Echo's low hum, gold light spilling up from the deep."],
          setFlags: { sanctum_doors_opened: true, chapter: 3 },
          warp: { to: 'sanctum_inner', toX: 14, toY: 13, facing: 'up' },
        },
      },
    ],
    npcs: [
      {
        id: 'sanctum_keeper',
        name: 'Keeper Ilse',
        x: 10, y: 6, facing: 'down',
        palette: { h: '#3a5a6e', f: '#d8a878', e: '#20203a', c: '#2c4a5e', g: '#9fd8ff', b: '#241d18' },
        dialogue: [
          'Stop there. Grey cloaks came through a week ago — the water took two before the rest turned back.',
          'The Warden holds the deep hall, and the sanctum doors behind her have not opened in a hundred years. Earn your way past me first.',
        ],
        battle: { trainerId: 'sanctum_keeper', flag: 'sanctum_keeper_won' },
        postWinDialogue: ['Firm enough. The Warden waits up the neck of stone — speak softly. The water carries everything to her.'],
        repeatDialogue: ['The Warden is up the neck. Mind the gravel beds — the dark fish nest there.'],
      },
      {
        id: 'warden_mira',
        name: 'Warden Mira',
        x: 14, y: 2, facing: 'down',
        palette: { h: '#2c4a5e', f: '#caa07a', e: '#20203a', c: '#43657a', g: '#d4af37', b: '#241d18' },
        dialogue: [
          'So you are the one the reeds kept lighting up for. And that hum about you — the sanctum hears it too, {player}.',
          'I am Mira, Warden of the Mirewood. Behind me stand doors that answer only to the Aethori dead — and lately, the Hollowed Chain digs for another way in.',
          'My Oath stands between them and the deep. Show me it can stand behind YOU instead.',
        ],
        battle: { trainerId: 'warden_mira', flag: 'warden2_won' },
        postWinDialogue: [
          'The Oath broke clean. The mire has chosen its guest.',
          'Take the Mirewood Sigil. And hear me, Echo-bearer: when the sanctum doors finally answer that hum of yours, make certain the Chain is not standing behind you.',
          'Rest at the marsh shrine. The third Warden keeps the Cinderpeaks — when the next road is cut.',
        ],
        repeatDialogue: ['The Sigil is yours, guest of the mire. The sanctum doors keep their silence — for now.'],
      },
    ],
    encounters: {
      rate: 0.16,
      table: [
        { speciesId: 'murkfin', weight: 32, min: 19, max: 22 },
        { speciesId: 'gloombat', weight: 23, min: 19, max: 22 },
        { speciesId: 'bogstinger', weight: 20, min: 19, max: 22 },
        { speciesId: 'lanternreed', weight: 15, min: 19, max: 22 },
        { speciesId: 'murkmaw', weight: 6, min: 26, max: 28 },
        { speciesId: 'wickbloom', weight: 4, min: 25, max: 27 },
      ],
    },
  },

  sanctum_inner: {
    id: 'sanctum_inner',
    name: 'The Drowned Sanctum — Inner Hall',
    //       012345678901234567890123456789
    rows: [
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // 0
      'WWWWWWWCCCCCCCCCCCCCCCCWWWWWWW', // 1
      'WWWWWWWCccccccScccccccCWWWWWWW', // 2  <- the First Shrine at (14,2)
      'WWWWWWWCccccccccccccccCWWWWWWW', // 3
      'WWWWWWWCccccccccccccccCWWWWWWW', // 4
      'WWWWWWWCccCccccccccCccCWWWWWWW', // 5  <- pillars; Echo of Solen at (14,5)
      'WWWWWWWCccccccccccccccCWWWWWWW', // 6
      'WWWWWWWCccccccccccccccCWWWWWWW', // 7
      'WWWWWWWCccccccccccccccCWWWWWWW', // 8
      'WWWWWWWCccccccccccccccCWWWWWWW', // 9
      'WWWWWWWCccCccccccccCccCWWWWWWW', // 10 <- pillars
      'WWWWWWWCccccccccccccccCWWWWWWW', // 11
      'WWWWWWWCccccccccccccccCWWWWWWW', // 12
      'WWWWWWWCccccccccccccccCWWWWWWW', // 13 <- entry landing at (14,13)
      'WWWWWWWCCCCCCCcCCCCCCCCWWWWWWW', // 14 <- threshold gap at (14,14)
      'WWWWWWWWWWWWWWcWWWWWWWWWWWWWWW', // 15 <- exit back through the doors at (14,15)
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', // 16
    ],
    exits: [{ x: 14, y: 15, to: 'mirewood_deep', toX: 15, toY: 2, facing: 'down' }],
    doors: [],
    npcs: [
      {
        // Chapter 3 opens here: the Echo's first keeper, kept by the water.
        id: 'echo_solen',
        name: 'Echo of Solen',
        x: 14, y: 5, facing: 'down',
        palette: { h: '#e8dca0', f: '#d8cfae', e: '#2a3a5e', c: '#7a93c0', g: '#f4e09a', b: '#3a4a6e' },
        dialogue: [
          'Light gathers between the pillars and takes the shape of a man — young, road-worn, smiling like an old apology.',
          '"So my Echo chose you. Good. It always did have better judgment than I did."',
          '"Hear what the water kept, keeper. I did not die sealing a god away. I died sealing a DOOR — one of eight. And the Hollowed Chain has learned the eighth is failing."',
          '"Three Sigils more. The mountain Warden holds the next — the Cinderpeaks, where the first fire still argues with the dark. Carry my Echo up before the Chain cuts its own road."',
          '"And keeper — when the Chain offers to carry it FOR you, and it will offer... remember that hollowed hands hold nothing. They only close."',
        ],
        repeatDialogue: ['"The Cinderpeaks, keeper. The Echo knows the way up — listen between heartbeats."'],
        setFlags: { echo_answered: true },
      },
    ],
    encounters: null,
  },

  mirewood_town: {
    id: 'mirewood_town',
    name: 'Mirewood — Reedlight Village',
    //       012345678901234567890123456789
    rows: [
      'TTTTTTTTTTTTTTPTTTTTTTTTTTTTTT', // 0  <- north exit to the Cinderpeaks ascent at (14,0)
      'TGGmmGGGRRRRGGGGGGGRRRRGGmmGGT', // 1  <- stilt-house roofs; snow-guide Bryn at (14,1)
      'TGGmmGGGRRRRGGGGGGGRRRRGGmmGGT', // 2
      'TGGGGGGGBBDBGGGGGGGBDBBGGGGGGT', // 3  <- doors at (10,3) and (20,3)
      'TGGGGGGGGGPGGGGGGGGGPGGGGGGGGT', // 4
      'TFGGGGGGGGPPPPPPPPPPPGGGGGFGGT', // 5
      'TGGGGGGGGGGGGGPGGGGGGGGGGGGGGT', // 6
      'TGGWWGGGGGGGGGPGGGGGGGGGWWGGGT', // 7  <- reed pools
      'TGWWWWGGGGGGSGPGGGGGGGGWWWWGGT', // 8  <- Save Shrine at (12,8)
      'TGGWWGGGGGGGGGPGGGGGGGGGWWGGGT', // 9
      'TGGGGGGGGGGGGGPGGGGGGGGGGGGGGT', // 10
      'TGGGGGGGGGGGGGPGGGGGGGGGGGGGGT', // 11
      'TGGmmGGGGGGGGGPGGGGGGGGmmGGGGT', // 12
      'TGGmmGGGGGGGGGPGGGGGGGGmmGGGGT', // 13
      'TGGGGGGGGGGGGGPGGGGGGGGGGGGGGT', // 14
      'TGGGGGGGGGGGGGPGGGGGGGGGGGGGGT', // 15
      'TTTTTTTTTTTTTTPTTTTTTTTTTTTTTT', // 16 <- south exit to the marsh at (14,16)
    ],
    exits: [
      { x: 14, y: 16, to: 'mirewood_marsh', toX: 14, toY: 1, facing: 'down' },
      { x: 14, y: 0, to: 'cinderpeaks_ascent', toX: 14, toY: 15, facing: 'up' },
    ],
    doors: [
      { x: 10, y: 3, text: "Hobb's storehouse. Stacked crates of reed-wax candles hum faintly in the dark." },
      { x: 20, y: 3, text: 'The Reedlight Lodge. A carved sign reads: "The mire keeps what the mire is given."' },
    ],
    npcs: [
      {
        // Gate to the third region: the pass opens once the Echo has answered.
        id: 'snow_guide_bryn',
        name: 'Snow-Guide Bryn',
        x: 14, y: 1, facing: 'down',
        palette: { h: '#d8d2c4', f: '#caa07a', e: '#20203a', c: '#5a708a', g: '#dce8f0', b: '#241d18' },
        gate: {
          requiresFlag: 'echo_answered',
          grantsFlag: 'peak_pass_granted',
          asideX: 13, asideY: 1,
          deniedDialogue: [
            'Turn back, walker. The Cinderpeaks pass is under nine feet of stubborn snow, and the mountain is still adding.',
            'They say the drowned doors east of here answer to an old voice. If anything can change the weather, it is whatever wakes when THEY do.',
          ],
          grantedDialogue: [
            'The night the sanctum sang, the snow on the pass cracked like a knuckle. First clear road in a generation, and here YOU stand. Hm.',
            'The ascent runs north to the cinder fields, {player}. Walk the packed snow, mind the drifts — things hunt under the powder — and if a grey cloak is digging up there, do not lend them a shovel.',
          ],
        },
        repeatDialogue: ['The pass holds clear. The Warden of the peaks keeps a forge-hall past the cinder field, if the road ever opens that far.'],
      },
      {
        // Free full heal — the village answer to Dockside Maeve.
        id: 'reedkeeper_tamsin',
        name: 'Reedkeeper Tamsin',
        x: 7, y: 8, facing: 'right',
        healer: true,
        palette: { h: '#7a9a5a', f: '#e0bc94', e: '#20203a', c: '#4a6a3a', g: '#9fd8ff', b: '#241d18' },
        dialogue: [
          'Off the road and into the light, walker. The reeds tend whoever sits among them — that is the whole of the deal.',
          'There. Warm, mended, and owing the mire nothing. Mind it stays that way.',
        ],
        repeatDialogue: ['Sit among the reeds whenever the deep eaves chew on you. They never tire of mending.'],
      },
      {
        id: 'peatmonger_hobb',
        name: 'Hobb',
        x: 8, y: 6, facing: 'down',
        palette: { h: '#5a4a32', f: '#caa07a', e: '#20203a', c: '#6a5a3a', g: '#9a8a66', b: '#241d18' },
        dialogue: [
          'Salves, tonics, dew off the lanternreeds themselves — Hobb trades it all, and never asks where your shards have been.',
          'The dew is dear, aye. So is walking out of the deep eaves on your own legs. Your choice, walker.',
        ],
        repeatDialogue: ['Back for more dew? The reeds only weep so fast, friend.'],
        shop: [
          { itemId: 'capture_orb', price: 200 },
          { itemId: 'tide_tonic', price: 300 },
          { itemId: 'brine_salve', price: 160 },
          { itemId: 'lantern_dew', price: 500 },
        ],
      },
      {
        id: 'elder_wren',
        name: 'Elder Wren',
        x: 16, y: 6, facing: 'down',
        palette: { h: '#c8c2b4', f: '#d8b08a', e: '#20203a', c: '#3a5a4a', g: '#d4af37', b: '#241d18' },
        dialogue: [
          'A new face in Reedlight. The mire told us you were coming — it counts its visitors, you know.',
          'Warden Mira keeps the drowned sanctum east of here. A hundred years that water has held its breath. Lately it has started listening again.',
        ],
        repeatDialogue: ['The sanctum water is listening again. Old folk notice such things; young folk survive them.'],
        // Once the Mirewood Sigil is won, Wren speaks to the Echo directly.
        conditionalDialogue: [
          {
            flag: 'badge_mirewood',
            stateKey: 'postBadge',
            pages: [
              'The Mirewood Sigil. So the Oath broke for you, and the mire called you guest. Then hear what the reeds have hummed all season, Echo-bearer.',
              'The sanctum doors do not want a key. They want a VOICE — the one Solen carried, the one humming behind your heartbeat this very moment.',
              'When you stand before them, let the Echo answer. And make certain no grey cloak stands close enough to listen.',
            ],
            repeat: ['Let the Echo answer the doors, child. And count the shadows behind you before you do.'],
          },
        ],
      },
      {
        // Chapter 3: Lyra catches up after the second Sigil and names the race.
        id: 'lyra_reedlight',
        name: 'Lyra',
        x: 16, y: 10, facing: 'left',
        showIfFlag: 'badge_mirewood',
        palette: { h: '#a03a4a', f: '#e8c39a', e: '#20203a', c: '#2a4a3a', g: '#d4af37', b: '#241d18' },
        dialogue: [
          'TWO Sigils?! I take ONE boat around the headland and you... ugh. Fine. Recount: you are ahead. Noted and despised.',
          "The lodge is buzzing — they say the drowned doors opened for someone. Father spent half his life knocking on stones like those, {player}. Whatever answered you in there... I want to hear all of it.",
          'After the Cinderpeaks. Third Sigil, mountain Warden, first one up owns the bragging rights for BOTH regions. Deal? Deal. Now go rest — you look like the mire chewed on you and apologized after.',
        ],
        repeatDialogue: ['Cinderpeaks next, rival. I am only still here because the mountain pass is snowed in — for now.'],
        setFlags: { lyra_sigil_seen: true },
      },
      {
        id: 'reed_tilly',
        name: 'Tilly',
        x: 20, y: 12, facing: 'left',
        palette: { h: '#e8a84a', f: '#e8c39a', e: '#20203a', c: '#7ba0c9', g: '#8a93a0', b: '#241d18' },
        dialogue: [
          'The reeds light up when Luminary swim under them! Blue for Murkfin, gold for Lanternreed — I keep a chart!',
          'Last night the WHOLE marsh lit gold at once. Gran says that has not happened since before she was born. I drew it on two pages!',
        ],
        repeatDialogue: ['Still gold, still glowing! Page three of my chart, if you want to see!'],
      },
    ],
    encounters: null,
  },
  cinderpeaks_ascent: {
    id: 'cinderpeaks_ascent',
    name: 'Cinderpeaks — Snowbound Ascent',
    //       012345678901234567890123456789
    rows: [
      'CCCCCCCCCCCCCCPCCCCCCCCCCCCCCC', // 0  <- forge road north at (14,0); Edda guards (14,1)
      'CnnhhhnnnnCnnnnnnnnnnnnhhhnnnC', // 1
      'CnnhhhnnnnnnnnhhhhnnnnnhhhnnnC', // 2
      'CnnhhhnnnnnnnnhhhhnnnnnnnnnnnC', // 3
      'CnnnnnnnCnnnnnhhhhnnnCnnnnnnnC', // 4
      'CnnnnnnnnnnnnnnnnnnnnnnnnnnnnC', // 5  <- Chain Digger Hesk at (8,5)
      'CnnnnnWWWnnnnnnnnnnnnnWWWnnnnC', // 6  <- frozen pools
      'CnnnnWWWWWnnnnSnnnnnnWWWWWnnnC', // 7  <- Save Shrine at (14,7)
      'CnnnnnWWWnnnnnnnnnnnnnWWWnnnnC', // 8
      'CnnnnnnnnnnnnnnnnnnnnnnnnnnnnC', // 9  <- Forge Acolyte Edda at (22,9)
      'CnnhhhhnnnnCnnnnnnnnnnnnnnnnnC', // 10
      'CnnhhhhnnnnnnnnnhhhhnnnnCnnnnC', // 11
      'CnnhhhhnnnnnnnnnhhhhnnnnnnnnnC', // 12
      'CnnnnnnnnnnnnnnnhhhhnnnnnnnnnC', // 13
      'CnnnnnnnCnnnnnnnnnnnnnnnCnnnnC', // 14
      'CnnnnnnnnnnnnnnnnnnnnnnnnnnnnC', // 15
      'CCCCCCCCCCCCCCPCCCCCCCCCCCCCCC', // 16 <- south exit back to Reedlight at (14,16)
    ],
    exits: [
      { x: 14, y: 16, to: 'mirewood_town', toX: 14, toY: 1, facing: 'down' },
      { x: 14, y: 0, to: 'cinderpeaks_forge', toX: 14, toY: 15, facing: 'up' },
    ],
    doors: [],
    npcs: [
      {
        // Solen said the Chain digs for another way in. Here is the shovel.
        id: 'chain_digger',
        name: 'Grey Cloak',
        x: 8, y: 5, facing: 'down',
        palette: { h: '#3a3a44', f: '#cfae96', e: '#4a1c28', c: '#43355e', g: '#8a93a0', b: '#1c1620' },
        dialogue: [
          'A keeper, this high already? The drowned doors must have liked you. No matter — stone keeps no favorites.',
          'The eighth door is FAILING, child. We dig toward the sound it makes. Step aside, or be the next thing the mountain swallows.',
        ],
        battle: { trainerId: 'chain_digger', flag: 'chain_digger_beaten' },
        postWinDialogue: [
          'Enough. The rock face will still be here when your bones are not.',
          'Climb, then. The Warden of the peaks will smell the Chain on you and bar her forge anyway.',
        ],
        repeatDialogue: ['The Grey Cloak studies the rock face and pointedly ignores you.'],
      },
      {
        // Gate to the forge-hall: the mountain settles once the digger stops.
        id: 'forge_acolyte_edda',
        name: 'Forge Acolyte Edda',
        x: 14, y: 1, facing: 'down',
        palette: { h: '#a0522a', f: '#d8a878', e: '#20203a', c: '#7a3a2e', g: '#e8c84a', b: '#241d18' },
        gate: {
          requiresFlag: 'chain_digger_beaten',
          grantsFlag: 'forge_road_cleared',
          asideX: 13, asideY: 1,
          deniedDialogue: [
            'Up from the mire, are you? Then you have met the second Warden. The third keeps the forge-hall past these crags — Warden Korr, and her Oath burns hotter than her temper.',
            'But the road is shut. The mountain has rumbled all season — ever since that grey cloak started swinging a pick at it. Settle HIM, and I would wager the mountain settles too.',
          ],
          grantedDialogue: [
            'The pick stopped, and the mountain slept its first honest night in months. You settle arguments like a Warden already.',
            'The forge road is open, {player}. Korr will have heard the whole thing through the stone — walk in like you mean it, and mind the channels. The forge keeps a dog.',
          ],
        },
        repeatDialogue: ['The forge road stands open. Korr is past the channels — and the tea offer stands.'],
      },
    ],
    encounters: {
      rate: 0.15,
      table: [
        { speciesId: 'drifthare', weight: 30, min: 24, max: 27 },
        { speciesId: 'emberhoof', weight: 26, min: 24, max: 27 },
        { speciesId: 'slatewing', weight: 24, min: 24, max: 28 },
        { speciesId: 'snowveil', weight: 20, min: 25, max: 28 },
      ],
    },
  },
  cinderpeaks_forge: {
    id: 'cinderpeaks_forge',
    name: 'Cinderpeaks — The Forge-Hall',
    //       012345678901234567890123456789
    rows: [
      'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCC', // 0
      'CCCCCCCCCCCcccccccCCCCCCCCCCCC', // 1  <- Korr's anvil chamber
      'CCCCCCCCCCCcccccccCCCCCCCCCCCC', // 2  <- Warden Korr at (14,2)
      'CCCCCCCCCCCcccccccCCCCCCCCCCCC', // 3
      'CCCCCCCCCCCCCCcCCCCCCCCCCCCCCC', // 4  <- neck (14,4)
      'CCCCeeeeccccccccccccceeeeCCCCC', // 5
      'CCCCeeeeclllccccccclllceeeeCCC', // 6  <- lava channels; Brann at (8,7)
      'CCCCccccccccccccccccccccccCCCC', // 7
      'CCCCcCCCCCCCCCCCCCCCCCCCCcCCCC', // 8  <- twin side passages (4,8) and (25,8)
      'CCCCccccccccccccccccccccccCCCC', // 9  <- Lyra waits at (13,9)
      'CCCCCCCCCCCCCCcCCCCCCCCCCCCCCC', // 10 <- neck (14,10)
      'CCCCCCCeecccccccccceeCCCCCCCCC', // 11
      'CCCCCCCcccclllccccccCCCCCCCCCC', // 12
      'CCCCCCcccccccccccccccccCCCCCCC', // 13
      'CCCCCCCCCCCCCCcCCCCCCCCCCCCCCC', // 14 <- entry corridor
      'CCCCCCCCCCCCCCcCCCCCCCCCCCCCCC', // 15
      'CCCCCCCCCCCCCCcCCCCCCCCCCCCCCC', // 16 <- mouth back to the ascent at (14,16)
    ],
    exits: [{ x: 14, y: 16, to: 'cinderpeaks_ascent', toX: 14, toY: 1, facing: 'down' }],
    doors: [],
    npcs: [
      {
        // The race she promised in Reedlight ends here.
        id: 'lyra_forge',
        name: 'Lyra',
        x: 13, y: 9, facing: 'right',
        palette: { h: '#a03a4a', f: '#e8c39a', e: '#20203a', c: '#2a4a3a', g: '#d4af37', b: '#241d18' },
        dialogue: [
          'Bryn let me through an HOUR after you. One hour, {player}. The mountain barely had time to miss me.',
          "So: forge-hall, third Sigil, and the finish line is Korr's anvil. The race ends where one of us beats the other to it — and I am DONE finishing second.",
        ],
        battle: { trainerId: 'lyra3', flag: 'rival3_won' },
        postWinDialogue: [
          'THREE for three. Fine. FINE. You are officially the rival in this story, not me.',
          "Father always said the Wardens test what the Chain tempts. Go let Korr test you — and {player}? When the Chain finally makes its real offer... be exactly this stubborn.",
        ],
        repeatDialogue: ['Go on — the anvil is waiting. I will be timing your Oath like a hawk.'],
      },
      {
        id: 'forge_acolyte_brann',
        name: 'Acolyte Brann',
        x: 8, y: 7, facing: 'right',
        palette: { h: '#3a2a22', f: '#b8835a', e: '#20203a', c: '#6e3a2e', g: '#e8c84a', b: '#241d18' },
        dialogue: [
          'Hold. The channel floor is the Warden\'s threshing room — nobody reaches her anvil unweighed.',
          'The hammer hears soft metal. Show me yours rings true.',
        ],
        battle: { trainerId: 'forge_acolyte', flag: 'forge_acolyte_won' },
        postWinDialogue: ['Rings true. Up the neck of stone — and do not touch the channels. The dog sleeps lightly.'],
        repeatDialogue: ['The Warden is up the neck. Mind the lava channels — the forge keeps a dog.'],
      },
      {
        id: 'warden_korr',
        name: 'Warden Korr',
        x: 14, y: 2, facing: 'down',
        palette: { h: '#2c2420', f: '#b8835a', e: '#20203a', c: '#8a3a22', g: '#f4c84a', b: '#241d18' },
        dialogue: [
          'So. The keeper the drowned doors sang for, with mire on your boots and the Chain\'s diggers behind you. The stone told me everything, {player}.',
          'I am Korr, Warden of the Cinderpeaks. My Sigil holds the third seal-thread, and my Oath has not broken since I took the hammer.',
          'The forge judges metal by what it keeps under the blow. Let us see what you keep.',
        ],
        battle: { trainerId: 'warden_korr', flag: 'warden3_won' },
        postWinDialogue: [
          'The Oath broke clean off your fire. Three Sigils, Echo-bearer. The mountain will talk about this for a century.',
          'Hear a smith\'s truth: the Chain does not want your Echo destroyed. It wants it CARRIED — by hands that no longer argue. Solen knew. Now you do.',
          'Rest at the ascent shrine. Past the peaks the land falls toward dawn — the fourth Warden keeps the far slopes, when the road is cut.',
        ],
        repeatDialogue: ['The Sigil is yours, Echo-bearer. The forge remembers every strike — make the next ones count.'],
      },
    ],
    encounters: {
      rate: 0.16,
      table: [
        { speciesId: 'emberhoof', weight: 34, min: 26, max: 29 },
        { speciesId: 'slatewing', weight: 30, min: 26, max: 29 },
        { speciesId: 'gloombat', weight: 26, min: 26, max: 29 },
        { speciesId: 'cindralisk', weight: 10, min: 28, max: 31 },
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
