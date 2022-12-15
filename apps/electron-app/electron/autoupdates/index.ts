import { autoUpdater } from 'electron-updater';
import * as log from 'electron-log';
import { BrowserWindow } from 'electron';

export default class AppUpdater {

  win: BrowserWindow

  constructor(_win: BrowserWindow) {
    this.win = _win;
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('checking-for-update', () => {
      this.sendStatusToWindow('Checking for update...');
    });

    autoUpdater.on('update-available', () => {
      this.sendStatusToWindow('Update available.');
    });

    autoUpdater.on('update-not-available', () => {
      this.sendStatusToWindow('Update not available.');
    });

    autoUpdater.on('error', (err) => {
      this.sendStatusToWindow('Error in auto-updater. ' + err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = "Download speed: " + progressObj.bytesPerSecond;
      log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
      log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
      this.sendStatusToWindow(log_message);
    });

    autoUpdater.on('update-downloaded', () => {
      this.sendStatusToWindow('Update downloaded');
      autoUpdater.quitAndInstall();
    });

  }

  sendStatusToWindow(text) {
    log.info(text);
    this.win.webContents.send('message', text);
  }

}
