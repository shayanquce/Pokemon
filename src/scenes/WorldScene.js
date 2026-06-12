/**
 * WorldScene — renders any map from src/data/maps.js: grid movement,
 * collision, NPCs with dialogue, doors, exit warps between maps, the Save
 * Shrine, and wild-encounter rolls in tall grass (hands off to BattleScene).
 *
 * Auto-saves on: arrival, map transition, dialogue completion, quit.
 */

const TILE = 32;

const SOLID_TILES = new Set(['T', 'W', 'S', 'B', 'R', 'D', 'C']);
const ENCOUNTER_TILES = new Set(['g', 'e', 'm']);
const FACING_DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

/** Facing -> sprite sheet direction (side frames face right; flipX gives left). */
const DIR_OF = (facing) => (facing === 'left' || facing === 'right' ? 'side' : facing);

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
    this.buildAmbient();
    this.buildHud();

    // Shared dust emitter for footsteps (explode() repositions per puff).
    this.dustEmitter = this.add.particles(0, 0, 'spark', {
      speed: { min: 8, max: 24 }, lifespan: 280,
      scale: { start: 0.9, end: 0 }, alpha: { start: 0.6, end: 0 },
      emitting: false,
    }).setDepth(30);

    // Gentle ripple: every water tile swaps between two glint frames.
    if (this.waterTiles.length) {
      let flip = false;
      this.time.addEvent({
        delay: 650, loop: true,
        callback: () => {
          flip = !flip;
          const key = flip ? 'tile_water2' : 'tile_water';
          this.waterTiles.forEach((img) => img.setTexture(key));
        },
      });
    }

    // Bystanders glance around now and then (trainers hold their stare).
    this.time.addEvent({ delay: 2400, loop: true, callback: () => this.npcIdle() });

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
      C: 'tile_cave_wall', c: 'tile_cave_floor', e: 'tile_cave_gravel', s: 'tile_sand', m: 'tile_mire',
    };

    this.shrineTile = null;
    this.waterTiles = [];
    for (let y = 0; y < this.mapH; y++) {
      for (let x = 0; x < this.mapW; x++) {
        const ch = this.tileAt(x, y);
        const px = x * TILE + TILE / 2;
        const py = y * TILE + TILE / 2;
        const img = this.add.image(px, py, groundFor[ch] ?? 'tile_grass').setDepth(0);
        if (ch === 'W') this.waterTiles.push(img);

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

  /** Per-map drifting motes: fireflies, leaves, seed fluff, cave glimmer. */
  buildAmbient() {
    const presets = {
      ashfen_grove: { tint: [0xd4af37, 0xefe2a0], frequency: 650, drift: 12 },
      ashfen_town: { tint: [0x6aa052, 0xd4af37], frequency: 1000, drift: 18 },
      north_road: { tint: [0xe8e4e0, 0xefe2a0], frequency: 900, drift: 16 },
      hollow_cave: { tint: [0x9fd8ff, 0x6a5a8a], frequency: 800, drift: 7 },
      keldrath_gate: { tint: [0xdce8f0, 0xcde4ee], frequency: 850, drift: 22 },
      keldrath_town: { tint: [0xdce8f0, 0xefe2a0], frequency: 800, drift: 22 },
      keldrath_cliffs: { tint: [0xdce8f0, 0x9fd0c8], frequency: 600, drift: 30 },
      mirewood_marsh: { tint: [0x8fd8c8, 0xefe2a0], frequency: 700, drift: 9 },
      mirewood_deep: { tint: [0x9fd8ff, 0x43657a], frequency: 750, drift: 6 },
    };
    const p = presets[this.map.id];
    if (!p) return;
    const W = this.scale.width, H = this.scale.height;
    this.add.particles(0, 0, 'spark', {
      x: { min: 0, max: W }, y: { min: 0, max: H },
      lifespan: 5200, frequency: p.frequency,
      speedX: { min: -p.drift, max: p.drift }, speedY: { min: -p.drift * 0.5, max: p.drift },
      scale: { start: 0.85, end: 0 }, alpha: { start: 0.5, end: 0 },
      tint: p.tint,
    }).setDepth(40);
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
    const visible = (this.map.npcs ?? []).filter(
      (def) =>
        !(def.hiddenIfFlag && Save.state.storyFlags[def.hiddenIfFlag]) &&
        !(def.showIfFlag && !Save.state.storyFlags[def.showIfFlag])
    );
    this.npcs = visible.map((def) => {
      ensureNpcTextures(this, def.id, def.palette);
      // Gate wardens who already granted passage spawn at their aside spot.
      const granted = def.gate && Save.state.storyFlags[def.gate.grantsFlag];
      const tx = granted ? def.gate.asideX : def.x;
      const ty = granted ? def.gate.asideY : def.y;
      const px = tx * TILE + TILE / 2;
      const shadow = this.add.ellipse(px, ty * TILE + TILE - 3, 20, 7, 0x000000, 0.3).setDepth(ty - 0.1);
      const sprite = this.add
        .image(px, ty * TILE + TILE - 2, `npc_${def.id}_${DIR_OF(def.facing)}_0`)
        .setOrigin(0.5, 1)
        .setDepth(ty)
        .setFlipX(def.facing === 'left');
      return { def, sprite, shadow, facing: def.facing, x: tx, y: ty };
    });
  }

  /** A gate NPC steps out of the road; collision follows npc.x/npc.y. */
  stepAside(npc, tx, ty) {
    npc.x = tx;
    npc.y = ty;
    const px = tx * TILE + TILE / 2;
    const py = ty * TILE + TILE - 2;
    this.tweens.add({ targets: npc.sprite, x: px, y: py, duration: 320, ease: 'Quad.easeInOut' });
    this.tweens.add({ targets: npc.shadow, x: px, y: py - 1, duration: 320, ease: 'Quad.easeInOut' });
    npc.sprite.setDepth(ty);
    npc.shadow.setDepth(ty - 0.1);
  }

  faceNpc(npc, facing) {
    npc.facing = facing;
    npc.sprite.setTexture(`npc_${npc.def.id}_${DIR_OF(facing)}_0`).setFlipX(facing === 'left');
  }

  /** Idle life: non-trainer, non-gate NPCs occasionally glance around. */
  npcIdle() {
    if (this.uiLock) return;
    for (const npc of this.npcs) {
      if (npc.def.battle || npc.def.gate || Math.random() > 0.25) continue;
      const dirs = ['up', 'down', 'left', 'right'].filter((d) => d !== npc.facing);
      this.faceNpc(npc, dirs[Math.floor(Math.random() * dirs.length)]);
    }
  }

  npcAt(x, y) {
    return this.npcs?.find((n) => n.x === x && n.y === y) ?? null;
  }

  /**
   * Face the player, run dialogue, persist npcStates + flags, auto-save.
   * NPCs with `battle` start a trainer fight after their pre-win dialogue;
   * NPCs with `shop` open their wares after talking.
   */
  talkTo(npc) {
    const { def, sprite } = npc;
    // NPC turns toward the player with a small acknowledging hop.
    const facePlayer = { up: 'down', down: 'up', left: 'right', right: 'left' }[this.facing];
    this.faceNpc(npc, facePlayer);
    this.tweens.add({ targets: sprite, y: sprite.y - 4, duration: 90, yoyo: true, ease: 'Quad.easeOut' });

    const state = Save.state.npcStates?.[def.id] ?? {};
    const battleWon = def.battle && Save.state.storyFlags[def.battle.flag];
    const battlePending = def.battle && !battleWon;
    // Gate wardens: denied speech without the required flag, the granting
    // speech once it's earned, repeat lines after they've stepped aside.
    const gate = def.gate;
    const gateGranted = gate && Save.state.storyFlags[gate.grantsFlag];
    const gateGranting = gate && !gateGranted && Save.state.storyFlags[gate.requiresFlag];

    // Story-conditional dialogue: the first matching flag entry overrides the
    // default lines (once with its pages, after that with its repeat lines).
    const cond = (def.conditionalDialogue ?? []).find((c) => Save.state.storyFlags[c.flag]);

    let raw;
    if (gate && !gateGranted) {
      raw = gateGranting ? gate.grantedDialogue : gate.deniedDialogue;
    } else if (battleWon) {
      // First conversation after the victory gets the aftermath lines.
      raw = !state.postWin && def.postWinDialogue?.length ? def.postWinDialogue : def.repeatDialogue ?? def.dialogue;
    } else if (battlePending) {
      raw = def.dialogue; // full challenge speech every time until beaten
    } else if (cond) {
      raw = state[cond.stateKey] ? cond.repeat ?? def.repeatDialogue ?? cond.pages : cond.pages;
    } else {
      raw = state.talked && def.repeatDialogue?.length ? def.repeatDialogue : def.dialogue ?? def.repeatDialogue;
    }
    const pages = raw.map((p) => p.replaceAll('{player}', Save.state.playerName));

    this.uiLock = true;
    new DialogueBox(this, {
      speaker: def.name,
      pages,
      onDone: async () => {
        if (!Save.state.npcStates) Save.state.npcStates = {};
        Save.state.npcStates[def.id] = {
          ...Save.state.npcStates[def.id],
          talked: true,
          ...(battleWon ? { postWin: true } : {}),
          ...(cond && !battlePending ? { [cond.stateKey]: true } : {}),
        };
        if (def.setFlags) Object.assign(Save.state.storyFlags, def.setFlags);
        if (gateGranting) {
          Save.state.storyFlags[gate.grantsFlag] = true;
          this.stepAside(npc, gate.asideX, gate.asideY);
          this.toast('The way east stands open.', true);
        }
        if (def.healer) {
          for (const mon of Save.state.party) {
            mon.currentHp = mon.stats.hp;
            mon.status = null;
            for (const mv of mon.moves) mv.pp = mv.maxPp;
          }
          this.refreshHud();
          const sparkle = this.add.particles(this.player.x, this.player.y - 24, 'spark', {
            speed: { min: 20, max: 60 }, lifespan: 600, scale: { start: 1.3, end: 0 }, tint: [0x7ec97e, 0xd4af37], emitting: false,
          });
          sparkle.explode(16);
          this.time.delayedCall(800, () => sparkle.destroy());
          this.toast('Your party has been fully rested.', true);
        }
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
    this.stepParity = false;
    this.turnLockUntil = 0;
    const px = this.tileX * TILE + TILE / 2;
    this.playerShadow = this.add.ellipse(px, this.tileY * TILE + TILE - 3, 20, 7, 0x000000, 0.3).setDepth(this.tileY - 0.1);
    this.player = this.add
      .image(px, this.tileY * TILE + TILE - 2, 'player_down_0')
      .setOrigin(0.5, 1)
      .setDepth(this.tileY);
    this.applyFacing();
  }

  /** frame 0 = standing, 1/2 = stride frames of the walk cycle. */
  applyFacing(frame = 0) {
    this.player.setTexture(`player_${DIR_OF(this.facing)}_${frame}`);
    this.player.setFlipX(this.facing === 'left');
  }

  heldDirection() {
    if (this.cursors.left.isDown || this.wasd.A.isDown) return 'left';
    if (this.cursors.right.isDown || this.wasd.D.isDown) return 'right';
    if (this.cursors.up.isDown || this.wasd.W.isDown) return 'up';
    if (this.cursors.down.isDown || this.wasd.S.isDown) return 'down';
    return null;
  }

  update(time) {
    if (this.uiLock || this.moving) return;
    const dir = this.heldDirection();
    if (!dir) return;
    // A tap turns in place; holding past the grace period starts walking.
    if (dir !== this.facing) {
      this.facing = dir;
      this.applyFacing();
      this.turnLockUntil = time + 110;
      return;
    }
    if (time < this.turnLockUntil) return;
    const [dx, dy] = FACING_DELTA[dir];
    this.tryStep(dx, dy, dir);
  }

  /** Grid step with collision; position is mirrored into the save state. */
  tryStep(dx, dy, facing) {
    this.facing = facing;
    const nx = this.tileX + dx;
    const ny = this.tileY + dy;

    const exit = this.exitAt(nx, ny);
    if (!exit && this.isSolid(nx, ny)) {
      this.applyFacing();
      return;
    }

    this.moving = true;
    this.stepParity = !this.stepParity;
    this.applyFacing(this.stepParity ? 1 : 2);
    this.footDust(this.tileX, this.tileY);
    this.tileX = nx;
    this.tileY = ny;
    Save.state.position = { x: nx, y: ny, facing };
    this.player.setDepth(Math.max(this.player.depth, ny));
    this.playerShadow.setDepth(this.player.depth - 0.1);

    this.tweens.add({
      targets: this.player,
      x: nx * TILE + TILE / 2,
      y: ny * TILE + TILE - 2,
      duration: 140,
      onUpdate: (tw) => {
        this.playerShadow.setPosition(this.player.x, this.player.y - 1);
        if (tw.progress > 0.55) this.applyFacing(0); // foot lands mid-step
      },
      onComplete: () => {
        this.moving = false;
        this.applyFacing(0);
        this.player.setDepth(ny);
        this.playerShadow.setDepth(ny - 0.1).setPosition(this.player.x, this.player.y - 1);
        if (exit) {
          this.warpTo(exit);
          return;
        }
        if (ENCOUNTER_TILES.has(this.tileAt(nx, ny))) {
          const t = this.tileAt(nx, ny);
          this.rustle(nx, ny, t === 'e' ? 0x524a5c : t === 'm' ? 0x3e5648 : 0x4e7a42);
          this.maybeEncounter();
        }
        // Key still held? Chain straight into the next step — no stutter.
        if (!this.uiLock) this.update(this.time.now);
      },
    });
  }

  /** Tiny dust puff at the tile being stepped off, tinted by the ground. */
  footDust(x, y) {
    const tile = this.tileAt(x, y);
    const tint = tile === 'P' ? 0x8a7a5c : tile === 'c' || tile === 'e' ? 0x524a5c : 0x35573d;
    this.dustEmitter.setParticleTint(tint);
    this.dustEmitter.explode(2, x * TILE + TILE / 2, y * TILE + TILE - 4);
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
    const W = this.scale.width, H = this.scale.height;
    this.shrineObjs = [
      this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.45).setDepth(50),
      drawPanel(this, W / 2 - 210, H / 2 - 104, 420, 208).setDepth(51),
      this.add
        .text(W / 2, H / 2 - 70, 'A Save Shrine hums with quiet light.', textStyle(15, UI.colors.parchment))
        .setOrigin(0.5)
        .setDepth(52),
    ];
    this.shrineMenu = new MenuList(this, {
      x: W / 2, y: H / 2 - 22, spacing: 34, fontSize: 16, depth: 52,
      items: [
        { label: 'Rest & Record', onSelect: () => { this.closeShrineMenu(); this.doShrineSave(); } },
        { label: 'Echo Vault', onSelect: () => { this.closeShrineMenu(); this.openVault(); } },
        { label: 'Leave', onSelect: () => { this.closeShrineMenu(); this.uiLock = false; } },
      ],
      onCancel: () => {
        this.closeShrineMenu();
        this.uiLock = false;
      },
    });
  }

  closeShrineMenu() {
    this.shrineMenu?.destroy();
    this.shrineMenu = null;
    this.shrineObjs?.forEach((o) => o.destroy());
    this.shrineObjs = null;
  }

  /** Shrine → Echo Vault: deposit/withdraw between party and vault. */
  openVault() {
    this.uiLock = true;
    this.vaultPanel = new VaultPanel(this, {
      onClose: async () => {
        this.vaultPanel.destroy();
        this.vaultPanel = null;
        this.refreshHud();
        this.uiLock = false;
        await Save.autoSave(this, 'vault');
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
          selectable: (mon) =>
            item.cures ? Boolean(mon.status) : mon.currentHp > 0 && mon.currentHp < mon.stats.hp,
          onCancel: () => {
            picker.destroy();
            this.openItems();
          },
          onSelect: async (mon) => {
            let text;
            if (item.cures) {
              const cured = STATUSES[mon.status.id].name.toLowerCase();
              mon.status = null;
              text = `${mon.nickname ?? mon.name} is no longer ${cured}.`;
            } else {
              mon.currentHp = Math.min(mon.stats.hp, mon.currentHp + item.heal);
              text = `${mon.nickname ?? mon.name} recovered with the ${item.name}.`;
            }
            Save.state.inventory[item.id]--;
            picker.destroy();
            this.refreshHud();
            this.uiLock = false;
            this.toast(text, true);
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
