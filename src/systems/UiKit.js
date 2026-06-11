/**
 * UiKit — shared dark-fantasy palette, fonts, and small keyboard-driven
 * widgets (panels, menus, confirm boxes) used by every scene.
 */
const UI = {
  colors: {
    bgTop: 0x070b14,
    bgBottom: 0x131f3a,
    panel: 0x0d1526,
    panelEdge: 0xd4af37, // gold
    panelEdgeDim: 0x3a4a66, // slate
    gold: '#d4af37',
    parchment: '#e8dcb8',
    dim: '#7d8aa5',
    danger: '#e06060',
    good: '#7ec97e',
  },
  fonts: {
    title: 'Georgia, "Times New Roman", serif',
    body: 'Consolas, "Courier New", monospace',
  },
};

/** Display colors for all 18 Luminary types (used on badges, moves, particles). */
const TYPE_COLORS = {
  Flame: '#e0703a',
  Tide: '#3f7fd0',
  Stone: '#9a8a66',
  Wind: '#9fd0c8',
  Volt: '#e8c84a',
  Frost: '#9fd8ff',
  Verdant: '#5da55f',
  Shadow: '#6a5a8a',
  Light: '#efe2a0',
  Psyche: '#c070d0',
  Venom: '#a05aa0',
  Iron: '#8a93a0',
  Echo: '#d4af37',
  Void: '#43355e',
  Spirit: '#b8c8e8',
  Beast: '#b07a4a',
  Arcane: '#7a6ad8',
  Storm: '#5a78b8',
};

/** Phaser text style helpers (body / title font). */
function textStyle(size, color, extra = {}) {
  return { fontFamily: UI.fonts.body, fontSize: `${size}px`, color, ...extra };
}

function titleStyle(size, color, extra = {}) {
  return { fontFamily: UI.fonts.title, fontSize: `${size}px`, color, ...extra };
}

/** Dark panel with a gold (or slate) edge and runic corner ticks. */
function drawPanel(scene, x, y, w, h, opts = {}) {
  const g = scene.add.graphics();
  const edge = opts.edge ?? UI.colors.panelEdge;
  g.fillStyle(opts.fill ?? UI.colors.panel, opts.alpha ?? 0.94);
  g.fillRect(x, y, w, h);
  g.lineStyle(2, edge, opts.edgeAlpha ?? 0.9);
  g.strokeRect(x + 1, y + 1, w - 2, h - 2);

  // Heavier corner ticks for the runic look.
  const n = 9;
  g.lineStyle(4, edge, 1);
  g.beginPath();
  g.moveTo(x + 1, y + 1 + n); g.lineTo(x + 1, y + 1); g.lineTo(x + 1 + n, y + 1);
  g.moveTo(x + w - 1 - n, y + 1); g.lineTo(x + w - 1, y + 1); g.lineTo(x + w - 1, y + 1 + n);
  g.moveTo(x + 1, y + h - 1 - n); g.lineTo(x + 1, y + h - 1); g.lineTo(x + 1 + n, y + h - 1);
  g.moveTo(x + w - 1 - n, y + h - 1); g.lineTo(x + w - 1, y + h - 1); g.lineTo(x + w - 1, y + h - 1 - n);
  g.strokePath();
  return g;
}

/** Full-screen night gradient used behind menus. */
function drawBackdrop(scene) {
  const W = scene.scale.width, H = scene.scale.height;
  const g = scene.add.graphics();
  g.fillGradientStyle(UI.colors.bgTop, UI.colors.bgTop, UI.colors.bgBottom, UI.colors.bgBottom, 1);
  g.fillRect(0, 0, W, H);
  return g;
}

/** Decorative double gold frame around the screen edge. */
function drawRunicFrame(scene, inset = 12) {
  const W = scene.scale.width, H = scene.scale.height;
  const g = scene.add.graphics();
  g.lineStyle(2, UI.colors.panelEdge, 0.35);
  g.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
  g.lineStyle(1, UI.colors.panelEdge, 0.18);
  g.strokeRect(inset + 6, inset + 6, W - (inset + 6) * 2, H - (inset + 6) * 2);
  g.fillStyle(UI.colors.panelEdge, 0.5);
  for (const [cx, cy] of [[inset, inset], [W - inset, inset], [inset, H - inset], [W - inset, H - inset]]) {
    g.fillRect(cx - 3, cy - 3, 6, 6);
  }
  return g;
}

/** Tiny diamond texture used for particles (motes, sparkles, bursts). */
function ensureSparkTexture(scene) {
  if (scene.textures.exists('spark')) return;
  const c = scene.textures.createCanvas('spark', 5, 5);
  const ctx = c.context;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(1, 0, 3, 5);
  ctx.fillRect(0, 1, 5, 3);
  c.refresh();
}

