import { contextBridge, ipcRenderer } from 'electron'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('db', {
      checkDuplicate: (variation) => {
        return ipcRenderer.invoke('db-checkDuplicate', variation)
      },
      checkRedundant: (variation) => {
        return ipcRenderer.invoke('db-checkRedundant', variation)
      },
      deleteRedundantVariation: (variation) => {
        return ipcRenderer.invoke('db-deleteRedundantVariation', variation)
      },
      getRepertoire: () => {
        return ipcRenderer.invoke('db-getRepertoire')
      },
      getVariations: () => {
        return ipcRenderer.invoke('db-getVariations')
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
}
