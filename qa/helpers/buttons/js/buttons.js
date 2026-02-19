(function () {
  'use strict';

  // ── Display ─────────────────────────────────────────────────────────────────
  // Single responsibility: reveal a result message element by ID.

  function showMessage(id) {
    document.getElementById(id).style.display = 'block';
  }

  // ── Events ──────────────────────────────────────────────────────────────────
  // Single responsibility: bind all interaction events without inline handlers.

  function bindEvents() {
    document.getElementById('doubleClickBtn')
      .addEventListener('dblclick', () => showMessage('doubleClickMessage'));

    document.getElementById('rightClickBtn')
      .addEventListener('contextmenu', e => {
        e.preventDefault();
        showMessage('rightClickMessage');
      });

    document.querySelector('[data-cy="dynamic-click-btn"]')
      .addEventListener('click', () => showMessage('dynamicClickMessage'));
  }

  bindEvents();
})();
