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
let cur_dir;                         // Current directory


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

    id("home").addEventListener("click", () => {
      populateDir(root);
    });
  }

  /**
   * Set the root of the file.
   */
  async function setRoot() {
    try {
      const data = await fs.readFile(FILE, "utf-8");
      // Empty string implies unset root
      if (data.length === 0) {
        id("test").textContent += "not set yet";
      } else if (await isDir(data)) {
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

  async function populateDir(file) {
    Print(file + " ");
    file = fmt(file);
    if (!await isDir(file)) {
      return;
    }

    try {
      const files = await fs.readdir(file);

      // Clear the old container
      qs(".container").innerHTML = "";

      for (const f of files) {
        let pth = path.join(file, f);
        let card = genCard(pth, f);
        if (await isDir(pth)) {
          card.addEventListener("click", () => {
            populateDir(pth);
          });
          qs(".container").appendChild(card);
        }
        else if (isPdf(pth)) {
          card.addEventListener("click", () => {
            openPdf(pth);
          });
          qs(".container").appendChild(card);
        }
      }
      cur_dir = file;
      updateNav();
    } catch (err) {
      Print(err);
    }
  }

  function openPdf() {
    Print("open pdf");
  }

  // TODO: To be fixed
  async function updateNav() {
    let addr = cur_dir;
    if (!await isDir(addr)) {
      Print("error on navbar");
    }

    // Clean the nav
    qs(".breadcrumb").innerHTML = "";

    let elem = [];
    let i = 0;

    for (; path.relative(addr, root).length !== 0; i++) {
      elem[i] = getBreadCrumb(path.basename(addr), i === 0);
      elem[i].addEventListener("click", () => {
        populateDir(addr);
      });
      addr = path.dirname(addr);
    }

    elem[i] = getBreadCrumb("Home", i === 0);
    elem[i].addEventListener("click", () => {
      populateDir(root);
    })

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