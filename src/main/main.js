/**
 * This is the main process of the app File Explorer.
 */

"use strict";

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

// main window
let win;

app.on("ready", createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
  }
});

app.on('second-instance', () => {
	if (win) {
		if (win.isMinimized()) {
			win.restore();
		}
		win.show();
	}
});

function createWindow () {
  win = new BrowserWindow({
    show: false,
    // width: 500,
    // height: 500,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      preload: require.resolve("./preload.js")
    }
  });

  win.webContents.on('dom-ready', () => {
    // The window has loaded its contents
    win.show();
  })

  win.loadFile(path.join(__dirname, "../renderer/index.html"));
};