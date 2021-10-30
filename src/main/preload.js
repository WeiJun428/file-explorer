/**
 * This is preload.js.
 */

// Dependencies
const fs = require("fs").promises;
const path = require("path");

// Global variables
const DELAY = 2000;                  // Duration of message
const HVAL = 2225039093;             // Hash value of password
const FILE = "src/others/temp.txt";  // Where root is stored
let root;                            // Root of the explorer

"use strict";

(async function() {
  window.addEventListener("load", init);

  /**
   * Debug purpose. Print the error message to the webpage
   */
  Print = (str) => {
    id("test").textContent += str;
  }

  /**
   * Called when window is loaded
   */
  async function init() {
    // Activate form update
    qs("form").addEventListener("submit", (param) => {
      param.preventDefault();
      updateRoot();
    });

    // Set the root
    await setRoot();
  }

  /**
   * Set the root of the file.
   * If it is not set yet, instruct user to set it up in setting
   */
  async function setRoot() {
    try {
      const data = fmt(await fs.readFile(FILE, "utf-8"));

      if (await isDir(data)) {  // Valid root
        root = data;
        populateDir(root);
      } else {  // Invalid root or not set yet
        Print("Please set the root by clicking setting at the upper right corner");
      }
    } catch (err) {
      Print(err);
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

    // Overwrite old file
    await fs.writeFile(FILE, address, {flag: 'w+'}, err => {
      Print(err);
    })

    // Output success message
    id("upd-result").style.color = "green";
    updateRootMessage("Success. Reload in 2 seconds");

    // Reload the page
    setTimeout(() => {
      location.reload();
    }, DELAY);
  }

  /**
   * Print a message to indicate sattus of root setting
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
    if (!await isDir(file)) {
      return;
    }

    try {
      const files = await fs.readdir(file);

      // Clear the old container
      qs(".container").innerHTML = "";
      qs(".container").classList.add("hidden");

      // Iterate through the file
      for (const f of files) {
        let pth = path.join(file, f);
        let card = genCard(pth, f);
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
      Print(err);
    }
  }

  function openPdf(file) {
    qs("main").classList.add("hidden");
    qs("embed").classList.remove("hidden");
    qs("embed").src = file;
  }

  /**
   * Update the navigation bar (breadcrumb)
   * @param {string} curDir current directory name
   */
  async function updateNav(curDir) {
    if (!await isDir(curDir)) {
      Print("error on navbar");
    }

    // Clean the nav
    qs(".breadcrumb").innerHTML = "";

    let elem = [];
    let i = 0;

    for (let cur = curDir; cur != root; i++) {
      elem[i] = getBreadCrumb(path.basename(cur), i === 0);
      add(elem[i], cur);
      cur = path.dirname(cur);
    }

    elem[i] = getBreadCrumb("Home", i === 0);
    add(elem[i], root);

    if (i !== 0) {
      elem[++i] = getBreadCrumb("Back", false);
      add(elem[i], path.dirname(curDir));
    }

    for (; i >= 0; i--) {
      qs(".breadcrumb").appendChild(elem[i]);
    }
  }

  function add(elem, addr) {
    elem.addEventListener("click", () => {
      populateDir(fmt(addr));
    });
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
   * @param {string} name filename
   * @returns a card element
   */
  function genCard(id, name) {
    let div1 = gen("div");
    div1.classList.add("card");
    let div2 = gen("div");
    div2.classList.add("card-body");
    let title = gen("h2");
    title.classList.add("card-title");
    title.textContent = name;
    div2.appendChild(title);
    div1.appendChild(div2);
    div1.id = id;
    return div1;
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