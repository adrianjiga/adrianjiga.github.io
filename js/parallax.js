/**
 * Parallax Effect Module
 * Adds parallax movement to shape elements based on mouse position
 */

/** @type {NodeListOf<HTMLElement>|null} */
let shapes = null;

/** @type {boolean} */
let rafPending = false;

/**
 * Initializes the parallax effect on shape elements
 */
export function initParallax() {
  try {
    shapes = document.querySelectorAll(".shape");

    if (shapes.length === 0) {
      console.warn("No shape elements found for parallax effect");
      return;
    }

    document.addEventListener("mousemove", handleParallax);
  } catch (error) {
    console.error("Failed to initialize parallax:", error);
  }
}

/**
 * Handles mouse movement for parallax effect
 * Uses a RAF gate so DOM writes happen at most once per frame, not 200-400x per second.
 * @param {MouseEvent} e - The mouse event
 */
function handleParallax(e) {
  if (!shapes || shapes.length === 0 || rafPending) {
    return;
  }

  rafPending = true;

  const mouseX = e.clientX / window.innerWidth;
  const mouseY = e.clientY / window.innerHeight;

  requestAnimationFrame(() => {
    shapes?.forEach((shape, index) => {
      const speed = (index + 1) * 20;
      const x = (mouseX - 0.5) * speed;
      const y = (mouseY - 0.5) * speed;

      shape.style.transform = `translate(${x}px, ${y}px)`;
    });

    rafPending = false;
  });
}

/**
 * Cleans up parallax effect
 * Removes event listeners
 */
export function destroyParallax() {
  document.removeEventListener("mousemove", handleParallax);
  shapes = null;
  rafPending = false;
}
