/**
 * Scroll Effects Module
 * Handles scroll-based animations and visibility changes
 */

/** @type {IntersectionObserver|null} */
let cardObserver = null;

/** @type {HTMLElement|null} */
let scrollIndicator = null;

/**
 * Initializes scroll indicator visibility behavior
 * Hides the indicator after scrolling past threshold
 */
export function initScrollIndicator() {
  try {
    scrollIndicator = document.querySelector(".scroll-indicator");

    if (!scrollIndicator) {
      console.warn("Scroll indicator element not found");
      return;
    }

    window.addEventListener("scroll", handleScroll);
  } catch (error) {
    console.error("Failed to initialize scroll indicator:", error);
  }
}

/**
 * Handles scroll events for the scroll indicator
 */
function handleScroll() {
  if (!scrollIndicator) {
    return;
  }

  if (window.scrollY > 100) {
    scrollIndicator.style.opacity = "0";
  } else {
    scrollIndicator.style.opacity = "0.5";
  }
}

/**
 * Initializes card reveal animation on scroll
 * Uses Intersection Observer for performance
 */
export function initCardReveal() {
  try {
    const cards = document.querySelectorAll(".card");

    if (cards.length === 0) {
      console.warn("No card elements found for reveal animation");
      return;
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("card--reveal-pending");
          entry.target.classList.add("card--revealed");
        }
      });
    }, observerOptions);

    // Setup initial state and observe each card
    cards.forEach((card) => {
      card.classList.add("card--reveal-pending");
      cardObserver?.observe(card);
    });
  } catch (error) {
    console.error("Failed to initialize card reveal:", error);
  }
}

/**
 * Cleans up scroll effects
 * Removes event listeners and disconnects observer
 */
export function destroyScrollEffects() {
  window.removeEventListener("scroll", handleScroll);

  if (cardObserver) {
    cardObserver.disconnect();
    cardObserver = null;
  }

  scrollIndicator = null;
}
