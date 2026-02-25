/**
 * Cursor Trail Effect Module
 * Creates a trailing effect following the mouse cursor
 */

/** @type {Array<{element: HTMLElement, x: number, y: number, currentX: number, currentY: number}>} */
let trails = [];
const MAX_TRAILS = 20;

/** @type {number} */
let rafId = 0;

/**
 * Initializes the cursor trail effect
 * Creates trail elements and sets up event listeners
 */
export function initCursorTrail() {
  try {
    // Create trail elements
    for (let i = 0; i < MAX_TRAILS; i++) {
      const trail = document.createElement("div");
      trail.className = "cursor-trail";
      document.body.appendChild(trail);
      trails.push({
        element: trail,
        x: 0,
        y: 0,
        currentX: 0,
        currentY: 0,
      });
    }

    // Track mouse movement
    document.addEventListener("mousemove", handleMouseMove);

    // Hide trails when mouse leaves
    document.addEventListener("mouseleave", handleMouseLeave);

    // Start animation loop
    animateTrails();
  } catch (error) {
    console.error("Failed to initialize cursor trail:", error);
  }
}

/**
 * Handles mouse movement events
 * @param {MouseEvent} e - The mouse event
 */
function handleMouseMove(e) {
  if (trails.length > 0 && trails[0].element) {
    trails[0].x = e.clientX - 5;
    trails[0].y = e.clientY - 5;
    trails[0].element.style.opacity = "0.8";
  }
}

/**
 * Handles mouse leave events
 * Hides all trail elements
 */
function handleMouseLeave() {
  trails.forEach((trail) => {
    if (trail.element) {
      trail.element.style.opacity = "0";
    }
  });
}

/**
 * Animation loop for the cursor trail
 * Uses requestAnimationFrame for smooth performance
 */
function animateTrails() {
  // Cascade positions from front to back
  for (let i = trails.length - 1; i > 0; i--) {
    trails[i].x = trails[i - 1].x;
    trails[i].y = trails[i - 1].y;
  }

  // Animate each trail element with easing
  trails.forEach((trail, index) => {
    const ease = 0.15;
    trail.currentX += (trail.x - trail.currentX) * ease;
    trail.currentY += (trail.y - trail.currentY) * ease;

    if (trail.element) {
      trail.element.style.left = `${trail.currentX}px`;
      trail.element.style.top = `${trail.currentY}px`;

      const opacity = (1 - index / trails.length) * 0.6;
      const scale = 1 - (index / trails.length) * 0.5;

      if (trail.element.style.opacity !== "0") {
        trail.element.style.opacity = String(opacity);
        trail.element.style.transform = `scale(${scale})`;
      }
    }
  });

  rafId = requestAnimationFrame(animateTrails);
}

/**
 * Cleans up cursor trail effect
 * Removes all trail elements and event listeners
 */
export function destroyCursorTrail() {
  cancelAnimationFrame(rafId);
  rafId = 0;

  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseleave", handleMouseLeave);

  trails.forEach((trail) => {
    if (trail.element && trail.element.parentNode) {
      trail.element.parentNode.removeChild(trail.element);
    }
  });

  trails = [];
}
