/**
 * PlaceholderArt — procedurally generated pixel-art textures so the game is
 * fully playable before final sprite sheets exist. Every function is
 * idempotent: textures are only created once per TextureManager.
 */

/** Deterministic PRNG so tiles look identical every launch. */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Paint a string pixel-map onto a new canvas texture (1 char = scale*scale px). */
function pixelTexture(scene, key, rows, palette, scale = 2) {
  if (scene.textures.exists(key)) return;
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const c = scene.textures.createCanvas(key, w * scale, h * scale);
  const ctx = c.context;
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = palette[row[x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  });
  c.refresh();
}

/** 32x32 tile: solid base color + seeded speckle noise + optional extra pass. */
function noiseTile(scene, key, base, specks, seed, opts = {}) {
  if (scene.textures.exists(key)) return;
  const S = 32;
  const c = scene.textures.createCanvas(key, S, S);
  const ctx = c.context;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  const rnd = mulberry32(seed);
  const count = opts.count ?? 70;
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = specks[Math.floor(rnd() * specks.length)];
    ctx.fillRect(Math.floor(rnd() * S), Math.floor(rnd() * S), 2, 2);
  }
  opts.post?.(ctx, rnd);
  c.refresh();
}

/** Build every overworld tile + the Save Shrine object texture. */
function ensureWorldTextures(scene) {
  noiseTile(scene, 'tile_grass', '#2e4f36', ['#27452f', '#36593d', '#2a4a32'], 11);

  noiseTile(scene, 'tile_grass_tall', '#2a4a32', ['#27452f', '#36593d'], 22, {
    post: (ctx, rnd) => {
      for (let i = 0; i < 9; i++) {
        const x = 2 + Math.floor(rnd() * 28);
        const h = 6 + Math.floor(rnd() * 8);
        ctx.fillStyle = '#203c2a';
        ctx.fillRect(x, 32 - h, 2, h);
        ctx.fillStyle = '#41684a';
        ctx.fillRect(x, 32 - h, 2, 2);
      }
    },
  });

  noiseTile(scene, 'tile_flowers', '#2e4f36', ['#27452f', '#36593d'], 33, {
    count: 40,
    post: (ctx, rnd) => {
      const colors = ['#d4af37', '#e8e4e0', '#c97ba0'];
      for (let i = 0; i < 3; i++) {
        const x = 4 + Math.floor(rnd() * 24);
        const y = 4 + Math.floor(rnd() * 24);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x - 2, y, 2, 2);
        ctx.fillRect(x + 2, y, 2, 2);
        ctx.fillRect(x, y - 2, 2, 2);
        ctx.fillRect(x, y + 2, 2, 2);
        ctx.fillStyle = '#8a5a2a';
        ctx.fillRect(x, y, 2, 2);
      }
    },
  });

  noiseTile(scene, 'tile_path', '#7a6a4e', ['#6a5c42', '#8a7a5c', '#5f5440'], 44);

  noiseTile(scene, 'tile_water', '#1c3a5e', ['#234a78'], 55, {
    count: 30,
    post: (ctx, rnd) => {
      ctx.fillStyle = '#2e5a8e';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(Math.floor(rnd() * 20), 4 + Math.floor(rnd() * 26), 8 + Math.floor(rnd() * 4), 1);
      }
      ctx.fillStyle = '#3f6f9f';
      ctx.fillRect(6, 10, 6, 1);
      ctx.fillRect(18, 22, 7, 1);
    },
  });

  noiseTile(scene, 'tile_tree', '#2e4f36', ['#27452f'], 66, {
    count: 20,
    post: (ctx) => {
      ctx.fillStyle = '#3a2b1d';
      ctx.fillRect(13, 18, 6, 12);
      ctx.fillStyle = '#241a10';
      ctx.fillRect(13, 18, 2, 12);
      ctx.fillStyle = '#16301f';
      ctx.fillRect(3, 4, 26, 18);
      ctx.fillStyle = '#1f4029';
      ctx.fillRect(5, 2, 22, 18);
      ctx.fillStyle = '#2a5236';
      ctx.fillRect(7, 4, 18, 12);
      ctx.fillStyle = '#356445';
      ctx.fillRect(9, 6, 4, 3);
      ctx.fillRect(18, 9, 5, 3);
    },
  });

  noiseTile(scene, 'tile_roof', '#6e3a2e', ['#5e3026', '#7e463a', '#54281f'], 77, {
    count: 24,
    post: (ctx) => {
      ctx.fillStyle = '#54281f';
      for (let y = 6; y < 32; y += 8) ctx.fillRect(0, y, 32, 2);
      ctx.fillStyle = '#8a5a4a';
      ctx.fillRect(0, 0, 32, 2);
    },
  });

  noiseTile(scene, 'tile_wall', '#7e7468', ['#6e6458', '#8e8478'], 88, {
    count: 18,
    post: (ctx) => {
      // Plank seams + a small shuttered window.
      ctx.fillStyle = '#5e564c';
      ctx.fillRect(0, 10, 32, 1);
      ctx.fillRect(0, 22, 32, 1);
      ctx.fillRect(10, 0, 1, 32);
      ctx.fillRect(22, 0, 1, 32);
    },
  });

  if (!scene.textures.exists('tile_door')) {
    const c = scene.textures.createCanvas('tile_door', 32, 32);
    const ctx = c.context;
    ctx.fillStyle = '#7e7468';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#4a3424';
    ctx.fillRect(6, 4, 20, 28);
    ctx.fillStyle = '#5e4430';
    ctx.fillRect(8, 6, 16, 26);
    ctx.fillStyle = '#3a2a1c';
    ctx.fillRect(15, 6, 2, 26);
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(11, 18, 3, 3);
    c.refresh();
  }

  // Save Shrine: stone plinth + rune-marked pillar + floating crystal (32x48).
  if (!scene.textures.exists('shrine_obj')) {
    const c = scene.textures.createCanvas('shrine_obj', 32, 48);
    const ctx = c.context;
    ctx.fillStyle = '#39404f';
    ctx.fillRect(4, 42, 24, 6);
    ctx.fillStyle = '#4a5266';
    ctx.fillRect(6, 36, 20, 8);
    ctx.fillStyle = '#5a6478';
    ctx.fillRect(10, 20, 12, 18);
    ctx.fillStyle = '#6a7488';
    ctx.fillRect(11, 20, 4, 18);
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(14, 24, 4, 2);
    ctx.fillRect(14, 29, 4, 2);
    ctx.fillRect(14, 34, 4, 2);
    ctx.fillStyle = '#9fd8ff';
    ctx.beginPath();
    ctx.moveTo(16, 2);
    ctx.lineTo(23, 11);
    ctx.lineTo(16, 20);
    ctx.lineTo(9, 11);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e2f6ff';
    ctx.beginPath();
    ctx.moveTo(16, 5);
    ctx.lineTo(20, 11);
    ctx.lineTo(16, 17);
    ctx.lineTo(12, 11);
    ctx.closePath();
    ctx.fill();
    c.refresh();
  }
}

