/**
 * This is preload.js.
 */

// Dependencies
const fs = require("fs").promises;
const path = require("path");

const DELAY = 2000;                  // Duration of message
const HVAL = 2225039093;             // Hash value of password
const FILE = "src/others/temp.txt";  // Where root is stored
let root;                            // Root of the explorer
let curDir;                         // Current directory


"use strict";

(async function() {
  window.addEventListener("load", init);

  /**
   * Debug purpose. Print the message to the webpage
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
   */
  async function setRoot() {
    try {
      const data = fmt(await fs.readFile(FILE, "utf-8"));
      // Empty string implies unset root
      if (data.length === 0) {
        id("test").textContent += "not set yet";
      } else if (await isDir(data) && path.isAbsolute(data)) {
        // Set the root only when the directory is valid and absolute
        root = data;
        populateDir(root);
      }
    } catch (err) {
      Print (err);
    }
  }

  async function updateRoot() {
    let password = id("password-input").value;
    let address = fmt(id("addr-input").value);

    // Validate Password
    if (!isPassword(password)) {
      id("upd-result").textContent = "Incorrect Password";
      setTimeout(() => {
        id("upd-result").textContent = "";
      }, DELAY);
      return;
    }

    // Validate address
    if (!await isDir(address)) {
      id("upd-result").textContent = "Invalid address";
      setTimeout(() => {
        id("upd-result").textContent = "";
      }, DELAY);
      return;
    }

    // Avoid malicious relative address
    if (!path.isAbsolute(address)) {
      id("upd-result").textContent = "Not an absolute address";
      setTimeout(() => {
        id("upd-result").textContent = "";
      }, DELAY);
      return;
    }

    // Overwrite old file
    await fs.writeFile(FILE, address, {flag: 'w+'}, err => {
      Print(err);
    })

    // Output success message
    id("upd-result").style.color = "green";
    id("upd-result").textContent = "Success. Reload in 2 seconds";

    // Reload the page
    setTimeout(() => {
      location.reload();
    }, DELAY);
  }

  /**
   * populates the container with clickable cards
   * @param {string} file filename
   * @returns nothing
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

      // Iterate through the file
      for (const f of files) {
        let pth = path.join(file, f);
        let card = genCard(pth, f);
        // Insert the card if it is dir or pdf
        if (await isDir(pth) && path.isAbsolute(pth)) {
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
      curDir = file;
      await updateNav();
    } catch (err) {
      Print(err);
    }
  }

  function openPdf() {
    Print("open pdf");
  }

  // TODO: To be fixed
  async function updateNav() {
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

    elem[i] = getBreadCrumb("Home", false);
    elem[i].addEventListener("click", () => {
      populateDir(root);
    });

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
    let ext = path.extname(file);
    return ext === ".pdf";
  }

  /**
   * Returns true if file is directory
   * @param {path} file filename to be checked
   * @returns true if file is directory
   */
  async function isDir(file) {
    try {
      let stat = await fs.stat(file);
      if (stat.isDirectory()) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      Print(err);
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