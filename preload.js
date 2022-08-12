const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    send: (data) => ipcRenderer.send('send', data)
})