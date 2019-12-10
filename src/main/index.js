import { app, BrowserWindow, shell } from 'electron';
import { autoUpdater } from 'electron-updater';

const log = require('electron-log');
const settings = require('electron-settings');
const fs = require('fs-extra');

import * as Sentry from '@sentry/electron';
Sentry.init({
  dsn: 'https://2db185d22fdc4b5d844102a36714c0d1@sentry.io/1761306',
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Check if it is an exception, if so, show the report dialog
    if (event.exception) {
      Sentry.showReportDialog({
        'title': "You've encountered an error.",
        'subtitle': "Explain the error as best you can below.",
        'subtitle2': "Error message: " + event.exception.values[0].type + ": " + event.exception.values[0].value,
      });
    }
    return event;
  }
});

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {

  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1350,
    height: 800,
    minWidth: 860,
    minHeight: 484,
    backgroundColor: '#0b0c0f',
    useContentSize: true,
    autoHideMenuBar: true,
    show: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(winURL);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  }); 

  mainWindow.webContents.on('new-window', (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  });

  mainWindow.on('closed', () => {
    mainWindow = null
  });
}

function sendToWeb(text) {
  log.info(text);
  mainWindow.webContents.send('message', text);
}

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'debug';
if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on('checking-for-update', () => {
  sendToWeb('checking_for_update');
});
autoUpdater.on('update-available', () => {
  sendToWeb('update_available');
});
autoUpdater.on('update-downloaded', () => {
  sendToWeb('update_downloaded');
  autoUpdater.quitAndInstall();
});
autoUpdater.on('update-not-available', (info) => {
  sendToWeb('update_not_available');
});
autoUpdater.on('error', (err) => {
  sendToWeb(err);
});

if (process.env.NODE_ENV === 'development') app.setAppPath(process.cwd());

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
});
