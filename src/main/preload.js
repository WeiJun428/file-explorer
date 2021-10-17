/**
 * This is preload.js.
 */

const fs = require("fs").promises;
const path = require("path");
const FILE = "C:/Users/alext/Desktop/";

"use strict";

(async function() {
  window.addEventListener("load", init);

  /**
  * Initializes the interative elements once the window is loaded.
  */
  async function init() {
    getFile(FILE);
  }

  async function getFile(fileName) {
    try {
      const files = await fs.readdir(fileName);
      qs(".container").innerHTML = "";
      for (const file of files) {
        let p = genCard(file, file);
        p.addEventListener("click", () => {
          getFile(FILE + p.id + "/");
        });
        qs(".container").appendChild(p);
      }
    } catch (err) {
      console.log("haha");
    }
  }

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