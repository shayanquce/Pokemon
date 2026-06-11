/**
 * DialogueBox — keyboard-driven dialogue window at the bottom of the screen.
 *
 * Typewriter reveal honoring the player's Text Speed setting (cached in
 * window.GameSettings by game.js). Z/Enter completes the current page or
 * advances to the next; onDone fires after the final page. The caller owns
 * input locking (WorldScene sets uiLock while a box is open).
 */
const TEXT_SPEED_MS = { slow: 55, normal: 28, fast: 12, instant: 0 };

class DialogueBox {
  constructor(scene, { speaker = null, pages, onDone = null, depth = 60 }) {
    this.scene = scene;
    this.pages = pages;
    this.onDone = onDone;
    this.pageIndex = 0;
    this.charTimer = null;
    this.dead = false;

    const W = scene.scale.width, H = scene.scale.height;
    const boxH = 122;
    this.objs = [
      drawPanel(scene, 16, H - boxH - 14, W - 32, boxH).setDepth(depth),
    ];
    if (speaker) {
      this.objs.push(
        drawPanel(scene, 28, H - boxH - 34, 14 + speaker.length * 11, 30, { alpha: 1 }).setDepth(depth + 1),
        scene.add.text(35, H - boxH - 19, speaker, textStyle(15, UI.colors.gold)).setOrigin(0, 0.5).setDepth(depth + 2)
      );
    }
    this.textObj = scene.add
      .text(38, H - boxH + 6, '', textStyle(17, UI.colors.parchment, { wordWrap: { width: W - 96 }, lineSpacing: 6 }))
      .setDepth(depth + 1);
    this.moreArrow = scene.add
      .text(W - 38, H - 32, '▼', textStyle(15, UI.colors.gold))
      .setOrigin(1, 0.5)
      .setDepth(depth + 1)
      .setVisible(false);
    this.objs.push(this.textObj, this.moreArrow);
    scene.tweens.add({ targets: this.moreArrow, y: '+=4', duration: 420, yoyo: true, repeat: -1 });

    const advance = () => this.advance();
    this.handlers = { 'keydown-Z': advance, 'keydown-ENTER': advance, 'keydown-X': advance };
    for (const [evt, fn] of Object.entries(this.handlers)) scene.input.keyboard.on(evt, fn);

    this.showPage();
  }

  /** Per-character reveal delay from the persisted Text Speed setting. */
  charDelay() {
    return TEXT_SPEED_MS[window.GameSettings?.textSpeed] ?? TEXT_SPEED_MS.normal;
  }

  showPage() {
    const page = this.pages[this.pageIndex];
    this.full = page;
    this.shown = 0;
    this.moreArrow.setVisible(false);
    const delay = this.charDelay();
    if (delay === 0) {
      this.finishPage();
      return;
    }
    this.textObj.setText('');
    this.charTimer = this.scene.time.addEvent({
      delay,
      repeat: page.length - 1,
      callback: () => {
        this.shown++;
        this.textObj.setText(this.full.slice(0, this.shown));
        if (this.shown >= this.full.length) this.finishPage();
      },
    });
  }

  finishPage() {
    this.charTimer?.remove();
    this.charTimer = null;
    this.shown = this.full.length;
    this.textObj.setText(this.full);
    this.moreArrow.setVisible(true).setText(this.pageIndex < this.pages.length - 1 ? '▼' : '■');
  }

  /** Z: typing in progress → reveal all; page done → next page or close. */
  advance() {
    if (this.dead) return;
    if (this.shown < this.full.length) {
      this.finishPage();
      return;
    }
    this.pageIndex++;
    if (this.pageIndex < this.pages.length) this.showPage();
    else this.destroy(true);
  }

  destroy(fireDone = false) {
    if (this.dead) return;
    this.dead = true;
    this.charTimer?.remove();
    for (const [evt, fn] of Object.entries(this.handlers)) this.scene.input.keyboard.off(evt, fn);
    this.objs.forEach((o) => o.destroy());
    if (fireDone) this.onDone?.();
  }
}
