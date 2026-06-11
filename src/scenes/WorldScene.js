/**
 * WorldScene — the first walkable map: Whispergrove, on the edge of Ashfen.
 *
 * Phase-1 scope: grid-based movement, collision, depth-sorted Save Shrine
 * with manual save (confirmation animation + screenshot thumbnail), pause
 * menu with auto-save on exit. Encounters, NPCs and battles hook in next.
 */

const TILE = 32;

/**
 * Tile legend:
 *   T tree (solid)   W water (solid)   S Save Shrine (solid, interact)
 *   G grass          g tall grass      P path          F flowers
 */
const ASHFEN_GROVE = {
  id: 'ashfen_grove',
  name: 'Ashfen — Whispergrove',
  //       012345678901234567890123456789
  rows: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 0
    'TGGGGGGGGGGFGGGGGGGGGGGWWWWWWT', // 1
    'TGGGFGGGGGGGGGGGGTGGGGWWWWWWWT', // 2
    'TGGGGGGGGGGGGGGGGGGGGGWWWWWWGT', // 3
    'TGGTGGGGGGGGGGGGGGGGGGGWWWWGGT', // 4
    'TGGGGGGGGGPPPPPPPPPGGGGGWWGGGT', // 5
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
};

const SOLID_TILES = new Set(['T', 'W', 'S']);
const FACING_DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  create(data) {
    console.log('[boot] WorldScene ready');
    ensureWorldTextures(this);
    ensurePlayerTextures(this);
    ensureSparkTexture(this);

    this.rows = ASHFEN_GROVE.rows;
    this.mapW = this.rows[0].length;
    this.mapH = this.rows.length;
    this.rows.forEach((r, i) => {
      if (r.length !== this.mapW) console.warn(`[map] row ${i} has length ${r.length}, expected ${this.mapW}`);
    });

    this.buildMap();
    this.spawnPlayer();
    this.buildHud();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.input.keyboard.on('keydown-Z', () => this.interact());
    this.input.keyboard.on('keydown-ENTER', () => this.interact());
    this.input.keyboard.on('keydown-ESC', () => this.toggleMenu());

    this.moving = false;
    this.uiLock = false;
    this.pauseMenu = null;

    Save.state.currentMap = ASHFEN_GROVE.id;

    if (data?.fresh) {
      this.toast(`Welcome to Whispergrove, ${Save.state.playerName}. Your journey was recorded.`, true);
    }
    // Capture a thumbnail for the slot card once the first frame has rendered.
    this.time.delayedCall(400, () => Save.autoSave(this, 'arrival'));
  }

  // ----------------------------------------------------------------- map --

  /** Place ground tiles, solids, and the Save Shrine object. */
  buildMap() {
    const groundFor = { G: 'tile_grass', g: 'tile_grass_tall', F: 'tile_flowers', P: 'tile_path', W: 'tile_water', T: 'tile_tree', S: 'tile_grass' };

    for (let y = 0; y < this.mapH; y++) {
      for (let x = 0; x < this.mapW; x++) {
        const ch = this.tileAt(x, y);
        const px = x * TILE + TILE / 2;
        const py = y * TILE + TILE / 2;
        this.add.image(px, py, groundFor[ch] ?? 'tile_grass').setDepth(0);

        if (ch === 'S') {
          this.shrineTile = { x, y };
          this.add.image(px, y * TILE + TILE, 'shrine_obj').setOrigin(0.5, 1).setDepth(y);
          // Soft pulsing glow on the shrine crystal.
          const glow = this.add.image(px, y * TILE - 6, 'spark').setScale(3).setTint(0x9fd8ff).setAlpha(0.7).setDepth(y);
          this.tweens.add({ targets: glow, alpha: 0.25, scale: 2.2, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
      }
    }
  }

  tileAt(x, y) {
    return (this.rows[y] ?? '')[x] ?? 'T';
  }

  isSolid(x, y) {
    if (x < 0 || y < 0 || x >= this.mapW || y >= this.mapH) return true;
    return SOLID_TILES.has(this.tileAt(x, y));
  }

  // -------------------------------------------------------------- player --

  spawnPlayer() {
    const pos = Save.state.position ?? { x: 14, y: 11, facing: 'up' };
    this.tileX = pos.x;
    this.tileY = pos.y;
    this.facing = pos.facing ?? 'down';
    this.player = this.add
      .image(this.tileX * TILE + TILE / 2, this.tileY * TILE + TILE - 2, 'player_down')
      .setOrigin(0.5, 1)
      .setDepth(this.tileY);
    this.applyFacing();
  }

  applyFacing() {
    const tex = this.facing === 'up' ? 'player_up' : this.facing === 'down' ? 'player_down' : 'player_side';
    this.player.setTexture(tex);
    this.player.setFlipX(this.facing === 'left');
  }

  update() {
    if (this.uiLock || this.moving) return;
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    if (left) this.tryStep(-1, 0, 'left');
    else if (right) this.tryStep(1, 0, 'right');
    else if (up) this.tryStep(0, -1, 'up');
    else if (down) this.tryStep(0, 1, 'down');
  }

  /** Grid step with collision; position is mirrored into the save state. */
  tryStep(dx, dy, facing) {
    this.facing = facing;
    this.applyFacing();
    const nx = this.tileX + dx;
    const ny = this.tileY + dy;
    if (this.isSolid(nx, ny)) return;

    this.moving = true;
    this.tileX = nx;
    this.tileY = ny;
    Save.state.position = { x: nx, y: ny, facing };
    this.player.setDepth(Math.max(this.player.depth, ny));

    this.tweens.add({
      targets: this.player,
      x: nx * TILE + TILE / 2,
      y: ny * TILE + TILE - 2,
      duration: 150,
      onComplete: () => {
        this.moving = false;
        this.player.setDepth(ny);
        if (this.tileAt(nx, ny) === 'g') this.rustle(nx, ny);
      },
    });
  }

  /** Cosmetic leaf-rustle when wading through tall grass. */
  rustle(x, y) {
    const p = this.add.particles(x * TILE + TILE / 2, y * TILE + 20, 'spark', {
      speed: { min: 10, max: 30 },
      lifespan: 350,
      scale: { start: 1, end: 0 },
      tint: 0x4e7a42,
      emitting: false,
    });
    p.explode(4);
    this.time.delayedCall(600, () => p.destroy());
  }

  // ------------------------------------------------------------ interact --

  /** Z/Enter: act on the tile the player is facing. */
  interact() {
    if (this.uiLock || this.moving) return;
    const [dx, dy] = FACING_DELTA[this.facing];
    const tx = this.tileX + dx;
    const ty = this.tileY + dy;
    if (this.shrineTile && tx === this.shrineTile.x && ty === this.shrineTile.y) {
      this.openShrine();
    }
  }

  openShrine() {
    this.uiLock = true;
    new ConfirmBox(this, {
      text: 'A Save Shrine hums with quiet light.\nRest here and record your journey?',
      onYes: () => this.doShrineSave(),
      onNo: () => {
        this.uiLock = false;
      },
    });
  }

  /** Heal the party, play the shrine animation, persist with a thumbnail. */
  async doShrineSave() {
    for (const mon of Save.state.party) {
      mon.currentHp = mon.stats.hp;
      mon.status = null;
      for (const mv of mon.moves) mv.pp = mv.maxPp;
    }
    this.refreshHud();

    // Confirmation animation: white flash + golden burst from the crystal.
    const W = this.scale.width, H = this.scale.height;
    const flash = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0).setDepth(90);
    this.tweens.add({
      targets: flash,
      alpha: 0.65,
      duration: 220,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => flash.destroy(),
    });
    const sx = this.shrineTile.x * TILE + TILE / 2;
    const sy = this.shrineTile.y * TILE - 6;
    const burst = this.add.particles(sx, sy, 'spark', {
      speed: { min: 40, max: 120 },
      lifespan: 700,
      scale: { start: 1.6, end: 0 },
      tint: [0xd4af37, 0x9fd8ff],
      emitting: false,
    });
    burst.explode(26);
    this.time.delayedCall(900, () => burst.destroy());

    const res = await Save.save(this);
    this.toast(res.ok ? 'Your journey has been recorded. The party is rested.' : `Save failed: ${res.error ?? 'unknown error'}`, res.ok);
    this.uiLock = false;
  }

  // ----------------------------------------------------------- pause menu --

  toggleMenu() {
    if (this.pauseMenu) this.closeMenu();
    else if (!this.uiLock) this.openMenu();
  }

  openMenu() {
    this.uiLock = true;
    const W = this.scale.width;
    const px = W - 252, py = 56;
    this.menuObjs = [
      drawPanel(this, px, py, 212, 196).setDepth(80),
      this.add.text(px + 106, py + 28, 'PAUSE', titleStyle(20, UI.colors.gold)).setOrigin(0.5).setDepth(81),
    ];
    this.pauseMenu = new MenuList(this, {
      x: px + 106,
      y: py + 76,
      spacing: 40,
      fontSize: 17,
      depth: 81,
      items: [
        { label: 'Resume', onSelect: () => this.closeMenu() },
        {
          label: 'Quit to Title',
          onSelect: async () => {
            await Save.autoSave(this, 'quit-to-title');
            this.scene.start('TitleScene');
          },
        },
        {
          label: 'Quit Game',
          onSelect: async () => {
            await Save.autoSave(this, 'quit-game');
            window.LuminaryNative.quit();
          },
        },
      ],
      onCancel: () => this.closeMenu(),
    });
  }

  closeMenu() {
    if (!this.pauseMenu) return;
    this.pauseMenu.destroy();
    this.pauseMenu = null;
    this.menuObjs?.forEach((o) => o.destroy());
    this.menuObjs = null;
    this.uiLock = false;
  }

  // ------------------------------------------------------------------ hud --

  buildHud() {
    const W = this.scale.width, H = this.scale.height;
    drawPanel(this, 8, 8, 300, 34, { alpha: 0.8 }).setDepth(100);
    this.add.text(22, 25, ASHFEN_GROVE.name, textStyle(15, UI.colors.gold)).setOrigin(0, 0.5).setDepth(101);

    drawPanel(this, 8, H - 42, W - 16, 34, { alpha: 0.8 }).setDepth(100);
    this.hudText = this.add.text(22, H - 25, '', textStyle(14, UI.colors.parchment)).setOrigin(0, 0.5).setDepth(101);
    this.add
      .text(W - 22, H - 25, 'WASD/Arrows — move   Z — interact   Esc — menu', textStyle(13, UI.colors.dim))
      .setOrigin(1, 0.5)
      .setDepth(101);
    this.refreshHud();
  }

  refreshHud() {
    const s = Save.state;
    const lead = s.party[0];
    this.hudText.setText(
      `${s.playerName}   Shards ${s.shards}   |   ${lead.name} Lv ${lead.level}   Bond ${lead.bond}   HP ${lead.currentHp}/${lead.stats.hp}`
    );
  }

  /** Transient status message at the top of the screen. */
  toast(text, ok = true) {
    this.toastObj?.destroy();
    const t = this.add
      .text(this.scale.width / 2, 70, text, textStyle(15, ok ? UI.colors.good : UI.colors.danger, {
        backgroundColor: 'rgba(13,21,38,0.92)',
        padding: { x: 14, y: 8 },
      }))
      .setOrigin(0.5)
      .setDepth(110)
      .setAlpha(0);
    this.toastObj = t;
    this.tweens.add({ targets: t, alpha: 1, duration: 200, yoyo: true, hold: 1900, onComplete: () => t.destroy() });
  }
}
