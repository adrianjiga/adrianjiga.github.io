/**
 * Main Entry Point
 * Imports and initializes all modules
 */

import { initCursorTrail } from "./cursor-trail.js";
import { initParallax } from "./parallax.js";
import { initScrollIndicator, initCardReveal } from "./scroll-effects.js";
import { initSmoothScroll } from "./smooth-scroll.js";
import { initThemeToggle } from "./theme-toggle.js";
import { initFooterYear } from "./footer-year.js";

/**
 * Initializes all modules when the DOM is ready
 */
function init() {
  try {
    // Theme should be initialized first to prevent flash
    initThemeToggle();

    // Visual effects
    initCursorTrail();
    initParallax();

    // Scroll-related features
    initScrollIndicator();
    initCardReveal();
    initSmoothScroll();

    // Dynamic content
    initFooterYear();

    console.log("All modules initialized successfully");
  } catch (error) {
    console.error("Failed to initialize application:", error);
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
