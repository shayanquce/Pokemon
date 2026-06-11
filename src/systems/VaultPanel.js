/**
 * VaultPanel — the Echo Vault, opened at Save Shrines. Two columns:
 * the travelling party (≤6, left) and the shrine vault (≤300, right,
 * paginated). Left/Right switches column, Up/Down navigates, Z sends the
 * highlighted Luminary to the other side, X closes.
 *
 * Rules enforced here:
 *  - the party always keeps at least one Luminary, and at least one of the
 *    Luminary left behind must be conscious (no vaulting your last fighter)
 *  - the vault holds at most 300
 * The caller owns input locking and auto-saves on close.
 */
const VAULT_CAP = 300;
const VAULT_PAGE = 9;

class VaultPanel {
  constructor(scene, { onClose, depth = 130 }) {
    this.scene = scene;
    this.onClose = onClose;
    this.depth = depth;
    this.col = 0; // 0 = party, 1 = vault
    this.index = 0;
    this.page = 0;
    this.dead = false;

    const W = scene.scale.width, H = scene.scale.height;
    this.objs = [
      scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6).setDepth(depth),
      drawPanel(scene, 20, 36, W - 40, H - 96).setDepth(depth + 1),
      scene.add.text(W / 2, 66, 'ECHO VAULT', titleStyle(24, UI.colors.gold, { letterSpacing: 4 })).setOrigin(0.5).setDepth(depth + 2),
      scene.add
        .text(W / 2, H - 76, 'Left/Right — column     Up/Down — choose     Z — transfer     X — close', textStyle(13, UI.colors.dim))
        .setOrigin(0.5)
        .setDepth(depth + 2),
    ];
    this.msgText = scene.add.text(W / 2, 92, 'The shrine hums, ready to keep your echoes safe.', textStyle(13, UI.colors.dim)).setOrigin(0.5).setDepth(depth + 2);
    this.objs.push(this.msgText);
    this.rowObjs = [];
    this.buildRows();