const PLAYER_PALETTE = {
  h: '#3b2a1e', // hair
  f: '#e8c39a', // skin
  e: '#20203a', // eyes
  c: '#39516e', // cloak (slate blue)
  g: '#d4af37', // gold clasp
  b: '#241d18', // boots
};

const PLAYER_DOWN = [
  '..hhhh..',
  '.hhhhhh.',
  '.hhhhhh.',
  '.hffffh.',
  '.hfefeh.',
  '..ffff..',
  '..cggc..',
  '.cccccc.',
  '.cccccc.',
  'fccccccf',
  '..cccc..',
  '..c..c..',
  '..b..b..',
  '.bb..bb.',
];

const PLAYER_UP = [
  '..hhhh..',
  '.hhhhhh.',
  '.hhhhhh.',
  '.hhhhhh.',
  '.hhhhhh.',
  '..hhhh..',
  '..cggc..',
  '.cccccc.',
  '.cccccc.',
  'fccccccf',
  '..cccc..',
  '..c..c..',
  '..b..b..',
  '.bb..bb.',
];

// Drawn facing right; flipX renders the left-facing version.
const PLAYER_SIDE = [
  '..hhhh..',
  '.hhhhhh.',
  '.hhhhhh.',
  '..hffff.',
  '..hffef.',
  '..ffff..',
  '..cggc..',
  '..ccccc.',
  '..ccccc.',
  '..ccccf.',
  '..cccc..',
  '..c.c...',
  '..b.b...',
  '..bb.b..',
];

function ensurePlayerTextures(scene) {
  pixelTexture(scene, 'player_down', PLAYER_DOWN, PLAYER_PALETTE, 3);
  pixelTexture(scene, 'player_up', PLAYER_UP, PLAYER_PALETTE, 3);
  pixelTexture(scene, 'player_side', PLAYER_SIDE, PLAYER_PALETTE, 3);
}

/**
 * NPCs reuse the player pixel-maps with their own palette (hair/skin/cloak
 * colors come from the map data). Keys: npc_<id>_down / _up / _side.
 */
