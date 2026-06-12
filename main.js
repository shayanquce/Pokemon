/**
 * Luminary: Echoes of the Forgotten Age — Electron main process.
 *
 * Responsibilities:
 *   - Create and manage the game window.
 *   - Own the save system. All save data lives in the OS user-data folder via
 *     electron-store (on Windows: %APPDATA%\luminary-game\luminary-saves.json)
 *     and is exposed to the renderer through a small IPC API (see preload.cjs).
 *
 * Save design (the contract the rest of the game is built on):
 *   - 3 named slots (slot_1..slot_3). Each slot is a checksum-sealed record:
 *     { schemaVersion, savedAt, thumbnail, meta, data, checksum }.
 *   - Every successful write ALSO lands in one of 3 rolling backups for that
 *     slot, in round-robin order (backup_1 -> backup_2 -> backup_3 -> ...).
 *     The newest write replaces the OLDEST backup, never the only good copy.
 *   - On read, the checksum is recomputed. A mismatch marks the slot as
 *     corrupted and the intact backups are offered for restoration.
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import Store from 'electron-store';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Keep the game loop alive when the window is hidden or covered by another
// window. Without these, Chromium throttles requestAnimationFrame to zero,
// which freezes Phaser tweens/scene transitions mid-await (and breaks the
// automated CDP playtest whenever the window is occluded).
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

const SLOT_IDS = ['slot_1', 'slot_2', 'slot_3'];
const BACKUP_KEYS = ['backup_1', 'backup_2', 'backup_3'];
const SAVE_SCHEMA_VERSION = 1;

/** Checksum-validated save slots with rolling round-robin backups. */
class SaveManager {
  constructor(storeName = 'luminary-saves') {
    this.store = new Store({ name: storeName });
  }

  /** SHA-256 over the canonical JSON of the save payload. */
  checksum(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  assertSlot(slotId) {
    if (!SLOT_IDS.includes(slotId)) throw new Error(`Unknown save slot: ${slotId}`);
  }

  /** Light schema gate so garbage can never be written as a "save". */
  isShapedLikeASave(data) {
    return Boolean(
      data &&
        typeof data === 'object' &&
        typeof data.playerName === 'string' &&
        Array.isArray(data.party) &&
        data.position &&
        typeof data.currentMap === 'string'
    );
  }

  /** Wraps raw game state into a sealed slot record with display metadata. */
  buildRecord(data, thumbnail) {
    const lead = data.party[0] ?? null;
    return {
      schemaVersion: SAVE_SCHEMA_VERSION,
      savedAt: Date.now(),
      thumbnail: typeof thumbnail === 'string' ? thumbnail : null,
      meta: {
        playerName: data.playerName,
        playtimeSeconds: Math.floor(data.playtimeSeconds || 0),
        currentMap: data.currentMap,
        leadName: lead ? lead.nickname || lead.name : null,
        leadLevel: lead ? lead.level : null,
        chapter: data.storyFlags?.chapter ?? 1,
      },
      data,
      checksum: this.checksum(data),
    };
  }

  /**
   * Write a slot, then mirror the record into the round-robin backup ring.
   * The cursor advances after each write, so the three newest saves are
   * always recoverable and the only remaining backup is never overwritten.
   */
  writeSlot(slotId, data, thumbnail) {
    this.assertSlot(slotId);
    if (!this.isShapedLikeASave(data)) {
      return { ok: false, error: 'Save data failed schema validation' };
    }
    const record = this.buildRecord(data, thumbnail);
    this.store.set(`slots.${slotId}`, record);

    const cursorKey = `backupCursor.${slotId}`;
    const cursor = this.store.get(cursorKey, 0) % BACKUP_KEYS.length;
    this.store.set(`backups.${slotId}.${BACKUP_KEYS[cursor]}`, record);
    this.store.set(cursorKey, (cursor + 1) % BACKUP_KEYS.length);

    return { ok: true, savedAt: record.savedAt };
  }

  /** True when the record's payload hashes back to its stored checksum. */
  validateRecord(record) {
    if (!record || typeof record !== 'object' || !record.data || typeof record.checksum !== 'string') {
      return false;
    }
    return this.checksum(record.data) === record.checksum;
  }

  readSlot(slotId) {
    this.assertSlot(slotId);
    const record = this.store.get(`slots.${slotId}`, null);
    if (!record) return { ok: false, empty: true };
    if (!this.validateRecord(record)) {
      return { ok: false, corrupted: true, backups: this.listBackups(slotId) };
    }
    return { ok: true, record };
  }

  /** Newest-first list of intact backups for a slot. */
  listBackups(slotId) {
    this.assertSlot(slotId);
    const out = [];
    for (const key of BACKUP_KEYS) {
      const rec = this.store.get(`backups.${slotId}.${key}`, null);
      if (rec && this.validateRecord(rec)) {
        out.push({ key, savedAt: rec.savedAt, meta: rec.meta });
      }
    }
    return out.sort((a, b) => b.savedAt - a.savedAt);
  }

  /** Copy an intact backup over the main slot record. Backups are untouched. */
  restoreBackup(slotId, backupKey) {
    this.assertSlot(slotId);
    if (!BACKUP_KEYS.includes(backupKey)) return { ok: false, error: `Unknown backup: ${backupKey}` };
    const rec = this.store.get(`backups.${slotId}.${backupKey}`, null);
    if (!rec || !this.validateRecord(rec)) return { ok: false, error: 'That backup is missing or damaged' };
    this.store.set(`slots.${slotId}`, rec);
    return { ok: true };
  }

  /** Slot summaries for the Load Game screen (no full payloads). */
  listSlots() {
    return SLOT_IDS.map((slotId) => {
      const record = this.store.get(`slots.${slotId}`, null);
      if (!record) return { slotId, empty: true };
      const valid = this.validateRecord(record);
      return {
        slotId,
        empty: false,
        corrupted: !valid,
        savedAt: record.savedAt ?? null,
        meta: record.meta ?? null,
        thumbnail: record.thumbnail ?? null,
        backups: valid ? undefined : this.listBackups(slotId),
      };
    });
  }

  deleteSlot(slotId) {
    this.assertSlot(slotId);
    this.store.delete(`slots.${slotId}`);
    this.store.delete(`backups.${slotId}`);
    this.store.delete(`backupCursor.${slotId}`);
    return { ok: true };
  }
}

/** Player preferences, stored separately from saves so they survive slot deletion. */
class SettingsManager {
  constructor() {
    this.store = new Store({
      name: 'luminary-settings',
      defaults: { musicVolume: 7, sfxVolume: 8, textSpeed: 'normal' },
    });
  }

