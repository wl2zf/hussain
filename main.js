'use strict';

const { app, BrowserWindow } = require('electron');
const path = require('path');
const { start } = require('./server');

const PORT = process.env.PORT || 3737;
let serverInstance = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 900,
    minHeight: 640,
    backgroundColor: '#140a1f',
    title: 'CipherForge',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.removeMenu();
  win.loadURL(`http://localhost:${PORT}`);
}

app.whenReady().then(async () => {
  // نشغّل خادم Express داخل عملية Electron
  serverInstance = await start(PORT);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (serverInstance) {
    serverInstance.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
