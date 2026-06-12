/**
 * ShopPanel — buy items with Shards. Z buys one of the highlighted item,
 * X closes. The caller persists (auto-save) on close.
 *
 * DexPanel — the Luminary record: every species by dex number, shown as
 * caught (gold), seen (parchment) or ??? (dim).
 */
class ShopPanel {
  constructor(scene, { stock, onClose, depth = 130, title = "BRAM'S WARES" }) {
    this.scene = scene;
    this.depth = depth;
    this.stock = stock;
    this.index = 0;

    const W = scene.scale.width;
    const h = 140 + stock.length * 36;
    this.objs = [
      scene.add.rectangle(W / 2, scene.scale.height / 2, W, scene.scale.height, 0x000000, 0.6).setDepth(depth),
      drawPanel(scene, W / 2 - 260, 110, 520, h).setDepth(depth + 1),
      scene.add.text(W / 2, 138, title, titleStyle(20, UI.colors.gold, { letterSpacing: 3 })).setOrigin(0.5).setDepth(depth + 2),
      scene.add.text(W / 2, 110 + h - 22, 'Z — buy one     X — leave', textStyle(12, UI.colors.dim)).setOrigin(0.5).setDepth(depth + 2),
    ];
    this.shardText = scene.add.text(W / 2 + 230, 138, '', textStyle(14, UI.colors.gold)).setOrigin(1, 0.5).setDepth(depth + 2);
    this.descText = scene.add.text(W / 2, 110 + h - 48, '', textStyle(12, UI.colors.dim, { wordWrap: { width: 470 }, align: 'center' })).setOrigin(0.5).setDepth(depth + 2);
    this.rowTexts = stock.map((entry, i) =>
      scene.add.text(W / 2 - 220, 178 + i * 36, '', textStyle(15, UI.colors.parchment)).setDepth(depth + 2)
    );
    this.priceTexts = stock.map((entry, i) =>
      scene.add.text(W / 2 + 220, 178 + i * 36, '', textStyle(15, UI.colors.gold)).setOrigin(1, 0).setDepth(depth + 2)
    );
    this.cursor = scene.add.text(W / 2 - 236, 178, '>', textStyle(15, UI.colors.gold)).setDepth(depth + 2);
    this.objs.push(this.shardText, this.descText, this.cursor, ...this.rowTexts, ...this.priceTexts);

    this.handlers = {
      'keydown-UP': () => this.move(-1),
      'keydown-W': () => this.move(-1),
      'keydown-DOWN': () => this.move(1),
      'keydown-S': () => this.move(1),
      'keydown-Z': () => this.buy(),
      'keydown-ENTER': () => this.buy(),
      'keydown-X': () => onClose?.(),
      'keydown-ESC': () => onClose?.(),
    };
    for (const [evt, fn] of Object.entries(this.handlers)) scene.input.keyboard.on(evt, fn);
    this.refresh();
  }

  move(dir) {
    this.index = (this.index + dir + this.stock.length) % this.stock.length;
    this.refresh();
  }

  buy() {
    const entry = this.stock[this.index];
    const item = ITEMS[entry.itemId];
    if (Save.state.shards < entry.price) {
      this.scene.tweens.add({ targets: this.shardText, alpha: 0.2, duration: 90, yoyo: true, repeat: 2 });
      this.descText.setText('Not enough Shards.');
      return;
    }
    Save.state.shards -= entry.price;
    Save.state.inventory[entry.itemId] = (Save.state.inventory[entry.itemId] ?? 0) + 1;
    this.refresh();
    this.descText.setText(`Bought a ${item.name}. (${Save.state.inventory[entry.itemId]} held)`);
  }

  refresh() {
    this.shardText.setText(`Shards ${Save.state.shards}`);
    this.stock.forEach((entry, i) => {
      const item = ITEMS[entry.itemId];
      const held = Save.state.inventory[entry.itemId] ?? 0;
      this.rowTexts[i].setText(`${item.name}   (held ${held})`).setColor(i === this.index ? UI.colors.gold : UI.colors.parchment);
      this.priceTexts[i].setText(`${entry.price}`);
    });
    this.cursor.setY(178 + this.index * 36);
    this.descText.setText(ITEMS[this.stock[this.index].itemId].desc);
  }

  destroy() {
    for (const [evt, fn] of Object.entries(this.handlers)) this.scene.input.keyboard.off(evt, fn);
    this.objs.forEach((o) => o.destroy());
  }
}

class DexPanel {
  constructor(scene, { onClose, depth = 130 }) {
    this.scene = scene;
    const W = scene.scale.width, H = scene.scale.height;

    const all = Object.values(LUMINARY_SPECIES).sort((a, b) => a.dexNo - b.dexNo);
    const seen = Save.state.dex?.seen ?? [];
    const caught = Save.state.dex?.caught ?? [];

    this.objs = [
      scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6).setDepth(depth),
      drawPanel(scene, W / 2 - 330, 36, 660, H - 90).setDepth(depth + 1),
      scene.add.text(W / 2, 66, 'LUMINARY DEX', titleStyle(24, UI.colors.gold, { letterSpacing: 4 })).setOrigin(0.5).setDepth(depth + 2),
      scene.add
        .text(W / 2, 94, `Seen ${seen.length}   Caught ${caught.length}   of ${all.length} known in the Lowlands`, textStyle(13, UI.colors.dim))
        .setOrigin(0.5)
        .setDepth(depth + 2),
      scene.add.text(W / 2, H - 70, 'Z / X — close', textStyle(13, UI.colors.dim)).setOrigin(0.5).setDepth(depth + 2),
    ];

    // Two columns of entries.
    const perCol = Math.ceil(all.length / 2);
    all.forEach((sp, i) => {
      const col = Math.floor(i / perCol);
      const row = i % perCol;
      const x = W / 2 - 290 + col * 320;
      const y = 124 + row * 32;
      const isCaught = caught.includes(sp.id);
      const isSeen = seen.includes(sp.id);
      const label = isSeen || isCaught ? sp.name : '???';
      const color = isCaught ? UI.colors.gold : isSeen ? UI.colors.parchment : UI.colors.dim;
      this.objs.push(
        scene.add.text(x, y, `#${String(sp.dexNo).padStart(2, '0')}`, textStyle(13, UI.colors.dim)).setDepth(depth + 2),
        scene.add.text(x + 46, y, label, textStyle(14, color)).setDepth(depth + 2)
      );
      if (isCaught) {
        ensureLuminaryTexture(scene, sp.id);
        this.objs.push(scene.add.image(x + 250, y + 8, `lum_${sp.id}`).setScale(0.4).setDepth(depth + 2));
      }
    });

    this.handlers = {
      'keydown-Z': () => onClose?.(),
      'keydown-ENTER': () => onClose?.(),
      'keydown-X': () => onClose?.(),
      'keydown-ESC': () => onClose?.(),
    };
    for (const [evt, fn] of Object.entries(this.handlers)) scene.input.keyboard.on(evt, fn);
  }

  destroy() {
    for (const [evt, fn] of Object.entries(this.handlers)) this.scene.input.keyboard.off(evt, fn);
    this.objs.forEach((o) => o.destroy());
  }
}
