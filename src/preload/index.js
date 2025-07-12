import { contextBridge, ipcRenderer } from 'electron'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    // TODO rewrite so it only takes variation.id instead of whole variation?
    contextBridge.exposeInMainWorld('db', {
      archiveVariation: (variation) => {
        ipcRenderer.invoke('db-archiveVariation', variation)
      },
      checkDuplicate: (variation) => {
        return ipcRenderer.invoke('db-checkDuplicate', variation)
      },
      checkRedundant: (variation) => {
        return ipcRenderer.invoke('db-checkRedundant', variation)
      },
      deleteVariation: (variation) => {
        ipcRenderer.invoke('db-deleteVariation', variation)
      },
      deleteOpening: (opening) => {
        ipcRenderer.invoke('db-deleteOpening', opening)
      },
      deleteRedundantVariation: (variation) => {
        return ipcRenderer.invoke('db-deleteRedundantVariation', variation)
      },
      getHomework: () => {
        return ipcRenderer.invoke('db-getHomework')
      },
      getVault: () => {
        return ipcRenderer.invoke('db-getVault')
      },
      restoreVariation: (variation) => {
        ipcRenderer.invoke('db-restoreVariation', variation)
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
