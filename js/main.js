/**
 * Main Entry Point
 * Imports and initializes all modules
 */

import { initCursorTrail } from "./cursor-trail.js";
import { initParallax } from "./parallax.js";
import { initScrollIndicator, initCardReveal } from "./scroll-effects.js";
import { initThemeToggle } from "./theme-toggle.js";
import { initContactForm } from "./contact-form.js";

/**
 * Initializes all modules. type="module" scripts are deferred automatically,
 * so this runs after the DOM is parsed — no DOMContentLoaded guard needed.
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

    // Dynamic content
    const yearEl = document.querySelector("#current-year");
    if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }
    initContactForm();
  } catch (error) {
    console.error("Failed to initialize application:", error);
  }
}

init();
