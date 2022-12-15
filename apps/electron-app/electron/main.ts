import * as dotenv from 'dotenv';
import { app, BrowserWindow, Event, screen, Session, session } from 'electron';
// import { autoUpdater } from 'electron-updater';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import AppUpdater from './autoupdates';
import { configureHotReload } from './helpers/configure-hot-reload';

dotenv.config();

// eslint-disable-next-line
// autoUpdater.logger = require('electron-log') as any;
// // eslint-disable-next-line
// (<any>autoUpdater.logger).transports.file.level = 'info';
//
// autoUpdater.on('update-available', () => {
//   dialog.showMessageBox({
//     type: 'info',
//     title: 'Found Updates',
//     message: 'Found updates, yasssss',
//     buttons: ['Sure', 'Sure'],
//   }).then(() => {
//
//   });
// });
//
//
//
// autoUpdater.checkForUpdatesAndNotify();

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const args = process.argv.slice(2);

const serve = args.some(val => val === '--serve');
const noCsp = args.some(val => val === '--no-csp');


// The dotenv-webpack plugin does not support destructuring, so individually reference the variables.
const WL = (process.env.WL)?.toLowerCase() ?? '';
const ENVIRONMENT = (process.env.ENVIRONMENT)?.toLowerCase() ?? '';


let win: BrowserWindow | null = null;

configureHotReload(serve);

function createWindow(secureSession: Session): BrowserWindow {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      session: secureSession,
      // See:
      // https://www.electronjs.org/docs/latest/tutorial/security#2-do-not-enable-nodejs-integration-for-remote-content
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      // Prevent renderer from changing global objects.
      // See: https://www.electronjs.org/docs/latest/tutorial/security#3-enable-context-isolation
      contextIsolation: true,
      // Restrict dev tools access in the packaged app.
      devTools: !app.isPackaged,
      // Prevent new windows from being opened.
      // See: https://www.electronjs.org/docs/latest/tutorial/security#14-disable-or-limit-creation-of-new-windows
      disableBlinkFeatures: 'Auxclick',
      // See: https://www.electronjs.org/docs/latest/tutorial/security#4-enable-process-sandboxing
      sandbox: true,
      // Only allow secure content to be loaded.
      // See: https://www.electronjs.org/docs/latest/tutorial/security#8-do-not-enable-allowrunninginsecurecontent
      allowRunningInsecureContent: false,
    },
  });

  new AppUpdater(win);

  // Path when running electron executable
  let pathIndex = './index.html';
  const localPath = '../dist/index.html';

  if (fs.existsSync(path.join(__dirname, localPath))) {
    // Path when running electron in local folder
    pathIndex = localPath;
  }

  win.loadURL(url.format({
    pathname: path.join(__dirname, pathIndex),
    protocol: 'file:',
    slashes: true,
  }));

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  win.on('minimize', () => win?.webContents.send('win:minimized', true));
  win.on('restore', () => win?.webContents.send('win:minimized', false));

  win.webContents.on('did-fail-load', () => win?.loadURL(url.format({
    pathname: path.join(__dirname, pathIndex),
    protocol: 'file:',
    slashes: true,
  })));

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('win:get-login-item-settings', app.getLoginItemSettings());
  });

  // Uncomment to auto-open devtools.
  // win.webContents.openDevTools();
  return win;
}

try {
  // Sandbox all renderer content
  // See: https://www.electronjs.org/docs/latest/tutorial/sandbox
  app.enableSandbox();

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {

    const secureSession = session.fromPartition(`persist:${WL}:${ENVIRONMENT}-electron-app`, {
      cache: false,
    });

    // Added 400 ms to fix the black background issue while using transparent window.
    // More details at https://github.com/electron/electron/issues/15947
    const timeoutMS = 400;
    setTimeout(() => createWindow(secureSession), timeoutMS);

    app.on('activate', () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow(secureSession);
    });

    // All permissions are granted by default. Rather only allow what we need.
    // See:
    // https://www.electronjs.org/docs/latest/tutorial/security#5-handle-session-permission-requests-from-remote-content
    secureSession.setPermissionRequestHandler(
      (_webContents, _permission, callback) => {
        callback(false);
      },
    );

    // Define a CSP.
    // See: https://www.electronjs.org/docs/latest/tutorial/security#7-define-a-content-security-policy
    secureSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            `default-src 'self'; ` +
            `object-src 'none'; ` +
            // @TODO: This will need to be updated to whitelist specific domains once we have the list.
            `connect-src 'self' *; ` +
            // Need to allow unsafe-eval when we are serving in dev config.
            `script-src 'self' 'unsafe-inline' ${noCsp ? `'unsafe-eval'` : ''}; ` +
            `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ` +
            `font-src 'self' https://fonts.gstatic.com; `,
          ],
        },
      });
    });
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('web-contents-created', (_ev, contents) => {
    const preventDefault = (ev: Event) => {
      ev.preventDefault();
    };

    // Verify webview options before creation, for now just disable unless we need it.
    // See: https://www.electronjs.org/docs/latest/tutorial/security#12-verify-webview-options-before-creation
    contents.on('will-attach-webview', preventDefault);

    // Disable navigation unless we need it.
    // See: https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
    contents.on('will-navigate', preventDefault);

    // Disable the creation of new windows.
    // See: https://www.electronjs.org/docs/latest/tutorial/security#14-disable-or-limit-creation-of-new-windows
    contents.setWindowOpenHandler(() => ({action: 'deny'}));
  });

  // ** IPC functionalities goes here **


} catch (e) {
  // Catch Error
  // throw e;
}