    this.handlers = {
      'keydown-UP': () => this.move(-1),
      'keydown-W': () => this.move(-1),
      'keydown-DOWN': () => this.move(1),
      'keydown-S': () => this.move(1),
      'keydown-LEFT': () => this.setCol(0),
      'keydown-A': () => this.setCol(0),
      'keydown-RIGHT': () => this.setCol(1),
      'keydown-D': () => this.setCol(1),
      'keydown-Z': () => this.transfer(),
      'keydown-ENTER': () => this.transfer(),
      'keydown-X': () => this.close(),
      'keydown-ESC': () => this.close(),
    };
    for (const [evt, fn] of Object.entries(this.handlers)) scene.input.keyboard.on(evt, fn);
  }

  party() {
    return Save.state.party;
  }

  vault() {
    return Save.state.vault ?? (Save.state.vault = []);
  }

  pageCount() {
    return Math.max(1, Math.ceil(this.vault().length / VAULT_PAGE));
  }

  /** Entries shown in the current column (vault is paged). */
  visibleVault() {
    return this.vault().slice(this.page * VAULT_PAGE, (this.page + 1) * VAULT_PAGE);
  }

  buildRows() {
    this.rowObjs.forEach((o) => o.destroy());
    this.rowObjs = [];
    const scene = this.scene;
    const W = scene.scale.width;
    const d = this.depth + 2;

    const header = (x, label, active) =>
      this.rowObjs.push(scene.add.text(x, 124, label, textStyle(15, active ? UI.colors.gold : UI.colors.dim)).setDepth(d));

    header(70, `PARTY  ${this.party().length}/6`, this.col === 0);
    header(W / 2 + 50, `VAULT  ${this.vault().length}/${VAULT_CAP}   (page ${this.page + 1}/${this.pageCount()})`, this.col === 1);

    const row = (x, y, mon, dimmed) => {
      ensureLuminaryTexture(scene, mon.speciesId);
      this.rowObjs.push(
        scene.add.image(x + 22, y + 10, `lum_${mon.speciesId}`).setScale(0.55).setDepth(d).setAlpha(dimmed ? 0.5 : 1),
        scene.add.text(x + 56, y, `${mon.nickname ?? mon.name}`, textStyle(14, dimmed ? UI.colors.dim : UI.colors.parchment)).setDepth(d),
        scene.add.text(x + 290, y, `Lv ${mon.level}`, textStyle(13, UI.colors.gold)).setOrigin(1, 0).setDepth(d),
        scene.add.text(x + 380, y, `${Math.max(0, Math.ceil(mon.currentHp))}/${mon.stats.hp}`, textStyle(12, dimmed ? UI.colors.dim : UI.colors.parchment)).setOrigin(1, 0).setDepth(d)
      );
    };

    this.party().forEach((mon, i) => row(70, 156 + i * 36, mon, false));
    this.visibleVault().forEach((mon, i) => row(W / 2 + 50, 156 + i * 36, mon, false));
    if (!this.vault().length) {
      this.rowObjs.push(scene.add.text(W / 2 + 106, 160, 'The vault is empty.', textStyle(13, UI.colors.dim)).setDepth(d));
    }

    this.cursor?.destroy();
    this.cursor = scene.add.text(0, 0, '>', textStyle(16, UI.colors.gold)).setOrigin(1, 0).setDepth(d);
    this.refreshCursor();
  }

  colLength() {
    return this.col === 0 ? this.party().length : this.visibleVault().length;
  }

  refreshCursor() {
    const W = this.scene.scale.width;
    const n = this.colLength();
    if (!n) {
      this.cursor.setVisible(false);
      return;
    }
    this.index = Math.min(this.index, n - 1);
    this.cursor.setVisible(true);
    this.cursor.setPosition(this.col === 0 ? 62 : W / 2 + 42, 156 + this.index * 36);
  }

  move(dir) {
    const n = this.colLength();
    if (this.col === 1 && this.pageCount() > 1) {
      // Walking off the top/bottom of a vault page flips pages.
      const next = this.index + dir;
      if (next < 0 || next >= n) {
        this.page = (this.page + (dir > 0 ? 1 : -1) + this.pageCount()) % this.pageCount();
        this.index = dir > 0 ? 0 : VAULT_PAGE - 1;
        this.buildRows();
        return;
      }
    }
    if (!n) return;
    this.index = (this.index + dir + n) % n;
    this.refreshCursor();
  }

  setCol(col) {
    if (this.col === col) return;
    this.col = col;
    this.index = 0;
    this.buildRows();
  }

  deny(text) {
    this.msgText.setText(text).setColor(UI.colors.danger);
    this.scene.tweens.add({ targets: this.cursor, x: this.cursor.x - 6, duration: 50, yoyo: true, repeat: 2 });
  }

  note(text) {
    this.msgText.setText(text).setColor(UI.colors.dim);
  }

  transfer() {
    if (this.col === 0) {
      const party = this.party();
      const mon = party[this.index];
      if (!mon) return;
      if (party.length <= 1) {
        this.deny('Your last companion stays with you.');
        return;
      }
      const remaining = party.filter((m, i) => i !== this.index);
      if (!remaining.some((m) => m.currentHp > 0)) {
        this.deny('Someone conscious must walk beside you.');
        return;
      }
      if (this.vault().length >= VAULT_CAP) {
        this.deny('The vault can hold no more echoes.');
        return;
      }
      party.splice(this.index, 1);
      this.vault().push(mon);
      this.note(`${mon.nickname ?? mon.name} rests in the vault.`);
    } else {
      const k = this.page * VAULT_PAGE + this.index;
      const mon = this.vault()[k];
      if (!mon) return;
      if (this.party().length >= 6) {
        this.deny('Your party is full.');
        return;
      }
      this.vault().splice(k, 1);
      this.party().push(mon);
      this.note(`${mon.nickname ?? mon.name} rejoins the party.`);
    }
    if (this.page >= this.pageCount()) this.page = this.pageCount() - 1;
    this.buildRows();
  }

  close() {
    this.onClose?.();
  }

  destroy() {
    if (this.dead) return;
    this.dead = true;
    for (const [evt, fn] of Object.entries(this.handlers)) this.scene.input.keyboard.off(evt, fn);
    this.rowObjs.forEach((o) => o.destroy());
    this.cursor?.destroy();
    this.objs.forEach((o) => o.destroy());
  }
}
