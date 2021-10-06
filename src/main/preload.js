/**
 * This is preload.js.
 */

const fs = require("fs").promises;
const path = require("path");
const FILE = "/../..";

"use strict";

(function() {
  window.addEventListener("load", init);

  /**
  * Initializes the interative elements once the window is loaded.
  */
  function init() {
    let btn = gen("button");
    qs("body").appendChild(btn);
    btn.addEventListener("click", haha);
  }

  async function haha() {
    try {
      const files = await fs.readdir(path.join(__dirname, FILE));
      for (const file of files) {
        let p = gen("p"); p.textContent = file; qs("body").appendChild(p);
      }
    } catch (err) {
      console.log("haha");
    }
    id("console").textContent = "file";
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