const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Data persistence methods
  getData: () => ipcRenderer.invoke('getData'),
  setData: (data) => ipcRenderer.invoke('setData', data),
  getItem: (key) => ipcRenderer.invoke('getItem', key),
  setItem: (key, value) => ipcRenderer.invoke('setItem', key, value),
  removeItem: (key) => ipcRenderer.invoke('removeItem', key),
  getAllKeys: () => ipcRenderer.invoke('getAllKeys'),
  clear: () => ipcRenderer.invoke('clear'),

  // Backup methods
  createBackup: () => ipcRenderer.invoke('createBackup'),
  getDataPath: () => ipcRenderer.invoke('getDataPath'),

  // Check if running in Electron
  isElectron: true
});
