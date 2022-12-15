import * as path from 'path';

export function configureHotReload(serve: boolean) {
  if (!serve) return;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const debug = require('electron-debug');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const electronReload = require('electron-reload');

  debug();

  electronReload(path.join('apps', 'electron-app', 'dist'), {
    electron: path.join('node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit',
  });
}
