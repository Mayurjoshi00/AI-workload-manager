const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { fork } = require('child_process')

let mainWindow
let serverProcess

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
    backgroundColor: '#0f0f0f',
  })

  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
}

function startServer() {
  serverProcess = fork(path.join(__dirname, '../server/index.js'), [], {
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV }
  })

  serverProcess.on('message', (msg) => {
    console.log('Server:', msg)
  })

  serverProcess.on('error', (err) => {
    console.error('Server error:', err)
  })
}

app.whenReady().then(() => {
  startServer()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill()
  if (process.platform !== 'darwin') app.quit()
})