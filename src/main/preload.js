/**
 *
 */

 const fs = require("fs").promises;
 const FILE = "../../src";

 "use strict";

 (async function() {
   window.addEventListener("load", init);

   /**
   * Initialize the interative elements once the window is loaded.
   */
   async function init() {
     console.log("yes");
     // id("console").textContent = "file";
     let file = await fs.readdir(FILE, (err, files) => {
       files.array.forEach(element => {
        id("console").textContent = element;
       });
     });
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