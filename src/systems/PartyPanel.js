/**
 * PartyPanel — full-screen keyboard overlay listing the party (≤6) with HP
 * bars. Used by the pause menu (manage: summary + reorder) and by battle /
 * item flows (select: pick a target and return it).
 *
 * Modes:
 *   'manage' — Z opens a per-mon action menu (Summary / Move Up / Back)
 *   'select' — Z calls onSelect(mon, index); entries failing `selectable`
 *              are dimmed and refused with a shake.
 *
 * The caller owns input locking and calls destroy() (onCancel/onSelect do
 * not auto-destroy, so battle can keep the panel open on invalid picks).
 */
class PartyPanel {
  constructor(scene, { mode = 'manage', title = 'PARTY', selectable = null, onSelect = null, onCancel = null, depth = 130 }) {
    this.scene = scene;
    this.mode = mode;
    this.selectable = selectable;
    this.onSelect = onSelect;
    this.onCancel = onCancel;
    this.depth = depth;
    this.index = 0;
    this.submenu = null;
    this.summaryObjs = null;
    this.dead = false;

    const W = scene.scale.width, H = scene.scale.height;
    this.objs = [
      scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6).setDepth(depth),
      drawPanel(scene, W / 2 - 330, 36, 660, H - 100).setDepth(depth + 1),
      scene.add.text(W / 2, 66, title, titleStyle(24, UI.colors.gold, { letterSpacing: 4 })).setOrigin(0.5).setDepth(depth + 2),
      scene.add
        .text(W / 2, H - 44, this.mode === 'manage' ? 'Z — actions     X — close' : 'Z — choose     X — back', textStyle(13, UI.colors.dim))
        .setOrigin(0.5)
        .setDepth(depth + 2),
    ];
    this.rowObjs = [];
    this.buildRows();

