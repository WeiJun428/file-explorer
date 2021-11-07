/**
 * Copyright ©2021 Wei Jun Tan.  All rights reserved. No other use,
 * copying, distribution, or modification is permitted without prior
 * written consent. Copyrights for third-party components of this work
 * must be honored.
 */

/**
 * This is the main process of the app File Explorer.
 */

"use strict";

const { app, BrowserWindow } = require("electron");
const path = require("path");

// main window
let win;

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
  }
});

app.on("second-instance", () => {
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
    autoHideMenuBar: true,
    icon: path.join(__dirname, "../img/logo.jpeg"),
    webPreferences: {
      nodeIntegration: false,
      preload: require.resolve("./preload.js")
    }
  });

  win.webContents.on('dom-ready', () => {
    // The window has loaded its contents
    win.show();
    app.setAccessibilitySupportEnabled(true);
  })

  win.loadFile(path.join(__dirname, "../renderer/index.html"));

  win.maximize();
};