function ensureNpcTextures(scene, id, palette) {
  pixelTexture(scene, `npc_${id}_down`, PLAYER_DOWN, palette, 3);
  pixelTexture(scene, `npc_${id}_up`, PLAYER_UP, palette, 3);
  pixelTexture(scene, `npc_${id}_side`, PLAYER_SIDE, palette, 3);
}

/** Hand-pixelled placeholder portraits for starters + early wild Luminary. */
const STARTER_PIXELMAPS = {
  sprigling: {
    palette: { v: '#4e7a42', L: '#6aa052', d: '#3a5c32', k: '#1c2e18', y: '#d4af37', n: '#5e4430' },
    rows: [
      '.....LL.........',
      '....LLLL..L.....',
      '...LLvvLLLL.....',
      '....vvvvvL......',
      '...vvvvvvv......',
      '..vvkvvvkvv.....',
      '..vvvvvvvvv.....',
      '..vvvyyvvvv.....',
      '...vvvvvvv......',
      '..vv.vvv.vv.....',
      '..n...n...n.....',
      '.nn..nn..nn.....',
    ],
  },
  ashvole: {
    palette: { a: '#8a8478', d: '#6e6a5e', w: '#b8b4a8', k: '#241d18', p: '#c97ba0', n: '#3a3430' },
    rows: [
      '..aa......aa....',
      '.apaa....aapa...',
      '.aaaaaaaaaaaa...',
      '.aakaaaaaakaa...',
      '..aaaawwaaaa....',
      '..aaawwwwaaa....',
      '.aaaaawwaaaaa...',
      '.aaaaaaaaaaaa...',
      '..aaaaaaaaaa..n.',
      '..aaa.aa.aaa.n..',
      '...dd.dd.dd.n...',
      '..ddd.dd.ddd....',
    ],
  },
  glimwing: {
    palette: { w: '#9fd0c8', W: '#cdeee8', y: '#efe2a0', g: '#d4af37', k: '#1c2030', b: '#5a6478' },
    rows: [
      '.ww..........ww.',
      'wWWw........wWWw',
      'wWWWw..bb..wWWWw',
      'wWyWww.bb.wwWyWw',
      'wWWWwwbkkbwwWWWw',
      '.wWWwbbbbbbwWWw.',
      '..wwwbgbbgbwww..',
      '...wbbbbbbbbw...',
      '..wWwbbbbbbwWw..',
      '.wWWw.bbbb.wWWw.',
      'wWyWw..bb..wWyWw',
      '.www...bb...www.',
    ],
  },
  embrik: {
    palette: { o: '#d96a2f', d: '#b34f1f', y: '#f2cf9a', k: '#26150d', F: '#ffd166', R: '#e84a2a' },
    rows: [
      '..o......o......',
      '..oo....oo......',
      '..ooo..ooo......',
      '..oooooooo......',
      '..okoooko.......',
      '..ooyyoo........',
      '..oooooo....FF..',
      '.oooyyyyo...FRF.',
      '.oooyyyyoo..oo..',
      '..oooooooooo....',
      '..oo.oo..oo.....',
      '..d...d...d.....',
    ],
  },
  tidalink: {
    palette: { t: '#3f8fae', d: '#2c6a86', l: '#aef0e8', k: '#13313f' },
    rows: [
      '...l........l...',
      '...t........t...',
      '...t.......t....',
      '....tt....tt....',
      '....tttttttt....',
      '...tttttttttt...',
      '..ttkttttkttt...',
      '..tltttltttttt..',
      '.tttttttttttttt.',
      '.ttltttlttltttt.',
      '..dddddddddddd..',
      '...dddddddddd...',
    ],
  },
  thornpaw: {
    palette: { b: '#7a5a3a', d: '#5e4429', y: '#d8b88a', v: '#4e7a42', L: '#6aa052', k: '#241509', n: '#3a2415' },
    rows: [
      '..bb......bb....',
      '.bbbb....bbbb...',
      '.bbbbbbbbbbbb...',
      '.bbkbbbbbbkbb...',
      '.bbbbbnnbbbbb...',
      '..bbbbbbbbbb....',
      'Lv.bbbbbbbb.vL..',
      '.v.bbyyyybb.v...',
      '.vvbbyyyybbvv...',
      '..bbbbbbbbbb....',
      '..bbb.bb.bbb....',
      '..dd..dd..dd....',
    ],
  },
};