    this.handlers = {
      'keydown-UP': () => this.move(-1),
      'keydown-W': () => this.move(-1),
      'keydown-DOWN': () => this.move(1),
      'keydown-S': () => this.move(1),
      'keydown-Z': () => this.confirm(),
      'keydown-ENTER': () => this.confirm(),
      'keydown-X': () => this.cancel(),
      'keydown-ESC': () => this.cancel(),
    };
    for (const [evt, fn] of Object.entries(this.handlers)) scene.input.keyboard.on(evt, fn);
  }

  party() {
    return Save.state.party;
  }

  buildRows() {
    this.rowObjs.forEach((o) => o.destroy());
    this.rowObjs = [];
    const W = this.scene.scale.width;
    const x = W / 2 - 300;
    this.party().forEach((mon, i) => {
      const y = 100 + i * 60;
      const species = LUMINARY_SPECIES[mon.speciesId];
      const dim = this.mode === 'select' && this.selectable && !this.selectable(mon, i);
      const nameColor = dim ? UI.colors.dim : UI.colors.parchment;
      ensureLuminaryTexture(this.scene, mon.speciesId);
      this.rowObjs.push(
        this.scene.add.image(x + 30, y + 24, `lum_${mon.speciesId}`).setScale(0.8).setDepth(this.depth + 2).setAlpha(dim ? 0.4 : 1),
        this.scene.add.text(x + 70, y + 8, `${mon.nickname ?? mon.name}`, textStyle(16, nameColor)).setDepth(this.depth + 2),
        this.scene.add.text(x + 70, y + 28, species.types.join(' / '), textStyle(11, TYPE_COLORS[species.types[0]] ?? UI.colors.dim)).setDepth(this.depth + 2),
        this.scene.add.text(x + 290, y + 8, `Lv ${mon.level}   Bond ${mon.bond}`, textStyle(13, UI.colors.gold)).setDepth(this.depth + 2),
        this.scene.add.text(x + 600, y + 8, `${Math.max(0, Math.ceil(mon.currentHp))}/${mon.stats.hp}`, textStyle(13, nameColor)).setOrigin(1, 0).setDepth(this.depth + 2)
      );
      const bar = this.scene.add.graphics().setDepth(this.depth + 2);
      const frac = Math.max(0, mon.currentHp / mon.stats.hp);
      const color = frac > 0.5 ? 0x7ec97e : frac > 0.2 ? 0xe8c84a : 0xe06060;
      bar.fillStyle(0x1c2436, 1).fillRect(x + 290, y + 30, 310, 8);
      bar.fillStyle(color, 1).fillRect(x + 290, y + 30, Math.round(310 * frac), 8);
      bar.lineStyle(1, 0x3a4a66, 1).strokeRect(x + 290, y + 30, 310, 8);
      this.rowObjs.push(bar);
    });
    this.cursor?.destroy();
    this.cursor = this.scene.add.text(0, 0, '>', textStyle(18, UI.colors.gold)).setOrigin(1, 0).setDepth(this.depth + 2);
    this.refreshCursor();
  }

  refreshCursor() {
    const W = this.scene.scale.width;
    this.cursor.setPosition(W / 2 - 306, 108 + this.index * 60);
  }

  move(dir) {
    if (this.submenu || this.summaryObjs) return;
    const n = this.party().length;
    this.index = (this.index + dir + n) % n;
    this.refreshCursor();
  }

  confirm() {
    if (this.summaryObjs) {
      this.closeSummary();
      return;
    }
    if (this.submenu) return; // submenu's own MenuList handles Z
    const mon = this.party()[this.index];
    if (this.mode === 'select') {
      if (this.selectable && !this.selectable(mon, this.index)) {
        this.scene.tweens.add({ targets: this.cursor, x: this.cursor.x - 6, duration: 50, yoyo: true, repeat: 2 });
        return;
      }
      this.onSelect?.(mon, this.index);
      return;
    }
    this.openSubmenu(mon);
  }

  cancel() {
    if (this.summaryObjs) {
      this.closeSummary();
      return;
    }
    if (this.submenu) {
      this.closeSubmenu();
      return;
    }
    this.onCancel?.();
  }

  // -------------------------------------------------------- manage extras --

  openSubmenu(mon) {
    const W = this.scene.scale.width;
    const x = W / 2 + 170, y = 110 + this.index * 60;
    this.submenuPanel = drawPanel(this.scene, x, y, 150, 118).setDepth(this.depth + 3);
    this.submenu = new MenuList(this.scene, {
      x: x + 75, y: y + 26, spacing: 32, fontSize: 14, depth: this.depth + 4,
      items: [
        { label: 'Summary', onSelect: () => { this.closeSubmenu(); this.openSummary(mon); } },
        {
          label: 'Move Up',
          onSelect: () => {
            const p = this.party();
            if (this.index > 0) {
              [p[this.index - 1], p[this.index]] = [p[this.index], p[this.index - 1]];
              this.index--;
            }
            this.closeSubmenu();
            this.buildRows();
          },
        },
        { label: 'Back', onSelect: () => this.closeSubmenu() },
      ],
      onCancel: () => this.closeSubmenu(),
    });
  }

  closeSubmenu() {
    this.submenu?.destroy();
    this.submenu = null;
    this.submenuPanel?.destroy();
    this.submenuPanel = null;
  }

  openSummary(mon) {
    const W = this.scene.scale.width, H = this.scene.scale.height;
    const species = LUMINARY_SPECIES[mon.speciesId];
    const x = W / 2 - 250, y = 90;
    const lines = [
      `${mon.nickname ?? mon.name}   Lv ${mon.level}   ${species.types.join(' / ')}`,
      `Bond ${mon.bond}/10    EXP ${mon.exp}/${expToNext(mon.level)} to next`,
      '',
      `HP ${Math.ceil(mon.currentHp)}/${mon.stats.hp}   Atk ${mon.stats.atk}   Def ${mon.stats.def}`,
      `SpA ${mon.stats.spa}   SpD ${mon.stats.spd}   Spe ${mon.stats.spe}`,
      '',
      'Moves:',
      ...mon.moves.map((m) => {
        const d = MOVES[m.id];
        return `  ${d.name}  (${d.type}, ${d.power || '—'} pow, ${m.pp}/${m.maxPp} PP)`;
      }),
      '',
      species.tagline,
    ];
    this.summaryObjs = [
      drawPanel(this.scene, x, y, 500, H - 200).setDepth(this.depth + 5),
      this.scene.add.image(x + 60, y + 60, `lum_${mon.speciesId}`).setScale(1.5).setDepth(this.depth + 6),
      this.scene.add
        .text(x + 120, y + 24, lines.join('\n'), textStyle(14, UI.colors.parchment, { lineSpacing: 5, wordWrap: { width: 360 } }))
        .setDepth(this.depth + 6),
      this.scene.add.text(x + 250, y + H - 224, 'Z / X — back', textStyle(12, UI.colors.dim)).setOrigin(0.5).setDepth(this.depth + 6),
    ];
  }

  closeSummary() {
    this.summaryObjs?.forEach((o) => o.destroy());
    this.summaryObjs = null;
  }

  /** Repaint rows (HP changed, party reordered) without rebuilding handlers. */
  refresh() {
    this.buildRows();
  }

  destroy() {
    if (this.dead) return;
    this.dead = true;
    this.closeSummary();
    this.closeSubmenu();
    for (const [evt, fn] of Object.entries(this.handlers)) this.scene.input.keyboard.off(evt, fn);
    this.rowObjs.forEach((o) => o.destroy());
    this.cursor?.destroy();
    this.objs.forEach((o) => o.destroy());
  }
}

