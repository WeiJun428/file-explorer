/**
 * Name: Wei Jun Tan
 * Date: May 19, 2021
 * Section: CSE 154 AH (TA: Victor Shan)
 * This index.js adds an interactive UI to the site.
 * It controls the interactive buttons for navigation
 * and form submission for web server request.
 */

 "use strict";

 (function() {
   window.addEventListener("load", init);

   /**
    * Initialize the interative elements once the window is loaded.
    */
   function init() {
     console.log("haha");
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