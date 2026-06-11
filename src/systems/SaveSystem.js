/**
 * SaveSystem (renderer side) — owns the live game state for the active run
 * and talks to the main-process save store through window.LuminaryNative.
 *
 * Auto-save policy: every system that completes a meaningful action calls
 * Save.autoSave(scene, reason). Phase 1 wires: new game, quit-to-title,
 * quit-game, and arrival in the world. Battles, captures, item pickups and
 * map transitions hook into the same call as they come online.
 */
class SaveSystemClass {
  constructor() {
    this.state = null; // live save-data object for the active run
    this.slotId = null; // which slot this run reads/writes
    this.sessionStart = null; // wall-clock ms when playtime last flushed
  }

  /** Build a brand-new save state (the full schema lives here). */
  newGame({ playerName, starterId, slotId }) {
    this.slotId = slotId;
    this.sessionStart = Date.now();
    this.state = {
      schemaVersion: 1,
      playerName,
      playtimeSeconds: 0,
      currentMap: 'ashfen_grove',
      position: { x: 14, y: 11, facing: 'up' },
      party: [makeLuminary(starterId, 5)],
      vault: [], // Echo Vault storage (cap 300, enforced when storage UI lands)
      inventory: { capture_orb: 5, ember_tonic: 3 },
      shards: 500,
      storyFlags: { chapter: 1, echo_awakened: false },
      npcStates: {},
      discoveredLocations: ['ashfen_grove'],
      dex: { seen: [starterId], caught: [starterId] },
      createdAt: Date.now(),
    };
    return this.state;
  }

  /** Fold elapsed session time into playtimeSeconds. */
  flushPlaytime() {
    if (!this.sessionStart || !this.state) return;
    const now = Date.now();
    this.state.playtimeSeconds += (now - this.sessionStart) / 1000;
    this.sessionStart = now;
  }

  /**
   * Persist the current state to the active slot.
   * Pass a scene to capture a screenshot thumbnail for the slot card.
   */
  async save(scene, opts = {}) {
    if (!this.state || !this.slotId) return { ok: false, error: 'No active run to save' };
    this.flushPlaytime();
    let thumbnail = null;
    if (scene && opts.thumbnail !== false) thumbnail = await this.captureThumbnail(scene);
    return window.LuminaryNative.saves.write(this.slotId, this.state, thumbnail);
  }

  /** Fire-and-log save used by gameplay systems. */
  async autoSave(scene, reason) {
    const res = await this.save(scene);
    console.log(`[autosave:${reason}]`, res.ok ? 'ok' : res.error);
    return res;
  }

  /** Load a slot into the live state. Returns the raw read result. */
  async loadSlot(slotId) {
    const res = await window.LuminaryNative.saves.read(slotId);
    if (res.ok) {
      this.state = res.record.data;
      this.slotId = slotId;
      this.sessionStart = Date.now();
    }
    return res;
  }

  /** 192x108 JPEG data-URL snapshot of the current frame (never blocks a save). */
  captureThumbnail(scene) {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (v) => {
        if (!settled) {
          settled = true;
          resolve(v);
        }
      };
      try {
        scene.game.renderer.snapshot((img) => {
          try {
            const c = document.createElement('canvas');
            c.width = 192;
            c.height = 108;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0, c.width, c.height);
            finish(c.toDataURL('image/jpeg', 0.7));
          } catch {
            finish(null);
          }
        });
        setTimeout(() => finish(null), 1500);
      } catch {
        finish(null);
      }
    });
  }
}

/** Global singleton used by every scene. */
const Save = new SaveSystemClass();
