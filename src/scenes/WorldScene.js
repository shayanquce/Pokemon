/**
 * WorldScene — renders any map from src/data/maps.js: grid movement,
 * collision, NPCs with dialogue, doors, exit warps between maps, the Save
 * Shrine, and wild-encounter rolls in tall grass (hands off to BattleScene).
 *
 * Auto-saves on: arrival, map transition, dialogue completion, quit.
 */

const TILE = 32;

const SOLID_TILES = new Set(['T', 'W', 'S', 'B', 'R', 'D', 'C']);
const ENCOUNTER_TILES = new Set(['g', 'e']);
const FACING_DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  create(data) {
    this.map = MAPS[Save.state.currentMap] ?? MAPS.ashfen_grove;
    console.log(`[boot] WorldScene ready — ${this.map.id}`);
    ensureWorldTextures(this);
    ensurePlayerTextures(this);
    ensureSparkTexture(this);

    this.rows = this.map.rows;
    this.mapW = this.rows[0].length;
    this.mapH = this.rows.length;
    this.rows.forEach((r, i) => {
      if (r.length !== this.mapW) console.warn(`[map] row ${i} has length ${r.length}, expected ${this.mapW}`);
    });

    this.buildMap();
    this.spawnNpcs();
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

    Save.state.currentMap = this.map.id;
    this.announceDiscovery();

    if (data?.fresh) {
      this.toast(`Welcome to Whispergrove, ${Save.state.playerName}. Your journey was recorded.`, true);
    }
    if (data?.battleResult) this.toast(data.battleResult.text, data.battleResult.ok !== false);

    // Capture a thumbnail for the slot card once the first frame has rendered.
    this.time.delayedCall(400, () => Save.autoSave(this, 'arrival'));
  }

  /** First visit to a map: record it and show a discovery banner. */
  announceDiscovery() {
    const found = Save.state.discoveredLocations ?? (Save.state.discoveredLocations = []);
    if (!found.includes(this.map.id)) {
      found.push(this.map.id);
      this.time.delayedCall(300, () => this.toast(`Discovered — ${this.map.name}`, true));
    }
  }

  // ----------------------------------------------------------------- map --

  /** Place ground tiles, solids, doors, and the Save Shrine object. */
  buildMap() {
    const groundFor = {
      G: 'tile_grass', g: 'tile_grass_tall', F: 'tile_flowers', P: 'tile_path',
      W: 'tile_water', T: 'tile_tree', S: 'tile_grass', R: 'tile_roof', B: 'tile_wall', D: 'tile_door',
      C: 'tile_cave_wall', c: 'tile_cave_floor', e: 'tile_cave_gravel',
    };

    this.shrineTile = null;
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
    if (x < 0 || y < 0 || x >= this.mapW || y >= this.mapH) {
      // Off-map is only reachable through an exit tile, which warps first.
      return true;
    }
    if (this.npcAt(x, y)) return true;
    return SOLID_TILES.has(this.tileAt(x, y));
  }

  exitAt(x, y) {
    return (this.map.exits ?? []).find((e) => e.x === x && e.y === y) ?? null;
  }

  doorAt(x, y) {
    return (this.map.doors ?? []).find((d) => d.x === x && d.y === y) ?? null;
  }

  // ---------------------------------------------------------------- npcs --

  spawnNpcs() {
    const visible = (this.map.npcs ?? []).filter((def) => !(def.hiddenIfFlag && Save.state.storyFlags[def.hiddenIfFlag]));
    this.npcs = visible.map((def) => {
      ensureNpcTextures(this, def.id, def.palette);
      const tex = def.facing === 'up' ? `npc_${def.id}_up` : def.facing === 'down' ? `npc_${def.id}_down` : `npc_${def.id}_side`;
      const sprite = this.add
        .image(def.x * TILE + TILE / 2, def.y * TILE + TILE - 2, tex)
        .setOrigin(0.5, 1)
        .setDepth(def.y)
        .setFlipX(def.facing === 'left');
      return { def, sprite };
    });
  }

  npcAt(x, y) {
    return this.npcs?.find((n) => n.def.x === x && n.def.y === y) ?? null;
  }

  /**
   * Face the player, run dialogue, persist npcStates + flags, auto-save.
   * NPCs with `battle` start a trainer fight after their pre-win dialogue;
   * NPCs with `shop` open their wares after talking.
   */
  talkTo(npc) {
    const { def, sprite } = npc;
    // NPC turns toward the player.
    const facePlayer = { up: 'down', down: 'up', left: 'right', right: 'left' }[this.facing];
    const tex = facePlayer === 'up' ? `npc_${def.id}_up` : facePlayer === 'down' ? `npc_${def.id}_down` : `npc_${def.id}_side`;
    sprite.setTexture(tex).setFlipX(facePlayer === 'left');

    const state = Save.state.npcStates?.[def.id] ?? {};
    const battleWon = def.battle && Save.state.storyFlags[def.battle.flag];
    const battlePending = def.battle && !battleWon;

    let raw;
    if (battleWon) {
      // First conversation after the victory gets the aftermath lines.
      raw = !state.postWin && def.postWinDialogue?.length ? def.postWinDialogue : def.repeatDialogue ?? def.dialogue;
    } else if (battlePending) {
      raw = def.dialogue; // full challenge speech every time until beaten
    } else {
      raw = state.talked && def.repeatDialogue?.length ? def.repeatDialogue : def.dialogue;
    }
    const pages = raw.map((p) => p.replaceAll('{player}', Save.state.playerName));

    this.uiLock = true;
    new DialogueBox(this, {
      speaker: def.name,
      pages,
      onDone: async () => {
        if (!Save.state.npcStates) Save.state.npcStates = {};
        Save.state.npcStates[def.id] = { ...Save.state.npcStates[def.id], talked: true, ...(battleWon ? { postWin: true } : {}) };
        if (def.setFlags) Object.assign(Save.state.storyFlags, def.setFlags);
        if (battlePending) {
          await Save.autoSave(this, `dialogue:${def.id}`);
          this.scene.start('BattleScene', { trainer: buildTrainer(def.battle.trainerId), flag: def.battle.flag });
          return;
        }
        if (def.shop) {
          this.openShop(def);
          return;
        }
        this.uiLock = false;
        await Save.autoSave(this, `dialogue:${def.id}`);
      },
    });
  }

  /** NPC shop: buy with shards, auto-save per purchase. */
  openShop(def) {
    this.uiLock = true;
    this.shopPanel = new ShopPanel(this, {
      stock: def.shop,
      onClose: async () => {
        this.shopPanel.destroy();
        this.shopPanel = null;
        this.refreshHud();
        this.uiLock = false;
        await Save.autoSave(this, `shop:${def.id}`);
      },
    });
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

    const exit = this.exitAt(nx, ny);
    if (!exit && this.isSolid(nx, ny)) return;

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
        if (exit) {
          this.warpTo(exit);
          return;
        }
        if (ENCOUNTER_TILES.has(this.tileAt(nx, ny))) {
          this.rustle(nx, ny, this.tileAt(nx, ny) === 'e' ? 0x524a5c : 0x4e7a42);
          this.maybeEncounter();
        }
      },
    });
  }

  /** Cross into a connected map: persist position there, auto-save, restart. */
  async warpTo(exit) {
    this.uiLock = true;
    Save.state.currentMap = exit.to;
    Save.state.position = { x: exit.toX, y: exit.toY, facing: exit.facing };
    await Save.autoSave(this, `map-transition:${exit.to}`);
    this.cameras.main.fadeOut(220, 7, 11, 20);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart({}));
  }

  /** Cosmetic rustle when wading through tall grass or cave gravel. */
  rustle(x, y, tint = 0x4e7a42) {
    const p = this.add.particles(x * TILE + TILE / 2, y * TILE + 20, 'spark', {
      speed: { min: 10, max: 30 },
      lifespan: 350,
      scale: { start: 1, end: 0 },
      tint,
      emitting: false,
    });
    p.explode(4);
    this.time.delayedCall(600, () => p.destroy());
  }

  /** Wild-encounter roll for the tall-grass tile just entered. */
  maybeEncounter() {
    const enc = this.map.encounters;
    if (!enc || Math.random() >= enc.rate) return;
    const { speciesId, level } = rollEncounter(enc);
    this.uiLock = true;

    // Brief alert flash, then hand off to the battle.
    const W = this.scale.width, H = this.scale.height;
    const flash = this.add.rectangle(W / 2, H / 2, W, H, 0x070b14, 0).setDepth(120);
    this.tweens.add({
      targets: flash,
      alpha: 1,
      duration: 160,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.scene.start('BattleScene', { wild: makeLuminary(speciesId, level) });
      },
    });
  }

  // ------------------------------------------------------------ interact --

  /** Z/Enter: act on the tile the player is facing. */
  interact() {
    if (this.uiLock || this.moving) return;
    const [dx, dy] = FACING_DELTA[this.facing];
    const tx = this.tileX + dx;
    const ty = this.tileY + dy;

    const npc = this.npcAt(tx, ty);
    if (npc) {
      this.talkTo(npc);
      return;
    }
    const door = this.doorAt(tx, ty);
    if (door) {
      this.uiLock = true;
      new DialogueBox(this, { pages: [door.text], onDone: () => (this.uiLock = false) });
      return;
    }
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
      drawPanel(this, px, py, 212, 316).setDepth(80),
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
        { label: 'Party', onSelect: () => { this.closeMenu(); this.openParty(); } },
        { label: 'Items', onSelect: () => { this.closeMenu(); this.openItems(); } },
        { label: 'Dex', onSelect: () => { this.closeMenu(); this.openDex(); } },
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

  /** Pause menu → Party: view, summary, reorder (lead = first slot). */
  openParty() {
    this.uiLock = true;
    this.partyPanel = new PartyPanel(this, {
      mode: 'manage',
      onCancel: () => {
        this.partyPanel.destroy();
        this.partyPanel = null;
        this.refreshHud();
        this.uiLock = false;
      },
    });
  }

  /** Pause menu → Dex: seen/caught records. */
  openDex() {
    this.uiLock = true;
    this.dexPanel = new DexPanel(this, {
      onClose: () => {
        this.dexPanel.destroy();
        this.dexPanel = null;
        this.uiLock = false;
      },
    });
  }

  /** Pause menu → Items: pick a heal item, then the party member to use it on. */
  openItems() {
    this.uiLock = true;
    const close = () => {
      this.itemsPanel?.destroy();
      this.itemsPanel = null;
      this.refreshHud();
      this.uiLock = false;
    };
    this.itemsPanel = new ItemsPanel(this, {
      usableOnly: true,
      onCancel: close,
      onUse: (item) => {
        this.itemsPanel.destroy();
        this.itemsPanel = null;
        const picker = new PartyPanel(this, {
          mode: 'select',
          title: `USE ${item.name.toUpperCase()} ON…`,
          selectable: (mon) => mon.currentHp > 0 && mon.currentHp < mon.stats.hp,
          onCancel: () => {
            picker.destroy();
            this.openItems();
          },
          onSelect: async (mon) => {
            mon.currentHp = Math.min(mon.stats.hp, mon.currentHp + item.heal);
            Save.state.inventory[item.id]--;
            picker.destroy();
            this.refreshHud();
            this.uiLock = false;
            this.toast(`${mon.nickname ?? mon.name} recovered with the ${item.name}.`, true);
            await Save.autoSave(this, `item-use:${item.id}`);
          },
        });
      },
    });
  }

  // ------------------------------------------------------------------ hud --

  buildHud() {
    const W = this.scale.width, H = this.scale.height;
    drawPanel(this, 8, 8, 300, 34, { alpha: 0.8 }).setDepth(100);
    this.add.text(22, 25, this.map.name, textStyle(15, UI.colors.gold)).setOrigin(0, 0.5).setDepth(101);

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
      `${s.playerName}   Shards ${s.shards}   Orbs ${s.inventory?.capture_orb ?? 0}   |   ${lead.nickname ?? lead.name} Lv ${lead.level}   Bond ${lead.bond}   HP ${lead.currentHp}/${lead.stats.hp}`
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
