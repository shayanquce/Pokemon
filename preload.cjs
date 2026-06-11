/**
 * Preload bridge — the only doorway between the sandboxed renderer (Phaser)
 * and the save/settings IPC API owned by the main process.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('LuminaryNative', {
  saves: {
    list: () => ipcRenderer.invoke('save:list'),
    read: (slotId) => ipcRenderer.invoke('save:read', slotId),
    write: (slotId, data, thumbnail) => ipcRenderer.invoke('save:write', slotId, data, thumbnail),
    listBackups: (slotId) => ipcRenderer.invoke('save:list-backups', slotId),
    restoreBackup: (slotId, backupKey) => ipcRenderer.invoke('save:restore-backup', slotId, backupKey),
    delete: (slotId) => ipcRenderer.invoke('save:delete', slotId),
    filePath: () => ipcRenderer.invoke('save:path'),
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (patch) => ipcRenderer.invoke('settings:set', patch),
  },
  quit: () => ipcRenderer.invoke('app:quit'),
});