  all() {
    return this.store.store;
  }

  patch(partial) {
    if (partial && typeof partial === 'object') this.store.set(partial);
    return this.all();
  }
}

/**
 * Headless self-test of the save system (`npm run save-smoke`).
 * Uses an isolated store so real saves are never touched.
 */
function runSaveSmokeTest() {
  const saves = new SaveManager('luminary-saves-smoke');
  saves.store.clear();

  const sample = (n) => ({
    playerName: 'SmokeTester',
    playtimeSeconds: n,
    currentMap: 'test_chamber',
    position: { x: n, y: n, facing: 'down' },
    party: [{ name: 'Embrik', level: 5 }],
    vault: [],
    inventory: {},
    shards: 0,
    storyFlags: { chapter: 1 },
    npcStates: {},
    discoveredLocations: [],
    dex: { seen: [], caught: [] },
  });

  const results = [];
  const check = (label, cond) => results.push(`${cond ? 'PASS' : 'FAIL'} — ${label}`);

  saves.writeSlot('slot_1', sample(1), null);
  check('write + read round trip', saves.readSlot('slot_1').ok === true);

  // Tamper with the payload without updating the checksum.
  saves.store.set('slots.slot_1.data.shards', 999999);
  const corrupted = saves.readSlot('slot_1');
  check('tampered save detected as corrupted', corrupted.ok === false && corrupted.corrupted === true);
  check('intact backup offered after corruption', (corrupted.backups || []).length >= 1);

  const restore = saves.restoreBackup('slot_1', corrupted.backups[0].key);
  check('backup restore succeeds', restore.ok === true && saves.readSlot('slot_1').ok === true);

  for (let i = 2; i <= 5; i++) saves.writeSlot('slot_1', sample(i), null);
  const backups = saves.listBackups('slot_1');
  check('rolling backups capped at 3', backups.length === 3);
  const newest = Math.max(...backups.map((b) => b.meta.playtimeSeconds));
  check('round-robin keeps the newest saves', newest === 5);

  saves.store.clear();
  for (const line of results) console.log('[save-smoke]', line);
  const failed = results.some((r) => r.startsWith('FAIL'));
  console.log('[save-smoke]', failed ? 'RESULT: FAIL' : 'RESULT: ALL PASS');
  return failed ? 1 : 0;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 760,
    minWidth: 980,
    minHeight: 620,
    backgroundColor: '#070b14',
    title: 'Luminary: Echoes of the Forgotten Age',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  win.once('ready-to-show', () => win.show());

  // Mirror renderer console output into the terminal — invaluable in dev.
  win.webContents.on('console-message', (event, _level, message) => {
    const text = typeof message === 'string' ? message : event?.message ?? '';
    console.log('[renderer]', text);
  });

  // F12 toggles DevTools even without an application menu.
  win.webContents.on('before-input-event', (_e, input) => {
    if (input.type === 'keyDown' && input.key === 'F12') win.webContents.toggleDevTools();
  });

  // Playtest mode (CDP port present): tell the renderer so Phaser can run its
  // loop on setTimeout. rAF in an unfocused/occluded window can be throttled
  // to 1fps by newer Chromium even with the occlusion flags disabled, which
  // stalls every tween the playtest waits on. setTimeout is exempt because of
  // backgroundThrottling: false above.
  const playtest = process.argv.some((a) => a.startsWith('--remote-debugging-port'));
  win.loadFile(path.join(__dirname, 'src', 'index.html'), playtest ? { query: { playtest: '1' } } : undefined);
  return win;
}

app.whenReady().then(() => {
  if (process.argv.includes('--save-smoke')) {
    app.exit(runSaveSmokeTest());
    return;
  }

  const saves = new SaveManager();
  const settings = new SettingsManager();

  // Wrap handlers so renderer always receives { ok:false, error } over a throw.
  const safe = (fn) => async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      return { ok: false, error: String(err?.message ?? err) };
    }
  };

  ipcMain.handle('save:list', safe(() => saves.listSlots()));
  ipcMain.handle('save:read', safe((_e, slotId) => saves.readSlot(slotId)));
  ipcMain.handle('save:write', safe((_e, slotId, data, thumbnail) => saves.writeSlot(slotId, data, thumbnail)));
  ipcMain.handle('save:list-backups', safe((_e, slotId) => saves.listBackups(slotId)));
  ipcMain.handle('save:restore-backup', safe((_e, slotId, key) => saves.restoreBackup(slotId, key)));
  ipcMain.handle('save:delete', safe((_e, slotId) => saves.deleteSlot(slotId)));
  ipcMain.handle('save:path', safe(() => saves.store.path));
  ipcMain.handle('settings:get', safe(() => settings.all()));
  ipcMain.handle('settings:set', safe((_e, patch) => settings.patch(patch)));
  ipcMain.handle('app:quit', () => app.quit());

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
