/**
 * SaveSlotPanel — modal overlay showing the 3 save slots as cards with
 * name, party lead, playtime, timestamp and screenshot thumbnail.
 *
 * mode 'load': empty slots refuse selection; corrupted slots can be picked
 *              (the caller then runs the backup-restore flow).
 * mode 'save': any slot can be picked (caller confirms overwrites).
 */
class SaveSlotPanel {
  constructor(scene, { mode, title, onPick, onCancel, depth = 30 }) {
    this.scene = scene;
    this.mode = mode;
    this.onPick = onPick;
    this.onCancel = onCancel;
    this.depth = depth;
    this.index = 0;
    this.slots = [];
    this.cardObjs = [];
    this.cardPanels = [];
    this.cardGeom = [];
    this.alive = true;
    this.enabled = true;

    const W = scene.scale.width, H = scene.scale.height;
    this.veil = scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6).setDepth(depth);
    this.titleText = scene.add.text(W / 2, 56, title, titleStyle(26, UI.colors.gold)).setOrigin(0.5).setDepth(depth + 1);
    this.hintText = scene.add
      .text(W / 2, H - 18, 'Up/Down — choose     Z — select     X — back', textStyle(13, UI.colors.dim))
      .setOrigin(0.5)
      .setDepth(depth + 1);

    this.handlers = {
      'keydown-UP': () => this.move(-1),
      'keydown-W': () => this.move(-1),
      'keydown-DOWN': () => this.move(1),
      'keydown-S': () => this.move(1),
      'keydown-Z': () => this.pick(),
      'keydown-ENTER': () => this.pick(),
      'keydown-X': () => this.cancel(),
      'keydown-ESC': () => this.cancel(),
    };
    for (const [evt, fn] of Object.entries(this.handlers)) scene.input.keyboard.on(evt, fn);

    this.refresh();
  }

  /** Re-fetch slot summaries from the main process and redraw. */
  async refresh() {
    const res = await window.LuminaryNative.saves.list();
    if (!this.alive) return;
    this.slots = Array.isArray(res) ? res : [];
    this.renderCards();
  }

  renderCards() {
    this.cardObjs.forEach((o) => o.destroy());
    this.cardObjs = [];
    this.cardPanels.forEach((o) => o.destroy());
    this.cardPanels = [];
    this.cardGeom = [];

    const scene = this.scene;
    const W = scene.scale.width;
    const cardW = 660, cardH = 116, gap = 16;
    const x = (W - cardW) / 2;
    let y = 96;

    this.slots.forEach((slot, i) => {
      this.cardGeom.push({ x, y, w: cardW, h: cardH });
      const tx = x + 22;

      this.cardObjs.push(
        scene.add.text(tx, y + 14, `SLOT ${i + 1}`, textStyle(13, UI.colors.dim)).setDepth(this.depth + 2)
      );

      if (slot.empty) {
        this.cardObjs.push(
          scene.add.text(tx, y + 50, '— Empty —', textStyle(18, UI.colors.dim)).setDepth(this.depth + 2)
        );
      } else if (slot.corrupted) {
        this.cardObjs.push(
          scene.add.text(tx, y + 42, 'SAVE DAMAGED', textStyle(18, UI.colors.danger)).setDepth(this.depth + 2)
        );
        this.cardObjs.push(
          scene.add
            .text(tx, y + 72, `${(slot.backups ?? []).length} intact backup(s) — press Z to restore`, textStyle(13, UI.colors.dim))
            .setDepth(this.depth + 2)
        );
      } else {
        const m = slot.meta ?? {};
        this.cardObjs.push(
          scene.add.text(tx, y + 36, `${m.playerName ?? '???'}`, textStyle(19, UI.colors.parchment)).setDepth(this.depth + 2)
        );
        this.cardObjs.push(
          scene.add
            .text(
              tx,
              y + 64,
              `${m.leadName ?? '—'} Lv ${m.leadLevel ?? '?'} · ${prettyMapName(m.currentMap)} · ${formatPlaytime(m.playtimeSeconds)}`,
              textStyle(13, UI.colors.dim)
            )
            .setDepth(this.depth + 2)
        );
        this.cardObjs.push(
          scene.add.text(tx, y + 88, formatTimestamp(slot.savedAt), textStyle(12, UI.colors.dim)).setDepth(this.depth + 2)
        );
        if (slot.thumbnail) this.addThumb(slot, x + cardW - 178, y + 13, 160, 90);
      }
      y += cardH + gap;
    });

    this.updateSelection();
  }

  /** Slot screenshots arrive as data-URLs; cache them as textures keyed by save time. */
  addThumb(slot, x, y, w, h) {
    const scene = this.scene;
    const key = `thumb_${slot.slotId}_${slot.savedAt}`;
    const place = () => {
      if (!this.alive) return;
      this.cardObjs.push(scene.add.image(x + w / 2, y + h / 2, key).setDisplaySize(w, h).setDepth(this.depth + 2));
      this.cardObjs.push(
        scene.add.rectangle(x + w / 2, y + h / 2, w + 4, h + 4).setStrokeStyle(1, UI.colors.panelEdgeDim).setDepth(this.depth + 2)
      );
    };
    if (scene.textures.exists(key)) {
      place();
      return;
    }
    const image = new Image();
    image.onload = () => {
      if (!this.alive) return;
      if (!scene.textures.exists(key)) scene.textures.addImage(key, image);
      place();
    };
    image.src = slot.thumbnail;
  }

  /** Redraw card frames so only the selected card glows gold. */
  updateSelection() {
    this.cardPanels.forEach((p) => p.destroy());
    this.cardPanels = this.cardGeom.map((gm, i) =>
      drawPanel(this.scene, gm.x, gm.y, gm.w, gm.h, {
        edge: i === this.index ? UI.colors.panelEdge : UI.colors.panelEdgeDim,
        alpha: i === this.index ? 0.97 : 0.85,
      }).setDepth(this.depth + 1)
    );
  }

  move(dir) {
    if (!this.enabled || !this.alive || !this.slots.length) return;
    this.index = (this.index + dir + this.slots.length) % this.slots.length;
    this.updateSelection();
  }

  pick() {
    if (!this.enabled || !this.alive || !this.slots.length) return;
    const slot = this.slots[this.index];
    if (this.mode === 'load' && slot.empty) {
      this.flashMessage('That shrine holds no memory.');
      return;
    }
    this.onPick?.(slot);
  }

  cancel() {
    if (!this.enabled || !this.alive) return;
    this.onCancel?.();
  }

  flashMessage(text) {
    if (!this.alive) return;
    this.msg?.destroy();
    this.msg = this.scene.add
      .text(this.scene.scale.width / 2, this.scene.scale.height - 48, text, textStyle(16, UI.colors.danger))
      .setOrigin(0.5)
      .setDepth(this.depth + 5);
    this.scene.tweens.add({ targets: this.msg, alpha: 0, delay: 1400, duration: 400 });
  }

  setEnabled(v) {
    this.enabled = v;
  }

  destroy() {
    if (!this.alive) return;
    this.alive = false;
    for (const [evt, fn] of Object.entries(this.handlers)) this.scene.input.keyboard.off(evt, fn);
    [this.veil, this.titleText, this.hintText, this.msg, ...this.cardObjs, ...this.cardPanels]
      .filter(Boolean)
      .forEach((o) => o.destroy());
  }
}
