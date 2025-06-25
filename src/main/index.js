import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

import Database from 'better-sqlite3'
import fs from 'fs'

const isDevMode = !app.isPackaged
const DB_PATH = 'repertoire.db'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // Size
    width: 1777,
    height: 1080,
    // Offsets (starting location on window open)
    x: 0,
    y: 1440 - 1140,

    show: false,
    autoHideMenuBar: true,
    icon: join(__dirname, '../../build/icon.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Open dev console
  if (isDevMode) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Delete the existing database
  if (isDevMode && fs.existsSync(DB_PATH) && process.argv.includes('--d')) {
    fs.unlinkSync(DB_PATH)
    console.log('Deleted existing repertoire.db')
  }

  // Create the database instance
  const db = new Database(DB_PATH)

  // Create a table if it doesn't exist already
  db.prepare(
    `
      CREATE TABLE IF NOT EXISTS Repertoire (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        pgn           TEXT NOT NULL,
        fen           TEXT NOT NULL,
        orientation   TEXT NOT NULL,
        opening       TEXT NOT NULL,
        eco           TEXT NOT NULL,
        next_study    TEXT NOT NULL,

        status        TEXT DEFAULT 'learning' NOT NULL,
        interval      INTEGER DEFAULT 60 NOT NULL,
        ease          INTEGER DEFAULT 2.5 NOT NULL,
        step          INTEGER DEFAULT 0 NOT NULL
      )
    `,
    (err) => {
      if (err) console.error(`Error creating table: ${err.message}`)
    }
  ).run()

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Socket.on functions
  ipcMain.handle('db-checkDuplicate', (_, variation) => {
    const query = `SELECT pgn, orientation 
                   FROM Repertoire 
                   WHERE pgn = ? AND orientation = ?
                  `
    const result = db.prepare(query).get(variation.pgn, variation.orientation)
    return result ? true : false
  })

  ipcMain.handle('db-checkRedundant', (_, variation) => {
    const query = `SELECT id
                   FROM Repertoire
                   WHERE pgn LIKE CONCAT(?, '%')
                  `
    const result = db.prepare(query).get(variation.pgn)
    return result ? true : false
  })

  ipcMain.handle('db-deleteVariation', (_, variation) => {
    const query = `DELETE FROM Repertoire WHERE id = ?`

    db.prepare(query).run(variation.id)
  })

  ipcMain.handle('db-deleteOpening', (_, opening) => {
    const query = `DELETE FROM Repertoire WHERE opening = ?`

    db.prepare(query).run(opening)
  })

  ipcMain.handle('db-deleteRedundantVariation', (_, variation) => {
    const query = `SELECT id, pgn, orientation
                   FROM Repertoire
                   WHERE ? LIKE CONCAT(pgn, '%')
                  `
    const result = db.prepare(query).get(variation.pgn)

    if (result) {
      db.prepare(`DELETE FROM Repertoire WHERE id = ?`).run(result.id)
      console.log(`Deleted redundant variation: ${JSON.stringify(result)}`)
    } else {
      console.log('No redundant variations here bruther!')
    }

    return result
  })

  ipcMain.handle('db-getRepertoire', () => {
    const query = `SELECT *
                   FROM Repertoire 
                  `
    return db.prepare(query).all()
  })

  ipcMain.handle('db-getVariations', () => {
    const query = `SELECT *
                   FROM Repertoire 
                   WHERE next_study <= ?
                   ORDER BY next_study ASC
                  `
    return db.prepare(query).all(new Date().toISOString())
  })

  ipcMain.handle('db-save', (_, variation) => {
    const query = `INSERT INTO Repertoire (pgn, fen, orientation, opening, eco, next_study) VALUES (?, ?, ?, ?, ?, ?)`
    db.prepare(query).run(
      variation.pgn,
      variation.fen,
      variation.orientation,
      variation.opening,
      variation.eco,
      new Date().toISOString()
    )
  })

  ipcMain.handle('db-update', (_, update) => {
    console.log('Updating db...')
    console.log(update)
    const query = `UPDATE Repertoire
                   SET next_study = ?, status = ?, interval = ?, ease = ?, step = ?
                   WHERE id = ?`
    db.prepare(query).run(
      update.next_study,
      update.status,
      update.interval,
      update.ease,
      update.step,
      update.id
    )
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
