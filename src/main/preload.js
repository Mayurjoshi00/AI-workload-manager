const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('api', {
  platform: process.platform,
  version: process.versions.electron,
})