function formatPlaytime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

function formatTimestamp(ms) {
  return ms ? new Date(ms).toLocaleString() : '—';
}

const MAP_DISPLAY_NAMES = {
  ashfen_grove: 'Ashfen — Whispergrove',
  ashfen_town: 'Ashfen Town',
  north_road: 'Ashfen Lowlands — North Road',
  hollow_cave: 'Hollow Cave',
};

function prettyMapName(id) {
  return MAP_DISPLAY_NAMES[id] ?? String(id ?? '???').replace(/_/g, ' ');
}

/**
 * MenuList — vertical keyboard menu (Up/Down/W/S to move, Z/Enter to select,
 * X/Esc fires onCancel when provided). Call destroy() when done.
 */
class MenuList {
  constructor(scene, { x, y, items, spacing = 44, fontSize = 22, origin = 0.5, depth = 10, onCancel = null }) {
    this.scene = scene;
    this.items = items;
    this.index = 0;
    this.enabled = true;
    this.onCancel = onCancel;

    this.texts = items.map((item, i) =>
      scene.add
        .text(x, y + i * spacing, item.label, textStyle(fontSize, UI.colors.parchment))
        .setOrigin(origin, 0.5)
        .setDepth(depth)
    );
    this.cursor = scene.add.text(0, 0, '>', textStyle(fontSize, UI.colors.gold)).setOrigin(1, 0.5).setDepth(depth);

    this.handlers = {
      'keydown-UP': () => this.move(-1),
      'keydown-W': () => this.move(-1),
      'keydown-DOWN': () => this.move(1),
      'keydown-S': () => this.move(1),
      'keydown-Z': () => this.select(),
      'keydown-ENTER': () => this.select(),
    };
    if (onCancel) {
      this.handlers['keydown-X'] = () => this.cancel();
      this.handlers['keydown-ESC'] = () => this.cancel();
    }
    for (const [evt, fn] of Object.entries(this.handlers)) scene.input.keyboard.on(evt, fn);
    this.refresh();
  }

  move(dir) {
    if (!this.enabled) return;
    this.index = (this.index + dir + this.items.length) % this.items.length;
    this.refresh();
  }

  select() {
    if (!this.enabled) return;
    this.items[this.index].onSelect?.();
  }

  cancel() {
    if (!this.enabled) return;
    this.onCancel?.();
  }

  refresh() {
    this.texts.forEach((t, i) => t.setColor(i === this.index ? UI.colors.gold : UI.colors.parchment));
    const t = this.texts[this.index];
    const leftEdge = t.originX === 0.5 ? t.x - t.width / 2 : t.x;
    this.cursor.setPosition(leftEdge - 12, t.y);
  }

  setEnabled(v) {
    this.enabled = v;
    this.cursor.setVisible(v);
    if (v) this.refresh();
  }

  destroy() {
    for (const [evt, fn] of Object.entries(this.handlers)) this.scene.input.keyboard.off(evt, fn);
    this.texts.forEach((t) => t.destroy());
    this.cursor.destroy();
  }
}

/** Modal yes/no dialog. Destroys itself before invoking the callback. */
class ConfirmBox {
  constructor(scene, { text, onYes, onNo, depth = 50 }) {
    this.scene = scene;
    const W = scene.scale.width, H = scene.scale.height;
    this.objs = [
      scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55).setDepth(depth),
      drawPanel(scene, W / 2 - 270, H / 2 - 80, 540, 160).setDepth(depth + 1),
      scene.add
        .text(W / 2, H / 2 - 22, text, textStyle(17, UI.colors.parchment, { align: 'center', wordWrap: { width: 490 } }))
        .setOrigin(0.5)
        .setDepth(depth + 2),
      scene.add
        .text(W / 2, H / 2 + 44, 'Z — confirm     X — cancel', textStyle(14, UI.colors.dim))
        .setOrigin(0.5)
        .setDepth(depth + 2),
    ];
    const yes = () => { this.destroy(); onYes?.(); };
    const no = () => { this.destroy(); onNo?.(); };
    this.handlers = { 'keydown-Z': yes, 'keydown-ENTER': yes, 'keydown-X': no, 'keydown-ESC': no };
    for (const [evt, fn] of Object.entries(this.handlers)) scene.input.keyboard.on(evt, fn);
  }

  destroy() {
    if (this.dead) return;
    this.dead = true;
    for (const [evt, fn] of Object.entries(this.handlers)) this.scene.input.keyboard.off(evt, fn);
    this.objs.forEach((o) => o.destroy());
  }
}
