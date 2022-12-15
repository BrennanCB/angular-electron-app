import { contextBridge } from "electron";

// It does not provide direct access to `ipcRenderer` or other Electron or Node APIs.
export const RENDERER_API = { };

contextBridge.exposeInMainWorld('electronAPI', RENDERER_API);
