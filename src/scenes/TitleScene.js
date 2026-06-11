/**
 * TitleScene — main menu: New Game, Load Game, Settings, Quit.
 * Also owns the load-slot flow, including corrupted-save backup restoration.
 */
class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    console.log('[boot] TitleScene ready');
    const W = this.scale.width, H = this.scale.height;

    drawBackdrop(this);
    drawRunicFrame(this, 14);
    ensureSparkTexture(this);

    // Drifting golden motes — echoes on the wind.
    this.add.particles(0, 0, 'spark', {
      x: { min: 0, max: W },
      y: H + 10,
      lifespan: 9000,
      speedY: { min: -18, max: -6 },
      speedX: { min: -4, max: 4 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 0.5, end: 0 },
      frequency: 220,
      tint: 0xd4af37,
    });

    const title = this.add
      .text(W / 2, 128, 'LUMINARY', titleStyle(76, UI.colors.gold, { letterSpacing: 10 }))
      .setOrigin(0.5);
    this.tweens.add({ targets: title, alpha: 0.85, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add
      .text(W / 2, 188, 'ECHOES  OF  THE  FORGOTTEN  AGE', textStyle(17, UI.colors.parchment, { letterSpacing: 6 }))
      .setOrigin(0.5);

    this.menu = new MenuList(this, {
      x: W / 2,
      y: 312,
      spacing: 46,
      fontSize: 24,
      items: [
        { label: 'New Game', onSelect: () => this.scene.start('NewGameScene') },
        { label: 'Load Game', onSelect: () => this.openLoad() },
        { label: 'Settings', onSelect: () => this.scene.start('SettingsScene') },
        { label: 'Quit', onSelect: () => window.LuminaryNative.quit() },
      ],
    });

    this.add
      .text(W / 2, H - 30, 'Z / Enter — select      F12 — dev console      v0.1 "Save Shrine" build', textStyle(12, UI.colors.dim))
      .setOrigin(0.5);
  }

  /** Open the 3-slot load panel. */
  openLoad() {
    this.menu.setEnabled(false);
    this.slotPanel = new SaveSlotPanel(this, {
      mode: 'load',
      title: 'Whose echo will you follow?',
      onCancel: () => {
        this.slotPanel.destroy();
        this.slotPanel = null;
        this.menu.setEnabled(true);
      },
      onPick: (slot) => this.handleSlotPick(slot),
    });
  }

  /** Validate + load the picked slot; route corrupted saves to restoration. */
  async handleSlotPick(slot) {
    if (slot.corrupted) {
      this.openBackupRestore(slot);
      return;
    }
    this.slotPanel.setEnabled(false);
    const res = await Save.loadSlot(slot.slotId);
    if (res.ok) {
      this.scene.start('WorldScene');
      return;
    }
    if (res.corrupted) {
      this.openBackupRestore({ ...slot, backups: res.backups });
      return;
    }
    this.slotPanel.setEnabled(true);
    this.slotPanel.flashMessage(res.error || 'That save could not be read.');
  }

  /** Offer the rolling backups for a corrupted slot, newest first. */
  async openBackupRestore(slot) {
    this.slotPanel.setEnabled(false);
    const backups = slot.backups?.length
      ? slot.backups
      : await window.LuminaryNative.saves.listBackups(slot.slotId);

    if (!Array.isArray(backups) || backups.length === 0) {
      this.slotPanel.setEnabled(true);
      this.slotPanel.flashMessage('No intact backups remain for this slot.');
      return;
    }

    const W = this.scale.width;
    const objs = [];
    objs.push(this.add.rectangle(W / 2, this.scale.height / 2, W, this.scale.height, 0x000000, 0.65).setDepth(60));
    objs.push(drawPanel(this, W / 2 - 320, 110, 640, 130 + (backups.length + 1) * 42).setDepth(61));
    objs.push(this.add.text(W / 2, 142, 'The record is damaged.', titleStyle(24, UI.colors.danger)).setOrigin(0.5).setDepth(62));
    objs.push(
      this.add
        .text(W / 2, 172, 'Choose a backup to restore:', textStyle(15, UI.colors.parchment))
        .setOrigin(0.5)
        .setDepth(62)
    );

    let menu;
    const close = () => {
      menu.destroy();
      objs.forEach((o) => o.destroy());
      this.slotPanel.setEnabled(true);
      this.slotPanel.refresh();
    };

    menu = new MenuList(this, {
      x: W / 2,
      y: 218,
      spacing: 42,
      fontSize: 17,
      depth: 62,
      items: [
        ...backups.map((b) => ({
          label: `${formatTimestamp(b.savedAt)} — ${b.meta?.playerName ?? '???'} · ${formatPlaytime(b.meta?.playtimeSeconds)}`,
          onSelect: async () => {
            const res = await window.LuminaryNative.saves.restoreBackup(slot.slotId, b.key);
            if (!res.ok) {
              close();
              this.slotPanel.flashMessage(res.error || 'Restore failed.');
              return;
            }
            const loaded = await Save.loadSlot(slot.slotId);
            if (loaded.ok) this.scene.start('WorldScene');
            else {
              close();
              this.slotPanel.flashMessage('Restored, but the save still could not be read.');
            }
          },
        })),
        { label: 'Cancel', onSelect: close },
      ],
      onCancel: close,
    });
  }
}
