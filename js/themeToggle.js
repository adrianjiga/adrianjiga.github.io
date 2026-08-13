/**
 * Theme Toggle Module
 * Handles dark/light mode switching with localStorage persistence
 */

const STORAGE_KEY = "theme-preference";

/** @type {HTMLElement|null} */
let toggleButton = null;

/** @type {MediaQueryList|null} */
let mediaQuery = null;

/** @type {((e: MediaQueryListEvent) => void)|null} */
let mediaQueryHandler = null;

/**
 * Gets the user's preferred theme
 * Checks localStorage first, then system preference
 * @returns {'light'|'dark'} The preferred theme
 */
function getPreferredTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored === "light" || stored === "dark") {
    return stored;
  }

  // Check system preference
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }

  return "dark";
}

/**
 * Applies the theme to the document without persisting it
 * @param {'light'|'dark'} theme - The theme to apply
 */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

/**
 * Applies the theme and persists the user's explicit choice
 * @param {'light'|'dark'} theme - The theme to apply
 */
function setTheme(theme) {
  applyTheme(theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

/**
 * Toggles between light and dark themes
 */
function toggleTheme() {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || getPreferredTheme();
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme);
}

/**
 * Initializes the theme toggle functionality
 */
export function initThemeToggle() {
  try {
    // Apply initial theme — only persist if the user already had a stored preference
    const stored = localStorage.getItem(STORAGE_KEY);
    applyTheme(stored || getPreferredTheme());

    // Find and setup toggle button
    toggleButton = document.querySelector(".themeToggle");

    if (!toggleButton) {
      console.warn("Theme toggle button not found");
      return;
    }

    toggleButton.addEventListener("click", toggleTheme);

    // Listen for system preference changes — store refs so destroy() can remove the listener
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQueryHandler = (e) => {
      // Only update if user hasn't set a preference
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", mediaQueryHandler);
  } catch (error) {
    console.error("Failed to initialize theme toggle:", error);
  }
}

/**
 * Cleans up theme toggle functionality
 */
export function destroyThemeToggle() {
  if (toggleButton) {
    toggleButton.removeEventListener("click", toggleTheme);
    toggleButton = null;
  }

  if (mediaQuery && mediaQueryHandler) {
    mediaQuery.removeEventListener("change", mediaQueryHandler);
    mediaQuery = null;
    mediaQueryHandler = null;
  }
}
