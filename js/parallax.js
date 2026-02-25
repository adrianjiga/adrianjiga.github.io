/**
 * Parallax Effect Module
 * Adds parallax movement to shape elements based on mouse position
 */

/** @type {NodeListOf<HTMLElement>|null} */
let shapes = null;

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
 * @param {MouseEvent} e - The mouse event
 */
function handleParallax(e) {
  if (!shapes || shapes.length === 0) {
    return;
  }

  const mouseX = e.clientX / window.innerWidth;
  const mouseY = e.clientY / window.innerHeight;

  shapes.forEach((shape, index) => {
    const speed = (index + 1) * 20;
    const x = (mouseX - 0.5) * speed;
    const y = (mouseY - 0.5) * speed;

    shape.style.transform = `translate(${x}px, ${y}px)`;
  });
}

/**
 * Cleans up parallax effect
 * Removes event listeners
 */
export function destroyParallax() {
  document.removeEventListener("mousemove", handleParallax);
  shapes = null;
}
