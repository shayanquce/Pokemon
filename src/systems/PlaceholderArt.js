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

/** Multiply a #rrggbb color's channels (mult < 1 darkens, > 1 lightens). */
function shade(hex, mult) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(v * mult)));
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** Pixel map -> 2D color grid (null = transparent). */
function gridFrom(rows, palette) {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const grid = [];
  for (let y = 0; y < h; y++) {
    grid.push([]);
    for (let x = 0; x < w; x++) grid[y].push(palette[rows[y][x]] ?? null);
  }
  return grid;
}

/**
 * EPX/Scale2x — doubles a color grid while rounding staircase corners, the
 * classic pixel-art smoothing pass. Keeps hard edges, kills the chunk.
 */
function epxScale(grid) {
  const h = grid.length, w = grid[0].length;
  const at = (x, y) => (y < 0 || x < 0 || y >= h || x >= w ? null : grid[y][x]);
  const out = Array.from({ length: h * 2 }, () => new Array(w * 2));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = at(x, y);
      const a = at(x, y - 1), b = at(x + 1, y), c = at(x - 1, y), d = at(x, y + 1);
      let tl = p, tr = p, bl = p, br = p;
      if (c === a && c !== d && a !== b) tl = a;
      if (a === b && a !== c && b !== d) tr = b;
      if (d === c && d !== b && c !== a) bl = c;
      if (b === d && b !== a && d !== c) br = d;
      out[y * 2][x * 2] = tl;
      out[y * 2][x * 2 + 1] = tr;
      out[y * 2 + 1][x * 2] = bl;
      out[y * 2 + 1][x * 2 + 1] = br;
    }
  }
  return out;
}

/**
 * Volume pass: lighten silhouette tops (sky light), darken undersides, and
 * apply a soft top-to-bottom gradient so flat color regions read as round.
 */
function shadeGrid(grid) {
  const h = grid.length, w = grid[0].length;
  const solid = (x, y) => y >= 0 && x >= 0 && y < h && x < w && grid[y][x];
  const out = grid.map((row) => row.slice());
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!grid[y][x]) continue;
      let mult = 1.04 - 0.13 * (y / h); // ambient gradient
      if (!solid(x, y - 1)) mult *= 1.22; // lit top rim
      else if (!solid(x, y + 1)) mult *= 0.74; // shaded underside
      else if (!solid(x - 1, y)) mult *= 1.08; // soft left key light
      else if (!solid(x + 1, y)) mult *= 0.88; // soft right falloff
      out[y][x] = shade(grid[y][x], mult);
    }
  }
  return out;
}

const OUTLINE_COLOR = '#10141f';

