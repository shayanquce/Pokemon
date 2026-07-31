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
        // Counsel deepens with each Sigil; the chapter-4 refusal comes first.
        conditionalDialogue: [
          {
            // The Chain's real offer, refused. Word reached even Ashfen.
            flag: 'chain_envoy_beaten',
            stateKey: 'postEnvoy',
            pages: [
              'Three Sigils, and then the Chain came to you with open hands and a soft voice. And you sent it away empty. The southern roads have not stopped talking about it, {player}.',
              'Understand what you did. The Chain does not ASK twice. What it sends now will not bargain, will not boast, will not even have a face to read. Solen faced the same silence at the last door.',
              "You are past the place where I can counsel you, child. Only this: the Echo is not a burden to carry to the end. It is a voice to LET SPEAK. When the faceless thing comes, do not out-argue it. Out-remember it.",
            ],
            repeat: ['The old fear has a name again, and it is coming uphill toward you. Let the Echo answer it, {player}. That is all any of us ever could.'],
          },
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
        // Wren's counsel deepens by chapter; the refusal reaction comes first.
        conditionalDialogue: [
          {
            // After the envoy is refused — the reeds go quiet, and Wren knows why.
            flag: 'chain_envoy_beaten',
            stateKey: 'postEnvoy',
            pages: [
              'The whole marsh went still the night you refused the pale cloak. Not frightened-still. Listening-still. The reeds do that when something old turns its head toward us.',
              'You told the Chain no with your own mouth, where Solen could only tell it no with a locked door and a hundred years of silence. That is either the bravest thing this mire has witnessed, or the last.',
              'Go to the far slopes, Echo-bearer. Warden Alder has kept the dawnward vale longer than any of us have been alive. If anyone knows how to stand in front of a thing with no face, it is her — and the voice you carry.',
            ],
            repeat: ['The reeds are still listening, child. Whatever answered you at the doors — keep letting it speak. It is not done yet.'],
          },
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
      'CnnnnnnnnnnnnnnnnnnnnnnnnnnnnP', // 9  <- Dawn-Guide Sella gates the east road (28,9); slopes exit (29,9)
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
      { x: 29, y: 9, to: 'verdant_descent', toX: 1, toY: 9, facing: 'right' },
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
        // Chapter 3 closer: after the third Sigil the Chain stops digging
        // and starts asking. Beating Vael advances the chapter to 4.
        id: 'chain_envoy',
        name: 'Pale Cloak',
        x: 16, y: 8, facing: 'left',
        showIfFlag: 'badge_cinderpeaks',
        hiddenIfFlag: 'chain_envoy_beaten',
        palette: { h: '#d8d2c4', f: '#cfae96', e: '#4a1c28', c: '#8a8498', g: '#d4af37', b: '#1c1620' },
        dialogue: [
          'Three Sigils. The scout asked, the stalker insisted, the digger dug — and you outlasted them all. So the Chain sends me, with its only honest face.',
          'Give us the Echo, keeper. Freely. Carried by hands that no longer argue, it opens the eighth door GENTLY — no flood, no fire, no drowned towns. Your hands will argue. Hollowed hands never do.',
          'Solen refused, and died holding a door shut. We are offering to open it properly. Last chance to say yes, child.',
        ],
        battle: { trainerId: 'chain_envoy', flag: 'chain_envoy_beaten' },
        postWinDialogue: [
          'So. The answer is the same answer Solen gave. Noted, keeper — truly noted.',
          'Then the Chain stops asking. What comes for the eighth door next will not have a face at all. Enjoy the mountain. The far slopes are lovely this time of year.',
        ],
        repeatDialogue: ['The snow has already filled the Pale Cloak\'s footprints.'],
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
      {
        // Gate to the fourth region: the east road opens once the Chain's
        // envoy is refused and the chapter turns. Sella came UP from the sprawl.
        id: 'dawn_guide_sella',
        name: 'Dawn-Guide Sella',
        x: 28, y: 9, facing: 'left',
        palette: { h: '#6a8a4a', f: '#d8a878', e: '#20203a', c: '#8a6a3a', g: '#e8c84a', b: '#241d18' },
        gate: {
          requiresFlag: 'chain_envoy_beaten',
          grantsFlag: 'slopes_pass_granted',
          asideX: 28, asideY: 10,
          deniedDialogue: [
            'Hold there, keeper. I climbed UP from the Verdant Sprawl to warn this pass, not to wave folk down into it.',
            'A pale cloak came through here making a soft, terrible offer. Until the mountain is done answering THAT, the dawnward road stays my business, not yours.',
          ],
          grantedDialogue: [
            'You sent the pale one back to whatever sends them. Word runs downhill faster than snow-melt — the whole sprawl already knows the keeper said no.',
            'Then go down and see it, {player}. The slopes fall east toward dawn, green as a held breath. Warden Alder keeps the vale below — but something walks the slopes now that wears no face at all. Mind it does not learn yours.',
          ],
        },
        repeatDialogue: ['The dawnward road is open. Alder keeps the vale — and the faceless thing keeps the slopes. Watch your shadow, keeper.'],
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
  verdant_descent: {
    id: 'verdant_descent',
    name: 'Verdant Sprawl — Dawnward Slopes',
    //       012345678901234567890123456789
    rows: [
      'CCCCCCCCCCCCCCTTTTTTTTTTTTTTTT', // 0  <- crag rim gives way to canopy
      'CnnnnnnnnGGGGGGGGGGGGGGGGGGGGT', // 1  <- snow thins into the first green
      'CnnnnnnnGGGGGGgggggGGGGGGGGGGT', // 2
      'CnnnnnnGGGGGgggggggGGGGGGGFGGT', // 3
      'CnnnnnGGGGGgggggggGGGGGGGGGGGT', // 4
      'CnnnnGGGGGGGGGGGGGGGGGGGGGGGGT', // 5
      'CnnnGGGGFGGGGGGGGWWWWGGGGGGGGT', // 6  <- meltwater tarn
      'CnnGGGGGGGGGGGGGGWWWWGGGGGGGGT', // 7
      'CnnGGGGGGGGGGGGGGWWWWGGGGGGGGT', // 8  <- the Hollow Vessel waits at (14,8)
      'PnnGGGGGGGGGGGGGGGWWGGGGGGGGGT', // 9  <- west road back up to the ascent (0,9)
      'CnnGGGGGGGGGGGGGGGGGGGGGGGGGGT', // 10
      'CGGGGGGGGGGGGGGGGGGGGGGGGGGGGP', // 11 <- Lyra (6,11); Grafter Wick gates the vale road (28,11), exit (29,11)
      'CGGGgggggGGGGGGGGGGGGggggGGGGT', // 12
      'CGGGgggggggGGGGGGGGgggggGGGGGT', // 13 <- Sprawl Ranger Tibb at (26,13)
      'CGGGgggggGGGGGGSGGGGGgggGGGGGT', // 14 <- Save Shrine at (15,14)
      'CGGGGGGGGGGGGGGGGGGGGGGGGGGGGT', // 15
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 16 <- the vale forest closes the south
    ],
    exits: [
      { x: 0, y: 9, to: 'cinderpeaks_ascent', toX: 28, toY: 9, facing: 'left' },
      { x: 29, y: 11, to: 'sprawl_vale', toX: 1, toY: 11, facing: 'right' },
    ],
    doors: [],
    npcs: [
      {
        // Chapter 4 opens here: the Chain sends the thing with no face.
        id: 'chain_hollow',
        name: 'Hollow Vessel',
        x: 14, y: 8, facing: 'down',
        hiddenIfFlag: 'chain_hollow_beaten',
        palette: { h: '#2a2438', f: '#b8b0c8', e: '#2a2438', c: '#3a3450', g: '#8a84a0', b: '#161020' },
        dialogue: [
          'It stands too still in the melt-water, and the snow does not settle on it. Where its face should be, the slope behind it simply continues.',
          'The pale cloak said the next thing would have no face. This one has less than that. It lifts one hand — not to greet, not to threaten. To COLLECT.',
        ],
        battle: { trainerId: 'chain_hollow', flag: 'chain_hollow_beaten' },
        postWinDialogue: [
          'The Vessel folds down like a coat with no one in it. For a heartbeat the grass shows the shape of a face — yours, almost — and then the wind takes it.',
          'Nothing is left on the slope but wet stone and the smell of a snuffed candle. The Chain will send another. It has stopped needing them to be people.',
        ],
        repeatDialogue: ['Only the melt-water remains, and the faint dark where the snow refused to fall.'],
      },
      {
        // The rival caught up again — and the race is settled, so she reacts
        // to the envoy instead. She names Warden Alder and the vale below.
        id: 'lyra_slopes',
        name: 'Lyra',
        x: 6, y: 11, facing: 'right',
        palette: { h: '#a03a4a', f: '#e8c39a', e: '#20203a', c: '#3a6a4a', g: '#d4af37', b: '#241d18' },
        dialogue: [
          'THERE you are. I lost the race to Korr\'s anvil by an hour, so I did the only honorable thing and glided down here first. We are even. Do not argue.',
          'Sella told me what the pale cloak offered you up on the pass. Hand the Echo over, quiet and gentle, and no more drowned towns. And you said NO. Out loud. To its face.',
          "Father would have liked you, {player}. He knocked on stone doors his whole life and never once offered to open them the easy way. Down there is Warden Alder's vale — fourth Sigil. I'll be one ridge behind you, as usual.",
        ],
        repeatDialogue: ['Alder\'s vale is east and down. Whatever wears no face out here — do not let it catch you alone, rival.'],
        setFlags: { lyra_slopes_seen: true },
        // After the faceless fight she drops the banter for a moment.
        conditionalDialogue: [
          {
            flag: 'chain_hollow_beaten',
            stateKey: 'postHollow',
            pages: [
              'I saw it come apart from up the ridge. There was a face in the grass for a second, {player}. It looked like YOURS. I have decided not to think about that until we are somewhere with tea.',
              'Go find Alder. I mean it about staying a ridge behind — but not TOO far. The Chain stopped sending people. That means it stopped being afraid of losing them.',
            ],
            repeat: ['One ridge behind you, keeper. Always. Now go win a Sigil so I have something to chase.'],
          },
        ],
      },
      {
        // Names the fourth Warden + seeds the next map (the vale, v0.22 hook).
        id: 'sprawl_ranger_tibb',
        name: 'Sprawl Ranger Tibb',
        x: 26, y: 13, facing: 'left',
        palette: { h: '#4a6a3a', f: '#d8a878', e: '#20203a', c: '#6a8a4a', g: '#c8e0a0', b: '#241d18' },
        dialogue: [
          'Down from the peaks in one piece — the sprawl does not see many of those. Mind the tall grass; the thaw wakes things up hungry and proud.',
          'The vale runs on east past this forest wall, where the whole slope turns to orchard and terrace. Warden Alder keeps it, and her Sigil holds the fourth seal-thread. The road through the trees is grown shut for now — but it opens for keepers, in time.',
        ],
        repeatDialogue: ['Alder\'s vale is east, past the treewall. It opens when it means to. Rest at the shrine till then, keeper.'],
        setFlags: { heard_vale_rumor: true },
      },
      {
        // Gate to Alder's vale: the treewall is grafted shut, and Wick only
        // cuts it for someone the faceless thing failed to collect.
        id: 'grafter_wick',
        name: 'Grafter Wick',
        x: 28, y: 11, facing: 'left',
        palette: { h: '#6e5a3a', f: '#caa07a', e: '#20203a', c: '#4a6a3a', g: '#c8e0a0', b: '#241d18' },
        gate: {
          requiresFlag: 'chain_hollow_beaten',
          grantsFlag: 'vale_road_cleared',
          asideX: 28, asideY: 12,
          deniedDialogue: [
            'Far enough, walker. This treewall was grafted shut by hands older than the vale, and I keep the graft. Alder\'s orders, and Alder does not repeat herself.',
            'There is a thing walking these slopes with no face on it. Until somebody settles THAT, every road into the vale stays a hedge. I am not losing an orchard to politeness.',
          ],
          grantedDialogue: [
            'It came apart on the west slope. I felt the graft loosen the same moment — the whole hedge exhaled, {player}. Trees know when something stops watching them.',
            'Then the vale is yours to enter. Down the terraces: cellars, cordial, and Warden Alder at the top of the orchard road. Tell her Wick cut the hedge himself. She will know what it cost me.',
          ],
        },
        repeatDialogue: ['The hedge stands open. Mind the terraces — and if Alder offers you the cordial, drink it. Refusing is its own kind of insult.'],
      },
    ],
    encounters: {
      rate: 0.16,
      table: [
        { speciesId: 'fernkit', weight: 30, min: 30, max: 33 },
        { speciesId: 'thistlebuck', weight: 26, min: 30, max: 33 },
        { speciesId: 'dawnfinch', weight: 24, min: 31, max: 34 },
        { speciesId: 'hollowmoth', weight: 20, min: 32, max: 35 },
      ],
    },
  },
  sprawl_vale: {
    id: 'sprawl_vale',
    name: "Verdant Sprawl — Alder's Vale",
    //       012345678901234567890123456789
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 0
      'TooooGGRRRRGGGGGGGGRRRRGGooooT', // 1  <- terrace houses over the orchard rows
      'TooooGGRRRRGGGGGGGGRRRRGGooooT', // 2
      'TooooGGBBDBGGGGGGGGBDBBGGooooT', // 3  <- doors at (9,3) and (20,3)
      'TooooGGGGPGGGGGGGGGGPGGGGooooT', // 4
      'TGGGGGGGGPPPPPPPPPPPPGGGGGGGGT', // 5  <- the terrace street
      'TGGGGGGGGGGGGPGGGGGGGGGGGGGGGT', // 6  <- Steward Yarrow at (17,6)
      'TooooGGGGGGGGPGGGGGGGGWWWGGGGT', // 7  <- Grafter Nell (healer) at (6,7); cistern pools east
      'TooooGGGGGGGGPGGGGGGGGWWWGGGGT', // 8
      'TooooGGGGGGGGPGGGGGGGGWWWGGGGT', // 9
      'TGGGGGGGGGGGGPGGGGGGGGGGGGGGGT', // 10 <- Cellarman Dov at (9,10)
      'PGGGGGGGGGGGGPGGGGGGGGGGGGGGGT', // 11 <- west hedge road back to the slopes (0,11)
      'TGGGGGGGSGGGGPGGGGGGGGGGGGGGGT', // 12 <- Save Shrine at (8,12); Lyra at (16,12)
      'TooooGGGGGGGGPGGGGGGGooooooGGT', // 13
      'TooooGGGGGGGGPGGGGGGGooooooGGT', // 14 <- Pip the scrumper at (24,14)
      'TGGGGGGGGGGGGPGGGGGGGGGGGGGGGT', // 15
      'TTTTTTTTTTTTTPTTTTTTTTTTTTTTTT', // 16 <- the orchard road up to Alder (13,16)
    ],
    exits: [
      { x: 0, y: 11, to: 'verdant_descent', toX: 28, toY: 11, facing: 'left' },
      { x: 13, y: 16, to: 'sprawl_orchard', toX: 14, toY: 1, facing: 'down' },
    ],
    doors: [
      { x: 9, y: 3, text: 'A pressing-house. The whole room smells of bruised fruit and patient wood.' },
      { x: 20, y: 3, text: 'The vale cellars. Rows of dark bottles, each chalked with a year older than you are.' },
    ],
    npcs: [
      {
        // The vale's free full heal — third in the Maeve/Tamsin line.
        id: 'grafter_nell',
        name: 'Grafter Nell',
        x: 6, y: 7, facing: 'right',
        healer: true,
        palette: { h: '#8a6a3a', f: '#e0bc94', e: '#20203a', c: '#4a6a3a', g: '#d8a33a', b: '#241d18' },
        dialogue: [
          'Come off the terrace and sit, keeper. You have the look of someone the mountain used badly and the slopes finished the job.',
          'There. Grafting is grafting — trees, bones, tired Luminary. You join the hurt thing to the strong thing and you WAIT. Off you go.',
        ],
        repeatDialogue: ['Sit whenever the vale road chews on you. Grafts take better on the rested.'],
      },
      {
        id: 'cellarman_dov',
        name: 'Cellarman Dov',
        x: 9, y: 10, facing: 'down',
        palette: { h: '#4a3a2a', f: '#caa07a', e: '#20203a', c: '#6a4a3a', g: '#c4622e', b: '#241d18' },
        dialogue: [
          'Cordial, orbs, salves — the vale presses more than fruit, friend. Anything that goes up the orchard road ought to go up stocked.',
          'The cordial is not cheap and I will not pretend otherwise. Neither is being carried back down. Choose.',
        ],
        repeatDialogue: ['Back again? The cellar keeps. Your Luminary might not.'],
        shop: [
          { itemId: 'capture_orb', price: 200 },
          { itemId: 'brine_salve', price: 160 },
          { itemId: 'lantern_dew', price: 500 },
          { itemId: 'orchard_cordial', price: 900 },
        ],
      },
      {
        // The vale's elder voice: names Alder's nature + the fourth seal-thread.
        id: 'steward_yarrow',
        name: 'Steward Yarrow',
        x: 17, y: 6, facing: 'down',
        palette: { h: '#c8c2b4', f: '#d8b08a', e: '#20203a', c: '#5a7a4a', g: '#d4af37', b: '#241d18' },
        dialogue: [
          'So the hedge opened for you. Wick does not cut that graft for charm, which means the slopes are quieter than they were. The vale thanks you in fruit, mostly.',
          'Warden Alder keeps the orchard road above us — fourth Sigil, fourth seal-thread. She has held it through two hollow winters and one very bad spring, and she has never once raised her voice.',
        ],
        repeatDialogue: ['The orchard road runs south and up. Alder will be at the top of it, exactly where she always is.'],
        // Once the Chain's faceless thing has been met, Yarrow says the quiet part.
        conditionalDialogue: [
          {
            flag: 'chain_hollow_beaten',
            stateKey: 'postHollow',
            pages: [
              'You met the faceless one. No — do not describe it. Three of our pickers have tried, and all three used the same words, and none of them had ever spoken to each other.',
              'That is what frightens Alder. Not that the Chain sends monsters — that it has stopped sending PEOPLE. A thing with no face cannot be bargained with, bribed, or shamed. It can only be outlasted.',
              'Go up the orchard road, Echo-bearer. Tell her what you saw. She has been waiting years for someone who could.',
            ],
            repeat: ['Up the orchard road, keeper. Alder is waiting, and she has been waiting a long while.'],
          },
        ],
      },
      {
        // Rival beat: Lyra arrives once the faceless thing is down.
        id: 'lyra_vale',
        name: 'Lyra',
        x: 16, y: 12, facing: 'left',
        showIfFlag: 'chain_hollow_beaten',
        palette: { h: '#a03a4a', f: '#e8c39a', e: '#20203a', c: '#3a6a4a', g: '#d4af37', b: '#241d18' },
        dialogue: [
          'One ridge behind you, exactly like I said. I even got here first for once — the hedge-keeper likes me. Everyone likes me. It is my main advantage over you.',
          'I have been thinking about that face in the grass, {player}. The one that looked like yours. What if that is what the Chain actually collects? Not the Echo. The KEEPER. Hollow you out and walk the fragment through the door wearing your hands.',
          'Anyway. Cheerful thought, terrible sleep. Alder is up the orchard road. I am going to sit here and pretend to be relaxed until you get back.',
        ],
        repeatDialogue: ['Go on. Fourth Sigil. I will be right here being relaxed. Extremely relaxed. Look at me.'],
        setFlags: { lyra_vale_seen: true },
        // Chapter 5: the Sprawl Sigil is won and the Frostwall is next.
        conditionalDialogue: [
          {
            flag: 'badge_sprawl',
            stateKey: 'postSprawl',
            pages: [
              'Four. FOUR, {player}. I have stopped keeping score, which is the single most generous thing I have ever done for anybody.',
              'Alder talked to me on the way down. She does that thing where she says something ordinary and it follows you around for a week. She said: the Chain has stopped needing you, and that is worse.',
              'So — the Frostwall. White, north, and nobody has walked that road in a generation. I am coming this time. Not one ridge behind. WITH you. Do not make it weird.',
            ],
            repeat: ['North to the Frostwall, rival. Together, this time. I already packed. I packed WEEKS ago.'],
          },
        ],
      },
      {
        id: 'vale_pip',
        name: 'Pip',
        x: 24, y: 14, facing: 'left',
        palette: { h: '#d8a33a', f: '#e8c39a', e: '#20203a', c: '#6aa052', g: '#c4622e', b: '#241d18' },
        dialogue: [
          'You cannot have the low fruit, it is MINE, I called it in spring. The high fruit is the Warden\'s and nobody argues with that.',
          'Fernkit steal the windfalls. I let them. They dig fake trails to the wrong tree and think they fooled me, and I let them think that TOO.',
        ],
        repeatDialogue: ['Low fruit mine. High fruit hers. Middle fruit is negotiable, for a keeper.'],
      },
    ],
    encounters: null,
  },
  sprawl_orchard: {
    id: 'sprawl_orchard',
    name: 'Verdant Sprawl — The Orchard Road',
    //       012345678901234567890123456789
    rows: [
      'TTTTTTTTTTTTTTPTTTTTTTTTTTTTTT', // 0  <- back down to the vale at (14,0)
      'TooooGGGGGGGGGPGGGGGGGGGGooooT', // 1  <- road head (14,1)
      'TooooGGGGgggGGPGGgggGGGGGooooT', // 2
      'TooooGGGGgggGGPGGgggGGGGGooooT', // 3
      'TGGGGGGGGgggGGPGGgggGGGGGGGGGT', // 4
      'TGGGGGGGGGGGGGPGGGGGGGGGGGGGGT', // 5  <- Pruner Hallow at (13,5)
      'TooooooGGGGGGGPGGGGGGGooooooGT', // 6
      'TooooooGGSGGGGPGGGGGWWWGGGGGGT', // 7  <- Save Shrine (9,7); irrigation cistern east
      'TGGGGGGGGGGGGGPGGGGGWWWGGGGGGT', // 8
      'TGGGGGGGGGGGGGPGGGGGGGGGGGGGGT', // 9  <- Grafter's boy Tam at (18,9)
      'TooooGGGggggGGPGGggggGGGGooooT', // 10
      'TooooGGGggggGGPGGggggGGGGooooT', // 11
      'TGGGGGGGGGGGGGPGGGGGGGGGGGGGGT', // 12
      'TTTTTTGGGGGGGGPGGGGGGGGTTTTTTT', // 13 <- the road narrows into her terrace
      'TTTTTTGGGGGGGGGGGGGGGGGTTTTTTT', // 14 <- Warden Alder at (14,14)
      'TTTTTToooooooooooooooooTTTTTTT', // 15 <- the high rows, hers to keep
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 16
    ],
    exits: [{ x: 14, y: 0, to: 'sprawl_vale', toX: 13, toY: 15, facing: 'up' }],
    doors: [],
    npcs: [
      {
        id: 'pruner_hallow',
        name: 'Pruner Hallow',
        x: 13, y: 5, facing: 'right',
        palette: { h: '#5a4a32', f: '#d8a878', e: '#20203a', c: '#5a7a4a', g: '#c8e0a0', b: '#241d18' },
        dialogue: [
          'Far enough up, keeper. Alder does not see climbers who have not been pruned — her word, not mine, and she means it kindly. Mostly.',
          'Nothing personal in it. A branch that has never been cut grows long, and hollow, and snaps in the first real wind. Let us find out which you are.',
        ],
        battle: { trainerId: 'vale_acolyte', flag: 'vale_acolyte_won' },
        postWinDialogue: ['Solid wood. Go up — she has been standing at the top of that road since sunrise, which means she already knows you are coming.'],
        repeatDialogue: ['Up the terraces. Do not dawdle in the high rows; the Warden likes her fruit unbruised.'],
      },
      {
        id: 'orchard_tam',
        name: 'Tam',
        x: 18, y: 9, facing: 'left',
        palette: { h: '#8a6a3a', f: '#e8c39a', e: '#20203a', c: '#7a9a5a', g: '#d8a33a', b: '#241d18' },
        dialogue: [
          'You are the one from the slopes. The one it did not get.',
          'My gran says the Warden has been sleeping out here in the rows since midwinter. Not watching the road, mind — watching the TREES. Says she is waiting to see which of them stops answering her first.',
        ],
        repeatDialogue: ['She sleeps out in the rows. Watching the trees, not the road. I would not be able to sleep at all.'],
      },
      {
        // The fourth Warden. Beating her closes Chapter 4 and opens Chapter 5.
        id: 'warden_alder',
        name: 'Warden Alder',
        x: 14, y: 14, facing: 'up',
        palette: { h: '#8a8478', f: '#d8b08a', e: '#20203a', c: '#3f6e34', g: '#f4d24a', b: '#241d18' },
        dialogue: [
          'Wick cut his own graft for you, and Yarrow sent you up, and the boy in the rows told you I have been sleeping out here. All true. Sit or do not — but hear it properly.',
          'I have kept this vale eleven years and I have never once fought the Chain. I did not have to. It always wanted something a person could be talked out of. Then it stopped sending people.',
          'It has been coming through my orchard, {player}. Not taking fruit. Taking the QUIET — row by row, and the trees it passes never green again. That is what a hollowed hand does to a living thing. That is what your Echo would do to a door.',
          'So. The Sigil is not a prize here, and the Oath is not a courtesy. Show me the keeper who told it no, and show me properly.',
        ],
        battle: { trainerId: 'warden_alder', flag: 'warden4_won' },
        postWinDialogue: [
          'The Oath went and you did not falter. Four Sigils, Echo-bearer. Four seal-threads, and the ones who wrote them have been dust for a thousand years.',
          'Now the part I have been dreading. The Chain does not need the eighth door any more — not the way it needed it. It has learned to make hollowed things WITHOUT a keeper to hollow. That is what walks my rows. That is what came off the slopes at you.',
          'North of here the land goes white and does not stop: the Frostwall. The fifth Warden keeps a road nobody has walked in a generation, and the last Sigil-thread before the Expanse is hers. Rest at my shrine. Take the cordial. Then go, while the trees still answer.',
        ],
        repeatDialogue: ['The Sprawl Sigil is yours, keeper. North to the Frostwall when you are rested — and do not go quiet on the way. Quiet is how it finds you.'],
      },
    ],
    encounters: {
      rate: 0.16,
      table: [
        { speciesId: 'thistlebuck', weight: 30, min: 33, max: 36 },
        { speciesId: 'fernkit', weight: 28, min: 33, max: 36 },
        { speciesId: 'dawnfinch', weight: 24, min: 34, max: 37 },
        { speciesId: 'hollowmoth', weight: 12, min: 34, max: 37 },
        { speciesId: 'orchardwarden', weight: 6, min: 36, max: 38 },
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