/**
 * ItemsPanel — small inventory list. `usableOnly` keeps just heal items
 * (the world pause menu); battle shows the same list. Z on a heal item calls
 * onUse(itemDef) — the caller picks the target and decrements the count.
 */
class ItemsPanel {
  constructor(scene, { usableOnly = true, onUse, onCancel, depth = 130 }) {
    this.scene = scene;
    this.depth = depth;
    const W = scene.scale.width;

    const inv = Save.state.inventory ?? {};
    this.entries = Object.entries(inv)
      .filter(([id, count]) => count > 0 && ITEMS[id] && (!usableOnly || ITEMS[id].heal || ITEMS[id].cures))
      .map(([id, count]) => ({ def: ITEMS[id], count }));

    const h = Math.max(120, 96 + this.entries.length * 34);
    this.objs = [
      scene.add.rectangle(W / 2, scene.scale.height / 2, W, scene.scale.height, 0x000000, 0.6).setDepth(depth),
      drawPanel(scene, W / 2 - 240, 120, 480, h).setDepth(depth + 1),
      scene.add.text(W / 2, 148, 'ITEMS', titleStyle(20, UI.colors.gold, { letterSpacing: 3 })).setOrigin(0.5).setDepth(depth + 2),
    ];
    this.descText = scene.add.text(W / 2, 120 + h - 26, '', textStyle(12, UI.colors.dim, { wordWrap: { width: 440 }, align: 'center' })).setOrigin(0.5).setDepth(depth + 2);
    this.objs.push(this.descText);

    if (!this.entries.length) {
      this.objs.push(scene.add.text(W / 2, 190, 'Nothing usable here.', textStyle(15, UI.colors.dim)).setOrigin(0.5).setDepth(depth + 2));
      this.menu = new MenuList(scene, {
        x: W / 2, y: 230, spacing: 30, fontSize: 14, depth: depth + 2,
        items: [{ label: 'Back', onSelect: () => onCancel?.() }],
        onCancel: () => onCancel?.(),
      });
      return;
    }

    this.menu = new MenuList(scene, {
      x: W / 2, y: 192, spacing: 34, fontSize: 15, depth: depth + 2,
      items: this.entries.map((e) => ({
        label: `${e.def.name}  x${e.count}`,
        onSelect: () => onUse?.(e.def),
      })),
      onCancel: () => onCancel?.(),
    });
    // Show the highlighted item's description.
    const origRefresh = this.menu.refresh.bind(this.menu);
    this.menu.refresh = () => {
      origRefresh();
      this.descText?.setText(this.entries[this.menu.index]?.def.desc ?? '');
    };
    this.menu.refresh();
  }

  destroy() {
    this.menu?.destroy();
    this.objs.forEach((o) => o.destroy());
  }
}
