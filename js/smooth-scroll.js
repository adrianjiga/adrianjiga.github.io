/**
 * Smooth Scroll Module
 * Provides smooth scrolling behavior for anchor links
 */

/**
 * Initializes smooth scrolling for all anchor links
 */
export function initSmoothScroll() {
  try {
    const anchors = document.querySelectorAll('a[href^="#"]');

    if (anchors.length === 0) {
      console.warn("No anchor links found for smooth scroll");
      return;
    }

    anchors.forEach((anchor) => {
      anchor.addEventListener("click", handleAnchorClick);
    });
  } catch (error) {
    console.error("Failed to initialize smooth scroll:", error);
  }
}

/**
 * Handles click events on anchor links
 * @param {Event} e - The click event
 */
function handleAnchorClick(e) {
  e.preventDefault();

  const anchor = /** @type {HTMLAnchorElement} */ (e.currentTarget);
  const href = anchor.getAttribute("href");

  if (!href) {
    return;
  }

  const target = document.querySelector(href);

  if (target) {
    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

/**
 * Cleans up smooth scroll functionality
 * Removes event listeners from all anchor links
 */
export function destroySmoothScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');

  anchors.forEach((anchor) => {
    anchor.removeEventListener("click", handleAnchorClick);
  });
}