/** Render a color grid to a canvas texture with a 1px dark outline around the silhouette. */
function gridTexture(scene, key, grid, pixel = 1) {
  if (scene.textures.exists(key)) return;
  const h = grid.length, w = grid[0].length;
  const c = scene.textures.createCanvas(key, (w + 2) * pixel, (h + 2) * pixel);
  const ctx = c.context;
  const solid = (x, y) => y >= 0 && x >= 0 && y < h && x < w && grid[y][x];
  for (let y = -1; y <= h; y++) {
    for (let x = -1; x <= w; x++) {
      let color = solid(x, y) ? grid[y][x] : null;
      if (!color && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) {
        color = OUTLINE_COLOR;
      }
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect((x + 1) * pixel, (y + 1) * pixel, pixel, pixel);
    }
  }
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

  // Second water frame — same body, shifted glints. WorldScene swaps the two
  // on a timer so every pool ripples gently.
  noiseTile(scene, 'tile_water2', '#1c3a5e', ['#234a78'], 55, {
    count: 30,
    post: (ctx, rnd) => {
      ctx.fillStyle = '#2e5a8e';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(2 + Math.floor(rnd() * 18), 2 + Math.floor(rnd() * 26), 7 + Math.floor(rnd() * 5), 1);
      }
      ctx.fillStyle = '#3f6f9f';
      ctx.fillRect(10, 14, 6, 1);
      ctx.fillRect(20, 6, 7, 1);
    },
  });

  noiseTile(scene, 'tile_tree', '#2e4f36', ['#27452f'], 66, {
    count: 20,
    post: (ctx) => {
      // Crisp stepped-circle canopy (no AA) over a shaded trunk.
      const disc = (cx, cy, r, color) => {
        ctx.fillStyle = color;
        for (let dy = -r; dy <= r; dy++) {
          const half = Math.floor(Math.sqrt(r * r - dy * dy));
          ctx.fillRect(cx - half, cy + dy, half * 2 + 1, 1);
        }
      };
      ctx.fillStyle = 'rgba(10,16,10,0.45)'; // ground shadow
      ctx.fillRect(8, 27, 16, 3);
      ctx.fillStyle = '#241a10';
      ctx.fillRect(13, 17, 6, 12);
      ctx.fillStyle = '#3a2b1d';
      ctx.fillRect(15, 17, 4, 12);
      disc(16, 11, 10, '#16301f'); // canopy: dark base, mid, lit crown
      disc(15, 10, 9, '#1f4029');
      disc(14, 8, 7, '#2a5236');
      disc(12, 6, 4, '#356445');
      ctx.fillStyle = '#41684a'; // glints
      ctx.fillRect(10, 4, 2, 2);
      ctx.fillRect(17, 7, 2, 1);
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

  noiseTile(scene, 'tile_cave_wall', '#2c2c38', ['#222230', '#363646', '#1c1c28'], 99, {
    count: 40,
    post: (ctx) => {
      ctx.fillStyle = '#16161f';
      ctx.fillRect(0, 28, 32, 4);
      ctx.fillRect(0, 0, 2, 32);
    },
  });

  noiseTile(scene, 'tile_cave_floor', '#3e3a44', ['#363240', '#48424f', '#302c38'], 111);

  noiseTile(scene, 'tile_cave_gravel', '#36323e', ['#2c2836', '#403a48'], 122, {
    count: 50,
    post: (ctx, rnd) => {
      ctx.fillStyle = '#524a5c';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(2 + Math.floor(rnd() * 27), 2 + Math.floor(rnd() * 27), 3, 2);
      }
    },
  });

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

/**
 * Expand the 6-key character palette (h/f/e/c/g/b, the schema map NPC defs
 * already use) into the full shaded glyph set the hi-res maps draw with.
 */
function charPalette(p) {
  return {
    h: p.h, H: shade(p.h, 0.66),
    f: p.f, F: shade(p.f, 0.74),
    e: p.e,
    c: p.c, C: shade(p.c, 0.62), l: shade(p.c, 1.35),
    g: p.g,
    b: p.b, B: shade(p.b, 1.9),
  };
}

/**
 * Character bodies are 16x18 pixel maps (head + torso); legs are 16x6 maps
 * composed underneath, with idle / stride-A / stride-B variants per facing.
 * Final frames are 16x24, rendered at 2px = 32x48 with a generated outline.
 * Side maps face RIGHT; flipX gives left.
 */
const CHAR_BODY = {
  down: [
    '.....hhhhhh.....',
    '....hhhhhhhh....',
    '...hhhhhhhhhh...',
    '...hhhhhhhhhh...',
    '...hHhhhhhhHh...',
    '...hffffffffh...',
    '...HfeffffefH...',
    '...HfeffffefH...',
    '....ffffffff....',
    '....FFffffFF....',
    '....occggcco....',
    '...cccccccccc...',
    '..clcccccccclc..',
    '..clcccccccclc..',
    '..cfccccccccfc..',
    '..cFccccccccFc..',
    '...CCccccccCC...',
    '...CCCccccCCC...',
  ],
  up: [
    '.....hhhhhh.....',
    '....hhhhhhhh....',
    '...hhhhhhhhhh...',
    '...hhhhhhhhhh...',
    '...hhhhhhhhhh...',
    '...hhhhhhhhhh...',
    '...HhhhhhhhhH...',
    '...HhhhhhhhhH...',
    '....hhhhhhhh....',
    '....HHhhhhHH....',
    '....cccccccc....',
    '...cccccccccc...',
    '..cccccccccccc..',
    '..cccccccccccc..',
    '..cCccccccccCc..',
    '..cCccccccccCc..',
    '...CCccccccCC...',
    '...CCCccccCCC...',
  ],
  side: [
    '.....hhhhhh.....',
    '....hhhhhhhh....',
    '....hhhhhhhhh...',
    '....hhhhhhhhh...',
    '....hHhhhhhhh...',
    '....hhhhfffff...',
    '....Hhhhfefff...',
    '....Hhhhfffff...',
    '.....hhhffff....',
    '.....HHhFFF.....',
    '......cccgc.....',
    '.....ccccccc....',
    '....ccccccccc...',
    '....clcccccCc...',
    '....clcccccCc...',
    '....cfcccccCc...',
    '.....CccccCC....',
    '.....CCccCCC....',
  ],
};

const CHAR_LEGS = {
  down: {
    idle: [
      '...bbb....bbb...',
      '...bbb....bbb...',
      '...bbb....bbb...',
      '...Bbb....Bbb...',
      '...BBb....BBb...',
      '................',
    ],
    a: [
      '...bbb....bbb...',
      '...bbb....bbb...',
      '...bbb....BBb...',
      '...Bbb..........',
      '...BBb..........',
      '................',
    ],
    b: [
      '...bbb....bbb...',
      '...bbb....bbb...',
      '...Bbb....bbb...',
      '..........Bbb...',
      '..........BBb...',
      '................',
    ],
  },
  side: {
    idle: [
      '.....bbbbb......',
      '.....bbbbb......',
      '.....bbbbb......',
      '.....Bbbbb......',
      '.....BBBBb......',
      '................',
    ],
    a: [
      '.....bbbbb......',
      '....bbb.bbb.....',
      '...bbb...bbb....',
      '...Bbb...Bbb....',
      '...BBb....BB....',
      '................',
    ],
    b: [
      '.....bbbbb......',
      '.....bbbbb......',
      '....bbb.bb......',
      '....Bbb.Bbb.....',
      '....BBb..BB.....',
      '................',
    ],
  },
};
CHAR_LEGS.up = CHAR_LEGS.down; // legs read the same from behind

const CHAR_FRAMES = ['idle', 'a', 'b'];

/**
 * Build the 9 frame textures for one character:
 * `<base>_down_0..2`, `<base>_up_0..2`, `<base>_side_0..2`
 * (0 = standing, 1/2 = stride frames; side faces right, flipX for left).
 */
function ensureCharTextures(scene, base, sixKeyPalette) {
  if (scene.textures.exists(`${base}_down_0`)) return;
  const pal = charPalette(sixKeyPalette);
  for (const dir of ['down', 'up', 'side']) {
    CHAR_FRAMES.forEach((variant, i) => {
      const rows = [...CHAR_BODY[dir], ...CHAR_LEGS[dir][variant]];
      gridTexture(scene, `${base}_${dir}_${i}`, gridFrom(rows, pal), 2);
    });
  }
}

function ensurePlayerTextures(scene) {
  ensureCharTextures(scene, 'player', PLAYER_PALETTE);
}

/**
 * NPCs reuse the player pixel-maps with their own palette (hair/skin/cloak
 * colors come from the map data). Keys: npc_<id>_<dir>_<frame>.
 */
function ensureNpcTextures(scene, id, palette) {
  ensureCharTextures(scene, `npc_${id}`, palette);
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

// North Road wilds.
Object.assign(STARTER_PIXELMAPS, {
  voltail: {
    palette: { b: '#b8893a', d: '#8a6428', y: '#e8c84a', k: '#241d10', w: '#f2e6b0' },
    rows: [
      '..........yy....',
      '.........yy.....',
      '..bb....yy......',
      '.bbbb..yy.......',
      '.bkbb.yy........',
      '.bbbbbyy........',
      '..bbbbby........',
      '.bwwbbb.........',
      '.bwwbbbb........',
      '..bbbbbb........',
      '..bb.bb.........',
      '..d...d.........',
    ],
  },
  mirewisp: {
    palette: { s: '#b8c8e8', S: '#dce8f8', b: '#5a78b8', k: '#1c2030', g: '#8fd8c8' },
    rows: [
      '......gg........',
      '.....gSSg.......',
      '....gSSSSg......',
      '....sSSSSs......',
      '...ssSSSSss.....',
      '...sskSSkss.....',
      '...sssSSsss.....',
      '....ssssss......',
      '...s.ssss.s.....',
      '....ssssss......',
      '.....ssss.......',
      '......ss........',
    ],
  },
  bristleboar: {
    palette: { b: '#6e5238', d: '#523c28', q: '#3a2c1c', y: '#d8b88a', k: '#1c130a', p: '#c89888' },
    rows: [
      '..qq.qq.qq......',
      '.qqqqqqqqqq.....',
      'qbbbbbbbbbbq....',
      'qbkbbbbbbbbbq...',
      '.bbbbbbbbbbbb...',
      '.byybbbbbbbbb...',
      '.bppbbbbbbbbbb..',
      '..bbbbbbbbbbbb..',
      '..bbbbbbbbbbb...',
      '..bb.bb.bb.bb...',
      '..dd.dd.dd.dd...',
      '................',
    ],
  },
  pebblump: {
    palette: { s: '#9a8a66', d: '#7a6e52', l: '#b8a87e', k: '#241d10', m: '#5da55f' },
    rows: [
      '....ssssss......',
      '..sslssssss.....',
      '.ssssssssssss...',
      '.sskssssskss....',
      'ssssssssssssss..',
      'sslsssssssslss..',
      'ssssssmssssss...',
      '.sssssssssss....',
      '..sssssssss.....',
      '...ddddddd......',
      '....dd.dd.......',
      '................',
    ],
  },
  zephyrkit: {
    palette: { c: '#9fd0c8', d: '#6ea8a0', w: '#cdeee8', k: '#1c3030', p: '#e8a8b8' },
    rows: [
      '..c.....c.......',
      '..cc...cc.......',
      '..ccccccc.......',
      '..ckcccck.......',
      '..ccpccpc.......',
      '...ccccc........',
      '..ccccccc..ww...',
      '.cccccccccww....',
      '.ccccccccww.....',
      '..cccccccw......',
      '..cc..cc........',
      '..d....d........',
    ],
  },
});

// Hollow Cave wild.
Object.assign(STARTER_PIXELMAPS, {
  gloombat: {
    palette: { p: '#6a5a8a', d: '#4e4268', w: '#8a7aaa', k: '#1c1424', r: '#c05a6a' },
    rows: [
      'p..............p',
      'pp....pp.p....pp',
      'ppp..pppppp..ppp',
      'pwppppppppppppwp',
      'pwwpppkppkpppwwp',
      '.pwpppppppppwwp.',
      '..ppppprrpppppp.',
      '...pppprrpppp...',
      '....pppppppp....',
      '.....pp..pp.....',
      '....pp....pp....',
      '................',
    ],
  },
});

/**
 * Texture key is `lum_<speciesId>` (e.g. lum_embrik). The 16-wide pixel map
 * is EPX-doubled twice (16x the pixels, staircases rounded into curves) and
 * outlined. Canvas is ~66x50 — call sites display at half their old scale.
 */
function ensureLuminaryTexture(scene, speciesId) {
  const def = STARTER_PIXELMAPS[speciesId];
  if (!def) return;
  gridTexture(scene, `lum_${speciesId}`, shadeGrid(epxScale(epxScale(gridFrom(def.rows, def.palette)))), 1);
}
