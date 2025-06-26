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
      deleteVariation: (variation) => {
        ipcRenderer.invoke('db-deleteVariation', variation)
      },
      deleteOpening: (opening) => {
        ipcRenderer.invoke('db-deleteOpening', opening)
      },
      deleteRedundantVariation: (variation) => {
        return ipcRenderer.invoke('db-deleteRedundantVariation', variation)
      },
      getVault: () => {
        return ipcRenderer.invoke('db-getVault')
      },
      getVariations: () => {
        return ipcRenderer.invoke('db-getVariations')
      },
      archiveVariation: (archiveVariation) => {
        ipcRenderer.invoke('db-archiveVariation', archiveVariation)
      },
      activateVariation: (activateVariation) => {
        ipcRenderer.invoke('db-activateVariation', activateVariation)
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