// First-stage evolutions — slightly taller maps so they read as "grown".
Object.assign(STARTER_PIXELMAPS, {
  embrath: {
    palette: { o: '#d96a2f', d: '#b34f1f', y: '#f2cf9a', k: '#26150d', F: '#ffd166', R: '#e84a2a', M: '#ff8c42' },
    rows: [
      '..o......o....MM',
      '..oo....oo...MFM',
      '..ooo..ooo...MM.',
      '..oooooooo..MM..',
      '..okoooko..MFM..',
      '..ooyyoo...MM...',
      '.oooooooooMM....',
      '.oooyyyyooFM....',
      'ooooyyyyooMM....',
      'oooooooooooo....',
      '.ooo.oo..ooo....',
      '.oo...d...oo....',
      '.d.....d...d....',
      'dd....dd..dd....',
    ],
  },
  tidarune: {
    palette: { t: '#3f8fae', d: '#2c6a86', l: '#aef0e8', k: '#13313f', g: '#ffd166' },
    rows: [
      '...l.........l..',
      '...t....l....t..',
      '...tt...t...tt..',
      '....ttttttttt...',
      '...ttttttttttt..',
      '..tttgttttgttt..',
      '..ttkttttttkttt.',
      '.ttltttgtttltttt',
      '.tttttttttttttgt',
      'ttgtttlttltttttt',
      'tttttttttttttttt',
      '.dddddddddddddd.',
      '..dddddddddddd..',
      '...dddddddddd...',
    ],
  },
  thorngrove: {
    palette: { b: '#7a5a3a', d: '#5e4429', y: '#d8b88a', v: '#4e7a42', L: '#6aa052', k: '#241509', n: '#3a2415' },
    rows: [
      '...LLL....LLL...',
      '..LvvvLLLLvvvL..',
      '..LLvvvvvvvvLL..',
      '..bb..vvvv..bb..',
      '.bbbb.LLLL.bbbb.',
      '.bbbbbbbbbbbbb..',
      '.bbkbbbbbbbkbb..',
      '.bbbbbnnbbbbbb..',
      '.vbbbyyyybbbbv..',
      '.vvbbyyyybbbvv..',
      '.bbbbbbbbbbbbb..',
      '.bbbb.bbb.bbbb..',
      '..nn..nnn..nn...',
      '.nnn..nnn..nnn..',
    ],
  },
  spriggrove: {
    palette: { v: '#4e7a42', L: '#6aa052', d: '#3a5c32', k: '#1c2e18', y: '#d4af37', n: '#5e4430' },
    rows: [
      '....LLL..LL.....',
      '...LLLLLLLLL....',
      '..LLvvLLLvvLL...',
      '...vvvvvvvvv....',
      '..vvvvvvvvvvv...',
      '..vvkvvvvvkvv...',
      '..vvvvvvvvvvv...',
      '..vvvyyyyvvvv...',
      '..nvvvvvvvvvn...',
      '..nnvvvvvvvnn...',
      '...nn.vvv.nn....',
      '...n...n...n....',
      '..nn..nn..nn....',
      '.nnn..nn..nnn...',
    ],
  },
  cindervole: {
    palette: { a: '#8a8478', d: '#6e6a5e', w: '#b8b4a8', k: '#241d18', p: '#c97ba0', n: '#3a3430', R: '#e84a2a', F: '#ffd166' },
    rows: [
      '..aa......aa....',
      '.apaa....aapa...',
      '.aaaaaaaaaaaa...',
      '.aakaaaaaakaa...',
      '..aaaawwaaaa....',
      '..aaawwwwaaa....',
      '.aaaaaFFaaaaa...',
      '.aaaaFRRFaaaa...',
      '.aaaaaFFaaaaa.n.',
      '.aaaaaaaaaaa.nn.',
      '..aaa.aa.aaa.n..',
      '...dd.dd.dd.n...',
      '..ddd.dd.ddd....',
    ],
  },
  lumenmoth: {
    palette: { w: '#9fd0c8', W: '#cdeee8', y: '#efe2a0', g: '#d4af37', k: '#1c2030', b: '#5a6478' },
    rows: [
      'ww............ww',
      'wWWw..........wW',
      'wWWWWw.bb..wWWWW',
      'wWyyWWw.bbwWWyyW',
      'wWWWWWwbkkbWWWWW',
      '.wWWgWwbbbbWgWWw',
      '..wWWWbbbbbbWWw.',
      '..wwwbgbbgbwww..',
      '..wWWbbbbbbWWw..',
      '.wWWWw.bbbbWWWw.',
      'wWyyWw..bb.wWyyW',
      'wWWWw...bb..wWWW',
      '.www....bb...www',
      '........bb......',
    ],
  },
});

/** Texture key is `lum_<speciesId>` (e.g. lum_embrik). */
function ensureLuminaryTexture(scene, speciesId) {
  const def = STARTER_PIXELMAPS[speciesId];
  if (!def) return;
  pixelTexture(scene, `lum_${speciesId}`, def.rows, def.palette, 2);
}
