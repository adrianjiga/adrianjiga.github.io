/**
 * Shape Visibility Module
 * Hides decorative shapes when viewing content-heavy sections
 */

/** @type {IntersectionObserver|null} */
let sectionObserver = null;

/** @type {Set<string>} */
const sectionsInView = new Set();

/** Sections where shapes should be hidden */
const HIDE_SHAPES_SECTIONS = ['work', 'life', 'about'];

/**
 * Updates the body class based on which sections are in view
 */
function updateShapeVisibility() {
  const shouldHide = HIDE_SHAPES_SECTIONS.some(id => sectionsInView.has(id));

  if (shouldHide) {
    document.body.classList.add('shapes-hidden');
  } else {
    document.body.classList.remove('shapes-hidden');
  }
}

/**
 * Initializes the shape visibility observer
 */
export function initShapeVisibility() {
  try {
    const sections = document.querySelectorAll('section[id]');

    if (sections.length === 0) {
      console.warn('No sections found for shape visibility');
      return;
    }

    const observerOptions = {
      threshold: 0.2,
      rootMargin: '-10% 0px -10% 0px'
    };

    sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const sectionId = entry.target.id;

        if (entry.isIntersecting) {
          sectionsInView.add(sectionId);
        } else {
          sectionsInView.delete(sectionId);
        }
      });

      updateShapeVisibility();
    }, observerOptions);

    sections.forEach((section) => {
      sectionObserver?.observe(section);
    });
  } catch (error) {
    console.error('Failed to initialize shape visibility:', error);
  }
}

/**
 * Cleans up shape visibility observer
 */
export function destroyShapeVisibility() {
  if (sectionObserver) {
    sectionObserver.disconnect();
    sectionObserver = null;
  }
  sectionsInView.clear();
  document.body.classList.remove('shapes-hidden');
}
