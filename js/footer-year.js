/**
 * Footer Year Module
 * Updates the copyright year dynamically
 */

/**
 * Updates the footer copyright year to the current year
 */
export function initFooterYear() {
  try {
    const yearElement = document.querySelector("#current-year");

    if (!yearElement) {
      console.warn("Footer year element not found");
      return;
    }

    yearElement.textContent = String(new Date().getFullYear());
  } catch (error) {
    console.error("Failed to initialize footer year:", error);
  }
}
