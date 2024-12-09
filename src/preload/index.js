import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    // TODO Not sure if I need electronAPI
    contextBridge.exposeInMainWorld('electron', electronAPI)

    contextBridge.exposeInMainWorld('db', {
      ping: () => ipcRenderer.invoke('ping').then((result) => console.log(result)),

      checkDuplicate: (variation) => {
        return ipcRenderer.invoke('db-checkDuplicate', variation)
      },
      retrieve: () => {
        return ipcRenderer.invoke('db-retrieve')
      },
      update: (update) => {
        ipcRenderer.invoke('db-update', update)
      },
      save: (variation) => {
        ipcRenderer.invoke('db-save', variation)
      }
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
