/**
 * BattleScene — wild-encounter battles. Turn-based: Fight / Capture / Run.
 *
 * Receives { wild } (a Luminary instance from makeLuminary). The player's
 * side is the first healthy party member; if it faints the next healthy one
 * is sent out automatically (switch UI arrives with the party menu phase).
 * Auto-saves on battle end and on capture, then returns to WorldScene.
 */
class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
  }

  init(data) {
    this.wild = data.wild;
  }

  create() {
    ensureSparkTexture(this);
    ensureLuminaryTexture(this, this.wild.speciesId);

    this.playerStages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    this.wildStages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    this.runAttempts = 0;
    this.menu = null;
    this.busy = true;

    const W = this.scale.width, H = this.scale.height;
    drawBackdrop(this);
    drawRunicFrame(this, 10);

    // Battle stage platforms.
    this.add.ellipse(W - 250, 215, 300, 70, 0x131f3a, 0.9).setStrokeStyle(2, 0x3a4a66);
    this.add.ellipse(250, 380, 320, 80, 0x131f3a, 0.9).setStrokeStyle(2, 0x3a4a66);

    this.wildSprite = this.add.image(W - 250, 185, `lum_${this.wild.speciesId}`).setScale(4);
    this.playerMon = Save.state.party.find((m) => m.currentHp > 0) ?? Save.state.party[0];
    ensureLuminaryTexture(this, this.playerMon.speciesId);
    this.playerSprite = this.add.image(250, 340, `lum_${this.playerMon.speciesId}`).setScale(5).setFlipX(true);

    this.wildPanel = this.buildInfoPanel(34, 40, this.wild, false);
    this.playerPanel = this.buildInfoPanel(W - 354, 290, this.playerMon, true);

    // Message bar + command panel.
    drawPanel(this, 16, H - 116, W - 312, 100);
    this.msgText = this.add.text(36, H - 98, '', textStyle(17, UI.colors.parchment, { wordWrap: { width: W - 360 }, lineSpacing: 6 }));
    this.msgArrow = this.add.text(W - 320, H - 36, '▼', textStyle(14, UI.colors.gold)).setOrigin(1, 0.5).setVisible(false);
    this.tweens.add({ targets: this.msgArrow, y: '+=4', duration: 420, yoyo: true, repeat: -1 });
    this.commandPanel = drawPanel(this, W - 284, H - 116, 268, 100);

    this.intro();
  }

  // ------------------------------------------------------------ info ui --

  /** Name/level header, HP bar, and (player side) HP numbers + exp bar. */
  buildInfoPanel(x, y, mon, isPlayer) {
    const w = 320;
    const panel = { x, y, w, mon, isPlayer };
    drawPanel(this, x, y, w, isPlayer ? 86 : 68);
    const species = LUMINARY_SPECIES[mon.speciesId];
    this.add.text(x + 16, y + 20, mon.nickname ?? mon.name, textStyle(17, UI.colors.parchment));
    this.add.text(x + w - 16, y + 20, `Lv ${mon.level}`, textStyle(15, UI.colors.gold)).setOrigin(1, 0);
    this.add.text(x + 16, y + 41, species.types.join(' / '), textStyle(11, TYPE_COLORS[species.types[0]] ?? UI.colors.dim));
    panel.bar = this.add.graphics();
    if (isPlayer) {
      panel.hpText = this.add.text(x + w - 16, y + 64, '', textStyle(13, UI.colors.parchment)).setOrigin(1, 0);
      panel.expBar = this.add.graphics();
    }
    this.redrawPanel(panel);
    return panel;
  }

  redrawPanel(panel) {
    const { x, y, w, mon, bar } = panel;
    const frac = Math.max(0, mon.currentHp / mon.stats.hp);
    const color = frac > 0.5 ? 0x7ec97e : frac > 0.2 ? 0xe8c84a : 0xe06060;
    bar.clear();
    bar.fillStyle(0x1c2436, 1);
    bar.fillRect(x + 16, y + 56, w - 32, 8);
    bar.fillStyle(color, 1);
    bar.fillRect(x + 16, y + 56, Math.round((w - 32) * frac), 8);
    bar.lineStyle(1, 0x3a4a66, 1);
    bar.strokeRect(x + 16, y + 56, w - 32, 8);
    if (panel.hpText) panel.hpText.setText(`${Math.max(0, Math.ceil(mon.currentHp))} / ${mon.stats.hp}`);
    if (panel.expBar) {
      const eFrac = Math.min(1, mon.exp / expToNext(mon.level));
      panel.expBar.clear();
      panel.expBar.fillStyle(0x1c2436, 1);
      panel.expBar.fillRect(x + 16, y + 76, w - 32, 4);
      panel.expBar.fillStyle(0xd4af37, 1);
      panel.expBar.fillRect(x + 16, y + 76, Math.round((w - 32) * eFrac), 4);
    }
  }

  /** Tween a mon's HP to a new value, animating the bar as it drains. */
  tweenHp(panel, to) {
    return new Promise((resolve) => {
      const mon = panel.mon;
      this.tweens.addCounter({
        from: mon.currentHp,
        to,
        duration: 420,
        onUpdate: (tw) => {
          mon.currentHp = tw.getValue();
          this.redrawPanel(panel);
        },
        onComplete: () => {
          mon.currentHp = Math.max(0, Math.round(to));
          this.redrawPanel(panel);
          resolve();
        },
      });
    });
  }

  // ----------------------------------------------------------- messaging --

  /** Show one message; resolves when the player presses Z/Enter. */
  say(text) {
    return new Promise((resolve) => {
      this.msgText.setText(text);
      this.msgArrow.setVisible(true);
      const done = () => {
        this.input.keyboard.off('keydown-Z', done);
        this.input.keyboard.off('keydown-ENTER', done);
        this.msgArrow.setVisible(false);
        resolve();
      };
      this.input.keyboard.on('keydown-Z', done);
      this.input.keyboard.on('keydown-ENTER', done);
    });
  }

  /** Show a message without waiting for input (used under menus). */
  prompt(text) {
    this.msgText.setText(text);
    this.msgArrow.setVisible(false);
  }

  // ---------------------------------------------------------- battle flow --

  async intro() {
    // Wild slides in from the right.
    const wx = this.wildSprite.x;
    this.wildSprite.setX(this.scale.width + 80);
    this.tweens.add({ targets: this.wildSprite, x: wx, duration: 380, ease: 'Cubic.easeOut' });
    await this.say(`A wild ${this.wild.name} appeared!  (Lv ${this.wild.level})`);
    await this.say(`Go, ${this.playerMon.nickname ?? this.playerMon.name}!`);
    this.openCommandMenu();
  }

  openCommandMenu() {
    this.busy = false;
    this.prompt(`What will ${this.playerMon.nickname ?? this.playerMon.name} do?`);
    const W = this.scale.width, H = this.scale.height;
    this.menu = new MenuList(this, {
      x: W - 150, y: H - 92, spacing: 28, fontSize: 16, depth: 5,
      items: [
        { label: 'Fight', onSelect: () => this.openMoveMenu() },
        { label: `Capture  (${Save.state.inventory.capture_orb ?? 0})`, onSelect: () => this.tryCapture() },
        { label: 'Run', onSelect: () => this.tryRun() },
      ],
    });
  }

  closeMenu() {
    this.menu?.destroy();
    this.menu = null;
    this.busy = true;
  }

  openMoveMenu() {
    this.closeMenu();
    const W = this.scale.width, H = this.scale.height;
    const items = this.playerMon.moves.map((mv) => {
      const def = MOVES[mv.id];
      return {
        label: `${def.name}  ${mv.pp}/${mv.maxPp}`,
        onSelect: () => {
          if (mv.pp <= 0) {
            this.prompt('No PP left for that move!');
            return;
          }
          this.closeMenu();
          this.resolveTurn(mv);
        },
      };
    });
    this.menu = new MenuList(this, {
      x: W - 150, y: H - 96, spacing: 26, fontSize: 15, depth: 5,
      items,
      onCancel: () => {
        this.closeMenu();
        this.openCommandMenu();
      },
    });
  }

  /** Pick the wild's move: random among those with PP remaining. */
  wildMove() {
    const usable = this.wild.moves.filter((m) => m.pp > 0);
    if (!usable.length) return null;
    return usable[Math.floor(Math.random() * usable.length)];
  }

  speedOf(mon, stages) {
    return mon.stats.spe * stageMultiplier(stages.spe);
  }

  async resolveTurn(playerMoveSlot) {
    const wildSlot = this.wildMove();
    const playerFirst = this.speedOf(this.playerMon, this.playerStages) >= this.speedOf(this.wild, this.wildStages);

    const order = playerFirst
      ? [['player', playerMoveSlot], ['wild', wildSlot]]
      : [['wild', wildSlot], ['player', playerMoveSlot]];

    for (const [side, slot] of order) {
      if (this.wild.currentHp <= 0 || this.playerMon.currentHp <= 0) break;
      await this.useMove(side, slot);
    }

    if (this.wild.currentHp <= 0) return this.winBattle();
    if (this.playerMon.currentHp <= 0) return this.handleFaint();
    this.openCommandMenu();
  }

  /** Execute one move use with messages, damage/effect, and hit flash. */
  async useMove(side, slot) {
    const attacker = side === 'player' ? this.playerMon : this.wild;
    const defender = side === 'player' ? this.wild : this.playerMon;
    const atkStages = side === 'player' ? this.playerStages : this.wildStages;
    const defStages = side === 'player' ? this.wildStages : this.playerStages;
    const defPanel = side === 'player' ? this.wildPanel : this.playerPanel;
    const defSprite = side === 'player' ? this.wildSprite : this.playerSprite;
    const atkName = side === 'player' ? (attacker.nickname ?? attacker.name) : `The wild ${attacker.name}`;

    if (!slot) {
      await this.say(`${atkName} has no moves left! It struggles!`);
      slot = { id: null };
    }
    const move = slot.id ? MOVES[slot.id] : { name: 'Struggle', type: 'Beast', category: 'physical', power: 25, accuracy: 100 };
    if (slot.pp !== undefined && slot.id) slot.pp--;

    await this.say(`${atkName} used ${move.name}!`);

    if (Math.random() * 100 >= move.accuracy) {
      await this.say('...but it missed!');
      return;
    }

    if (move.category === 'support') {
      const msg = applySupportEffect(move, atkStages);
      await this.say(`${atkName}'s ${msg ?? 'stance shifted!'}`);
      return;
    }

    const result = computeDamage(attacker, defender, move, atkStages, defStages);
    // Hit feedback: flash + shake on the defender.
    defSprite.setTintFill(0xffffff);
    this.tweens.add({ targets: defSprite, x: defSprite.x + 8, duration: 50, yoyo: true, repeat: 2 });
    this.time.delayedCall(140, () => defSprite.clearTint());

    await this.tweenHp(defPanel, Math.max(0, defender.currentHp - result.damage));
    if (result.crit) await this.say('A critical hit!');
    if (result.typeMult > 1) await this.say("It's super effective!");
    else if (result.typeMult === 0) await this.say(`It doesn't affect ${side === 'player' ? `the wild ${defender.name}` : defender.nickname ?? defender.name}...`);
    else if (result.typeMult < 1) await this.say("It's not very effective...");
  }

  // ------------------------------------------------------------- endings --

  async winBattle() {
    this.tweens.add({ targets: this.wildSprite, alpha: 0, y: this.wildSprite.y + 24, duration: 420 });
    await this.say(`The wild ${this.wild.name} fainted!`);
    await this.grantBattleExp();
    await Save.autoSave(this, 'battle-end');
    this.scene.start('WorldScene', { battleResult: { text: `Victory! ${this.playerMon.nickname ?? this.playerMon.name} grows stronger.`, ok: true } });
  }

  async grantBattleExp() {
    if (!Save.state.dex.seen.includes(this.wild.speciesId)) Save.state.dex.seen.push(this.wild.speciesId);
    const amount = expReward(this.wild);
    const levels = grantExp(this.playerMon, amount);
    this.redrawPanel(this.playerPanel);
    await this.say(`${this.playerMon.nickname ?? this.playerMon.name} gained ${amount} EXP!`);
    for (const lv of levels) {
      this.redrawPanel(this.playerPanel);
      await this.say(`${this.playerMon.nickname ?? this.playerMon.name} grew to Lv ${lv}!`);
    }
  }

  async handleFaint() {
    this.tweens.add({ targets: this.playerSprite, alpha: 0, y: this.playerSprite.y + 24, duration: 420 });
    await this.say(`${this.playerMon.nickname ?? this.playerMon.name} fainted!`);

    const next = Save.state.party.find((m) => m.currentHp > 0);
    if (next) {
      // Auto-send the next healthy Luminary (manual switching comes with the party menu).
      this.playerMon = next;
      ensureLuminaryTexture(this, next.speciesId);
      this.playerStages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
      this.playerSprite.setTexture(`lum_${next.speciesId}`).setAlpha(1).setY(this.playerSprite.y - 24);
      this.playerPanel.mon = next;
      this.redrawPanel(this.playerPanel);
      await this.say(`Go, ${next.nickname ?? next.name}!`);
      this.openCommandMenu();
      return;
    }

    // Blacked out: party restored, returned to the Whispergrove shrine.
    await this.say(`${Save.state.playerName} blacked out!`);
    for (const mon of Save.state.party) {
      mon.currentHp = mon.stats.hp;
      mon.status = null;
    }
    Save.state.currentMap = 'ashfen_grove';
    Save.state.position = { x: 13, y: 8, facing: 'up' };
    await Save.autoSave(this, 'blackout');
    this.scene.start('WorldScene', { battleResult: { text: 'You came to at the Save Shrine, your party rested.', ok: false } });
  }

  // ------------------------------------------------------------- capture --

  async tryCapture() {
    this.closeMenu();
    const orbs = Save.state.inventory.capture_orb ?? 0;
    if (orbs <= 0) {
      await this.say('No Capture Orbs left! Bram said the shop opens when his cart arrives...');
      this.openCommandMenu();
      return;
    }
    Save.state.inventory.capture_orb = orbs - 1;
    await this.say(`${Save.state.playerName} threw a Capture Orb!`);

    // Orb arcs to the wild, which dissolves inward.
    const orb = this.add.circle(250, 320, 7, 0xd4af37).setStrokeStyle(2, 0xe8dcb8);
    await new Promise((res) =>
      this.tweens.add({ targets: orb, x: this.wildSprite.x, y: this.wildSprite.y, duration: 420, ease: 'Quad.easeOut', onComplete: res })
    );
    this.wildSprite.setVisible(false);

    const result = rollCapture(this.wild);
    for (let i = 0; i < result.shakes; i++) {
      await new Promise((res) =>
        this.tweens.add({ targets: orb, angle: i % 2 ? 16 : -16, duration: 180, yoyo: true, onComplete: res })
      );
      await new Promise((res) => this.time.delayedCall(260, res));
    }

    if (result.caught) {
      orb.setFillStyle(0x7ec97e);
      const burst = this.add.particles(orb.x, orb.y, 'spark', {
        speed: { min: 30, max: 90 }, lifespan: 600, scale: { start: 1.4, end: 0 }, tint: 0xd4af37, emitting: false,
      });
      burst.explode(18);
      await this.say(`Gotcha! ${this.wild.name} was caught!`);

      if (!Save.state.dex.seen.includes(this.wild.speciesId)) Save.state.dex.seen.push(this.wild.speciesId);
      if (!Save.state.dex.caught.includes(this.wild.speciesId)) Save.state.dex.caught.push(this.wild.speciesId);
      if (Save.state.party.length < 6) {
        Save.state.party.push(this.wild);
        await this.say(`${this.wild.name} joined your party!`);
      } else {
        Save.state.vault.push(this.wild);
        await this.say(`${this.wild.name} was sent to the Echo Vault.`);
      }
      await Save.autoSave(this, 'capture');
      this.scene.start('WorldScene', { battleResult: { text: `${this.wild.name} was caught!`, ok: true } });
      return;
    }

    orb.destroy();
    this.wildSprite.setVisible(true);
    await this.say(`Oh no! The wild ${this.wild.name} broke free!`);
    await this.useMove('wild', this.wildMove());
    if (this.playerMon.currentHp <= 0) return this.handleFaint();
    this.openCommandMenu();
  }

  // ----------------------------------------------------------------- run --

  async tryRun() {
    this.closeMenu();
    this.runAttempts++;
    if (rollEscape(this.playerMon, this.wild, this.runAttempts)) {
      await this.say('Got away safely!');
      this.scene.start('WorldScene', {});
      return;
    }
    await this.say("Can't escape!");
    await this.useMove('wild', this.wildMove());
    if (this.playerMon.currentHp <= 0) return this.handleFaint();
    this.openCommandMenu();
  }
}
