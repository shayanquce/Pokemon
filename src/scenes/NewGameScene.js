/**
 * NewGameScene — the new-game flow, in three keyboard-driven steps:
 *   1. name  — type the hero's name (defaults to "Kael")
 *   2. starter — choose one of the three starter Luminary
 *   3. slot  — pick which save slot to record the journey in
 * The first save record is written before the world ever loads.
 */
class NewGameScene extends Phaser.Scene {
  constructor() {
    super('NewGameScene');
  }

  create() {
    drawBackdrop(this);
    drawRunicFrame(this, 14);

    this.step = 'name';
    this.playerName = '';
    this.nameValue = '';
    this.starterIndex = 0;
    this.ui = { name: [], starter: [] };
    this.cards = [];

    this.buildNameStep();

    // Generic typing handler (name step only).
    this.input.keyboard.on('keydown', this.onAnyKey, this);
    this.input.keyboard.on('keydown-ESC', this.onEsc, this);

    // Starter-step navigation (gated by this.step).
    this.input.keyboard.on('keydown-LEFT', () => this.moveStarter(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.moveStarter(1));
    this.input.keyboard.on('keydown-A', () => this.moveStarter(-1));
    this.input.keyboard.on('keydown-D', () => this.moveStarter(1));
    this.input.keyboard.on('keydown-Z', () => this.confirmStarter());
    this.input.keyboard.on('keydown-ENTER', () => this.confirmStarter());
  }

  onEsc() {
    if (this.step === 'name') {
      this.scene.start('TitleScene');
    } else if (this.step === 'starter') {
      this.destroyStarterStep();
      this.buildNameStep();
      this.step = 'name';
    }
    // 'slot' and 'confirm' steps handle their own cancel keys.
  }

  // ---------------------------------------------------------------- name --

  buildNameStep() {
    const W = this.scale.width;
    const objs = [];
    objs.push(this.add.text(W / 2, 150, 'Every echo begins with a name.', titleStyle(30, UI.colors.gold)).setOrigin(0.5));
    objs.push(this.add.text(W / 2, 196, 'The elders of Ashfen await your answer.', textStyle(15, UI.colors.dim)).setOrigin(0.5));

    this.nameText = this.add.text(W / 2, 280, '', textStyle(38, UI.colors.parchment)).setOrigin(0.5);
    objs.push(this.nameText);
    objs.push(this.add.rectangle(W / 2, 314, 320, 2, 0xd4af37, 0.8));
    objs.push(
      this.add
        .text(
          W / 2,
          382,
          'Type a name (12 letters max), then press Enter.\nLeave blank to be called "Kael".      Esc — back',
          textStyle(14, UI.colors.dim, { align: 'center' })
        )
        .setOrigin(0.5)
    );

    this.ui.name = objs;
    this.cursorOn = true;
    this.nameBlink = this.time.addEvent({
      delay: 450,
      loop: true,
      callback: () => {
        this.cursorOn = !this.cursorOn;
        this.updateNameText();
      },
    });
    this.updateNameText();
  }

  updateNameText() {
    if (this.nameText?.active) this.nameText.setText(this.nameValue + (this.cursorOn ? '_' : ' '));
  }

  destroyNameStep() {
    this.nameBlink?.remove();
    this.ui.name.forEach((o) => o.destroy());
    this.ui.name = [];
  }

  /** Character-by-character name entry. */
  onAnyKey(e) {
    if (this.step !== 'name') return;
    if (e.key === 'Enter') {
      this.playerName = this.nameValue.trim() || 'Kael';
      this.destroyNameStep();
      this.buildStarterStep();
      this.step = 'starter';
      return;
    }
    if (e.key === 'Backspace') {
      this.nameValue = this.nameValue.slice(0, -1);
    } else if (e.key.length === 1 && /^[a-zA-Z0-9 '-]$/.test(e.key) && this.nameValue.length < 12) {
      this.nameValue += e.key;
    }
    this.updateNameText();
  }

  // ------------------------------------------------------------- starter --

  buildStarterStep() {
    const W = this.scale.width;
    const objs = [];
    objs.push(this.add.text(W / 2, 80, `Three Luminary await, ${this.playerName}.`, titleStyle(28, UI.colors.gold)).setOrigin(0.5));
    objs.push(
      this.add.text(W / 2, 116, 'Only one will answer your Echo. Choose with care.', textStyle(15, UI.colors.dim)).setOrigin(0.5)
    );

    this.cards = STARTER_IDS.map((id, i) => {
      const species = LUMINARY_SPECIES[id];
      ensureLuminaryTexture(this, id);
      const cx = W / 2 + (i - 1) * 290;
      const card = { cx, id };

      card.sprite = this.add.image(cx, 242, `lum_${id}`).setScale(2).setDepth(2);
      card.name = this.add.text(cx, 326, species.name, titleStyle(24, UI.colors.parchment)).setOrigin(0.5).setDepth(2);

      const typeColor = Phaser.Display.Color.HexStringToColor(TYPE_COLORS[species.types[0]]).color;
      card.badge = this.add.rectangle(cx, 356, 92, 22, typeColor, 1).setStrokeStyle(1, 0x000000, 0.4).setDepth(2);
      card.badgeText = this.add.text(cx, 356, species.types.join('/'), textStyle(12, '#0d1526')).setOrigin(0.5).setDepth(2);
      card.tagline = this.add
        .text(cx, 406, species.tagline, textStyle(13, UI.colors.dim, { wordWrap: { width: 220 }, align: 'center' }))
        .setOrigin(0.5)
        .setDepth(2);
      return card;
    });

    objs.push(this.add.text(W / 2, 492, 'Left/Right — choose      Z — bond      Esc — back', textStyle(14, UI.colors.dim)).setOrigin(0.5));
    this.ui.starter = objs;
    this.refreshStarterCards();
  }

  /** Gold-frame the selected card and let its sprite breathe a little larger. */
  refreshStarterCards() {
    this.cards.forEach((card, i) => {
      const selected = i === this.starterIndex;
      card.panel?.destroy();
      card.panel = drawPanel(this, card.cx - 130, 150, 260, 300, {
        edge: selected ? UI.colors.panelEdge : UI.colors.panelEdgeDim,
        alpha: selected ? 0.97 : 0.85,
      }).setDepth(1);
      card.sprite.setScale(selected ? 2.25 : 2);
      card.name.setColor(selected ? UI.colors.gold : UI.colors.parchment);
    });
  }

  destroyStarterStep() {
    this.cards.forEach((card) => Object.values(card).forEach((o) => o?.destroy?.()));
    this.cards = [];
    this.ui.starter.forEach((o) => o.destroy());
    this.ui.starter = [];
  }

  moveStarter(dir) {
    if (this.step !== 'starter') return;
    this.starterIndex = (this.starterIndex + dir + STARTER_IDS.length) % STARTER_IDS.length;
    this.refreshStarterCards();
  }

  confirmStarter() {
    if (this.step !== 'starter') return;
    const species = LUMINARY_SPECIES[STARTER_IDS[this.starterIndex]];
    this.step = 'confirm';
    new ConfirmBox(this, {
      text: `Bond with ${species.name}, the ${species.types.join('/')} Luminary?\n\n"${species.lore}"`,
      onYes: () => this.enterSlotStep(),
      onNo: () => {
        this.step = 'starter';
      },
    });
  }

  // ---------------------------------------------------------------- slot --

  enterSlotStep() {
    this.step = 'slot';
    this.destroyStarterStep();
    this.slotPanel = new SaveSlotPanel(this, {
      mode: 'save',
      title: 'Where shall this journey be recorded?',
      onCancel: () => {
        this.slotPanel.destroy();
        this.slotPanel = null;
        this.buildStarterStep();
        this.step = 'starter';
      },
      onPick: (slot) => {
        if (!slot.empty) {
          this.slotPanel.setEnabled(false);
          const who = slot.corrupted ? 'the damaged record' : `${slot.meta?.playerName ?? 'another'}'s journey`;
          new ConfirmBox(this, {
            text: `Overwrite ${who}? This cannot be undone.`,
            onYes: () => this.beginAdventure(slot.slotId),
            onNo: () => this.slotPanel.setEnabled(true),
          });
        } else {
          this.beginAdventure(slot.slotId);
        }
      },
    });
  }

  /** Create the save state, write the first record, and enter the world. */
  async beginAdventure(slotId) {
    Save.newGame({
      playerName: this.playerName,
      starterId: STARTER_IDS[this.starterIndex],
      slotId,
    });
    const res = await Save.save(null); // first record; thumbnail follows on arrival
    if (!res.ok) {
      this.slotPanel?.setEnabled(true);
      this.slotPanel?.flashMessage(`Could not create save: ${res.error}`);
      return;
    }
    this.scene.start('WorldScene', { fresh: true });
  }
}
