/**
 * Copyright ©2021 Wei Jun Tan.  All rights reserved. No other use,
 * copying, distribution, or modification is permitted without prior
 * written consent. Copyrights for third-party components of this work
 * must be honored.
 */

/**
 * This is preload.js.
 */

// Dependencies
const shell = require('electron').shell;
const fs = require("fs").promises;
const path = require("path");

// Global variables
const DELAY    = 2000;            // Duration of message
const HVAL     = 2225039093;      // Hash value of password
const STR_MAX  = 30;              // Maximum length of title for card
const SCROLL   = 300;             // Number of pixels required to show scroll button
const ERR      = "System Error";  // Message to be printed when release
const DEBUG    = true;            // True if in debug mode

let root;  // Root of the explorer

"use strict";

(async function() {
  window.addEventListener("load", init);
  window.onscroll = function () {
    scrollFunction();
  };

  /**
   * Called when window is loaded
   */
  async function init() {
    // Activate form update
    qs("form").addEventListener("submit", (param) => {
      param.preventDefault();
      updateRoot();
    });

    // Activate Scroll to Top Button
    id("btn-back-to-top").addEventListener("click", () => {
      window.scrollTo({top: 0, behavior: "smooth"});
    });

    // Set the root
    setRoot();
  }

  /**
   * Set the root of the file.
   * If it is not set yet, instruct user to set it up in setting
   */
  async function setRoot() {
    let val = getItem("root");
    if (val !== null && await isDir(fmt(val))) {
      root = fmt(val);
      populateDir(root);
    } else {
      Print("Please set the root in setting");
    }
  }

  /**
   * Update the root of the explorer if it is valid.
   * If root is updated, the window will be reloaded in 2 sec
   */
  async function updateRoot() {
    let password = id("password-input").value;
    let address = fmt(id("addr-input").value);

    // Validate Password
    if (!isPassword(password)) {
      updateRootMessage("Incorrect Password");
      return;
    }

    // Validate address
    if (!await isDir(address)) {
      updateRootMessage("Invalid address");
      return;
    }

    // Set the root
    setItem("root", address);

    // Output success message
    id("upd-result").style.color = "green";
    updateRootMessage("Success. Reload in 2 seconds");

    // Reload the page
    setTimeout(() => {
      location.reload();
    }, DELAY);
  }

  /**
   * Print a message to indicate status of root setting.
   * Message disappeared after DELAY sec
   * @param {string} msg message to be printed
   */
  function updateRootMessage(msg) {
    id("upd-result").textContent = msg;
    setTimeout(() => {
      id("upd-result").textContent = "";
    }, DELAY);
  }

  /**
   * Populates the container with clickable cards
   * @param {string} file filename
   */
  async function populateDir(file) {
    file = fmt(file);

    // Do nothing if not a dir
    if (!await isDir(file)) {
      return;
    }

    try {
      const files = await fs.readdir(file);

      // Clear the old container
      qs(".container").innerHTML = "";
      qs(".container").classList.add("hidden");

      // Insert the most recent PDF if existed and if this is root
      if (path.dirname(file) === path.dirname(root)) {
        let pdf = getItem("pdf");
        if (pdf !== null && isPdf(fmt(pdf))) {
          pdf = fmt(pdf);
          let card = genCard(pdf, path.basename(pdf), true);
          card.addEventListener("click", () => {
            openPdf(pdf);
          });
          qs(".container").appendChild(card);
        }
      }

      // Iterate through the file
      for (const f of files) {
        let pth = path.join(file, f);
        let card = genCard(pth, f, false);

        // Insert the card if it is dir or pdf
        if (await isDir(pth)) {
          card.addEventListener("click", () => {
            populateDir(pth);
          });
          qs(".container").appendChild(card);
        } else if (isPdf(pth)) {
          card.addEventListener("click", () => {
            openPdf(pth);
          });
          qs(".container").appendChild(card);
        }
      }

      // Update the navigation
      await updateNav(file);
      qs(".container").classList.remove("hidden");
    } catch (err) {
      Print(DEBUG? err : ERR);
    }
  }

  /**
   * Open the given pdf and update the most recent pdf
   * @param {string} name filename of pdf
   */
  async function openPdf(name) {
    setItem("pdf", name);
    shell.openPath(name);
  }

  /**
   * Update the navigation bar (breadcrumb)
   * @param {string} curDir current directory name
   */
  async function updateNav(curDir) {
    if (!await isDir(curDir)) {
      Print(DEBUG? "Navbar error" : ERR);
    }

    // Clean the nav
    qs(".breadcrumb").innerHTML = "";

    let elem = [];
    let i = 0;

    // Setup subdir
    for (let cur = curDir; cur != root; i++) {
      elem[i] = getBreadCrumb(path.basename(cur), i === 0);
      add(elem[i], cur);
      cur = path.dirname(cur);
    }

    // Setup root
    elem[i] = getBreadCrumb("Home", i === 0);
    add(elem[i], root);

    // Setup back
    if (i !== 0) {
      elem[++i] = getBreadCrumb("Back", false);
      add(elem[i], path.dirname(curDir));
    }

    for (; i >= 0; i--) {
      qs(".breadcrumb").appendChild(elem[i]);
    }
  }

  /**
   * Returns a breadcrumb.
   * @param {string} label label of link
   * @returns a breadcrumb item with given label
   */
  function getBreadCrumb(label, isCurrent) {
    let li = gen("li");
    li.classList.add("breadcrumb-item");
    if (!isCurrent) {
      let a = gen("a");
      a.href = "#";
      a.textContent = label;
      li.appendChild(a);
    } else {
      li.classList.add("active");
      li.ariaCurrent = "page";
      li.textContent = label;
    }
    return li;
  }

  /**
   * Returns a card element
   * @param {string} id id of card
   * @param {string} filename filename
   * @param {boolean} isRecent true if the file is most recently opened
   * @returns a card element
   */
  function genCard(id, filename, isRecent) {
    // Generate elements
    let div1 = gen("div");
    div1.classList.add("card");
    let div2 = gen("div");
    div2.classList.add("card-body");
    let title = gen("h1");
    title.classList.add("card-title");
    let badge;

    // Format the badge
    if (path.extname(filename) === ".pdf") {
      badge = getBadge("PDF", "badge-primary");
    } else {
      badge = getBadge("Folder", "badge-secondary");
    }

    // Format the title
    let header = path.parse(id).name;
    if (header.length > STR_MAX) {
      header = header.substr(0, STR_MAX) + "...";
    }
    header += " ";
    title.textContent = header;

    title.appendChild(badge);

    // Add extra badge if it is most recent
    if (isRecent) {
      title.appendChild(getBadge("Recent", "badge-success"));
    }

    div2.appendChild(title);
    div1.appendChild(div2);
    return div1;
  }

  /**
   * Control the visibility of the scroll-to-top button
   */
  function scrollFunction() {
    if (document.body.scrollTop > SCROLL ||
      document.documentElement.scrollTop > SCROLL) {
      id("btn-back-to-top").classList.remove("hidden");
    } else {
      id("btn-back-to-top").classList.add("hidden");
    }
  }

  /**
   * Returns a badge
   * @param {string} text text content of badge
   * @param {string} label class label of badge
   * @returns a badge
   */
  function getBadge(text, label) {
    let badge = gen("span");
    badge.classList.add("badge");
    badge.classList.add(label);
    badge.textContent = text;
    return badge;
  }

  // Helper function that adds an event listener asyncronously
  function add(elem, addr) {
    elem.addEventListener("click", () => {
      populateDir(fmt(addr));
    });
  }

  /**
   * Returns true if file is pdf
   * @param {path} file file to be checked
   * @returns true if file is a pdf
   */
  function isPdf(file) {
    return path.extname(file) === ".pdf";
  }

  /**
   * Returns true if file is directory
   * @param {path} file filename to be checked
   * @returns true if file is directory
   */
  async function isDir(file) {
    try {
      let stat = await fs.stat(file);
      return stat.isDirectory() && path.isAbsolute(file);
    } catch {
      return false;
    }
  }

  /**
   * Normalize the file path
   * @param {string} file string to be formatted
   * @returns formatted path
   */
  function fmt(file) {
    return path.normalize(file);
  }

  /**
   * Check the correctness of password
   * @param {string} password password to be checked
   * @returns true if password is correct
   */
  function isPassword(password) {
    let hval = 0x811c9dc5;
    for (let i = 0; i < password.length; i++) {
      hval ^= (password.charCodeAt(i) & 0xFF);
      hval += (hval << 1) + (hval << 4) + (hval << 7) +
              (hval << 8) + (hval << 24);
    }
    return (hval >>> 0) === HVAL;
  }

  /**
   * Returns item of given key
   * @param {string} key key of pair
   * @returns value of given key
   */
  function getItem(key) {
    return window.localStorage.getItem(key);
  }

  /**
   * Set the given pair
   * @param {string} key key of pair
   * @param {string} value value of pair
   */
  function setItem(key, value) {
    window.localStorage.setItem(key, value);
  }

  /**
   * Print the error message to the webpage
   */
  Print = (str) => {
    id("test").textContent += (str + "\t");
  }

  /**
  * Returns the element that has the ID attribute with the specified value.
  * @param {string} idName - element ID
  * @returns {object} DOM object associated with id.
  */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
  * Returns the first element that matches the given CSS selector.
  * @param {string} selector - CSS query selector.
  * @returns {object} The first DOM object matching the query.
  */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
  * Returns a new element with the given tag name.
  * @param {string} tagName - HTML tag name for new DOM element.
  * @returns {object} New DOM object for given HTML tag.
  */
  function gen(tagName) {
    return document.createElement(tagName);
  }
})();
