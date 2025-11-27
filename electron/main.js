const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Data persistence directory - this persists across app updates
const userDataPath = app.getPath('userData');
const dataFilePath = path.join(userDataPath, 'club-data.json');

// Ensure user data directory exists
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

// Read all data from persistent file
function readData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading data file:', error);
  }
  return {};
}

// Write all data to persistent file
function writeData(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
}

// Create backup of data
function createBackup() {
  try {
    const backupDir = path.join(userDataPath, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `club-data-backup-${timestamp}.json`);

    if (fs.existsSync(dataFilePath)) {
      fs.copyFileSync(dataFilePath, backupPath);

      // Keep only last 10 backups
      const backups = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('club-data-backup-'))
        .sort()
        .reverse();

      backups.slice(10).forEach(f => {
        fs.unlinkSync(path.join(backupDir, f));
      });

      return backupPath;
    }
  } catch (error) {
    console.error('Error creating backup:', error);
  }
  return null;
}

let mainWindow;

function createWindow() {
  // Create auto-backup on app start
  createBackup();

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.png'),
    title: 'Snooker Club Manager',
    titleBarStyle: 'default',
    show: false,
  });

  // Load the app
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    const port = process.env.DEV_SERVER_PORT || 5173;
    mainWindow.loadURL(`http://localhost:${port}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for data persistence
ipcMain.handle('getData', () => {
  return readData();
});

ipcMain.handle('setData', (event, data) => {
  return writeData(data);
});

ipcMain.handle('getItem', (event, key) => {
  const data = readData();
  return data[key] || null;
});

ipcMain.handle('setItem', (event, key, value) => {
  const data = readData();
  data[key] = value;
  return writeData(data);
});

ipcMain.handle('removeItem', (event, key) => {
  const data = readData();
  delete data[key];
  return writeData(data);
});

ipcMain.handle('getAllKeys', () => {
  const data = readData();
  return Object.keys(data);
});

ipcMain.handle('clear', () => {
  return writeData({});
});

ipcMain.handle('createBackup', () => {
  return createBackup();
});

ipcMain.handle('getDataPath', () => {
  return dataFilePath;
});

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Create backup before closing
  createBackup();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  createBackup();
});
