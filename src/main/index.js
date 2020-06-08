import { app, BrowserWindow, shell, ipcMain, Tray, nativeImage, Menu } from 'electron';
import { autoUpdater } from 'electron-updater';
const app_name = process.env.NODE_ENV === 'production' ? 'DayZMagicLauncher' : 'DayZMagicLauncher (DEV)';
const app_version = process.env.npm_package_version;

const path = require('path');
const log = require('electron-log');
log.transports.console.format = `${app_name} > [{h}:{i}:{s}.{ms}] [{level}] {text}`;
global.log = log;
const fs = require('fs-extra');

import * as Sentry from '@sentry/electron';
Sentry.init({
  dsn: 'https://2db185d22fdc4b5d844102a36714c0d1@sentry.io/1761306',
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    if (event.exception) {
      mainWindow.webContents.send('error', event);
    }
    return event;
  }
});

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let tray
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
    minWidth: 1280,
    minHeight: 759,
    backgroundColor: '#1a202c',
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

  mainWindow.on('close', (e) => {
    //e.preventDefault();
    mainWindow.webContents.send('before-quit');
  });

  mainWindow.on('closed', () => {
    mainWindow = null
  });

  let menu = [];
  ['Home', 'Servers', 'Mods', 'Settings'].forEach((route) => {
    let route_path = route.toLowerCase();
    if (route == 'Home') {
      route_path = 'play';
    }
    menu.push({
      label: route,
      type: 'normal',
      click() {
        mainWindow.show();
        mainWindow.webContents.send('router_push', route_path);
      }
    });
  });
  tray = new Tray(path.join(app.getAppPath(), '/build/icons/icon.ico'));
  tray.setToolTip(app_name);
  tray.on('click', () => {
    mainWindow.show();
  });

  let last_played = null;
  ipcMain.on('last_played_server', (event, arg) => {
    last_played = arg;
    const contextMenu = Menu.buildFromTemplate([{
      label: 'Play '+(last_played !== null ? last_played.name : ''),
      type: 'normal',
      click() {
        mainWindow.webContents.send('join_server', last_played);
      },
      visible: last_played !== null,
    }, {
      type: last_played !== null ? 'separator' : 'normal',
      label: 'null',
      visible: last_played !== null,
    }, ...menu, {
      type: 'separator',
    }, {
      label: 'Reload',
      type: 'normal',
      click() {
        mainWindow.reload();
      },
    }, {
      label: 'Check for updates...',
      type: 'normal',
      click() {
        autoUpdater.checkForUpdates();
      },
    }, {
      type: 'separator',
    }, {
      label: 'Quit '+app_name,
      type: 'normal',
      role: 'quit',
    }]);
    
    tray.setContextMenu(contextMenu);
  });

  const settings = require('electron-settings');
  const uuid = require('uuid/v4');
  /**
   * Set user ID for tracking & errors
   */
  const user_id = settings.get('user_id', uuid());
  settings.set('user_id', user_id);
  Sentry.setUser({'id': user_id});
  
  /**
   * Set up analytics
   */
  if (process.env.NODE_ENV === 'production') {
    const ua = require('universal-analytics');
    const visitor = new ua.Visitor('UA-154435703-2', user_id);
    function trackEvent(category, action, label) {
      visitor.event({
        ec: category,
        ea: action,
        ...(label ? {el: label}:{})
      }, (err) => {
        if (err) log.error(err);
      });
    }
    function trackPageview(name, path) {
      visitor.pageview({
        dp: path,
        dt: name,
      }, (err) => {
        if (err) log.error(err);
      });
    }
    function trackScreenview(screen_name) {
      visitor.screenview({
        cd: screen_name,
        an: app_name,
        av: app_version,
      }, (err) => {
        if (err) log.error(err);
      });
    }
    global.trackEvent = trackEvent;
    global.trackPageview= trackPageview;
    global.trackScreenview = trackScreenview;
  }
}

function sendToWeb(text) {
  mainWindow.webContents.send('update_message', text);
}

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'debug';
if (process.env.NODE_ENV === 'production') {
  autoUpdater.checkForUpdates();
}

autoUpdater.on('update-available', () => {
  sendToWeb('update_available');
});
autoUpdater.on('update-downloaded', () => {
  sendToWeb('update_downloaded');
});
autoUpdater.on('update-not-available', (info) => {
  sendToWeb('update_not_available');
});
autoUpdater.on('error', (err) => {
  sendToWeb(err);
});
ipcMain.on('install_update', (event, arg) => {
  autoUpdater.quitAndInstall();
});
ipcMain.on('check_for_update', (event, arg) => {
  autoUpdater.checkForUpdates();
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

app.on('before-quit', function() {
  tray.destroy();
});
