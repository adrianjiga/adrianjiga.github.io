/**
 * Contact Form Module
 * Handles form validation and submission
 */

/** @type {HTMLFormElement|null} */
let form = null;

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Shows an error message for a form field
 * @param {HTMLInputElement|HTMLTextAreaElement} field - The field with an error
 * @param {string} message - The error message
 */
function showError(field, message) {
  const errorElement = field.parentElement?.querySelector(".error-message");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
  field.setAttribute("aria-invalid", "true");
}

/**
 * Clears the error message for a form field
 * @param {HTMLInputElement|HTMLTextAreaElement} field - The field to clear
 */
function clearError(field) {
  const errorElement = field.parentElement?.querySelector(".error-message");
  if (errorElement) {
    errorElement.style.display = "none";
  }
  field.removeAttribute("aria-invalid");
}

/**
 * Validates the entire form
 * @returns {boolean} True if all fields are valid
 */
function validateForm() {
  if (!form) {
    return false;
  }

  let isValid = true;

  const nameField = /** @type {HTMLInputElement|null} */ (
    form.querySelector("#contact-name")
  );
  const emailField = /** @type {HTMLInputElement|null} */ (
    form.querySelector("#contact-email")
  );
  const messageField = /** @type {HTMLTextAreaElement|null} */ (
    form.querySelector("#contact-message")
  );

  // Validate name
  if (nameField) {
    if (!nameField.value.trim()) {
      showError(nameField, "Please enter your name");
      isValid = false;
    } else {
      clearError(nameField);
    }
  }

  // Validate email
  if (emailField) {
    if (!emailField.value.trim()) {
      showError(emailField, "Please enter your email");
      isValid = false;
    } else if (!isValidEmail(emailField.value)) {
      showError(emailField, "Please enter a valid email address");
      isValid = false;
    } else {
      clearError(emailField);
    }
  }

  // Validate message
  if (messageField) {
    if (!messageField.value.trim()) {
      showError(messageField, "Please enter your message");
      isValid = false;
    } else if (messageField.value.trim().length < 10) {
      showError(messageField, "Message must be at least 10 characters");
      isValid = false;
    } else {
      clearError(messageField);
    }
  }

  return isValid;
}

/**
 * Handles form submission
 * @param {Event} e - The submit event
 */
function handleSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  // Form is valid - in a real implementation, you would send the data to a server
  // For now, show a success message
  const submitButton = form?.querySelector('button[type="submit"]');
  if (submitButton) {
    const originalText = submitButton.textContent;
    submitButton.textContent = "Message Sent!";
    submitButton.setAttribute("disabled", "true");

    setTimeout(() => {
      submitButton.textContent = originalText;
      submitButton.removeAttribute("disabled");
      form?.reset();
    }, 3000);
  }

  console.log("Form submitted successfully");
}

/**
 * Handles input events for real-time validation
 * @param {Event} e - The input event
 */
function handleInput(e) {
  const field = /** @type {HTMLInputElement|HTMLTextAreaElement} */ (e.target);
  clearError(field);
}

/**
 * Initializes the contact form functionality
 */
export function initContactForm() {
  try {
    form = document.querySelector("#contact-form");

    if (!form) {
      console.warn("Contact form not found");
      return;
    }

    form.addEventListener("submit", handleSubmit);

    // Add real-time validation on input
    const fields = form.querySelectorAll("input, textarea");
    fields.forEach((field) => {
      field.addEventListener("input", handleInput);
    });
  } catch (error) {
    console.error("Failed to initialize contact form:", error);
  }
}

/**
 * Cleans up contact form functionality
 */
export function destroyContactForm() {
  if (form) {
    form.removeEventListener("submit", handleSubmit);

    const fields = form.querySelectorAll("input, textarea");
    fields.forEach((field) => {
      field.removeEventListener("input", handleInput);
    });

    form = null;
  }
}
