# Browser

## Introduction
This is a browser that provides simplified UI and read-only permission to the client to browse textbooks stored in the specified root directory

## Technologies
I use HTML, CSS, BootStrap, JavaScript, ElectronJS, NodeJS (fs, path, shell) to create this native application. I use these web technologies instead of using .NET, C++, or Java to utilize its advanced and customized UI ability.

## User Journey

1. Set the root directory of the browser.
2. Browse the directory by clicking navigation cards and the top navigation bar.
3. Open a pdf file by clicking the PDF card.

## Extra Features

1. The most recent PDF that the user opens will be shown on the homepage so that the user does not need to navigate down to the subfolder again.
2. I add a scroll to top button that appears after some scrolling to help users speed scrolling to the top easily, especially when the folder contains large amount of subfolder and files.
3. I add a back button in the top navigation bar to help users quickly switch to previous folder.
4. I add a search bar to allow filter of folder and file names

## How to install
1. Prereq: Make sure that you download node.js (at least version 14) and has an IDE (e.g. VS Code)
1. Fork this GitHub Repo
2. Navigate the directory that you wish to clone the repo and clone it
3. run `cd 'repo name'`
4. run `npm install`
5. run `npm start`
