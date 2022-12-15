[![Angular Logo](https://www.vectorlogo.zone/logos/angular/angular-icon.svg)](https://angular.io/) [![Electron Logo](https://www.vectorlogo.zone/logos/electronjs/electronjs-icon.svg)](https://electronjs.org/)

# Introduction

Bootstrap and package the app application with Angular 14 and Electron 19 (Typescript + SASS + Hot Reload).

Currently runs with:

- Angular v14.0.6
- Electron v19.0.8

You can:

- Run the app in a local development environment with Electron & Hot reload
- Run the app in a production environment
- Package your app into an executable file for Linux, Windows & Mac

/!\ Hot reload only pertains to the renderer process. The main electron process is not able to be hot reloaded, only restarted.

/!\ Angular CLI & Electron Builder needs Node 14 or later to work correctly.

# Notice

Why two package.json ? This project follow [Electron Builder two package.json structure](https://www.electron.build/tutorials/two-package-structure) in order to optimize final bundle and be still able to use Angular `ng add` feature.

## To build for development

- **in a terminal window** -> npm start

Voila! You can use your Angular + Electron app in a local development environment with hot reload!

The application code is managed by `apps/electron-app/electron/main.ts`. In this sample, the app runs with a simple Angular App (http://localhost:4200), and an Electron window. \
The Angular component contains an example of Electron and NodeJS native lib import. \
You can disable "Developer Tools" by commenting `win.webContents.openDevTools();` in `apps/electron-app/electron/main.ts`.

## Project structure

| Folder               | Description                                      |
|----------------------|--------------------------------------------------|
| electron-app/electron | Electron main process folder (NodeJS)            |
| electron-app/src      | Electron renderer process folder (Web / Angular) |

## How to import 3rd party libraries

This sample project runs in both modes (web and electron). To make this work, **you have to import your dependencies the right way**. \

There are two kind of 3rd party libraries :
- NodeJS's one - Uses NodeJS core module (crypto, fs, util...)
    - I suggest you add this kind of 3rd party library in `dependencies` of both `apps/electron-app/electron/package.json` and `package.json (root folder)` in order to make it work in both Electron's Main process (app folder) and Electron's Renderer process (src folder).

- Web's one (like bootstrap, material, tailwind...)
    - It have to be added in `dependencies` of `package.json  (root folder)`

## Add a dependency with ng-add

You may encounter some difficulties with `ng-add` because this project doesn't use the defaults `@angular-builders`. \
For example you can find [here](HOW_TO.md) how to install Angular-Material with `ng-add`.

## You want to use a specific lib (like rxjs) in electron main thread ?

YES! You can do it! Just by importing your library in npm dependencies section of `apps/electron-app/electron/package.json` under `peerDependencies`. \
It will be loaded by electron during build phase and added to your final bundle. \
Then use your library by importing it in `apps/electron-app/electron/main.ts` file. Quite simple, isn't it?

## How to create a version

From root folder in bf-monorepo...

### Patch
``` bash
npm run app:version:patch
```
### Minor
``` bash
npm run app:version:minor
```
### Major
``` bash
npm run app:version:major
```
### Prerelease
``` bash
npm run app:version:prerelease
```
