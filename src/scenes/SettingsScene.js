/**
 * SettingsScene — music/SFX volume and text speed, persisted immediately to
 * the OS user-data folder via electron-store. Audio playback lands in a later
 * build, but the preferences are already remembered.
 */
class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  create() {
    drawBackdrop(this);
    drawRunicFrame(this, 14);

    const W = this.scale.width;
    this.add.text(W / 2, 90, 'SETTINGS', titleStyle(36, UI.colors.gold, { letterSpacing: 6 })).setOrigin(0.5);

    this.rows = [
      { key: 'musicVolume', label: 'Music Volume', type: 'int', min: 0, max: 10 },
      { key: 'sfxVolume', label: 'SFX Volume', type: 'int', min: 0, max: 10 },
      { key: 'textSpeed', label: 'Text Speed', type: 'enum', values: ['slow', 'normal', 'fast', 'instant'] },
    ];
    this.index = 0;
    this.values = null;

    window.LuminaryNative.settings.get().then((s) => {
      if (!this.scene.isActive()) return;
      this.values = s;
      this.build();
    });

    this.input.keyboard.on('keydown-UP', () => this.move(-1));
    this.input.keyboard.on('keydown-W', () => this.move(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.move(1));
    this.input.keyboard.on('keydown-S', () => this.move(1));
    this.input.keyboard.on('keydown-LEFT', () => this.adjust(-1));
    this.input.keyboard.on('keydown-A', () => this.adjust(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.adjust(1));
    this.input.keyboard.on('keydown-D', () => this.adjust(1));
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('TitleScene'));
    this.input.keyboard.on('keydown-X', () => this.scene.start('TitleScene'));
  }

  build() {
    const W = this.scale.width;
    drawPanel(this, W / 2 - 290, 150, 580, 230);
    this.labelTexts = this.rows.map((row, i) =>
      this.add.text(W / 2 - 250, 196 + i * 56, row.label, textStyle(18, UI.colors.parchment)).setOrigin(0, 0.5)
    );
    this.valueTexts = this.rows.map((_, i) =>
      this.add.text(W / 2 + 250, 196 + i * 56, '', textStyle(18, UI.colors.gold)).setOrigin(1, 0.5)
    );
    this.add
      .text(W / 2, 352, 'Audio arrives in a later build — your choices are already remembered.', textStyle(13, UI.colors.dim))
      .setOrigin(0.5);
    this.add
      .text(W / 2, 440, 'Up/Down — select      Left/Right — adjust      Esc — back', textStyle(14, UI.colors.dim))
      .setOrigin(0.5);
    this.refresh();
  }

  valueLabel(row) {
    const v = this.values[row.key];
    if (row.type === 'int') return `< ${'#'.repeat(v)}${'-'.repeat(row.max - v)} > ${String(v).padStart(2)}`;
    return `< ${v} >`;
  }

  move(dir) {
    if (!this.values) return;
    this.index = (this.index + dir + this.rows.length) % this.rows.length;
    this.refresh();
  }

  /** Change the selected option and persist the patch immediately. */
  adjust(dir) {
    if (!this.values) return;
    const row = this.rows[this.index];
    if (row.type === 'int') {
      this.values[row.key] = Phaser.Math.Clamp(this.values[row.key] + dir, row.min, row.max);
    } else {
      const idx = (row.values.indexOf(this.values[row.key]) + dir + row.values.length) % row.values.length;
      this.values[row.key] = row.values[idx];
    }
    window.LuminaryNative.settings.set({ [row.key]: this.values[row.key] });
    if (window.GameSettings) window.GameSettings[row.key] = this.values[row.key];
    this.refresh();
  }

  refresh() {
    if (!this.labelTexts) return;
    this.labelTexts.forEach((t, i) => t.setColor(i === this.index ? UI.colors.gold : UI.colors.parchment));
    this.valueTexts.forEach((t, i) => t.setText(this.valueLabel(this.rows[i])));
  }
}
