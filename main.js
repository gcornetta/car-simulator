//modules to control app lifecycle and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')



const loadMainWindow = () => {
    // Create the browser window
    const mainWindow = new BrowserWindow({
        width : 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.loadFile(path.join(__dirname, "index.html"))
}

// called when electron has finished all the initializations
app.on('ready', loadMainWindow)


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
    // for MacOS
    if (BrowserWindow.getAllWindows().length === 0) {
        loadMainWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('send', (event, data) => {
    fs.writeFileSync(path.join(__dirname, 'brain.json'), JSON.stringify(data))
})